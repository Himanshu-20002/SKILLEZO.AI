import { describe, it, expect } from "vitest";
import { ResumeParserService } from "@/modules/resume/resume.parser";

describe("ResumeParserService", () => {
  const parser = new ResumeParserService();

  const sampleResumeText = `
    Alex Rivera
    Senior Full Stack Engineer
    Email: alex.rivera@example.com | Phone: +1 (555) 234-5678 | Location: San Francisco, CA
    LinkedIn: linkedin.com/in/alexrivera | GitHub: github.com/alexrivera

    PROFESSIONAL SUMMARY
    Results-driven Software Engineer with 6+ years of experience architecting scalable distributed systems using React, TypeScript, Next.js, Node.js, and AWS.

    TECHNICAL SKILLS
    Languages: TypeScript, JavaScript, Python, SQL, Go
    Frontend: React, Next.js, Tailwind CSS, Redux, HTML5/CSS3
    Backend & Cloud: Node.js, Express, PostgreSQL, Redis, Docker, Kubernetes, AWS, CI/CD
    AI & ML: PyTorch, Generative AI, RAG, LLMs

    WORK EXPERIENCE
    Senior Full Stack Developer at Acme Cloud Corp
    Jan 2021 - Present
    - Designed and shipped microservices architecture processing 10M+ daily events.
    - Led migration to Next.js 15 and TypeScript, improving Core Web Vitals by 40%.

    Software Engineer at Delta Systems
    Jun 2018 - Dec 2020
    - Built REST APIs and real-time dashboard using Node.js, React, and MongoDB.

    EDUCATION
    Bachelor of Technology in Computer Science
    Stanford University | 2014 - 2018
  `;

  describe("extractPersonalInfo", () => {
    it("should correctly extract candidate name, email, and phone", () => {
      const personalInfo = parser.extractPersonalInfo(sampleResumeText);

      expect(personalInfo.fullName).toBe("Alex Rivera");
      expect(personalInfo.email).toBe("alex.rivera@example.com");
      expect(personalInfo.phone).toContain("555");
    });
  });

  describe("extractSkills", () => {
    it("should extract and categorize skills across frontend, backend, devops, and AI", () => {
      const skills = parser.extractSkills(sampleResumeText);
      const skillNames = skills.map((s) => s.name);

      expect(skillNames).toContain("TypeScript");
      expect(skillNames).toContain("React");
      expect(skillNames).toContain("Next.js");
      expect(skillNames).toContain("Node.js");
      expect(skillNames).toContain("AWS");
      expect(skillNames).toContain("Docker");
      expect(skillNames).toContain("PyTorch");
      expect(skillNames).toContain("Generative AI");
      expect(skillNames).toContain("RAG");

      const tsSkill = skills.find((s) => s.name === "TypeScript");
      expect(tsSkill?.category).toBe("Language");

      const reactSkill = skills.find((s) => s.name === "React");
      expect(reactSkill?.category).toBe("Frontend");

      const awsSkill = skills.find((s) => s.name === "AWS");
      expect(awsSkill?.category).toBe("Tools & Platforms");
    });

    it("should accurately parse full user technical skills block with direct categories", () => {
      const userText = `
        Technical Skills
        Frontend: React, Next.js, JavaScript, TypeScript, Tailwind CSS, GSAP, Framer Motion
        Backend & Database: Node.js, Express.js, REST APIs, JWT, MongoDB, PostgreSQL, Firebase, Redis
        Analytics & Performance: SEO, Lighthouse, Web Vitals, Google Analytics 4, Google Tag Manager
        Tools & Platforms: Git, GitHub, Postman, Docker, figma, Vercel, Zapier
        Soft Skill: Problem Solving, Communication, Teamwork, Analytical Thinking, Debugging
      `;

      const skills = parser.extractSkills(userText);
      const skillNames = skills.map((s) => s.name);

      expect(skillNames).toContain("GSAP");
      expect(skillNames).toContain("Framer Motion");
      expect(skillNames).toContain("Express.js");
      expect(skillNames).toContain("JWT");
      expect(skillNames).toContain("Firebase");
      expect(skillNames).toContain("SEO");
      expect(skillNames).toContain("Lighthouse");
      expect(skillNames).toContain("Web Vitals");
      expect(skillNames).toContain("Google Analytics 4");
      expect(skillNames).toContain("Google Tag Manager");
      expect(skillNames).toContain("Postman");
      expect(skillNames).toContain("Figma");
      expect(skillNames).toContain("Vercel");
      expect(skillNames).toContain("Zapier");
      expect(skillNames).toContain("Problem Solving");
      expect(skillNames).toContain("Debugging");
    });
  });

  describe("extractEducation", () => {
    it("should extract degree, field of study, and graduation years", () => {
      const education = parser.extractEducation(sampleResumeText);

      expect(education.length).toBeGreaterThan(0);
      expect(education[0].degree).toMatch(/Bachelor/i);
      expect(education[0].startYear).toBe(2014);
      expect(education[0].endYear).toBe(2018);
    });
  });

  describe("extractExperience", () => {
    it("should extract job titles and detect active current employment", () => {
      const experience = parser.extractExperience(sampleResumeText);

      expect(experience.length).toBeGreaterThan(0);
      const seniorRole = experience.find((e) => e.jobTitle.includes("Full Stack Developer"));
      expect(seniorRole).toBeDefined();
      expect(seniorRole?.isCurrent).toBe(true);
    });
  });

  describe("extractProjects", () => {
    it("should extract project title, technologies, description and url", () => {
      const projectText = `
        PROJECTS
        AI Resume Studio - Interactive Builder
        Tech: Next.js, TypeScript, Tailwind CSS, OpenAI
        Architected a full-featured real-time resume editor with PDF generation and ATS scoring.
        https://github.com/alexrivera/resume-studio
      `;

      const projects = parser.extractProjects(projectText);
      expect(projects.length).toBe(1);
      expect(projects[0].title).toBe("AI Resume Studio");
      expect(projects[0].technologies).toContain("Next.js");
      expect(projects[0].technologies).toContain("TypeScript");
      expect(projects[0].link).toBe("https://github.com/alexrivera/resume-studio");
    });

    it("should extract all 3 projects and clean dates and link annotations", () => {
      const multiProjectText = `
        Projects
        GuardOps – Workforce Safety PPE Monitoring Platform
        Next.js, TypeScript, Drizzle ORM, PostgreSQL (Neon), Better Auth, Tailwind CSSMarch 2026
        • Built a role-based PPE Workforce Safety Platform for admin and supervisor operations.
        GitHubRepository —LiveDemo
        Habib’s Hair & Beauty Salon Website
        Next.js, PostgreSQL, Admin dashboard, GA4, GTM, ZapierJune 2026
        • Built and deployed a production-ready salon website with an admin dashboard.
        GitHubRepositoryLiveDemo
        ContentAI – AI-Powered Social Media Campaign Generator
        Next.js 16, Tailwind CSS, Drizzle ORM, PostgreSQL, Auth.js (NextAuth), OpenRouter APIJan 2026
        • Engineered a full-stack generative AI dashboard using Next.js App Router.
        GitHubRepository —LiveDemo
        Education
        Bachelor of Technology
      `;

      const mockLinks = [
        { url: "https://github.com/Himanshu-20002/Workforce-Safety-Monitoring-Platform" },
        { url: "https://workforce-safety-monitoring-platfor.vercel.app/" },
        { url: "https://github.com/Himanshu-20002/Habibs-Hair-Beauty-Salon" },
        { url: "https://habibs-hair-beauty-salon.vercel.app/" },
        { url: "https://github.com/Himanshu-20002/contentAI.git" },
        { url: "https://content-ai-amber.vercel.app/" },
      ];

      const projects = parser.extractProjects(multiProjectText, mockLinks);
      expect(projects.length).toBe(3);

      expect(projects[0].title).toBe("GuardOps");
      expect(projects[0].technologies).toContain("Tailwind CSS");
      expect(projects[0].technologies).not.toContain("Tailwind CSSMarch 2026");
      expect(projects[0].githubUrl).toBe("https://github.com/Himanshu-20002/Workforce-Safety-Monitoring-Platform");
      expect(projects[0].liveDemoUrl).toBe("https://workforce-safety-monitoring-platfor.vercel.app/");

      expect(projects[1].title).toContain("Habib");
      expect(projects[1].technologies).toContain("Zapier");
      expect(projects[1].githubUrl).toBe("https://github.com/Himanshu-20002/Habibs-Hair-Beauty-Salon");

      expect(projects[2].title).toBe("ContentAI");
      expect(projects[2].technologies).toContain("OpenRouter API");
      expect(projects[2].githubUrl).toBe("https://github.com/Himanshu-20002/contentAI.git");
      expect(projects[2].liveDemoUrl).toBe("https://content-ai-amber.vercel.app/");
    });
  });

  describe("parseResumeText", () => {
    it("should return comprehensive structured IResumeExtractedData payload", () => {
      const extracted = parser.parseResumeText(sampleResumeText);

      expect(extracted.personalInfo?.fullName).toBe("Alex Rivera");
      expect(extracted.skills.length).toBeGreaterThan(5);
      expect(extracted.education.length).toBeGreaterThan(0);
      expect(extracted.experience.length).toBeGreaterThan(0);
      expect(extracted.totalExperienceYears).toBeGreaterThan(0);
      expect(extracted.parserVersion).toBe("1.0.0-pdf-parse");
    });
  });
});
