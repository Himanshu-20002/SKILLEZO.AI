import { describe, it, expect } from "vitest";
import {
  ResumeDocumentNormalizer,
  resumeDocumentNormalizer,
  normalizeSkillCategory,
  canonicalizeUrl,
} from "@/modules/resume-intelligence/document/resume-document.normalizer";
import { ResumeDocumentSchema } from "@/modules/resume-intelligence/document/resume-document.schema";
import { IResumeExtractedData } from "@/database/models/Resume.model";

describe("Phase 1: Resume Ingestion Normalization Pipeline", () => {
  const normalizer = new ResumeDocumentNormalizer();

  describe("1. Complete Parser Output Normalization", () => {
    it("should transform complete extracted data into valid canonical ResumeDocument", () => {
      const rawData: IResumeExtractedData = {
        personalInfo: {
          fullName: "Himanshu Kumar",
          email: "himanshu@example.com",
          phone: "+91 9876543210",
          location: "Bengaluru, India",
        },
        summary: "Senior Full-Stack Engineer with 5+ years of experience architecting scalable distributed systems.",
        skills: [
          { name: "TypeScript", category: "Language" },
          { name: "React", category: "Frontend" },
          { name: "Node.js", category: "Backend" },
          { name: "PostgreSQL", category: "Database" },
          { name: "AWS", category: "Cloud" },
          { name: "Docker", category: "DevOps" },
        ],
        experience: [
          {
            companyName: "Tech Corp",
            jobTitle: "Senior Software Engineer",
            startDate: new Date("2022-01-01"),
            endDate: null,
            isCurrent: true,
            description: "Architected real-time analytics pipeline reducing latency by 45%.\nLed a team of 6 engineers to deliver core payment microservice handling 10k requests per second.",
          },
        ],
        projects: [
          {
            title: "CloudFlow Orchestrator",
            description: "Distributed workflow scheduler built with TypeScript and Redis.",
            technologies: ["TypeScript", "Redis", "Docker"],
            link: "https://github.com/sample/cloudflow",
          },
        ],
        education: [
          {
            institution: "National Institute of Technology",
            degree: "Bachelor of Technology",
            fieldOfStudy: "Computer Science",
            startYear: 2017,
            endYear: 2021,
          },
        ],
        certifications: [
          {
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            issueDate: new Date("2023-05-15"),
          },
        ],
        totalExperienceYears: 5,
        parserVersion: "1.0.0-pdf-parse",
      };

      const rawText = "Himanshu Kumar | https://linkedin.com/in/himanshu | https://github.com/himanshu";

      const doc = normalizer.normalize(rawData, rawText, {
        userId: "usr_test_123",
        resumeId: "res_test_123",
        title: "Himanshu Resume",
      });

      // Assert schema validity
      const schemaCheck = ResumeDocumentSchema.safeParse(doc);
      expect(schemaCheck.success).toBe(true);

      // Assert contact normalization
      expect(doc.contact.fullName).toBe("Himanshu Kumar");
      expect(doc.contact.email).toBe("himanshu@example.com");
      expect(doc.contact.phone).toBe("+91 9876543210");
      expect(doc.contact.location).toBe("Bengaluru, India");
      expect(doc.contact.links.length).toBeGreaterThanOrEqual(2);
      expect(doc.contact.links.some((l) => l.label === "LinkedIn" && l.url === "https://linkedin.com/in/himanshu")).toBe(true);

      // Assert summary normalization
      expect(doc.summary.text).toContain("Senior Full-Stack Engineer");
      expect(doc.summary.yearsOfExperience).toBe(5);

      // Assert skills normalization & categories
      expect(doc.skills.length).toBe(6);
      const tsSkill = doc.skills.find((s) => s.name === "TypeScript");
      expect(tsSkill?.category).toBe("LANGUAGE");
      const reactSkill = doc.skills.find((s) => s.name === "React");
      expect(reactSkill?.category).toBe("FRONTEND");

      // Assert experience & bullets
      expect(doc.experience.length).toBe(1);
      expect(doc.experience[0].companyName).toBe("Tech Corp");
      expect(doc.experience[0].isCurrent).toBe(true);
      expect(doc.experience[0].bullets.length).toBe(2);
      expect(doc.experience[0].bullets[0].metrics).toContain("45%");

      // Assert projects
      expect(doc.projects.length).toBe(1);
      expect(doc.projects[0].title).toBe("CloudFlow Orchestrator");

      // Assert education
      expect(doc.education.length).toBe(1);
      expect(doc.education[0].institution).toBe("National Institute of Technology");

      // Assert achievements
      expect(doc.achievements.length).toBe(1);
      expect(doc.achievements[0].title).toBe("AWS Certified Solutions Architect");

      // Assert evidence ledger
      expect(doc.evidence.length).toBeGreaterThan(0);
      expect(doc.evidence.every((e) => e.source === "PARSED")).toBe(true);
      expect(doc.evidence.every((e) => e.verified === false)).toBe(true);
    });
  });

  describe("2. Partial Resume Handling", () => {
    it("should safely produce a valid ResumeDocument when sections are missing", () => {
      const partialData: IResumeExtractedData = {
        personalInfo: {
          fullName: "Jane Student",
          email: "jane.student@college.edu",
        },
        skills: [
          { name: "Python", category: "Language" },
          { name: "SQL", category: "Database" },
        ],
        education: [
          {
            institution: "State University",
            degree: "B.S. in Data Science",
            startYear: 2022,
            endYear: 2026,
          },
        ],
        experience: [],
        projects: [],
        certifications: [],
      };

      const doc = normalizer.normalize(partialData, null, {
        userId: "usr_student",
        title: "Student Resume",
      });

      const schemaCheck = ResumeDocumentSchema.safeParse(doc);
      expect(schemaCheck.success).toBe(true);

      expect(doc.contact.fullName).toBe("Jane Student");
      expect(doc.contact.email).toBe("jane.student@college.edu");
      expect(doc.skills.length).toBe(2);
      expect(doc.experience).toEqual([]);
      expect(doc.projects).toEqual([]);
      expect(doc.education.length).toBe(1);
      expect(doc.achievements).toEqual([]);
    });
  });

  describe("3. Artifact Cleaning and Skill Deduplication", () => {
    it("should clean duplicate skills with case variations and messy whitespace", () => {
      const messyData: IResumeExtractedData = {
        personalInfo: {
          fullName: "   Alex   Morgan   ",
          email: " alex.m@example.com ",
          phone: "  +1 (555) 019-2834  ",
        },
        summary: "Summary:   Passionate backend engineer with expertise in microservices.   ",
        skills: [
          { name: "React", category: "Frontend" },
          { name: "react", category: "Frontend" },
          { name: "REACT", category: "Frontend" },
          { name: "  Node.js  ", category: "Backend" },
          { name: "Node.js", category: "Backend" },
          { name: "Java", category: "Language" },
          { name: "JavaScript", category: "Language" },
        ],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
      };

      const doc = normalizer.normalize(messyData, null);

      expect(doc.contact.fullName).toBe("Alex Morgan");
      expect(doc.contact.email).toBe("alex.m@example.com");
      expect(doc.contact.phone).toBe("+1 (555) 019-2834");
      expect(doc.summary.text).toBe("Passionate backend engineer with expertise in microservices.");

      // React should appear exactly once
      const reactMatches = doc.skills.filter((s) => s.name.toLowerCase() === "react");
      expect(reactMatches.length).toBe(1);

      // Node.js should appear exactly once
      const nodeMatches = doc.skills.filter((s) => s.name.toLowerCase() === "node.js");
      expect(nodeMatches.length).toBe(1);

      // Java and JavaScript must remain distinct
      const java = doc.skills.find((s) => s.name.toLowerCase() === "java");
      const js = doc.skills.find((s) => s.name.toLowerCase() === "javascript");
      expect(java).toBeDefined();
      expect(js).toBeDefined();
      expect(java?.name).not.toBe(js?.name);
    });
  });

  describe("4. URL and Link Canonicalization", () => {
    it("should canonicalize profile links from text", () => {
      expect(canonicalizeUrl("linkedin.com/in/johndoe")).toBe("https://linkedin.com/in/johndoe");
      expect(canonicalizeUrl("http://example.com")).toBe("http://example.com");
      expect(canonicalizeUrl("https://github.com/octocat")).toBe("https://github.com/octocat");
      expect(canonicalizeUrl("")).toBe("");

      const rawText = "Find my work at github.com/developer and linkedin.com/in/developer";
      const doc = normalizer.normalize({ skills: [], education: [], experience: [], projects: [], certifications: [] }, rawText);

      const links = doc.contact.links;
      expect(links.some((l) => l.label === "GitHub" && l.url === "https://github.com/developer")).toBe(true);
      expect(links.some((l) => l.label === "LinkedIn" && l.url === "https://linkedin.com/in/developer")).toBe(true);
    });
  });

  describe("5. Evidence Provenance & Zero Hallucination Assertions", () => {
    it("should enforce PARSED provenance and verified=false on all facts", () => {
      const rawData: IResumeExtractedData = {
        personalInfo: { fullName: "Sam Test", email: "sam@test.com" },
        skills: [{ name: "Docker", category: "DevOps" }],
        experience: [
          {
            companyName: "Cloud Inc",
            jobTitle: "DevOps Engineer",
            description: "Deployed 20 microservices on Kubernetes.",
          },
        ],
        projects: [],
        education: [],
        certifications: [],
      };

      const doc = normalizer.normalize(rawData, null);

      expect(doc.evidence.length).toBeGreaterThan(0);
      for (const ev of doc.evidence) {
        expect(ev.source).toBe("PARSED");
        expect(ev.verified).toBe(false);
        expect(ev.confidence).toBeGreaterThan(0);
        expect(ev.confidence).toBeLessThanOrEqual(1.0);
      }

      // Zero hallucination check: no skills other than Docker
      expect(doc.skills.map((s) => s.name)).toEqual(["Docker"]);
    });

    it("should not fabricate dates, GPA, or metrics if missing in source", () => {
      const rawData: IResumeExtractedData = {
        personalInfo: { fullName: "Sam Test", email: "sam@test.com" },
        skills: [],
        experience: [
          {
            companyName: "Acme",
            jobTitle: "Engineer",
            description: "Wrote backend endpoints for user authentication.",
          },
        ],
        projects: [],
        education: [
          {
            institution: "Tech University",
            // No startYear, endYear, or GPA provided
          },
        ],
        certifications: [],
      };

      const doc = normalizer.normalize(rawData, null);

      // Missing dates must stay undefined, not invented
      expect(doc.experience[0].startDate).toBeUndefined();
      expect(doc.experience[0].endDate).toBeUndefined();
      expect(doc.education[0].startDate).toBeUndefined();
      expect(doc.education[0].endDate).toBeUndefined();
      expect(doc.education[0].gradeOrGpa).toBeUndefined();

      // No fake metrics in bullets
      expect(doc.experience[0].bullets[0].metrics).toBeUndefined();
    });
  });

  describe("6. Idempotency & Round-Trip Serialization", () => {
    it("should produce consistent output across multiple normalization calls", () => {
      const rawData: IResumeExtractedData = {
        personalInfo: { fullName: "Robin Dev", email: "robin@dev.io" },
        skills: [{ name: "Go", category: "Language" }, { name: "Rust", category: "Language" }],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
      };

      const doc1 = normalizer.normalize(rawData, null, { resumeId: "doc_fixed_id", userId: "usr_fixed" });
      const serialized = JSON.stringify(doc1);
      const deserialized = JSON.parse(serialized);

      const parsedCheck = ResumeDocumentSchema.safeParse(deserialized);
      expect(parsedCheck.success).toBe(true);
      expect(deserialized.id).toBe("doc_fixed_id");
      expect(deserialized.skills.length).toBe(2);
    });
  });

  describe("7. Skill Category Classification Mapping", () => {
    it("should categorize core technical taxonomy into proper canonical categories", () => {
      expect(normalizeSkillCategory("React")).toBe("FRONTEND");
      expect(normalizeSkillCategory("Node.js")).toBe("BACKEND");
      expect(normalizeSkillCategory("PostgreSQL")).toBe("DATABASE");
      expect(normalizeSkillCategory("AWS")).toBe("CLOUD");
      expect(normalizeSkillCategory("Docker")).toBe("DEVOPS");
      expect(normalizeSkillCategory("TypeScript")).toBe("LANGUAGE");
      expect(normalizeSkillCategory("Jest")).toBe("TESTING");
      expect(normalizeSkillCategory("React Native")).toBe("MOBILE");
      expect(normalizeSkillCategory("Machine Learning")).toBe("AI_ML");
      expect(normalizeSkillCategory("Postman")).toBe("TOOLS");
      expect(normalizeSkillCategory("UnknownCustomSkill")).toBe("OTHER");
    });
  });
});
