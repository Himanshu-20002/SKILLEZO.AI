import { describe, it, expect } from "vitest";
import {
  ResumeSectionEngine,
  resumeSectionEngine,
  contactAnalyzer,
  summaryAnalyzer,
  skillsAnalyzer,
  experienceAnalyzer,
  projectsAnalyzer,
  educationAnalyzer,
  achievementsAnalyzer,
} from "@/modules/resume-intelligence/sections";
import { ResumeSectionAnalysisResultSchema } from "@/modules/resume-intelligence/sections/section.schema";
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from "@/modules/resume-intelligence/document/resume-document.fixture";
import { ResumeDocument } from "@/modules/resume-intelligence/document/resume-document.types";

describe("Phase 2: Resume Section Engine — 7 Section Intelligence", () => {
  const engine = new ResumeSectionEngine();

  describe("1. Contact Analyzer", () => {
    it("should evaluate a complete contact section with high completeness and COMPLETE status", () => {
      const contact = {
        fullName: "Himanshu Kumar",
        email: "himanshu@example.com",
        phone: "+91 9876543210",
        location: "Bengaluru, India",
        links: [
          { label: "LinkedIn" as const, url: "https://linkedin.com/in/himanshu" },
          { label: "GitHub" as const, url: "https://github.com/himanshu" },
        ],
      };

      const result = contactAnalyzer.analyze(contact);
      expect(result.status).toBe("COMPLETE");
      expect(result.completeness).toBeGreaterThanOrEqual(0.9);
      expect(result.signals.hasFullName).toBe(true);
      expect(result.signals.hasValidEmail).toBe(true);
      expect(result.signals.hasPhone).toBe(true);
      expect(result.signals.hasLocation).toBe(true);
      expect(result.signals.hasLinkedIn).toBe(true);
      expect(result.signals.hasGitHub).toBe(true);
      expect(result.warnings.length).toBe(0);
      expect(result.missing.length).toBe(0);
    });

    it("should flag missing phone, location, and professional links in minimal contact", () => {
      const contact = {
        fullName: "Jane Doe",
        email: "jane@example.com",
        links: [],
      };

      const result = contactAnalyzer.analyze(contact);
      expect(result.status).toBe("PARTIAL");
      expect(result.signals.hasPhone).toBe(false);
      expect(result.signals.hasLocation).toBe(false);
      expect(result.signals.hasProfessionalLinks).toBe(false);
      expect(result.missing).toContain("contact.phone");
      expect(result.missing).toContain("contact.location");
      expect(result.missing).toContain("contact.links");
    });

    it("should flag duplicate links and invalid URLs", () => {
      const contact = {
        fullName: "Alex Smith",
        email: "alex@example.com",
        links: [
          { label: "LinkedIn" as const, url: "https://linkedin.com/in/alex" },
          { label: "LinkedIn" as const, url: "https://linkedin.com/in/alex" }, // duplicate
          { label: "Portfolio" as const, url: "not-a-valid-url" }, // invalid
        ],
      };

      const result = contactAnalyzer.analyze(contact);
      expect(result.signals.duplicateLinksCount).toBe(1);
      expect(result.warnings.some((w) => w.includes("Duplicate link"))).toBe(true);
      expect(result.warnings.some((w) => w.includes("Invalid URL"))).toBe(true);
    });

    it("should handle null/missing contact gracefully with MISSING status", () => {
      const result = contactAnalyzer.analyze(null);
      expect(result.status).toBe("MISSING");
      expect(result.completeness).toBe(0);
      expect(result.signals.hasFullName).toBe(false);
    });
  });

  describe("2. Summary Analyzer", () => {
    it("should evaluate a well-calibrated summary with target role and experience", () => {
      const summary = {
        text: "Senior Full-Stack Engineer with 5+ years of experience architecting scalable distributed systems, event-driven microservices, and reactive user interfaces.",
        targetRole: "Full-Stack Engineer",
        yearsOfExperience: 5,
      };

      const result = summaryAnalyzer.analyze(summary);
      expect(result.status).toBe("COMPLETE");
      expect(result.signals.hasSummary).toBe(true);
      expect(result.signals.hasTargetRole).toBe(true);
      expect(result.signals.hasYearsOfExperience).toBe(true);
      expect(result.signals.isOptimalLength).toBe(true);
      expect(result.signals.containsFirstPersonLanguage).toBe(false);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it("should detect first-person pronouns and flag warnings", () => {
      const summary = {
        text: "I am a passionate engineer and my main focus is building web applications for our team.",
      };

      const result = summaryAnalyzer.analyze(summary);
      expect(result.signals.containsFirstPersonLanguage).toBe(true);
      expect(result.signals.firstPersonPronouns).toContain("i");
      expect(result.signals.firstPersonPronouns).toContain("my");
      expect(result.signals.firstPersonPronouns).toContain("our");
      expect(result.warnings.some((w) => w.includes("first-person pronouns"))).toBe(true);
    });

    it("should detect very short summaries", () => {
      const summary = {
        text: "Software developer seeking role.",
      };

      const result = summaryAnalyzer.analyze(summary);
      expect(result.signals.isShort).toBe(true);
      expect(result.warnings.some((w) => w.includes("very brief"))).toBe(true);
    });

    it("should handle missing summary gracefully", () => {
      const result = summaryAnalyzer.analyze(null);
      expect(result.status).toBe("MISSING");
      expect(result.completeness).toBe(0);
      expect(result.signals.hasSummary).toBe(false);
    });
  });

  describe("3. Skills Analyzer", () => {
    it("should compute category distribution and detect diverse skill domains", () => {
      const skills = [
        { id: "sk_1", name: "TypeScript", category: "LANGUAGE" as const, evidenceIds: ["ev_1"] },
        { id: "sk_2", name: "React", category: "FRONTEND" as const, evidenceIds: ["ev_2"] },
        { id: "sk_3", name: "Node.js", category: "BACKEND" as const, evidenceIds: ["ev_3"] },
        { id: "sk_4", name: "PostgreSQL", category: "DATABASE" as const, evidenceIds: ["ev_4"] },
        { id: "sk_5", name: "Docker", category: "DEVOPS" as const, evidenceIds: ["ev_5"] },
        { id: "sk_6", name: "AWS", category: "CLOUD" as const, evidenceIds: ["ev_6"] },
        { id: "sk_7", name: "Jest", category: "TESTING" as const, evidenceIds: ["ev_7"] },
        { id: "sk_8", name: "Python", category: "LANGUAGE" as const, evidenceIds: ["ev_8"] },
      ];

      const result = skillsAnalyzer.analyze(skills);
      expect(result.status).toBe("COMPLETE");
      expect(result.signals.skillCount).toBe(8);
      expect(result.signals.categoryCount).toBe(7);
      expect(result.signals.categoryDistribution.LANGUAGE).toBe(2);
      expect(result.signals.categoryDistribution.FRONTEND).toBe(1);
      expect(result.signals.categoryDistribution.BACKEND).toBe(1);
      expect(result.signals.duplicateCount).toBe(0);
      expect(result.evidenceIds).toContain("ev_1");
    });

    it("should flag duplicate skills and uncategorized skills", () => {
      const skills = [
        { id: "sk_1", name: "React", category: "FRONTEND" as const, evidenceIds: [] },
        { id: "sk_2", name: "React", category: "FRONTEND" as const, evidenceIds: [] }, // duplicate
        { id: "sk_3", name: "CustomInternalTool", category: "OTHER" as const, evidenceIds: [] }, // uncategorized
      ];

      const result = skillsAnalyzer.analyze(skills);
      expect(result.signals.duplicateCount).toBe(1);
      expect(result.signals.uncategorizedCount).toBe(1);
      expect(result.warnings.some((w) => w.includes("Duplicate skill"))).toBe(true);
      expect(result.warnings.some((w) => w.includes("uncategorized"))).toBe(true);
    });

    it("should handle empty skills with MISSING status", () => {
      const result = skillsAnalyzer.analyze([]);
      expect(result.status).toBe("MISSING");
      expect(result.completeness).toBe(0);
      expect(result.signals.hasSkills).toBe(false);
    });
  });

  describe("4. Experience Analyzer", () => {
    it("should evaluate structured employment positions, bullets, metrics, and verbs", () => {
      const experience = [
        {
          id: "exp_1",
          companyName: "Acme Corp",
          jobTitle: "Senior Software Engineer",
          startDate: "2022-01",
          endDate: "Present",
          isCurrent: true,
          bullets: [
            {
              id: "blt_1",
              text: "Architected real-time stream processing pipeline reducing latency by 45%.",
              verbs: ["architected", "reducing"],
              metrics: ["45%"],
              evidenceIds: ["ev_blt_1"],
            },
            {
              id: "blt_2",
              text: "Led a cross-functional engineering team of 6 to deploy 12 microservices on AWS.",
              verbs: ["led", "deploy"],
              metrics: ["6", "12 microservices"],
              evidenceIds: ["ev_blt_2"],
            },
          ],
        },
      ];

      const result = experienceAnalyzer.analyze(experience);
      expect(result.status).toBe("COMPLETE");
      expect(result.signals.experienceCount).toBe(1);
      expect(result.signals.totalBulletsCount).toBe(2);
      expect(result.signals.entriesWithMetrics).toBe(1);
      expect(result.signals.totalMetricsCount).toBe(3);
      expect(result.signals.hasCurrentRole).toBe(true);
      expect(result.evidenceIds).toContain("ev_blt_1");
      expect(result.evidenceIds).toContain("ev_blt_2");
      expect(result.strengths.some((s) => s.includes("quantifiable metric"))).toBe(true);
    });

    it("should flag positions missing company, title, dates, or bullets", () => {
      const experience = [
        {
          id: "exp_1",
          companyName: "",
          jobTitle: "",
          isCurrent: false,
          bullets: [],
        },
      ];

      const result = experienceAnalyzer.analyze(experience);
      expect(result.signals.entriesMissingCompany).toBe(1);
      expect(result.signals.entriesMissingTitle).toBe(1);
      expect(result.signals.entriesMissingDates).toBe(1);
      expect(result.signals.entriesWithoutBullets).toBe(1);
      expect(result.missing).toContain("experience[0].companyName");
      expect(result.missing).toContain("experience[0].jobTitle");
      expect(result.missing).toContain("experience[0].bullets");
    });
  });

  describe("5. Projects Analyzer", () => {
    it("should evaluate projects with technologies, links, and descriptions", () => {
      const projects = [
        {
          id: "proj_1",
          title: "CloudFlow Orchestrator",
          description: "Distributed workflow scheduler supporting automated container execution.",
          technologies: ["TypeScript", "Redis", "Docker", "Node.js"],
          link: "https://cloudflow.dev",
          repoUrl: "https://github.com/example/cloudflow",
          bullets: ["Engineered core scheduler in TypeScript.", "Benchmarked 5,000 tasks per second throughput."],
        },
      ];

      const result = projectsAnalyzer.analyze(projects);
      expect(result.status).toBe("COMPLETE");
      expect(result.signals.projectCount).toBe(1);
      expect(result.signals.projectsWithDescription).toBe(1);
      expect(result.signals.projectsWithTechnologies).toBe(1);
      expect(result.signals.uniqueTechnologiesCount).toBe(4);
      expect(result.signals.projectsWithLink).toBe(1);
      expect(result.signals.projectsWithRepoUrl).toBe(1);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it("should flag projects missing descriptions, technologies, or links", () => {
      const projects = [
        {
          id: "proj_1",
          title: "Mini App",
          technologies: [],
          bullets: [],
        },
      ];

      const result = projectsAnalyzer.analyze(projects);
      expect(result.signals.projectsMissingDescription).toBe(1);
      expect(result.signals.projectsMissingTechnologies).toBe(1);
      expect(result.missing).toContain("projects[0].description");
      expect(result.missing).toContain("projects[0].technologies");
    });
  });

  describe("6. Education Analyzer", () => {
    it("should evaluate academic degrees, institutions, graduation dates, and GPA", () => {
      const education = [
        {
          id: "edu_1",
          institution: "National Institute of Technology",
          degree: "Bachelor of Technology",
          fieldOfStudy: "Computer Science and Engineering",
          startDate: "2017",
          endDate: "2021",
          gradeOrGpa: "8.9 / 10.0",
          honors: ["First Class with Distinction"],
        },
      ];

      const result = educationAnalyzer.analyze(education);
      expect(result.status).toBe("COMPLETE");
      expect(result.signals.educationCount).toBe(1);
      expect(result.signals.entriesWithDegree).toBe(1);
      expect(result.signals.entriesWithInstitution).toBe(1);
      expect(result.signals.entriesWithDates).toBe(1);
      expect(result.signals.gpaPresent).toBe(true);
      expect(result.signals.entriesWithHonors).toBe(1);
      expect(result.missing.length).toBe(0);
    });

    it("should report missing institution and degree when absent", () => {
      const education = [
        {
          id: "edu_1",
          institution: "",
          degree: "",
        },
      ];

      const result = educationAnalyzer.analyze(education);
      expect(result.signals.missingInstitutionCount).toBe(1);
      expect(result.signals.missingDegreeCount).toBe(1);
      expect(result.missing).toContain("education[0].institution");
      expect(result.missing).toContain("education[0].degree");
    });
  });

  describe("7. Achievements Analyzer", () => {
    it("should evaluate certifications and awards with issuing authorities", () => {
      const achievements = [
        {
          id: "ach_1",
          title: "AWS Certified Solutions Architect – Associate",
          issuer: "Amazon Web Services",
          date: "2023-05",
          url: "https://aws.amazon.com/verification",
        },
      ];

      const result = achievementsAnalyzer.analyze(achievements);
      expect(result.status).toBe("COMPLETE");
      expect(result.signals.achievementCount).toBe(1);
      expect(result.signals.entriesWithIssuer).toBe(1);
      expect(result.signals.entriesWithDate).toBe(1);
      expect(result.signals.entriesWithUrl).toBe(1);
    });

    it("should handle empty achievements with MISSING status", () => {
      const result = achievementsAnalyzer.analyze([]);
      expect(result.status).toBe("MISSING");
      expect(result.completeness).toBe(0);
      expect(result.signals.achievementCount).toBe(0);
    });
  });

  describe("8. Master ResumeSectionEngine Orchestration", () => {
    it("should evaluate sample ResumeDocument fixture and validate with Zod schema", () => {
      const analysis = engine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);

      // Verify master output schema
      const schemaCheck = ResumeSectionAnalysisResultSchema.safeParse(analysis);
      expect(schemaCheck.success).toBe(true);

      // Verify all 7 sections are present and addressable
      expect(analysis.sections.contact).toBeDefined();
      expect(analysis.sections.summary).toBeDefined();
      expect(analysis.sections.skills).toBeDefined();
      expect(analysis.sections.experience).toBeDefined();
      expect(analysis.sections.projects).toBeDefined();
      expect(analysis.sections.education).toBeDefined();
      expect(analysis.sections.achievements).toBeDefined();

      // Verify summary statistics
      expect(analysis.summaryStats.totalSectionsAnalyzed).toBe(7);
      expect(analysis.summaryStats.completeSectionsCount).toBeGreaterThanOrEqual(5);
      expect(analysis.summaryStats.overallCompletenessAverage).toBeGreaterThanOrEqual(0.8);
      expect(analysis.engineVersion).toBe("section-engine-v1");
    });

    it("should analyze single sections on demand via analyzeSection()", () => {
      const contactAnalysis = engine.analyzeSection(SAMPLE_RESUME_DOCUMENT_FIXTURE, "contact");
      expect(contactAnalysis.sectionId).toBe("contact");
      expect(contactAnalysis.status).toBe("COMPLETE");

      const skillsAnalysis = engine.analyzeSection(SAMPLE_RESUME_DOCUMENT_FIXTURE, "skills");
      expect(skillsAnalysis.sectionId).toBe("skills");
      expect(skillsAnalysis.signals.skillCount).toBe(10);
    });

    it("should guarantee IMMUTABILITY of the source ResumeDocument", () => {
      const docClone: ResumeDocument = JSON.parse(JSON.stringify(SAMPLE_RESUME_DOCUMENT_FIXTURE));
      const beforeStr = JSON.stringify(docClone);

      engine.analyze(docClone);

      const afterStr = JSON.stringify(docClone);
      expect(afterStr).toBe(beforeStr);
    });

    it("should guarantee DETERMINISTIC consistency across multiple runs", () => {
      const run1 = engine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const run2 = engine.analyze(SAMPLE_RESUME_DOCUMENT_FIXTURE);

      expect(run1.sections.contact.completeness).toBe(run2.sections.contact.completeness);
      expect(run1.sections.skills.signals.skillCount).toBe(run2.sections.skills.signals.skillCount);
      expect(run1.summaryStats.overallCompletenessAverage).toBe(run2.summaryStats.overallCompletenessAverage);
    });

    it("should evaluate partial resumes gracefully with explicit missing statuses", () => {
      const partialDoc: ResumeDocument = {
        id: "doc_partial_test",
        userId: "usr_test",
        title: "Partial Resume",
        contact: {
          fullName: "Sam Student",
          email: "sam@student.edu",
          links: [],
        },
        summary: { text: "" },
        skills: [{ id: "sk_1", name: "Python", category: "LANGUAGE", evidenceIds: [] }],
        experience: [],
        projects: [],
        education: [{ id: "edu_1", institution: "Tech College", degree: "B.S." }],
        achievements: [],
        evidence: [],
        templateConfig: { templateId: "modern", fontSize: "regular", margins: "normal" },
        currentVersion: { versionId: "v_1", versionNumber: 1, name: "Initial", createdAt: new Date().toISOString() },
        schemaVersion: "1.0.0",
        isMaster: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const analysis = engine.analyze(partialDoc);
      expect(analysis.sections.summary.status).toBe("MISSING");
      expect(analysis.sections.experience.status).toBe("MISSING");
      expect(analysis.sections.projects.status).toBe("MISSING");
      expect(analysis.sections.achievements.status).toBe("MISSING");
      expect(analysis.summaryStats.missingSectionsCount).toBe(4);
    });
  });
});
