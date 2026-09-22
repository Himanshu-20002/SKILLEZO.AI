import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";
import {
  ResumeDocumentNormalizer,
  resumeDocumentNormalizer,
  normalizeSkillCategory,
  normalizeDatePrecision,
  canonicalizeUrl,
  generateDeterministicId,
} from "@/modules/resume-intelligence/document/resume-document.normalizer";
import { ResumeDocumentSchema } from "@/modules/resume-intelligence/document/resume-document.schema";
import { ResumeParserService } from "@/modules/resume/resume.parser";
import {
  FULL_RESUME_PARSER_OUTPUT,
  PARTIAL_RESUME_PARSER_OUTPUT,
  MESSY_RESUME_PARSER_OUTPUT,
  MINIMAL_RESUME_PARSER_OUTPUT,
  MISSING_EMAIL_OUTPUT,
  MISSING_NAME_OUTPUT,
  MALFORMED_PARSER_OUTPUT,
} from "@/modules/resume-intelligence/document/resume-ingestion.fixtures";

describe("Phase 1: Resume Ingestion Normalization Pipeline", () => {
  const normalizer = new ResumeDocumentNormalizer();
  const parser = new ResumeParserService();

  // --------------------------------------------------------------------------
  // Suite 1: Canonical Normalization
  // --------------------------------------------------------------------------
  describe("Suite 1: Canonical Normalization (Full Parser Output Mapping)", () => {
    it("should transform complete extracted data into valid canonical ResumeDocument AST", () => {
      const doc = normalizer.normalize(FULL_RESUME_PARSER_OUTPUT, null, {
        userId: "usr_test_alex",
        resumeId: "res_test_alex",
        title: "Alex Morgan Resume",
      });

      const schemaCheck = ResumeDocumentSchema.safeParse(doc);
      expect(schemaCheck.success).toBe(true);

      // Contact
      expect(doc.contact.fullName).toBe("Alex Morgan");
      expect(doc.contact.email).toBe("alex.morgan@example.com");
      expect(doc.contact.phone).toBe("+1-555-0199");
      expect(doc.contact.location).toBe("San Francisco, CA");

      // Summary
      expect(doc.summary.text).toContain("Senior Full-Stack Engineer");
      expect(doc.summary.yearsOfExperience).toBe(6);

      // Skills
      expect(doc.skills.length).toBe(6);
      const reactSkill = doc.skills.find((s) => s.name === "React");
      expect(reactSkill?.category).toBe("FRONTEND");

      // Experience & Bullets
      expect(doc.experience.length).toBe(2);
      expect(doc.experience[0].companyName).toBe("Acme Cloud Corp");
      expect(doc.experience[0].isCurrent).toBe(true);
      expect(doc.experience[0].bullets.length).toBeGreaterThan(0);

      // Projects
      expect(doc.projects.length).toBe(1);
      expect(doc.projects[0].title).toBe("Cloud Pulse Monitor");

      // Education
      expect(doc.education.length).toBe(1);
      expect(doc.education[0].institution).toBe("Stanford University");

      // Achievements
      expect(doc.achievements.length).toBe(1);
      expect(doc.achievements[0].title).toBe("AWS Certified Solutions Architect");

      // Evidence ledger
      expect(doc.evidence.length).toBeGreaterThan(0);
      expect(doc.evidence.every((e) => e.source === "PARSED")).toBe(true);
      expect(doc.evidence.every((e) => e.verified === false)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 2: Partial & Minimal Resumes
  // --------------------------------------------------------------------------
  describe("Suite 2: Partial & Minimal Resumes", () => {
    it("should produce clean empty arrays for absent sections in partial resumes", () => {
      const doc = normalizer.normalize(PARTIAL_RESUME_PARSER_OUTPUT, null, {
        userId: "usr_student",
        title: "Partial Student Resume",
      });

      const schemaCheck = ResumeDocumentSchema.safeParse(doc);
      expect(schemaCheck.success).toBe(true);

      expect(doc.contact.fullName).toBe("Morgan Taylor");
      expect(doc.contact.email).toBe("morgan.taylor@example.com");
      expect(doc.experience).toEqual([]);
      expect(doc.projects).toEqual([]);
      expect(doc.achievements).toEqual([]);
      expect(doc.education.length).toBe(1);
    });

    it("should normalize minimal resume (name + email + skills only) without fabricating sections", () => {
      const doc = normalizer.normalize(MINIMAL_RESUME_PARSER_OUTPUT, null, {
        userId: "usr_minimal",
        title: "Minimal Resume",
      });

      const schemaCheck = ResumeDocumentSchema.safeParse(doc);
      expect(schemaCheck.success).toBe(true);

      expect(doc.contact.fullName).toBe("Taylor Swift");
      expect(doc.contact.email).toBe("taylor.swift@example.com");
      expect(doc.skills.length).toBe(2);
      expect(doc.experience).toEqual([]);
      expect(doc.projects).toEqual([]);
      expect(doc.education).toEqual([]);
      expect(doc.achievements).toEqual([]);
      expect(doc.summary.text).toBe("");
    });
  });

  // --------------------------------------------------------------------------
  // Suite 3: Missing Contact Fields
  // --------------------------------------------------------------------------
  describe("Suite 3: Missing Contact Fields (Zero Hallucination)", () => {
    it("should leave email as undefined when missing, never fabricating a synthetic email", () => {
      const doc = normalizer.normalize(MISSING_EMAIL_OUTPUT, null);

      expect(doc.contact.email).toBeUndefined();
      expect(doc.contact.fullName).toBe("Sam Wilson");
      const schemaCheck = ResumeDocumentSchema.safeParse(doc);
      expect(schemaCheck.success).toBe(true);
    });

    it("should handle missing fullName without injecting generic placeholders like 'Candidate'", () => {
      const doc = normalizer.normalize(MISSING_NAME_OUTPUT, null);

      expect(doc.contact.fullName).not.toBe("Candidate");
      expect(doc.contact.fullName.length).toBeGreaterThan(0);
      expect(doc.contact.email).toBe("anonymous.dev@example.com");

      const schemaCheck = ResumeDocumentSchema.safeParse(doc);
      expect(schemaCheck.success).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 4: Partial Experience Preservation
  // --------------------------------------------------------------------------
  describe("Suite 4: Partial Experience Preservation", () => {
    it("should preserve experience bullets and metrics even when company name is missing", () => {
      const doc = normalizer.normalize(MESSY_RESUME_PARSER_OUTPUT, null);

      expect(doc.experience.length).toBe(2);

      // First experience entry has empty companyName but 3 rich bullets
      const partialExp = doc.experience[0];
      expect(partialExp.companyName).toBeUndefined();
      expect(partialExp.jobTitle).toBe("Lead Developer");
      expect(partialExp.bullets.length).toBe(3);

      // Check bullet content is intact
      expect(partialExp.bullets.some((b) => b.text.includes("Redis caching layer"))).toBe(true);
      expect(partialExp.bullets.some((b) => b.text.includes("55%"))).toBe(true);

      const schemaCheck = ResumeDocumentSchema.safeParse(doc);
      expect(schemaCheck.success).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 5: Source Preservation Invariant
  // --------------------------------------------------------------------------
  describe("Suite 5: Source Preservation (No Deletion, Modification, or Rewriting)", () => {
    it("should strictly preserve metrics, technology names, and bullet phrasing exactly as parsed", () => {
      const doc = normalizer.normalize(FULL_RESUME_PARSER_OUTPUT, null);

      const acmeExp = doc.experience.find((e) => e.companyName === "Acme Cloud Corp");
      expect(acmeExp).toBeDefined();

      const latencyBullet = acmeExp?.bullets.find((b) => b.text.includes("42%"));
      expect(latencyBullet).toBeDefined();
      expect(latencyBullet?.metrics).toContain("42%");

      // Ensure technologies in projects are preserved without alteration
      const proj = doc.projects.find((p) => p.title === "Cloud Pulse Monitor");
      expect(proj?.technologies).toEqual(["Node.js", "Redis", "TypeScript", "Docker"]);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 6: AST Stability & Determinism
  // --------------------------------------------------------------------------
  describe("Suite 6: AST Stability & Determinism", () => {
    it("should produce identical canonical AST and IDs across consecutive runs with same input", () => {
      const fixedTimestamp = "2026-09-21T12:00:00.000Z";
      const options = {
        userId: "usr_stable_test",
        resumeId: "doc_stable_id",
        title: "Stable Resume",
        timestamp: fixedTimestamp,
      };

      const run1 = normalizer.normalize(FULL_RESUME_PARSER_OUTPUT, null, options);
      const run2 = normalizer.normalize(FULL_RESUME_PARSER_OUTPUT, null, options);

      expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
      expect(run1.id).toBe(run2.id);
      expect(run1.experience[0].id).toBe(run2.experience[0].id);
      expect(run1.skills[0].id).toBe(run2.skills[0].id);
      expect(run1.evidence[0].id).toBe(run2.evidence[0].id);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 7: Evidence & True Source Confidence
  // --------------------------------------------------------------------------
  describe("Suite 7: Evidence Ledger & True Source Confidence", () => {
    it("should record true source confidence (undefined/null, never fabricated 0.95)", () => {
      const doc = normalizer.normalize(FULL_RESUME_PARSER_OUTPUT, null, {
        userId: "usr_evidence",
        resumeId: "doc_evidence_id",
      });

      expect(doc.evidence.length).toBeGreaterThan(0);
      for (const ev of doc.evidence) {
        expect(ev.source).toBe("PARSED");
        expect(ev.verified).toBe(false);
        // True source confidence: must NOT be fabricated arbitrary numbers
        expect(ev.confidence).toBeUndefined();
      }
    });

    it("should decouple evidence IDs from resume file ID so canonical facts share identical IDs across files", () => {
      const fact1 = generateDeterministicId("ev", "skill", "TypeScript");
      const fact2 = generateDeterministicId("ev", "skill", "TypeScript");
      expect(fact1).toBe(fact2);

      // Decoupled from different doc options
      const docA = normalizer.normalize(MINIMAL_RESUME_PARSER_OUTPUT, null, { resumeId: "doc_aaa" });
      const docB = normalizer.normalize(MINIMAL_RESUME_PARSER_OUTPUT, null, { resumeId: "doc_bbb" });

      const skillEvA = docA.evidence.find((e) => e.value === "Creative Writing");
      const skillEvB = docB.evidence.find((e) => e.value === "Creative Writing");

      expect(skillEvA?.id).toBe(skillEvB?.id);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 8: Date Precision Preservation
  // --------------------------------------------------------------------------
  describe("Suite 8: Date Precision Normalizer", () => {
    it("should preserve exact granularity without inventing missing months or days", () => {
      expect(normalizeDatePrecision("2022")).toBe("2022");
      expect(normalizeDatePrecision("2022-01")).toBe("2022-01");
      expect(normalizeDatePrecision("01/2022")).toBe("2022-01");
      expect(normalizeDatePrecision("January 2022")).toBe("2022-01");
      expect(normalizeDatePrecision("Jan 2022")).toBe("2022-01");
      expect(normalizeDatePrecision("Jan 15, 2022")).toBe("2022-01-15");
      expect(normalizeDatePrecision("2022-01-15")).toBe("2022-01-15");
      expect(normalizeDatePrecision("Present")).toBe("Present");
      expect(normalizeDatePrecision("current")).toBe("Present");
      expect(normalizeDatePrecision(undefined)).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // Suite 9: Skill Deduplication & Taxonomic Classification
  // --------------------------------------------------------------------------
  describe("Suite 9: Skill Deduplication & Boundary", () => {
    it("should deduplicate skills case-insensitively while preserving distinct technologies", () => {
      const doc = normalizer.normalize(MESSY_RESUME_PARSER_OUTPUT, null);

      // React / react / REACT -> exactly 1
      const reactList = doc.skills.filter((s) => s.name.toLowerCase() === "react");
      expect(reactList.length).toBe(1);

      // Node.js / node.js -> exactly 1
      const nodeJsList = doc.skills.filter((s) => s.name.toLowerCase() === "node.js");
      expect(nodeJsList.length).toBe(1);

      // Distinct skills must remain distinct
      const java = doc.skills.find((s) => s.name === "Java");
      const js = doc.skills.find((s) => s.name === "JavaScript");
      const c = doc.skills.find((s) => s.name === "C");
      const cpp = doc.skills.find((s) => s.name === "C++");

      expect(java).toBeDefined();
      expect(js).toBeDefined();
      expect(c).toBeDefined();
      expect(cpp).toBeDefined();
    });

    it("should categorize technical skills into canonical enum categories", () => {
      expect(normalizeSkillCategory("React")).toBe("FRONTEND");
      expect(normalizeSkillCategory("Node.js")).toBe("BACKEND");
      expect(normalizeSkillCategory("PostgreSQL")).toBe("DATABASE");
      expect(normalizeSkillCategory("AWS")).toBe("CLOUD");
      expect(normalizeSkillCategory("Docker")).toBe("DEVOPS");
      expect(normalizeSkillCategory("TypeScript")).toBe("LANGUAGE");
      expect(normalizeSkillCategory("Jest")).toBe("TESTING");
      expect(normalizeSkillCategory("React Native")).toBe("MOBILE");
      expect(normalizeSkillCategory("PyTorch")).toBe("AI_ML");
      expect(normalizeSkillCategory("Postman")).toBe("TOOLS");
    });
  });

  // --------------------------------------------------------------------------
  // Suite 10: Synthetic Real PDF Integration
  // --------------------------------------------------------------------------
  describe("Suite 10: Synthetic Real PDF Integration (End-to-End)", () => {
    it("should process real synthetic PDF buffer through parser, normalizer, and schema validation", async () => {
      const fixturePath = path.join(process.cwd(), "tests", "fixtures", "synthetic-resume.pdf");
      expect(fs.existsSync(fixturePath)).toBe(true);

      const pdfBuffer = fs.readFileSync(fixturePath);
      expect(pdfBuffer.length).toBeGreaterThan(1000);

      // 1. PDF Parser
      const rawText = await parser.extractRawTextFromBuffer(pdfBuffer);
      expect(rawText.length).toBeGreaterThan(100);

      const extractedData = await parser.parseResumeBuffer(pdfBuffer);
      expect(extractedData.personalInfo?.fullName).toBeDefined();

      // 2. Deterministic Normalizer
      const canonicalDoc = normalizer.normalize(extractedData, rawText, {
        userId: "usr_pdf_e2e",
        title: "Synthetic PDF E2E Test",
      });

      // 3. Schema Validation
      const validation = ResumeDocumentSchema.safeParse(canonicalDoc);
      expect(validation.success).toBe(true);

      // 4. Assertions on normalized AST
      expect(canonicalDoc.contact.fullName.length).toBeGreaterThan(0);
      expect(canonicalDoc.schemaVersion).toBe("1.0.0");
      expect(canonicalDoc.evidence.length).toBeGreaterThan(0);
      expect(canonicalDoc.evidence.every((e) => e.source === "PARSED")).toBe(true);
      expect(canonicalDoc.evidence.every((e) => e.confidence === undefined)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Graceful Handling of Malformed Parser Output
  // --------------------------------------------------------------------------
  describe("Graceful Handling of Malformed Output", () => {
    it("should repair corrupted or malformed parser output without throwing uncaught exceptions", () => {
      const doc = normalizer.normalize(MALFORMED_PARSER_OUTPUT, null, {
        userId: "usr_malformed",
        title: "Malformed Ingestion Test",
      });

      const schemaCheck = ResumeDocumentSchema.safeParse(doc);
      expect(schemaCheck.success).toBe(true);
      expect(Array.isArray(doc.skills)).toBe(true);
      expect(Array.isArray(doc.experience)).toBe(true);
      expect(Array.isArray(doc.projects)).toBe(true);
    });

    it("should normalize projects without duplicating description in bullets and cap at max 4 bullets", () => {
      const rawWithBullets: any = {
        projects: [
          {
            title: "SafetyPlatform",
            description: "An enterprise safety platform.",
            bullets: [
              "• Built real-time monitoring.",
              "• Implemented YOLOv8 detection.",
              "• Reduced latency by 45%.",
              "• Integrated alerts.",
              "• Extra bullet point.",
            ],
            technologies: ["React", "Node.js"],
          },
          {
            title: "Legacy Project",
            description: "• Single bullet item from legacy parse without separate bullets field.",
            technologies: ["Python"],
          },
        ],
      };

      const doc = normalizer.normalize(rawWithBullets, null);
      expect(doc.projects.length).toBe(2);

      const p1 = doc.projects[0];
      expect(p1.description).toBe("An enterprise safety platform.");
      expect(p1.bullets.length).toBe(4);
      expect(p1.bullets[0]).toBe("Built real-time monitoring.");
      expect(p1.bullets.every((b) => !b.startsWith("•"))).toBe(true);
      expect(p1.bullets.includes(p1.description!)).toBe(false);

      const p2 = doc.projects[1];
      // Legacy project description starting with bullet should not be duplicated in description
      expect(p2.bullets.length).toBe(1);
      expect(p2.bullets[0]).toBe("Single bullet item from legacy parse without separate bullets field.");
      expect(p2.description).toBeUndefined();
    });
  });
});
