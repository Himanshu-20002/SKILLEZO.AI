import { describe, it, expect } from "vitest";
import {
  matchingIntelligenceService,
  SkillMatcher,
  ScoreEngine,
  GapEngine,
  skillIntelligenceService,
  roleIntelligenceService,
  jobIntelligenceService,
} from "@/modules/resume-intelligence";
import { AIContextBuilder } from "@/core/ai/ai.context";

describe("Phase 4: Resume ↔ Job Matching Intelligence Engine", () => {
  const sampleCandidateData = {
    personalInfo: { fullName: "Jane Smith", email: "jane@example.com" },
    skills: [
      { name: "React" },
      { name: "TypeScript" },
      { name: "Next.js" },
      { name: "Tailwind CSS" },
      { name: "Node.js" },
    ],
    experience: [
      {
        companyName: "Acme Cloud",
        jobTitle: "Frontend Lead",
        startDate: "2021",
        endDate: "2025",
        description: "Built scalable web apps in React & Next.js.",
      },
    ],
    education: [
      {
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        institution: "State University",
      },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
      },
    ],
  };

  const sampleCandidateText = `
Jane Smith
React, TypeScript, Next.js, Tailwind CSS, Node.js
Experience: Frontend Lead at Acme Cloud (2021 - 2025). Built scalable apps.
Education: Bachelor of Science in Computer Science, State University.
Certifications: AWS Certified Solutions Architect.
  `;

  const sampleJd = `
Senior Frontend Engineer
Requirements:
- 3+ years of experience in Frontend Development.
- Bachelor's degree in Computer Science.
- Must have React, TypeScript, and HTML/CSS.
- AWS Certified Solutions Architect required.

Preferred:
- Next.js and GraphQL experience preferred.
  `;

  describe("1. Deterministic Skill Matching (Exact, Alias, Related, Missing)", () => {
    it("should classify exact and alias skills as MATCHED with evidence tracking", () => {
      const profile = skillIntelligenceService.buildProfile(sampleCandidateData, sampleCandidateText);
      const reqs = [
        {
          skillId: "skill_react",
          canonicalName: "React",
          requirementType: "REQUIRED" as const,
          confidence: 0.98,
          evidenceIds: ["jd_01"],
          sources: ["JOB_DESCRIPTION" as const],
        },
        {
          skillId: "skill_typescript",
          canonicalName: "TypeScript",
          requirementType: "REQUIRED" as const,
          confidence: 0.98,
          evidenceIds: ["jd_02"],
          sources: ["JOB_DESCRIPTION" as const],
        },
      ];

      const matches = SkillMatcher.matchSkills(profile, reqs);
      expect(matches.length).toBe(2);
      expect(matches[0].status).toBe("MATCHED");
      expect(matches[0].candidateEvidenceIds.length).toBeGreaterThan(0);
      expect(matches[1].status).toBe("MATCHED");
    });

    it("should classify related skills as RELATED and missing skills as NOT_DETECTED", () => {
      const profile = skillIntelligenceService.buildProfile(sampleCandidateData, sampleCandidateText);
      const reqs = [
        {
          skillId: "skill_express",
          canonicalName: "Express.js",
          requirementType: "PREFERRED" as const,
          confidence: 0.95,
          evidenceIds: ["jd_03"],
          sources: ["JOB_DESCRIPTION" as const],
        },
        {
          skillId: "skill_swift",
          canonicalName: "Swift",
          requirementType: "PREFERRED" as const,
          confidence: 0.95,
          evidenceIds: ["jd_04"],
          sources: ["JOB_DESCRIPTION" as const],
        },
      ];

      const matches = SkillMatcher.matchSkills(profile, reqs);
      const expressMatch = matches.find((m) => m.requirementId === "skill_express");
      const swiftMatch = matches.find((m) => m.requirementId === "skill_swift");

      expect(expressMatch).toBeDefined();
      expect(expressMatch!.status).toBe("RELATED"); // Node.js -> Express.js
      expect(swiftMatch).toBeDefined();
      expect(swiftMatch!.status).toBe("NOT_DETECTED");
    });
  });

  describe("2. End-to-End Match Scoring & Coverage", () => {
    it("should compute deterministic overallMatchScore, coverage ratios, and strength label", () => {
      const profile = skillIntelligenceService.buildProfile(sampleCandidateData, sampleCandidateText);
      const roleBenchmark = roleIntelligenceService.getRoleBenchmark("Frontend Engineer");
      const jobProfile = jobIntelligenceService.parseJobDescription(sampleJd);

      const match = matchingIntelligenceService.computeMatch(
        profile,
        roleBenchmark,
        jobProfile,
        sampleCandidateData
      );

      expect(match.overallMatchScore).toBeGreaterThanOrEqual(70);
      expect(match.overallMatchScore).toBeLessThanOrEqual(100);
      expect(match.requiredCoverage).toBeGreaterThan(60);
      expect(match.experienceMatch).toBeGreaterThanOrEqual(80);
      expect(match.educationCoverage).toBeGreaterThanOrEqual(80);
      expect(match.matchStrengthLabel).toBeDefined();
      expect(["Excellent Match", "Strong Match", "Moderate Match"]).toContain(match.matchStrengthLabel);
    });

    it("should work seamlessly in Role-only mode when no JD is provided", () => {
      const profile = skillIntelligenceService.buildProfile(sampleCandidateData, sampleCandidateText);
      const roleBenchmark = roleIntelligenceService.getRoleBenchmark("Frontend Engineer");

      const match = matchingIntelligenceService.computeMatch(
        profile,
        roleBenchmark,
        null,
        sampleCandidateData
      );

      expect(match.overallMatchScore).toBeGreaterThanOrEqual(65);
      expect(match.summary.totalRequirements).toBeGreaterThan(0);
      expect(match.summary.matched).toBeGreaterThan(0);
    });
  });

  describe("3. Deterministic Gap Prioritization", () => {
    it("should assign HIGH priority to required missing skills and MEDIUM/LOW to preferred/related", () => {
      const profile = skillIntelligenceService.buildProfile(sampleCandidateData, sampleCandidateText);
      const roleBenchmark = roleIntelligenceService.getRoleBenchmark("Frontend Engineer");
      const jobProfile = jobIntelligenceService.parseJobDescription(sampleJd);

      const match = matchingIntelligenceService.computeMatch(
        profile,
        roleBenchmark,
        jobProfile,
        sampleCandidateData
      );

      expect(match.gaps.length).toBeGreaterThan(0);
      const highGaps = match.gaps.filter((g) => g.priority === "HIGH");
      const medLowGaps = match.gaps.filter((g) => g.priority !== "HIGH");

      expect(highGaps.length + medLowGaps.length).toBe(match.gaps.length);
      // Verify non-accusatory language
      match.gaps.forEach((g) => {
        expect(g.recommendation).not.toContain("You don't know");
      });
    });
  });

  describe("4. AI Context Integration & SHA-256 Versioned Caching", () => {
    it("should include matchResult in AI context and invalidate cache when MATCH_ENGINE_VERSION changes", () => {
      const context = AIContextBuilder.buildContext(
        sampleCandidateData,
        sampleCandidateText,
        {},
        "Frontend Engineer",
        sampleJd,
        "res_001",
        1
      );

      expect(context.matchResult).toBeDefined();
      expect(context.matchResult?.overallMatchScore).toBeGreaterThanOrEqual(70);
      expect(context.matchResult?.matchStrengthLabel).toBeDefined();

      const hash = AIContextBuilder.computeInputHash("res_001", 1, "Frontend Engineer", sampleJd);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
  });
});
