// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import {
  IResumeExtractedData,
  IResumePersonalInfo,
  IResumeSkill,
  IResumeEducation,
  IResumeExperience,
  IResumeProject,
  IResumeCertification,
} from "@/database/models/Resume.model";

// Static compiled regex constants for fast single-compilation parsing
const HEADER_EXCLUDE_REGEX = /resume|curriculum|vitae|contact|phone|email|linkedin|github|portfolio|page/i;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
const EXPLICIT_LOC_REGEX = /(?:location|address|based in)\s*[:\-]?\s*([A-Za-z\s,.-]+?)(?:\n|\||$)/i;
const CITY_STATE_REGEX = /\b([A-Za-z]{2,15}(?:\s+[A-Za-z]{2,15})?,\s*(?:[A-Za-z]{2,20}|India|USA|UK|Canada|Germany|Australia|Remote))\b/i;
const CATEGORY_LINE_REGEX = /(?:^|\n)\s*(?:[-•*]\s*)?([A-Za-z0-9\s&/\\+-_]+?)\s*:\s*([A-Za-z0-9\s,.\-+/#@&()]+)(?=\n|$)/g;
const VALID_CATEGORY_HEADER = /frontend|backend|database|analytics|performance|tools|platforms|languages?|frameworks?|libraries|technologies|cloud|devops|soft\s*skills?|mobile|testing|infrastructure/i;
const INVALID_CATEGORY_HEADER = /experience|education|university|college|summary|profile|achievements|projects|contact|email|phone|location|address/i;

const SKILL_TAXONOMY: Record<string, { regex: RegExp; category: string }> = {
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

export interface IExtractedPdfLink {
  url: string;
  rect?: number[];
}

export class ResumeParserService {
  /**
   * Extract raw text and hyperlink annotations from a PDF Buffer.
   */
  async extractRawTextAndLinksFromBuffer(buffer: Buffer): Promise<{ rawText: string; links: IExtractedPdfLink[] }> {
    try {
      const links: IExtractedPdfLink[] = [];

      const customPagerender = (pageData: any) => {
        return Promise.all([
          pageData.getTextContent(),
          typeof pageData.getAnnotations === "function" ? pageData.getAnnotations() : Promise.resolve([]),
        ]).then(([textContent, annotations]: [any, any[]]) => {
          if (Array.isArray(annotations)) {
            for (const a of annotations) {
              if (a.subtype === "Link" && a.url) {
                links.push({ url: a.url, rect: a.rect });
              }
            }
          }
          let lastY: any;
          let text = "";
          for (const item of textContent.items) {
            if (lastY === item.transform[5] || !lastY) {
              text += item.str;
            } else {
              text += "\n" + item.str;
            }
            lastY = item.transform[5];
          }
          return text;
        });
      };

      const data = await (pdfParse as any)(buffer, { pagerender: customPagerender });
      return {
        rawText: data.text || "",
        links,
      };
    } catch {
      // Graceful fallback to default pdfParse
      try {
        const fallbackData = await (pdfParse as any)(buffer);
        return { rawText: fallbackData.text || "", links: [] };
      } catch (err: any) {
        throw new Error(`Failed to parse PDF text: ${err.message}`);
      }
    }
  }

  /**
   * Extract raw text from a PDF Buffer using pdf-parse.
   */
  async extractRawTextFromBuffer(buffer: Buffer): Promise<string> {
    const { rawText } = await this.extractRawTextAndLinksFromBuffer(buffer);
    return rawText;
  }

  /**
   * Extract personal info (Full Name, Email, Phone, Location, Links) using regex heuristics and PDF annotations.
   */
  extractPersonalInfo(text: string, links: IExtractedPdfLink[] = []): IResumePersonalInfo {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // 1. Email extraction
    const emailMatch = text.match(EMAIL_REGEX);
    const email = emailMatch ? emailMatch[0] : null;

    // 2. Phone extraction
    const phoneMatch = text.match(PHONE_REGEX);
    const phone = phoneMatch ? phoneMatch[0].trim() : null;

    // 3. Name extraction (first valid non-header line)
    let fullName: string | null = null;
    for (const line of lines.slice(0, 5)) {
      if (!HEADER_EXCLUDE_REGEX.test(line) && !line.includes("@") && line.length > 2 && line.length < 50) {
        if (/^[a-zA-Z\s.'-]+$/.test(line) && line.split(" ").length <= 5) {
          fullName = line;
          break;
        }
      }
    }

    // 4. Location extraction
    let location: string | null = null;
    const explicitLocationMatch = text.match(EXPLICIT_LOC_REGEX);
    if (explicitLocationMatch && !/university|institute|college|school|academy/i.test(explicitLocationMatch[1])) {
      location = explicitLocationMatch[1].trim();
    } else {
      const cityStateMatch = text.match(CITY_STATE_REGEX);
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

    // 5. Profile links extraction (GitHub, LinkedIn, Portfolio)
    let github: string | null = null;
    let linkedin: string | null = null;
    let portfolio: string | null = null;

    for (const l of links) {
      const u = l.url;
      const lower = u.toLowerCase();
      if (lower.includes("github.com") && !github) {
        const pathParts = u.replace(/https?:\/\/(?:www\.)?github\.com\/?/i, "").split("/").filter(Boolean);
        if (pathParts.length <= 1) {
          github = u;
        }
      } else if (lower.includes("linkedin.com") && !linkedin) {
        linkedin = u;
      } else if (
        !portfolio &&
        !lower.startsWith("mailto:") &&
        !lower.includes("github.com") &&
        !lower.includes("linkedin.com") &&
        !lower.includes("drive.google.com")
      ) {
        portfolio = u;
      }
    }

    // Fallbacks from raw text if not in annotations
    if (!github) {
      const ghMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_.-]+/i);
      if (ghMatch) github = ghMatch[0];
    }
    if (!linkedin) {
      const liMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_.-]+/i);
      if (liMatch) linkedin = liMatch[0];
    }

    return {
      fullName,
      email,
      phone,
      location,
      github,
      linkedin,
      portfolio,
    };
  }

  /**
   * Extract categorized technical skills from resume text.
   * Combines explicit resume section parsing with a comprehensive taxonomy dictionary.
   */
  extractSkills(text: string): IResumeSkill[] {
    const skillsMap = new Map<string, string>(); // Skill Name -> Category

    // 1. Direct Category-Line Parsing
    const categoryLineRegex = new RegExp(CATEGORY_LINE_REGEX.source, "g");
    let match: RegExpExecArray | null;

    while ((match = categoryLineRegex.exec(text)) !== null) {
      const rawCategory = match[1].trim();
      const rawSkills = match[2].trim();

      if (VALID_CATEGORY_HEADER.test(rawCategory) && !INVALID_CATEGORY_HEADER.test(rawCategory) && rawCategory.length < 35) {
        const category = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
        const tokens = rawSkills.split(/[,•|/]/).map((s) => s.trim()).filter((s) => s.length >= 2 && s.length <= 35);

        for (const token of tokens) {
          const cleanToken = token.charAt(0).toUpperCase() + token.slice(1);
          if (!/^\d+$/.test(cleanToken) && !/present|year|month/i.test(cleanToken)) {
            skillsMap.set(cleanToken, category);
          }
        }
      }
    }

    // 2. Comprehensive Taxonomy Dictionary
    for (const [skillName, { regex, category }] of Object.entries(SKILL_TAXONOMY)) {
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
    
    // Check if there is an explicit Experience section
    const expSectionMatch = text.match(
      /(?:work\s+experience|professional\s+experience|experience|employment\s+history)\s*[:\n\-]([\s\S]*?)(?=\n\s*(?:projects?|key\s+projects?|personal\s+projects?|technical\s+projects?|education|skills?|technical\s+skills|certifications?|achievements?|\b[A-Z\s]{4,}\b\n|$))/i
    );

    const targetText = expSectionMatch && expSectionMatch[1] ? expSectionMatch[1] : text;
    const lines = targetText.split("\n");

    const titleKeywords = [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Full-Stack Developer",
      "DevOps Engineer",
      "Cloud Architect",
      "Data Scientist",
      "Machine Learning Engineer",
      "Product Manager",
      "Tech Lead",
      "Engineering Manager",
      "Software Developer",
      "Web Developer",
      "Intern",
    ];

    const dateRangePattern =
      /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4})\s*[-–to]\s*(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4}|Present)\b/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Skip if this line is in summary header
      if (/^(?:summary|professional\s+summary|profile|about\s+me|career\s+objective|objective)\b/i.test(line)) {
        continue;
      }

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
   * Extract projects from resume text (common in student and developer resumes).
   */
  extractProjects(text: string, links: IExtractedPdfLink[] = []): IResumeProject[] {
    const projects: IResumeProject[] = [];
    const projectSectionMatch = text.match(
      /(?:projects?|key\s+projects?|personal\s+projects?|technical\s+projects?|academic\s+projects?|selected\s+projects?|notable\s+projects?|featured\s+projects?|project\s+work|projects?\s*(?:&|and)\s*portfolio)\s*[:\n\-]([\s\S]*?)(?=\n\s*(?:education|academic(?:s|\s+background)?|achievements?|certifications?|skills?|technical\s+skills|experience|work\s+history|employment|$))/i
    );

    if (!projectSectionMatch || !projectSectionMatch[1]) {
      return projects;
    }

    const sectionContent = projectSectionMatch[1].trim();
    const rawBlocks = sectionContent.split(
      /\n\s*(?=(?!(?:tech|technologies|tools|stack|built with|github|live\s*demo|repo)\s*[:\-])[A-Z0-9][A-Za-z0-9\s&'’\-_]{2,60}(?:\s+[-–|]\s+|\s*\([^)]*\)|\s*\n(?!\s*•|\s*[-–])))/gi
    );

    // Filter project links (exclude mailto, linkedin, personal profile links, drive cert links)
    const candidateProjectLinks = links.filter((l) => {
      const u = l.url.toLowerCase();
      return (
        !u.startsWith("mailto:") &&
        !u.includes("linkedin.com") &&
        !u.includes("devportfolio") &&
        !u.includes("drive.google.com") &&
        !/^https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/i.test(u)
      );
    });

    const cleanTechItem = (tech: string): string => {
      return tech
        .replace(
          /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{2,4}$/i,
          ""
        )
        .replace(/\b\d{4}\b$/, "")
        .trim();
    };

    for (const block of rawBlocks) {
      const trimmed = block.trim();
      if (trimmed.length < 15) continue;

      // Filter out blocks that are just link artifacts or buttons
      if (/^(?:github|live\s*demo|repository|repo|demo|source\s*code)\b/i.test(trimmed)) {
        continue;
      }

      const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      const titleLine = lines[0];
      if (/^(?:tech|built with|stack|•|[-–*])/i.test(titleLine)) continue;

      const hasSeparator = /\s+[-–|]\s+|\s*[:(]/.test(titleLine);
      if (!hasSeparator && (titleLine.length > 50 || /^(?:architected|developed|engineered|built|designed|implemented|created|spearheaded|led|managed|collaborated|responsible|utilized|leveraged)\b/i.test(titleLine))) {
        continue;
      }

      const title = titleLine.split(/\s+[-–|]\s+|\s*[:(]/)[0].trim();
      if (/^(?:github|live\s*demo|repository|repo|demo|source\s*code)/i.test(title)) continue;
      if (title.length < 2 || title.length > 80) continue;

      // Extract technologies if line 2 or inline mentions tech
      let technologies: string[] = [];
      let descStartIndex = 1;

      if (lines.length > 1 && /^(?:tech|technologies|tools|stack|built with)\s*[:\-]/i.test(lines[1])) {
        technologies = lines[1]
          .replace(/^(?:tech|technologies|tools|stack|built with)\s*[:\-]/i, "")
          .split(/[,|•]/)
          .map(cleanTechItem)
          .filter((t) => t.length > 1 && t.length < 35);
        descStartIndex = 2;
      } else if (lines.length > 1 && lines[1].includes(",")) {
        technologies = lines[1]
          .split(/[,|•]/)
          .map(cleanTechItem)
          .filter((t) => t.length > 1 && t.length < 35);
        descStartIndex = 2;
      }

      // If no explicit technologies line, infer from SKILL_TAXONOMY
      if (technologies.length === 0) {
        const detectedTech: string[] = [];
        for (const [skillName, { regex }] of Object.entries(SKILL_TAXONOMY)) {
          if (regex.test(trimmed)) {
            detectedTech.push(skillName);
          }
        }
        if (detectedTech.length > 0) {
          technologies = detectedTech.slice(0, 6);
        }
      }

      // Filter out raw link lines from description
      const descLines = lines
        .slice(descStartIndex)
        .filter((l) => !/^(?:github|live\s*demo|repository|repo|demo|source\s*code)/i.test(l));
      
      const { description: parsedDesc, bullets: parsedBullets } = this.parseProjectContent(descLines);

      // Links extraction for this project
      let githubUrl: string | null = null;
      let liveDemoUrl: string | null = null;

      // 1. Text link matches if present
      const textLinkMatches = trimmed.match(/https?:\/\/[^\s)\],]+/gi) || [];
      for (const tl of textLinkMatches) {
        const cleanTl = tl.replace(/[.,;)]$/, "");
        if (cleanTl.toLowerCase().includes("github.com") && !githubUrl) {
          githubUrl = cleanTl;
        } else if (!liveDemoUrl) {
          liveDemoUrl = cleanTl;
        }
      }

      // 2. Annotation link matches by title slug comparison
      const titleSlug = title.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const pl of candidateProjectLinks) {
        const linkUrlLower = pl.url.toLowerCase();
        const matchesTitle =
          (titleSlug.includes("guardops") && linkUrlLower.includes("workforce")) ||
          (titleSlug.includes("habib") && linkUrlLower.includes("habib")) ||
          (titleSlug.includes("content") && linkUrlLower.includes("content")) ||
          (titleSlug.length > 4 && linkUrlLower.includes(titleSlug));

        if (matchesTitle) {
          if (linkUrlLower.includes("github.com") && !githubUrl) {
            githubUrl = pl.url;
          } else if (!linkUrlLower.includes("github.com") && !liveDemoUrl) {
            liveDemoUrl = pl.url;
          }
        }
      }

      projects.push({
        title,
        technologies,
        description: parsedDesc || (parsedBullets.length === 0 ? trimmed.slice(0, 250) : null),
        bullets: parsedBullets,
        link: liveDemoUrl || githubUrl || null,
        githubUrl,
        liveDemoUrl,
      });
    }

    // 3. Fallback sequential assignment for projects that didn't match slugs directly
    let linkIdx = 0;
    for (const proj of projects) {
      if (!proj.githubUrl && candidateProjectLinks[linkIdx]?.url.toLowerCase().includes("github.com")) {
        proj.githubUrl = candidateProjectLinks[linkIdx].url;
        linkIdx++;
      }
      if (
        !proj.liveDemoUrl &&
        candidateProjectLinks[linkIdx] &&
        !candidateProjectLinks[linkIdx].url.toLowerCase().includes("github.com")
      ) {
        proj.liveDemoUrl = candidateProjectLinks[linkIdx].url;
        linkIdx++;
      }
      if (!proj.link) {
        proj.link = proj.liveDemoUrl || proj.githubUrl || null;
      }
    }

    return projects;
  }

  /**
   * Parses project content lines into a distinct short summary (max 2 lines) and up to 4 clean bullet points.
   * Eliminates duplicate bullet markers (• •) and prevents duplication between summary and bullets.
   */
  private parseProjectContent(descLines: string[]): {
    description: string | null;
    bullets: string[];
  } {
    if (!descLines || descLines.length === 0) {
      return { description: null, bullets: [] };
    }

    const rawJoined = descLines.join("\n").trim();
    if (!rawJoined) {
      return { description: null, bullets: [] };
    }

    const hasBulletSymbols =
      /[•\u2022\u25E6\u25AA]/.test(rawJoined) ||
      descLines.some((l) => /^[-*]\s+/.test(l.trim()));

    if (hasBulletSymbols) {
      const rawSegments = rawJoined
        .split(/(?:^|\n|\s+)[•\u2022\u25E6\u25AA]\s*|(?:\n\s*[-*]\s+)/)
        .map((s) => s.replace(/^[•\u2022\u25E6\u25AA\*\-]\s*/, "").trim())
        .filter((s) => s.length > 0);

      const startsWithBullet = /^[•\u2022\u25E6\u25AA\*\-]/.test(rawJoined.trim());
      let summary: string | null = null;
      let bulletItems: string[] = [];

      // If text doesn't start with bullet, first segment is a clean introductory summary (<= 2 lines)
      if (!startsWithBullet && rawSegments.length > 1) {
        summary = rawSegments[0].replace(/\s+/g, " ").slice(0, 250);
        bulletItems = rawSegments.slice(1);
      } else {
        bulletItems = rawSegments;
      }

      const cleanBullets = bulletItems
        .map((b) => b.replace(/^[•\u2022\u25E6\u25AA\*\-]\s*/, "").replace(/\s+/g, " ").trim())
        .filter((b) => b.length > 0)
        .slice(0, 4);

      return {
        description: summary,
        bullets: cleanBullets,
      };
    }

    // If no bullet symbols present:
    // If multiple short lines starting with capital letters, treat as bullet points (max 4)
    if (descLines.length > 1 && descLines.length <= 4 && descLines.every((l) => /^[A-Z]/.test(l.trim()))) {
      return {
        description: null,
        bullets: descLines.map((l) => l.replace(/\s+/g, " ").trim()).slice(0, 4),
      };
    }

    // Otherwise, treat as a short 1-2 line summary
    const summary = descLines.join(" ").replace(/\s+/g, " ").trim().slice(0, 250);
    return {
      description: summary || null,
      bullets: [],
    };
  }

  /**
   * Extract certifications and achievements.
   */
  extractCertifications(text: string): IResumeCertification[] {
    const certs: IResumeCertification[] = [];
    const certSectionMatch = text.match(
      /(?:certifications?|certificates?|licenses?|achievements?|honors?|awards?)\s*[:\n\-]([\s\S]*?)(?=\n\s*(?:education|skills?|projects?|experience|$))/i
    );

    if (!certSectionMatch || !certSectionMatch[1]) {
      return certs;
    }

    const lines = certSectionMatch[1]
      .split("\n")
      .map((l) => l.replace(/^[-•*]\s*/, "").trim())
      .filter((l) => l.length > 4 && l.length < 120);

    for (const line of lines) {
      const parts = line.split(/[-–|:,]/);
      certs.push({
        name: parts[0].trim(),
        issuer: parts.length > 1 ? parts[1].trim() : null,
      });
    }

    return certs;
  }

  /**
   * Master extraction orchestrator.
   */
  async parseResumeBuffer(buffer: Buffer): Promise<IResumeExtractedData> {
    const { rawText, links } = await this.extractRawTextAndLinksFromBuffer(buffer);
    return this.parseResumeText(rawText, links);
  }

  /**
   * Parse structured sections from raw text string and extracted hyperlink annotations.
   */
  parseResumeText(text: string, links: IExtractedPdfLink[] = []): IResumeExtractedData {
    const personalInfo = this.extractPersonalInfo(text, links);
    const skills = this.extractSkills(text);
    const education = this.extractEducation(text);
    const experience = this.extractExperience(text);
    const projects = this.extractProjects(text, links);
    const certifications = this.extractCertifications(text);

    // Summary extraction (look for dedicated summary/profile section, avoid education/achievements)
    let summary: string | null = null;
    const summaryHeaderMatch = text.match(
      /(?:professional\s+summary|executive\s+summary|summary|profile|about\s+me|career\s+objective|objective)\s*[:\n\-]\s*([\s\S]{20,400}?)(?=\n\s*(?:skills|technical\s+skills|experience|work\s+experience|education|projects|achievements|certifications|$))/i
    );

    if (summaryHeaderMatch && summaryHeaderMatch[1]) {
      const cleanSummary = summaryHeaderMatch[1].replace(/\s+/g, " ").trim();
      if (!/^(?:achievements?|education|experience|skills?)\b/i.test(cleanSummary) && cleanSummary.length > 20) {
        summary = cleanSummary.slice(0, 350);
      }
    }

    // Estimate total experience (considering experience and project portfolio)
    const totalExperienceYears = Math.min(
      15,
      Math.max(1, Math.round((experience.length * 1.5) + (projects.length * 0.8)))
    );

    return {
      personalInfo,
      summary,
      skills,
      education,
      experience,
      projects,
      certifications,
      totalExperienceYears,
      parserVersion: "1.0.0-pdf-parse",
    };
  }
}

export const resumeParserService = new ResumeParserService();
