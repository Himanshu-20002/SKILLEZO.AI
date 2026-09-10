import { describe, it, expect } from "vitest";
import {
  ResumeDocumentSchema,
  ResumeContactSchema,
  ResumeEvidenceSchema,
  ResumeSkillItemSchema,
  ResumeExperienceItemSchema,
} from "@/modules/resume-intelligence/document/resume-document.schema";
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from "@/modules/resume-intelligence/document/resume-document.fixture";

describe("Phase 0: Canonical ResumeDocument Architecture", () => {
  describe("1. Schema Validation on Sample Fixture", () => {
    it("should validate complete sample ResumeDocument fixture without errors", () => {
      const parsed = ResumeDocumentSchema.safeParse(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.id).toBe("doc_himanshu_sample_01");
        expect(parsed.data.contact.fullName).toBe("Himanshu Kumar");
        expect(parsed.data.skills.length).toBe(10);
        expect(parsed.data.experience.length).toBe(2);
        expect(parsed.data.projects.length).toBe(2);
        expect(parsed.data.education.length).toBe(1);
        expect(parsed.data.achievements.length).toBe(2);
        expect(parsed.data.evidence.length).toBe(3);
      }
    });
  });

  describe("2. Contact Section Constraints", () => {
    it("should reject contact with invalid email address", () => {
      const invalidContact = {
        fullName: "Jane Doe",
        email: "not-an-email",
        links: [],
      };
      const parsed = ResumeContactSchema.safeParse(invalidContact);
      expect(parsed.success).toBe(false);
    });

    it("should reject contact with empty full name", () => {
      const invalidContact = {
        fullName: "",
        email: "jane@example.com",
        links: [],
      };
      const parsed = ResumeContactSchema.safeParse(invalidContact);
      expect(parsed.success).toBe(false);
    });
  });

  describe("3. Evidence Provenance Integrity", () => {
    it("should accept valid evidence with CONFIRMED source and normalized confidence", () => {
      const validEvidence = {
        id: "ev_001",
        type: "SKILL",
        source: "CONFIRMED",
        value: "TypeScript",
        confidence: 1.0,
        verified: true,
        createdAt: new Date().toISOString(),
      };
      const parsed = ResumeEvidenceSchema.safeParse(validEvidence);
      expect(parsed.success).toBe(true);
    });

    it("should reject evidence with confidence out of 0.0 - 1.0 bounds", () => {
      const invalidEvidence = {
        id: "ev_002",
        type: "METRIC",
        source: "PARSED",
        value: "40% reduction",
        confidence: 1.5, // invalid
        verified: false,
        createdAt: new Date().toISOString(),
      };
      const parsed = ResumeEvidenceSchema.safeParse(invalidEvidence);
      expect(parsed.success).toBe(false);
    });
  });

  describe("4. Experience & Skill Schema Validation", () => {
    it("should validate skill item categories and evidence mappings", () => {
      const skill = {
        id: "sk_test_1",
        name: "React",
        category: "FRONTEND",
        proficiency: "EXPERT",
        evidenceIds: ["ev_1", "ev_2"],
      };
      const parsed = ResumeSkillItemSchema.safeParse(skill);
      expect(parsed.success).toBe(true);
    });

    it("should validate experience item with bullets, verbs, and metrics", () => {
      const exp = {
        id: "exp_test_1",
        companyName: "Acme Corp",
        jobTitle: "Software Engineer",
        isCurrent: true,
        bullets: [
          {
            id: "b_1",
            text: "Developed scalable APIs reducing latency by 30%.",
            verbs: ["Developed", "Reducing"],
            metrics: ["30%"],
            evidenceIds: ["ev_3"],
          },
        ],
      };
      const parsed = ResumeExperienceItemSchema.safeParse(exp);
      expect(parsed.success).toBe(true);
    });
  });

  describe("5. Serialization & Roundtrip Integrity", () => {
    it("should preserve all fields through JSON serialization and parse roundtrip", () => {
      const serialized = JSON.stringify(SAMPLE_RESUME_DOCUMENT_FIXTURE);
      const deserialized = JSON.parse(serialized);
      const parsed = ResumeDocumentSchema.safeParse(deserialized);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.title).toBe(SAMPLE_RESUME_DOCUMENT_FIXTURE.title);
        expect(parsed.data.scores?.overall.overallScore).toBe(84);
      }
    });
  });
});
