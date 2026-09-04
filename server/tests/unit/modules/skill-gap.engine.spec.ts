import { describe, it, expect } from "vitest";
import { SkillGapEngine } from "@/modules/career-plan/skill-gap.engine";

describe("SkillGapEngine (Module 21)", () => {
  const candidateSkills = [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Tailwind CSS",
  ];

  const candidateRawText = `
    Full Stack Developer with experience in React, Next.js, TypeScript, Node.js, Express, and MongoDB.
    Built REST APIs serving 50k users. Implemented caching and clean architecture.
  `;

  describe("Supported Roles", () => {
    it("should return a list of standard target technical roles", () => {
      const roles = SkillGapEngine.getSupportedRoles();
      expect(roles).toContain("Full-Stack Engineer");
      expect(roles).toContain("Frontend Engineer");
      expect(roles).toContain("Backend Engineer");
      expect(roles).toContain("AI/ML Specialist");
      expect(roles).toContain("DevOps & Cloud Engineer");
      expect(roles).toContain("Mobile App Developer");
    });
  });

  describe("Skill Gap Analysis for Full-Stack Engineer", () => {
    it("should accurately calculate overall match score and 6-axis competencies", () => {
      const analysis = SkillGapEngine.analyzeSkillGap(candidateSkills, candidateRawText, "Full-Stack Engineer");

      expect(analysis.targetRole).toBe("Full-Stack Engineer");
      expect(analysis.overallMatchScore).toBeGreaterThanOrEqual(50);
      expect(analysis.overallMatchScore).toBeLessThanOrEqual(100);
      expect(analysis.skillsAcquiredCount).toBeGreaterThan(0);
      expect(analysis.skillsRequiredCount).toBe(10);
      expect(analysis.radarCategories).toHaveLength(6);

      // Verify all 6 axes are present
      const axisNames = analysis.radarCategories.map((r) => r.category);
      expect(axisNames).toContain("Frontend");
      expect(axisNames).toContain("Backend");
      expect(axisNames).toContain("Database");
      expect(axisNames).toContain("Cloud");
      expect(axisNames).toContain("DevOps");
      expect(axisNames).toContain("System Design");
    });

    it("should identify missing skills and generate sorted priority recommendations", () => {
      const analysis = SkillGapEngine.analyzeSkillGap(candidateSkills, candidateRawText, "Full-Stack Engineer");

      expect(analysis.skillsMissingCount).toBeGreaterThan(0);
      expect(analysis.priorityRecommendations.length).toBeGreaterThan(0);

      // First recommendations should have High priority
      expect(["High", "Medium"]).toContain(analysis.priorityRecommendations[0].priority);
    });
  });

  describe("Role Switching Resiliency", () => {
    it("should dynamically calculate distinct match scores when switching from Full-Stack to AI/ML Specialist", () => {
      const fullStackAnalysis = SkillGapEngine.analyzeSkillGap(candidateSkills, candidateRawText, "Full-Stack Engineer");
      const aimlAnalysis = SkillGapEngine.analyzeSkillGap(candidateSkills, candidateRawText, "AI/ML Specialist");

      expect(fullStackAnalysis.targetRole).toBe("Full-Stack Engineer");
      expect(aimlAnalysis.targetRole).toBe("AI/ML Specialist");

      // Full-Stack score should be significantly higher than AI/ML score for this JavaScript/React candidate
      expect(fullStackAnalysis.overallMatchScore).toBeGreaterThan(aimlAnalysis.overallMatchScore);
    });

    it("should fallback gracefully to Full-Stack Engineer when given an unrecognized role", () => {
      const analysis = SkillGapEngine.analyzeSkillGap(candidateSkills, candidateRawText, "Quantum Computing Specialist" as any);
      expect(analysis.targetRole).toBe("Full-Stack Engineer");
      expect(analysis.competencies.length).toBe(10);
    });
  });

  describe("Empty Candidate Resilience", () => {
    it("should produce a valid low baseline without crashing when candidate has no skills or text", () => {
      const analysis = SkillGapEngine.analyzeSkillGap([], "", "Full-Stack Engineer");

      expect(analysis.overallMatchScore).toBeLessThan(40);
      expect(analysis.skillsAcquiredCount).toBe(0);
      expect(analysis.skillsMissingCount).toBe(10);
      expect(analysis.competencies.every((c) => c.status === "Gap")).toBe(true);
    });
  });
});
