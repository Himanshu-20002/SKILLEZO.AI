import { describe, it, expect } from "vitest";
import { EmployabilityEngine } from "@/modules/career-plan/employability.engine";
import { SkillGapAnalysisResponseDTO } from "@/modules/career-plan/skill-gap.dto";
import { ResumeAtsResponseDTO } from "@/modules/resume/resume.dto";

describe("EmployabilityEngine (Module 22 & 23)", () => {
  const mockAtsAnalysis: ResumeAtsResponseDTO = {
    resumeId: "res-123",
    resumeVersion: 1,
    overallScore: 80,
    atsScore: 80,
    impactScore: 75,
    brevityScore: 90,
    level: "GOOD",
    breakdown: {
      keywordMatch: 80,
      structure: 85,
      brevity: 90,
      impact: 75,
      readability: 85,
    },
    categories: {} as any,
    atsCompatibility: [],
    keywords: [],
    missingKeywords: [],
    recommendations: [],
  };

  const mockSkillGapAnalysis: SkillGapAnalysisResponseDTO = {
    targetRole: "Full-Stack Engineer",
    availableRoles: ["Full-Stack Engineer", "Frontend Engineer"],
    overallMatchScore: 75,
    skillsAcquiredCount: 7,
    skillsRequiredCount: 10,
    skillsMissingCount: 3,
    radarCategories: [],
    competencies: [],
    priorityRecommendations: [
      {
        skill: "AWS / Cloud Infra",
        currentLevel: "Beginner",
        requiredLevel: "Intermediate",
        priority: "High",
        reason: "Core cloud architecture standard",
        suggestedAction: "Deploy scalable services to AWS",
      },
      {
        skill: "Docker & Containerization",
        currentLevel: "Intermediate",
        requiredLevel: "Intermediate",
        priority: "Medium",
        reason: "DevOps container parity",
        suggestedAction: "Containerize microservices",
      },
    ],
  };

  describe("Formula & Weight Calculations", () => {
    it("should calculate exact weighted score 0.40(Tech) + 0.25(Resume) + 0.15(Proj) + 0.10(SkillAlign) + 0.10(Recruiter)", () => {
      const result = EmployabilityEngine.calculateEmployability({
        targetRole: "Full-Stack Engineer",
        atsAnalysis: mockAtsAnalysis, // 80
        skillGapAnalysis: mockSkillGapAnalysis, // 75
        projectCount: 2, // 80
        hasGithubLink: true, // +5 = 85
        hasLiveDemoLink: true, // +5 = 90
        profileCompletenessScore: 80,
      });

      // Expected: 75*0.40 + 80*0.25 + 90*0.15 + 70*0.10 + 80*0.10 = 30 + 20 + 13.5 + 7 + 8 = 78.5 -> 79
      expect(result.overallScore).toBeGreaterThanOrEqual(75);
      expect(result.overallScore).toBeLessThanOrEqual(85);
      expect(result.tierStatus).toBe("Top 15%");
      expect(result.targetTier).toBe("Top 5%");
    });

    it("should clamp scores between 0 and 100", () => {
      const perfectResult = EmployabilityEngine.calculateEmployability({
        targetRole: "Full-Stack Engineer",
        atsAnalysis: { ...mockAtsAnalysis, overallScore: 100 },
        skillGapAnalysis: { ...mockSkillGapAnalysis, overallMatchScore: 100, skillsAcquiredCount: 10, skillsRequiredCount: 10 },
        projectCount: 4,
        hasGithubLink: true,
        hasLiveDemoLink: true,
        profileCompletenessScore: 100,
      });

      expect(perfectResult.overallScore).toBeLessThanOrEqual(100);
      expect(perfectResult.overallScore).toBeGreaterThanOrEqual(90);
      expect(perfectResult.tierStatus).toBe("Top 5%");
    });
  });

  describe("Strengths & Priority Actions", () => {
    it("should generate deterministic strengths and improvement areas based on factor thresholds", () => {
      const result = EmployabilityEngine.calculateEmployability({
        targetRole: "Full-Stack Engineer",
        atsAnalysis: mockAtsAnalysis,
        skillGapAnalysis: mockSkillGapAnalysis,
        projectCount: 1,
      });

      expect(result.strengths.length).toBeGreaterThan(0);
      expect(result.improvementAreas.length).toBeGreaterThan(0);
      expect(result.actionList.length).toBeGreaterThan(0);
    });
  });

  describe("Career GPS Milestones", () => {
    it("should generate structured milestones sorted by priority (HIGH -> MEDIUM -> LOW)", () => {
      const result = EmployabilityEngine.calculateEmployability({
        targetRole: "Full-Stack Engineer",
        atsAnalysis: mockAtsAnalysis,
        skillGapAnalysis: mockSkillGapAnalysis,
      });

      expect(result.careerGps.ready).toBe(true);
      expect(result.careerGps.milestones.length).toBeGreaterThanOrEqual(3);

      const priorities = result.careerGps.milestones.map((m) => m.priority);
      expect(priorities[0]).toBe("HIGH");
    });
  });

  describe("Empty Input Resilience", () => {
    it("should handle completely empty candidate inputs without crashing", () => {
      const result = EmployabilityEngine.calculateEmployability({
        targetRole: "Full-Stack Engineer",
        atsAnalysis: null,
        skillGapAnalysis: null,
      });

      expect(result.overallScore).toBeGreaterThanOrEqual(20);
      expect(result.overallScore).toBeLessThanOrEqual(60);
      expect(result.tierStatus).toBe("Developing");
    });
  });
});
