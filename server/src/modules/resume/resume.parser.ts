import { PDFParse } from "pdf-parse";
import {
  IResumeExtractedData,
  IResumePersonalInfo,
  IResumeSkill,
  IResumeEducation,
  IResumeExperience,
  IResumeProject,
  IResumeCertification,
} from "@/database/models/Resume.model";

export class ResumeParserService {
  /**
   * Extract raw text from a PDF Buffer using pdf-parse.
   */
  async extractRawTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy().catch(() => {});
      return result.text || "";
    } catch (err: any) {
      throw new Error(`Failed to parse PDF text: ${err.message}`);
    }
  }

  /**
   * Extract personal info (Full Name, Email, Phone, Location) using regex heuristics.
   */
  extractPersonalInfo(text: string): IResumePersonalInfo {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // 1. Email extraction
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : null;

    // 2. Phone extraction
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
    const phone = phoneMatch ? phoneMatch[0].trim() : null;

    // 3. Name extraction (first valid non-header line)
    let fullName: string | null = null;
    const headerExcludeRegex = /resume|curriculum|vitae|contact|phone|email|linkedin|github|portfolio|page/i;
    for (const line of lines.slice(0, 5)) {
      if (!headerExcludeRegex.test(line) && !line.includes("@") && line.length > 2 && line.length < 50) {
        // Name usually has 2-4 words with alphabetic characters
        if (/^[a-zA-Z\s.'-]+$/.test(line) && line.split(" ").length <= 5) {
          fullName = line;
          break;
        }
      }
    }

    // 4. Location extraction
    let location: string | null = null;
    const explicitLocationMatch = text.match(/(?:location|address|based in)\s*[:\-]?\s*([A-Za-z\s,.-]+?)(?:\n|\||$)/i);
    if (explicitLocationMatch && !/university|institute|college|school|academy/i.test(explicitLocationMatch[1])) {
      location = explicitLocationMatch[1].trim();
    } else {
      const cityStateMatch = text.match(/\b([A-Za-z]{2,15}(?:\s+[A-Za-z]{2,15})?,\s*(?:[A-Za-z]{2,20}|India|USA|UK|Canada|Germany|Australia|Remote))\b/i);
      if (cityStateMatch && !/university|institute|college|school|academy|technology|science|engineering/i.test(cityStateMatch[1])) {
        location = cityStateMatch[1].trim();
      }
    }

    // Clean location if candidate's name or leading symbols leaked in
    if (location && fullName) {
      const nameParts = fullName.split(/\s+/).filter((p) => p.length > 2);
      for (const part of nameParts) {
        location = location.replace(new RegExp(`\\b${part}\\b`, "gi"), "").trim();
      }
      location = location.replace(/^[,\s|/.-]+/, "").replace(/[,\s|/.-]+$/, "").trim();
      if (location.length === 0) location = null;
    }

    return {
      fullName,
      email,
      phone,
      location,
    };
  }

  /**
   * Extract categorized technical skills from resume text.
   * Combines explicit resume section parsing with a comprehensive taxonomy dictionary.
   */
  extractSkills(text: string): IResumeSkill[] {
    const skillsMap = new Map<string, string>(); // Skill Name -> Category

    // 1. Direct Category-Line Parsing: Handles "Frontend: React, GSAP...", "Tools & Platforms: Docker, Postman...", etc.
    const categoryLineRegex = /(?:^|\n)\s*(?:[-•*]\s*)?([A-Za-z0-9\s&/\\+-_]+?)\s*:\s*([A-Za-z0-9\s,.\-+/#@&()]+)(?=\n|$)/g;
    let match: RegExpExecArray | null;

    const validCategoryHeader =
      /frontend|backend|database|analytics|performance|tools|platforms|languages?|frameworks?|libraries|technologies|cloud|devops|soft\s*skills?|mobile|testing|infrastructure/i;
    const invalidCategoryHeader =
      /experience|education|university|college|summary|profile|achievements|projects|contact|email|phone|location|address/i;

    while ((match = categoryLineRegex.exec(text)) !== null) {
      const rawCategory = match[1].trim();
      const rawSkills = match[2].trim();

      if (validCategoryHeader.test(rawCategory) && !invalidCategoryHeader.test(rawCategory) && rawCategory.length < 35) {
        const category = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
        const tokens = rawSkills.split(/[,•|/]/).map((s) => s.trim()).filter((s) => s.length >= 2 && s.length <= 35);

        for (const token of tokens) {
          // Normalize capitalization (e.g., "figma" -> "Figma")
          const cleanToken = token.charAt(0).toUpperCase() + token.slice(1);
          if (!/^\d+$/.test(cleanToken) && !/present|year|month/i.test(cleanToken)) {
            skillsMap.set(cleanToken, category);
          }
        }
      }
    }

    // 2. Comprehensive Taxonomy Dictionary
    const skillTaxonomy: Record<string, { regex: RegExp; category: string }> = {
      // Languages
      TypeScript: { regex: /\bTypeScript\b/i, category: "Language" },
      JavaScript: { regex: /\bJavaScript\b|\bES6\b/i, category: "Language" },
      Python: { regex: /\bPython\b/i, category: "Language" },
      Java: { regex: /\bJava\b(?!Script)/i, category: "Language" },
      "C++": { regex: /\bC\+\+\b/i, category: "Language" },
      Go: { regex: /\bGolang\b|\bGo\s+lang\b/i, category: "Language" },
      Rust: { regex: /\bRust\b/i, category: "Language" },
      SQL: { regex: /\bSQL\b/i, category: "Language" },

      // Frontend
      React: { regex: /\bReact(?:\.js)?\b/i, category: "Frontend" },
      "Next.js": { regex: /\bNext(?:\.js)?\b/i, category: "Frontend" },
      Vue: { regex: /\bVue(?:\.js)?\b/i, category: "Frontend" },
      Angular: { regex: /\bAngular\b/i, category: "Frontend" },
      "Tailwind CSS": { regex: /\bTailwind(?:\s*CSS)?\b/i, category: "Frontend" },
      GSAP: { regex: /\bGSAP\b/i, category: "Frontend" },
      "Framer Motion": { regex: /\bFramer\s*Motion\b/i, category: "Frontend" },
      Redux: { regex: /\bRedux\b/i, category: "Frontend" },
      "HTML/CSS": { regex: /\bHTML5?\b|\bCSS3?\b/i, category: "Frontend" },

      // Backend & Database
      "Node.js": { regex: /\bNode(?:\.js)?\b/i, category: "Backend" },
      "Express.js": { regex: /\bExpress(?:\.js)?\b/i, category: "Backend" },
      "REST APIs": { regex: /\bREST(?:ful)?(?:\s*APIs?)?\b/i, category: "Backend" },
      JWT: { regex: /\bJWT\b|\bJSON\s*Web\s*Tokens?\b/i, category: "Backend" },
      NestJS: { regex: /\bNest(?:\.js)?\b/i, category: "Backend" },
      FastAPI: { regex: /\bFastAPI\b/i, category: "Backend" },
      Django: { regex: /\bDjango\b/i, category: "Backend" },
      "Spring Boot": { regex: /\bSpring\s*Boot\b/i, category: "Backend" },
      GraphQL: { regex: /\bGraphQL\b/i, category: "Backend" },
      MongoDB: { regex: /\bMongoDB\b/i, category: "Database" },
      PostgreSQL: { regex: /\bPostgreSQL\b|\bPostgres\b/i, category: "Database" },
      Firebase: { regex: /\bFirebase\b/i, category: "Database" },
      Redis: { regex: /\bRedis\b/i, category: "Database" },
      MySQL: { regex: /\bMySQL\b/i, category: "Database" },
      DynamoDB: { regex: /\bDynamoDB\b/i, category: "Database" },

      // Analytics & Performance
      SEO: { regex: /\bSEO\b|\bSearch\s*Engine\s*Optimization\b/i, category: "Analytics & Performance" },
      Lighthouse: { regex: /\bLighthouse\b/i, category: "Analytics & Performance" },
      "Web Vitals": { regex: /\bWeb\s*Vitals\b|\bCore\s*Web\s*Vitals\b/i, category: "Analytics & Performance" },
      "Google Analytics 4": { regex: /\bGoogle\s*Analytics(?:\s*4)?\b|\bGA4\b/i, category: "Analytics & Performance" },
      "Google Tag Manager": { regex: /\bGoogle\s*Tag\s*Manager\b|\bGTM\b/i, category: "Analytics & Performance" },

      // Tools & Platforms
      Git: { regex: /\bGit\b(?!Hub|Lab)/i, category: "Tools & Platforms" },
      GitHub: { regex: /\bGitHub\b/i, category: "Tools & Platforms" },
      Postman: { regex: /\bPostman\b/i, category: "Tools & Platforms" },
      Docker: { regex: /\bDocker\b/i, category: "Tools & Platforms" },
      Figma: { regex: /\bFigma\b/i, category: "Tools & Platforms" },
      Vercel: { regex: /\bVercel\b/i, category: "Tools & Platforms" },
      Zapier: { regex: /\bZapier\b/i, category: "Tools & Platforms" },
      Kubernetes: { regex: /\bKubernetes\b|\bK8s\b/i, category: "Tools & Platforms" },
      "CI/CD": { regex: /\bCI[\/-]?CD\b/i, category: "Tools & Platforms" },
      AWS: { regex: /\bAWS\b|\bAmazon\s*Web\s*Services\b/i, category: "Tools & Platforms" },
      Azure: { regex: /\bAzure\b/i, category: "Tools & Platforms" },
      GCP: { regex: /\bGCP\b|\bGoogle\s*Cloud\b/i, category: "Tools & Platforms" },
      Linux: { regex: /\bLinux\b|\bUbuntu\b/i, category: "Tools & Platforms" },

      // Soft Skills
      "Problem Solving": { regex: /\bProblem\s*Solving\b/i, category: "Soft Skill" },
      Communication: { regex: /\bCommunication\b/i, category: "Soft Skill" },
      Teamwork: { regex: /\bTeamwork\b|\bTeam\s*Collaboration\b/i, category: "Soft Skill" },
      "Analytical Thinking": { regex: /\bAnalytical\s*Thinking\b/i, category: "Soft Skill" },
      Debugging: { regex: /\bDebugging\b/i, category: "Soft Skill" },

      // AI & Machine Learning
      "Machine Learning": { regex: /\bMachine\s*Learning\b|\bML\b/i, category: "AI & ML" },
      "Generative AI": { regex: /\bGenerative\s*AI\b|\bGenAI\b/i, category: "AI & ML" },
      PyTorch: { regex: /\bPyTorch\b/i, category: "AI & ML" },
      TensorFlow: { regex: /\bTensorFlow\b/i, category: "AI & ML" },
      RAG: { regex: /\bRAG\b|\bRetrieval[\s-]Augmented\b/i, category: "AI & ML" },
      LLMs: { regex: /\bLLMs?\b|\bLarge\s*Language\s*Models?\b/i, category: "AI & ML" },
      NLP: { regex: /\bNLP\b|\bNatural\s*Language\s*Processing\b/i, category: "AI & ML" },
    };

    for (const [skillName, { regex, category }] of Object.entries(skillTaxonomy)) {
      if (regex.test(text)) {
        skillsMap.set(skillName, category);
      }
    }

    return Array.from(skillsMap.entries()).map(([name, category]) => ({
      name,
      category,
    }));
  }

  /**
   * Extract education qualifications (Degree, Institution, Field, Graduation Year).
   */
  extractEducation(text: string): IResumeEducation[] {
    const educationList: IResumeEducation[] = [];
    const lines = text.split("\n");

    const degreePatterns = [
      /\b(B\.?Tech|Bachelor\s+of\s+Technology|B\.?S\.?|Bachelor\s+of\s+Science|B\.?E\.?|Bachelor\s+of\s+Engineering)\b/i,
      /\b(M\.?Tech|Master\s+of\s+Technology|M\.?S\.?|Master\s+of\s+Science|M\.?C\.?A\.?|MBA|Master\s+of\s+Business\s+Administration)\b/i,
      /\b(Ph\.?D\.?|Doctor\s+of\s+Philosophy)\b/i,
      /\b(Diploma|Associate\s+Degree)\b/i,
    ];

    const yearPattern = /\b(19\d{2}|20\d{2})\s*(?:-|–|to)\s*(19\d{2}|20\d{2}|present)\b/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      for (const pattern of degreePatterns) {
        const degreeMatch = line.match(pattern);
        if (degreeMatch) {
          const degree = degreeMatch[0];
          // Look around 2 lines before/after for institution and year
          const contextBlock = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(" ");
          const yearMatch = contextBlock.match(yearPattern);

          // Institution inference
          let institution = "University / Institution";
          const instMatch = contextBlock.match(
            /(?:at|from|university|institute|college|school)\s+([A-Za-z\s&.-]+(?:University|Institute|College|Academy|School))/i
          );
          if (instMatch) {
            institution = instMatch[1].trim();
          }

          // Field of study inference
          let fieldOfStudy = "Computer Science";
          const fieldMatch = contextBlock.match(
            /(?:in|of)\s+([A-Za-z\s]+(?:Engineering|Science|Technology|Information|Mathematics|Business))/i
          );
          if (fieldMatch) {
            fieldOfStudy = fieldMatch[1].trim();
          }

          educationList.push({
            institution,
            degree,
            fieldOfStudy,
            startYear: yearMatch ? parseInt(yearMatch[1], 10) : null,
            endYear: yearMatch && yearMatch[2].toLowerCase() !== "present" ? parseInt(yearMatch[2], 10) : null,
          });
          break;
        }
      }
    }

    return educationList;
  }

  /**
   * Extract work experience blocks and titles.
   */
  extractExperience(text: string): IResumeExperience[] {
    const experienceList: IResumeExperience[] = [];
    const lines = text.split("\n");

    const titleKeywords = [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "DevOps Engineer",
      "Cloud Architect",
      "Data Scientist",
      "Machine Learning Engineer",
      "Product Manager",
      "Tech Lead",
      "Engineering Manager",
      "Intern",
    ];

    const dateRangePattern =
      /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4})\s*[-–to]\s*(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4}|Present)\b/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      for (const title of titleKeywords) {
        if (new RegExp(`\\b${title}\\b`, "i").test(line)) {
          const contextBlock = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 4)).join(" ");
          const dateMatch = contextBlock.match(dateRangePattern);

          // Infer company name from nearby uppercase words
          let companyName = "Company";
          const compMatch = contextBlock.match(/(?:at|@|with)\s+([A-Za-z0-9\s&.-]+)/i);
          if (compMatch) {
            companyName = compMatch[1].split(/\n|,|-/)[0].trim();
          }

          experienceList.push({
            jobTitle: title,
            companyName,
            isCurrent: dateMatch ? /present/i.test(dateMatch[0]) : false,
            description: contextBlock.slice(0, 300),
          });
          break;
        }
      }
    }

    return experienceList;
  }

  /**
   * Master extraction orchestrator.
   */
  async parseResumeBuffer(buffer: Buffer): Promise<IResumeExtractedData> {
    const rawText = await this.extractRawTextFromBuffer(buffer);
    return this.parseResumeText(rawText);
  }

  /**
   * Parse structured sections from raw text string.
   */
  parseResumeText(text: string): IResumeExtractedData {
    const personalInfo = this.extractPersonalInfo(text);
    const skills = this.extractSkills(text);
    const education = this.extractEducation(text);
    const experience = this.extractExperience(text);

    // Summary extraction (look for dedicated summary/profile section, avoid education/achievements)
    let summary: string | null = null;
    const summaryHeaderMatch = text.match(
      /(?:professional\s+summary|executive\s+summary|summary|profile|about\s+me|career\s+objective|objective)\s*[:\n\-]\s*([\s\S]{20,400}?)(?=\n\s*(?:skills|technical\s+skills|experience|work\s+experience|education|projects|achievements|certifications|\b[A-Z\s]{4,}\b\n|$))/i
    );

    if (summaryHeaderMatch && summaryHeaderMatch[1]) {
      const cleanSummary = summaryHeaderMatch[1].replace(/\s+/g, " ").trim();
      if (!/^(?:achievements?|education|experience|skills?)\b/i.test(cleanSummary) && cleanSummary.length > 20) {
        summary = cleanSummary.slice(0, 350);
      }
    }

    // Estimate total experience
    const totalExperienceYears = Math.min(15, Math.max(1, experience.length * 1.5));

    return {
      personalInfo,
      summary,
      skills,
      education,
      experience,
      projects: [],
      certifications: [],
      totalExperienceYears,
      parserVersion: "1.0.0-pdf-parse",
    };
  }
}

export const resumeParserService = new ResumeParserService();
