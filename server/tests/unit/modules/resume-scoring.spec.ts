import { describe, it, expect } from "vitest";
import {
  resumeScoringEngine,
  ResumeScoreResult,
  RESUME_STUDIO_SECTION_WEIGHTS,
  contactScorer,
  summaryScorer,
  skillsScorer,
  experienceScorer,
  projectsScorer,
  educationScorer,
  achievementsScorer,
  ResumeScoreResultSchema,
} from "../../../src/modules/resume-intelligence/scoring";
import { resumeSectionEngine } from "../../../src/modules/resume-intelligence/sections";
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from "../../../src/modules/resume-intelligence/document/resume-document.fixture";
import { ResumeDocument } from "../../../src/modules/resume-intelligence/document/resume-document.types";

describe("Phase 3: Deterministic Resume Scoring Engine", () => {
  describe("1. Mathematical Section Weight Integrity", () => {
    it("should ensure global section weights sum exactly to 1.00 (100%)", () => {
      const sum = Object.values(RESUME_STUDIO_SECTION_WEIGHTS).reduce((acc, w) => acc + w, 0);
      expect(Number(sum.toFixed(6))).toBe(1.0);
    });

    it("should have expected weighting distribution across the 7 sections", () => {
      expect(RESUME_STUDIO_SECTION_WEIGHTS.experience).toBe(0.30);
      expect(RESUME_STUDIO_SECTION_WEIGHTS.skills).toBe(0.20);
      expect(RESUME_STUDIO_SECTION_WEIGHTS.projects).toBe(0.15);
      expect(RESUME_STUDIO_SECTION_WEIGHTS.education).toBe(0.15);
      expect(RESUME_STUDIO_SECTION_WEIGHTS.summary).toBe(0.10);
      expect(RESUME_STUDIO_SECTION_WEIGHTS.contact).toBe(0.05);
      expect(RESUME_STUDIO_SECTION_WEIGHTS.achievements).toBe(0.05);
    });
  });

  describe("2. Contact Scorer", () => {
    it("should award full points (100) for complete, clean contact info with links", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const score = contactScorer.score(analysis.sections.contact);

      expect(score.sectionId).toBe("contact");
      expect(score.score).toBe(100);
      expect(score.maxScore).toBe(100);
      expect(score.weightedScore).toBe(5); // 100 * 0.05
      expect(score.tier).toBe("Excellent");
      expect(score.components).toHaveLength(4);
      expect(score.deductions).toHaveLength(0);
    });

    it("should penalize missing phone, missing location, and duplicate links", () => {
      const mockAnalysis: any = {
        sectionId: "contact",
        status: "PARTIAL",
        evidenceIds: [],
        strengths: [],
        weaknesses: [],
        signals: {
          hasFullName: true,
          hasEmail: true,
          hasValidEmail: true,
          hasPhone: false,
          hasLocation: false,
          hasLinkedIn: true,
          hasGitHub: false,
          hasPortfolio: false,
          hasTwitter: false,
          hasProfessionalLinks: true,
          linksCount: 2,
          duplicateLinksCount: 1,
          isMinimal: true,
        },
      };

      const score = contactScorer.score(mockAnalysis);
      // Identity: 30, Reachability: 0, Professional Presence: 15, Cleanliness: 7 (15 - 8)
      // Total: 30 + 0 + 15 + 7 = 52
      expect(score.score).toBe(52);
      expect(score.tier).toBe("Developing");
      expect(score.deductions.length).toBeGreaterThan(0);
    });

    it("should return 0 score and Needs Work tier for null/missing contact", () => {
      const score = contactScorer.score(null);
      expect(score.score).toBe(0);
      expect(score.status).toBe("MISSING");
      expect(score.tier).toBe("Needs Work");
      expect(score.weightedScore).toBe(0);
    });
  });

  describe("3. Summary Scorer", () => {
    it("should award full points (100) for well-calibrated summary with target role and experience", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const score = summaryScorer.score(analysis.sections.summary);

      expect(score.sectionId).toBe("summary");
      expect(score.score).toBe(100);
      expect(score.weightedScore).toBe(10); // 100 * 0.10
      expect(score.tier).toBe("Excellent");
    });

    it("should penalize first-person pronouns and out-of-bound length", () => {
      const mockAnalysis: any = {
        sectionId: "summary",
        status: "PARTIAL",
        evidenceIds: [],
        strengths: [],
        weaknesses: [],
        signals: {
          hasSummary: true,
          characterCount: 50,
          wordCount: 10, // <15 -> 5 pts
          sentenceCount: 1,
          hasYearsOfExperience: false, // 0 pts
          hasTargetRole: true,         // 10 pts
          containsFirstPersonLanguage: true,
          firstPersonPronouns: ["i", "my"], // >1 -> 0 pts
          isShort: true,
          isLong: false,
          isOptimalLength: false,
        },
      };

      const score = summaryScorer.score(mockAnalysis);
      // Presence: 30, Length: 5, Tone: 0, Role/Exp: 10 -> Total: 45
      expect(score.score).toBe(45);
      expect(score.tier).toBe("Developing");
      expect(score.deductions.some((d) => d.includes("first-person"))).toBe(true);
    });

    it("should return 0 for missing summary", () => {
      const score = summaryScorer.score(null);
      expect(score.score).toBe(0);
      expect(score.status).toBe("MISSING");
    });
  });

  describe("4. Skills Scorer", () => {
    it("should award full points (100) for >=8 skills across >=3 domains with zero duplicates", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const score = skillsScorer.score(analysis.sections.skills);

      expect(score.sectionId).toBe("skills");
      expect(score.score).toBe(100);
      expect(score.weightedScore).toBe(20); // 100 * 0.20
      expect(score.tier).toBe("Excellent");
    });

    it("should penalize low skill count, single domain, and duplicates", () => {
      const mockAnalysis: any = {
        sectionId: "skills",
        status: "PARTIAL",
        evidenceIds: [],
        strengths: [],
        weaknesses: [],
        signals: {
          hasSkills: true,
          skillCount: 3, // 1-4 -> 10 pts
          categoryCount: 1, // 1 domain -> 10 pts
          categorizedCount: 1, // 1/3 = 33% -> 5 pts
          uncategorizedCount: 2,
          duplicateCount: 1, // 1 dup -> 8 pts
          topCategories: [],
        },
      };

      const score = skillsScorer.score(mockAnalysis);
      // Volume: 10, Diversity: 10, Categorization: 5, Cleanliness: 8 -> Total: 33
      expect(score.score).toBe(33);
      expect(score.tier).toBe("Needs Work");
    });
  });

  describe("5. Experience Scorer", () => {
    it("should award full points (100) for structured roles with metrics and action verbs", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const score = experienceScorer.score(analysis.sections.experience);

      expect(score.sectionId).toBe("experience");
      expect(score.score).toBe(100);
      expect(score.weightedScore).toBe(30); // 100 * 0.30
      expect(score.tier).toBe("Excellent");
    });

    it("should penalize missing company/dates, lack of metrics, and 0 action verbs", () => {
      const mockAnalysis: any = {
        sectionId: "experience",
        status: "PARTIAL",
        evidenceIds: [],
        strengths: [],
        weaknesses: [],
        signals: {
          experienceCount: 2,
          totalBulletsCount: 2,
          entriesWithCompany: 1,
          entriesWithTitle: 2,
          entriesWithDates: 1,
          entriesWithBullets: 1,
          entriesWithMetrics: 0,
          totalMetricsCount: 0,
          totalVerbsCount: 0,
          entriesMissingDates: 1,
          entriesMissingCompany: 1,
          entriesMissingTitle: 0,
          entriesWithoutBullets: 1,
          shortBulletsCount: 0,
          longBulletsCount: 0,
          hasCurrentRole: true,
          averageBulletsPerRole: 1.0, // 1 bullet -> 12 pts
        },
      };

      const score = experienceScorer.score(mockAnalysis);
      // Completeness: 25 - (2 missing * 6) = 13
      // Density: 12
      // Action verbs: 0
      // Metrics: 0
      // Total = 25
      expect(score.score).toBe(25);
      expect(score.tier).toBe("Needs Work");
    });
  });

  describe("6. Projects Scorer", () => {
    it("should award full points (100) for projects with stack, bullets, and repository links", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const score = projectsScorer.score(analysis.sections.projects);

      expect(score.sectionId).toBe("projects");
      expect(score.score).toBe(100);
      expect(score.weightedScore).toBe(15); // 100 * 0.15
      expect(score.tier).toBe("Excellent");
    });
  });

  describe("7. Education Scorer", () => {
    it("should award full points (100) for verified degrees, institutions, dates, and honors/GPA", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const score = educationScorer.score(analysis.sections.education);

      expect(score.sectionId).toBe("education");
      expect(score.score).toBe(100);
      expect(score.weightedScore).toBe(15); // 100 * 0.15
      expect(score.tier).toBe("Excellent");
    });
  });

  describe("8. Achievements Scorer", () => {
    it("should award full points (100) for certifications and awards with issuers and dates", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const score = achievementsScorer.score(analysis.sections.achievements);

      expect(score.sectionId).toBe("achievements");
      expect(score.score).toBe(100);
      expect(score.weightedScore).toBe(5); // 100 * 0.05
      expect(score.tier).toBe("Excellent");
    });
  });

  describe("9. Master Resume Scoring Engine Orchestration", () => {
    it("should evaluate sample fixture and produce valid 100-point overall score", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const scoreResult = resumeScoringEngine.scoreDocument(analysis, SAMPLE_RESUME_DOCUMENT_FIXTURE);

      expect(scoreResult.engineVersion).toBe("resume-score-v1");
      expect(scoreResult.overall.overallScore).toBe(100);
      expect(scoreResult.overall.tier).toBe("Excellent");
      expect(scoreResult.sections.experience.score).toBe(100);
      expect(scoreResult.sections.skills.score).toBe(100);
      expect(scoreResult.sections.projects.score).toBe(100);

      // Validate schema
      expect(() => ResumeScoreResultSchema.parse(scoreResult)).not.toThrow();
    });

    it("should support on-demand single section scoring via scoreSection()", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const expScore = resumeScoringEngine.scoreSection("experience", analysis.sections.experience);

      expect(expScore.sectionId).toBe("experience");
      expect(expScore.score).toBe(100);
      expect(expScore.components).toHaveLength(4);
    });

    it("should handle partial resumes with missing sections safely without NaN/Infinity", () => {
      const partialDoc: ResumeDocument = {
        id: "partial-doc-001",
        version: 1,
        schemaVersion: "1.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        contact: {
          fullName: "John Doe",
          email: "john@example.com",
          links: [],
        },
        skills: [
          { id: "sk_01", name: "TypeScript", category: "LANGUAGE", evidenceIds: [] },
          { id: "sk_02", name: "React", category: "FRONTEND", evidenceIds: [] },
        ],
        evidence: [],
      };

      const analysis = resumeSectionEngine.analyze(partialDoc);
      const scoreResult = resumeScoringEngine.scoreDocument(analysis, partialDoc);

      expect(scoreResult.overall.overallScore).toBeGreaterThanOrEqual(0);
      expect(scoreResult.overall.overallScore).toBeLessThanOrEqual(100);
      expect(Number.isNaN(scoreResult.overall.overallScore)).toBe(false);
      expect(Number.isFinite(scoreResult.overall.overallScore)).toBe(true);

      // Verify missing sections are 0
      expect(scoreResult.sections.experience.score).toBe(0);
      expect(scoreResult.sections.projects.score).toBe(0);
      expect(scoreResult.sections.education.score).toBe(0);
      expect(scoreResult.sections.achievements.score).toBe(0);
    });

    it("should guarantee IMMUTABILITY of both ResumeDocument and SectionAnalysis", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const analysisJsonBefore = JSON.stringify(analysis);
      const docJsonBefore = JSON.stringify(SAMPLE_RESUME_DOCUMENT_FIXTURE);

      resumeScoringEngine.scoreDocument(analysis, SAMPLE_RESUME_DOCUMENT_FIXTURE);

      expect(JSON.stringify(analysis)).toBe(analysisJsonBefore);
      expect(JSON.stringify(SAMPLE_RESUME_DOCUMENT_FIXTURE)).toBe(docJsonBefore);
    });

    it("should guarantee DETERMINISTIC reproducibility across multiple runs", () => {
      const analysis = resumeSectionEngine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);

      const run1 = resumeScoringEngine.scoreDocument(analysis, SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const run2 = resumeScoringEngine.scoreDocument(analysis, SAMPLE_RESUME_DOCUMENT_FIXTURE);

      expect(run1.overall.overallScore).toBe(run2.overall.overallScore);
      expect(run1.overall.tier).toBe(run2.overall.tier);
      expect(run1.sections.experience.score).toBe(run2.sections.experience.score);
      expect(run1.sections.skills.score).toBe(run2.sections.skills.score);
      expect(run1.sections.projects.score).toBe(run2.sections.projects.score);
    });

    it("should satisfy monotonicity: adding valid email never decreases contact score", () => {
      const noEmailAnalysis: any = {
        sectionId: "contact",
        status: "PARTIAL",
        evidenceIds: [],
        signals: {
          hasFullName: true,
          hasEmail: false,
          hasValidEmail: false,
          hasPhone: true,
          hasLocation: true,
          hasLinkedIn: true,
          hasGitHub: false,
          hasPortfolio: false,
          hasTwitter: false,
          hasProfessionalLinks: true,
          linksCount: 1,
          duplicateLinksCount: 0,
          isMinimal: false,
        },
      };

      const withEmailAnalysis: any = {
        ...noEmailAnalysis,
        signals: {
          ...noEmailAnalysis.signals,
          hasEmail: true,
          hasValidEmail: true,
        },
      };

      const score1 = contactScorer.score(noEmailAnalysis);
      const score2 = contactScorer.score(withEmailAnalysis);

      expect(score2.score).toBeGreaterThan(score1.score);
    });
  });
});
