import { describe, it, expect } from "vitest";
import { ResumeAtsEngine, normalizeSkill } from "@/modules/resume/resume.ats";
import { IResumeExtractedData } from "@/database/models/Resume.model";

describe("ResumeAtsEngine", () => {
  const engine = new ResumeAtsEngine();

  describe("Skill Normalization", () => {
    it("should normalize common aliases correctly", () => {
      expect(normalizeSkill("React.js")).toBe("react");
      expect(normalizeSkill("TypeScript")).toBe("typescript");
      expect(normalizeSkill("NodeJS")).toBe("node.js");
      expect(normalizeSkill("Tailwind CSS")).toBe("tailwind css");
      expect(normalizeSkill("PostgreSQL")).toBe("postgresql");
      expect(normalizeSkill("CI/CD")).toBe("ci/cd");
      expect(normalizeSkill("K8s")).toBe("kubernetes");
    });
  });

  describe("ATS Scoring & Calculations", () => {
    const strongExtractedData: IResumeExtractedData = {
      personalInfo: {
        fullName: "Alex Rivera",
        email: "alex@example.com",
        phone: "+1 555-0199",
        location: "San Francisco, CA",
      },
      summary: "Senior Full Stack Engineer with 6+ years of experience building high-scale distributed web applications.",
      skills: [
        { name: "React", category: "Frontend" },
        { name: "Next.js", category: "Frontend" },
        { name: "TypeScript", category: "Language" },
        { name: "JavaScript", category: "Language" },
        { name: "Node.js", category: "Backend" },
        { name: "Express.js", category: "Backend" },
        { name: "REST APIs", category: "Backend" },
        { name: "MongoDB", category: "Database" },
        { name: "PostgreSQL", category: "Database" },
        { name: "AWS", category: "Cloud" },
        { name: "Docker", category: "DevOps" },
        { name: "Git", category: "DevOps" },
        { name: "CI/CD", category: "DevOps" },
      ],
      experience: [
        {
          companyName: "Acme Cloud Corp",
          jobTitle: "Senior Software Engineer",
          description: "Architected microservices that reduced latency by 45% and served 2M+ active users daily.",
        },
      ],
      education: [
        {
          institution: "State University",
          degree: "B.Tech Computer Science",
        },
      ],
      projects: [],
      certifications: [],
    };

    const strongRawText = `
Alex Rivera
alex@example.com | +1 555-0199 | San Francisco, CA
Summary: Senior Full Stack Engineer with 6+ years building web applications.
Technical Skills: React, Next.js, TypeScript, JavaScript, Node.js, Express.js, REST APIs, MongoDB, PostgreSQL, AWS, Docker, Git, CI/CD
Experience:
Senior Software Engineer at Acme Cloud Corp
- Architected microservices that reduced latency by 45% and served 2M+ active users daily.
- Optimized database query throughput by 3x and improved CI/CD deployment speed by 50%.
- Led team of 6 engineers delivering cloud microservices infrastructure.
Education:
B.Tech Computer Science, State University
    `;

    it("should calculate high score for a comprehensive resume", () => {
      const result = engine.analyze(strongExtractedData, strongRawText);

      expect(result.overallScore).toBeGreaterThanOrEqual(75);
      expect(result.level).toBe("GOOD");
      expect(result.breakdown.keywordMatch).toBeGreaterThan(60);
      expect(result.breakdown.structure).toBeGreaterThanOrEqual(80);
      expect(result.breakdown.impact).toBeGreaterThanOrEqual(80);
      expect(result.categories.frontend.matched).toBeGreaterThanOrEqual(4);
      expect(result.categories.backend.matched).toBeGreaterThanOrEqual(3);
    });

    it("should handle empty or minimal resume safely", () => {
      const emptyData: IResumeExtractedData = {
        skills: [],
        education: [],
        experience: [],
        projects: [],
        certifications: [],
      };

      const result = engine.analyze(emptyData, "");

      expect(result.overallScore).toBeGreaterThanOrEqual(10);
      expect(result.overallScore).toBeLessThan(50);
      expect(result.level).toBe("NEEDS_IMPROVEMENT");
      expect(result.missingKeywords.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should generate ATS system simulations accurately", () => {
      const result = engine.analyze(strongExtractedData, strongRawText);

      expect(result.atsCompatibility.length).toBe(4);
      const greenhouse = result.atsCompatibility.find((s) => s.system === "Greenhouse");
      expect(greenhouse).toBeDefined();
      expect(greenhouse?.compatibilityScore).toBeGreaterThanOrEqual(70);
    });

    it("should identify missing keywords and provide recommendations", () => {
      const partialData: IResumeExtractedData = {
        personalInfo: { fullName: "Jane Doe", email: "jane@example.com" },
        skills: [{ name: "React", category: "Frontend" }],
        education: [],
        experience: [],
        projects: [],
        certifications: [],
      };

      const result = engine.analyze(partialData, "Jane Doe React developer");

      expect(result.missingKeywords.length).toBeGreaterThan(0);
      const hasMissingBackend = result.missingKeywords.some((k) => k.category === "Backend");
      expect(hasMissingBackend).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});
