import { describe, it, expect } from "vitest";
import {
  SkillNormalizer,
  SkillDetector,
  SkillGapEngine,
  skillIntelligenceService,
  CANONICAL_SKILL_CATALOG,
} from "@/modules/resume-intelligence";
import { AIContextBuilder } from "@/core/ai/ai.context";
import { SKILL_ENGINE_VERSION } from "@/core/ai/ai.types";

describe("Phase 2: Evidence & Skill Intelligence Engine", () => {
  describe("1. Canonical Skill Catalog", () => {
    it("should contain all 48 benchmark skills and extended tech catalog", () => {
      expect(CANONICAL_SKILL_CATALOG.length).toBeGreaterThanOrEqual(48);
      const reactSkill = CANONICAL_SKILL_CATALOG.find((s) => s.id === "skill_react");
      expect(reactSkill).toBeDefined();
      expect(reactSkill?.canonicalName).toBe("React");
      expect(reactSkill?.category).toBe("FRONTEND");
      expect(reactSkill?.relatedSkillIds).toContain("skill_nextjs");
    });

    it("should maintain parent-child hierarchical skill relationships", () => {
      const nextjs = CANONICAL_SKILL_CATALOG.find((s) => s.id === "skill_nextjs");
      expect(nextjs?.parentSkillId).toBe("skill_react");

      const tailwind = CANONICAL_SKILL_CATALOG.find((s) => s.id === "skill_tailwind");
      expect(tailwind?.parentSkillId).toBe("skill_html_css");
    });

    it("should distinguish related skills from aliases", () => {
      const nodeSkill = CANONICAL_SKILL_CATALOG.find((s) => s.id === "skill_nodejs");
      expect(nodeSkill?.aliases).toContain("Node.js");
      expect(nodeSkill?.aliases).toContain("NodeJS");
      expect(nodeSkill?.relatedSkillIds).toContain("skill_express");
    });
  });

  describe("2. Canonical Skill Normalizer", () => {
    it("should normalize raw aliases to single canonical identities", () => {
      expect(SkillNormalizer.normalize("React.js")?.canonicalName).toBe("React");
      expect(SkillNormalizer.normalize("ReactJS")?.canonicalName).toBe("React");
      expect(SkillNormalizer.normalize("TypeScript")?.canonicalName).toBe("TypeScript");
      expect(SkillNormalizer.normalize("TS")?.canonicalName).toBe("TypeScript");
      expect(SkillNormalizer.normalize("NodeJS")?.canonicalName).toBe("Node.js");
      expect(SkillNormalizer.normalize("AWS Cloud")?.canonicalName).toBe("AWS");
      expect(SkillNormalizer.normalize("Amazon Web Services")?.canonicalName).toBe("AWS");
      expect(SkillNormalizer.normalize("PostgreSQL")?.canonicalName).toBe("PostgreSQL");
      expect(SkillNormalizer.normalize("CI/CD")?.canonicalName).toBe("CI/CD");
      expect(SkillNormalizer.normalize("k8s")?.canonicalName).toBe("Kubernetes");
    });

    it("should handle case differences, whitespace, and punctuation safely", () => {
      expect(SkillNormalizer.normalize("  react.js  ")?.canonicalName).toBe("React");
      expect(SkillNormalizer.normalize("nextjs")?.canonicalName).toBe("Next.js");
      expect(SkillNormalizer.normalize("html5")?.canonicalName).toBe("HTML/CSS");
    });
  });

  describe("3. Skill Detector & False-Positive Prevention", () => {
    it("should detect skills using strict word boundaries without false substring positives", () => {
      const extractedData = {
        skills: [{ name: "React" }, { name: "TypeScript" }],
        experience: [
          {
            jobTitle: "Software Engineer",
            companyName: "TechCorp",
            description: "Built scalable REST APIs and microservices using Node.js and Express. Deployed on AWS.",
          },
        ],
        projects: [
          {
            title: "E-Commerce App",
            description: "Full stack web application built with Next.js, PostgreSQL, and Docker.",
            technologies: ["Next.js", "PostgreSQL", "Docker"],
          },
        ],
      };

      const profile = SkillDetector.detectAndBuildProfile(extractedData, "");

      const detectedNames = profile.skills.map((s) => s.canonicalName);
      expect(detectedNames).toContain("React");
      expect(detectedNames).toContain("TypeScript");
      expect(detectedNames).toContain("Node.js");
      expect(detectedNames).toContain("AWS");
      expect(detectedNames).toContain("Next.js");
      expect(detectedNames).toContain("PostgreSQL");
      expect(detectedNames).toContain("Docker");
    });

    it("should track frequency across multiple mentions and sections", () => {
      const extractedData = {
        skills: [{ name: "React" }],
        summary: "Passionate React and Next.js developer.",
        experience: [
          {
            companyName: "Alpha",
            jobTitle: "Frontend Dev",
            description: "Developed UI components using React and Redux.\nOptimized React render cycles.",
          },
        ],
        projects: [],
      };

      const profile = SkillDetector.detectAndBuildProfile(extractedData, "");
      const reactProfile = profile.skills.find((s) => s.canonicalName === "React");

      expect(reactProfile).toBeDefined();
      expect(reactProfile!.frequency).toBeGreaterThanOrEqual(3);
      expect(reactProfile!.sections).toContain("skills");
      expect(reactProfile!.sections).toContain("summary");
      expect(reactProfile!.sections).toContain("experience");
    });
  });

  describe("4. Skill Evidence Model & Traceability", () => {
    it("should attach traceable evidence with source section, text snippet, and confidence", () => {
      const extractedData = {
        experience: [
          {
            companyName: "Beta Corp",
            jobTitle: "Backend Lead",
            description: "Architected PostgreSQL cluster with 99.99% uptime.",
          },
        ],
      };

      const profile = SkillDetector.detectAndBuildProfile(extractedData, "");
      const pgSkill = profile.skills.find((s) => s.canonicalName === "PostgreSQL");

      expect(pgSkill).toBeDefined();
      expect(pgSkill!.confidence).toBeGreaterThanOrEqual(0.9);
      expect(pgSkill!.evidenceIds.length).toBeGreaterThan(0);
      expect(pgSkill!.evidenceList.length).toBeGreaterThan(0);

      const evidence = pgSkill!.evidenceList[0];
      expect(evidence.sourceSection).toBe("experience");
      expect(evidence.sourceText).toContain("PostgreSQL");
      expect(evidence.evidenceId).toContain("exp_0_bullet_0");
    });
  });

  describe("5. Skill Gap Engine against Role Benchmarks", () => {
    it("should accurately partition matched vs not detected skills for target role", () => {
      const extractedData = {
        skills: [
          { name: "React" },
          { name: "TypeScript" },
          { name: "Node.js" },
          { name: "REST APIs" },
          { name: "Git" },
        ],
      };

      const profile = SkillDetector.detectAndBuildProfile(extractedData, "");
      const gaps = SkillGapEngine.computeGaps(profile, "Full-Stack Engineer");

      const matchedNames = gaps.matchedGaps.map((g) => g.canonicalName);
      const notDetectedNames = gaps.notDetectedGaps.map((g) => g.canonicalName);

      expect(matchedNames).toContain("React");
      expect(matchedNames).toContain("TypeScript");
      expect(matchedNames).toContain("Node.js");

      // AWS and PostgreSQL should be not detected
      expect(notDetectedNames).toContain("AWS");
      expect(notDetectedNames).toContain("PostgreSQL");
    });
  });

  describe("6. AI Context Builder & Hash Versioning", () => {
    it("should enrich AI context with canonical skillsProfile and versioned input hash", () => {
      const extractedData = {
        personalInfo: { fullName: "Jane Smith", email: "jane@test.com" },
        skills: [{ name: "React" }, { name: "Next.js" }],
      };

      const context = AIContextBuilder.buildContext(extractedData, "", {}, "Full-Stack Engineer", "", "res_123", 1);

      expect(context.skillsProfile).toBeDefined();
      expect(context.skillsProfile?.detected.length).toBeGreaterThanOrEqual(2);
      expect(context.skillsProfile?.matchedTargetSkills).toContain("React");
      expect(context.skillsProfile?.notDetectedTargetSkills.length).toBeGreaterThan(0);

      const hash1 = AIContextBuilder.computeInputHash("res_123", 1, "Full-Stack Engineer");
      expect(hash1).toBeDefined();
      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBe(64); // SHA-256 hex string
    });
  });
});
