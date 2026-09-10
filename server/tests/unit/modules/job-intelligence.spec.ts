import { describe, it, expect } from "vitest";
import {
  jobIntelligenceService,
  roleIntelligenceService,
  JobValidator,
} from "@/modules/resume-intelligence";
import { AIContextBuilder } from "@/core/ai/ai.context";

describe("Phase 3: Job Description Intelligence", () => {
  const sampleJd = `
Senior Frontend Engineer
About Us: High growth fintech startup building next-generation payment systems.

Requirements:
- 4+ years of experience in Frontend Web Development.
- Bachelor's degree in Computer Science or equivalent.
- Must have React, TypeScript, and HTML/CSS.
- Strong experience building responsive design systems with Tailwind CSS.
- AWS Certified Solutions Architect is required.

Preferred Qualifications:
- Experience with Next.js is preferred.
- Nice to have: GraphQL, Redux, and Playwright.

Responsibilities:
- Architect and develop high-performance payment checkout flows.
- Optimize client-side rendering speed and Core Web Vitals.
  `;

  describe("1. Validation & Input Sanitization", () => {
    it("should reject empty or extremely short JD input safely", () => {
      expect(JobValidator.validateAndNormalize("").isValid).toBe(false);
      expect(JobValidator.validateAndNormalize("short text").isValid).toBe(false);
      expect(JobValidator.validateAndNormalize(undefined).isValid).toBe(false);
    });

    it("should accept valid length JD and normalize line breaks and whitespace", () => {
      const result = JobValidator.validateAndNormalize(sampleJd);
      expect(result.isValid).toBe(true);
      expect(result.normalizedText.length).toBeGreaterThan(50);
    });
  });

  describe("2. Deterministic Section & Requirement Extraction", () => {
    it("should extract structured JD profile with skills, experience, education, and certs", () => {
      const profile = jobIntelligenceService.parseJobDescription(sampleJd);
      expect(profile).toBeDefined();
      expect(profile).not.toBeNull();

      expect(profile!.title).toContain("Senior Frontend Engineer");
      expect(profile!.seniority?.level).toBe("SENIOR");

      const reqSkillNames = profile!.requiredSkills.map((s) => s.canonicalName);
      const prefSkillNames = profile!.preferredSkills.map((s) => s.canonicalName);

      // Required skills
      expect(reqSkillNames).toContain("React");
      expect(reqSkillNames).toContain("TypeScript");
      expect(reqSkillNames).toContain("HTML/CSS");
      expect(reqSkillNames).toContain("Tailwind CSS");

      // Preferred skills
      expect(prefSkillNames).toContain("Next.js");
      expect(prefSkillNames).toContain("GraphQL");

      // Experience & Education
      expect(profile!.experienceRequirements.length).toBeGreaterThanOrEqual(1);
      expect(profile!.experienceRequirements[0].minYears).toBe(4);
      expect(profile!.educationRequirements.length).toBeGreaterThanOrEqual(1);

      // Certifications & Domains
      expect(profile!.certificationRequirements.length).toBeGreaterThanOrEqual(1);
      expect(profile!.domains).toContain("FinTech");

      // Evidence traceability
      expect(profile!.evidence.length).toBeGreaterThanOrEqual(3);
      expect(profile!.sourceHash).toBeDefined();
      expect(profile!.sourceHash.length).toBe(64);
    });
  });

  describe("3. Role Benchmark + JD Combination & Deduplication", () => {
    it("should merge role benchmark and JD requirements without replacing the benchmark", () => {
      const roleBenchmark = roleIntelligenceService.getRoleBenchmark("Frontend Engineer");
      const jobProfile = jobIntelligenceService.parseJobDescription(sampleJd);

      const merged = jobIntelligenceService.mergeRequirements(roleBenchmark, jobProfile);

      expect(merged.mergedRequiredSkills.length).toBeGreaterThanOrEqual(4);
      const reactMerged = merged.mergedRequiredSkills.find((s) => s.canonicalName === "React");
      expect(reactMerged).toBeDefined();
      expect(reactMerged!.sources).toContain("ROLE_BENCHMARK");
      expect(reactMerged!.sources).toContain("JOB_DESCRIPTION");

      // Check Next.js is preserved and classified properly
      const nextMerged = merged.mergedRequiredSkills.concat(merged.mergedPreferredSkills).find((s) => s.canonicalName === "Next.js");
      expect(nextMerged).toBeDefined();

      expect(merged.effectiveDomains).toContain("FinTech");
    });
  });

  describe("4. AI Context Integration & SHA-256 Versioning", () => {
    it("should include roleProfile and jobRequirements in AI context and produce unique hash with JD", () => {
      const extractedData = {
        personalInfo: { fullName: "Alex Rivera", email: "alex@example.com" },
        skills: [{ name: "React" }, { name: "TypeScript" }],
      };

      const ctxWithJd = AIContextBuilder.buildContext(
        extractedData,
        "",
        {},
        "Frontend Engineer",
        sampleJd,
        "res_001",
        1
      );

      expect(ctxWithJd.roleProfile).toBeDefined();
      expect(ctxWithJd.roleProfile?.title).toBe("Frontend Engineer");
      expect(ctxWithJd.jobRequirements).toBeDefined();
      expect(ctxWithJd.jobRequirements?.requiredSkills.length).toBeGreaterThanOrEqual(3);

      const hash1 = AIContextBuilder.computeInputHash("res_001", 1, "Frontend Engineer", sampleJd);
      const hash2 = AIContextBuilder.computeInputHash("res_001", 1, "Frontend Engineer", "");

      expect(hash1).not.toBe(hash2);
      expect(hash1.length).toBe(64);
    });
  });
});
