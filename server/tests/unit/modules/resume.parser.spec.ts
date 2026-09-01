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
      expect(awsSkill?.category).toBe("DevOps & Cloud");
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
