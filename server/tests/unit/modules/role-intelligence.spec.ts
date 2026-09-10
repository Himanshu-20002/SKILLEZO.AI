import { describe, it, expect } from "vitest";
import {
  RoleNormalizer,
  roleIntelligenceService,
  CANONICAL_ROLE_CATALOG,
} from "@/modules/resume-intelligence";

describe("Phase 3: Role Benchmark Intelligence", () => {
  describe("1. Canonical Role Catalog", () => {
    it("should provide canonical role definitions with required and preferred skills referencing Phase 2 IDs", () => {
      expect(CANONICAL_ROLE_CATALOG.length).toBeGreaterThanOrEqual(6);
      const frontend = CANONICAL_ROLE_CATALOG.find((r) => r.roleId === "role_frontend_engineer");
      expect(frontend).toBeDefined();
      expect(frontend?.title).toBe("Frontend Engineer");

      const reqSkillIds = frontend?.requiredSkills.map((s) => s.skillId);
      expect(reqSkillIds).toContain("skill_react");
      expect(reqSkillIds).toContain("skill_typescript");
      expect(reqSkillIds).toContain("skill_javascript");
      expect(reqSkillIds).toContain("skill_html_css");
    });

    it("should support responsibilities, experience, education, and domain metadata", () => {
      const backend = CANONICAL_ROLE_CATALOG.find((r) => r.roleId === "role_backend_engineer");
      expect(backend).toBeDefined();
      expect(backend?.responsibilities.length).toBeGreaterThanOrEqual(2);
      expect(backend?.experienceRequirements.length).toBeGreaterThanOrEqual(1);
      expect(backend?.domains).toContain("Microservices");
    });
  });

  describe("2. Role Normalization & Aliases", () => {
    it("should normalize diverse alias spellings to canonical titles", () => {
      expect(RoleNormalizer.normalize("Full Stack Developer").canonicalTitle).toBe("Full-Stack Engineer");
      expect(RoleNormalizer.normalize("full-stack developer").canonicalTitle).toBe("Full-Stack Engineer");
      expect(RoleNormalizer.normalize("React Developer").canonicalTitle).toBe("Frontend Engineer");
      expect(RoleNormalizer.normalize("Node.js Developer").canonicalTitle).toBe("Backend Engineer");
      expect(RoleNormalizer.normalize("Cloud Engineer").canonicalTitle).toBe("DevOps & Cloud Engineer");
      expect(RoleNormalizer.normalize("Machine Learning Engineer").canonicalTitle).toBe("AI/ML Engineer");
      expect(RoleNormalizer.normalize("iOS Developer").canonicalTitle).toBe("Mobile App Developer");
    });

    it("should extract seniority profiles accurately", () => {
      const intern = RoleNormalizer.normalize("Junior Frontend Engineer");
      expect(intern.seniority.level).toBe("JUNIOR");
      expect(intern.seniority.minYears).toBe(0);

      const senior = RoleNormalizer.normalize("Senior Full Stack Developer");
      expect(senior.seniority.level).toBe("SENIOR");
      expect(senior.seniority.minYears).toBe(5);

      const staff = RoleNormalizer.normalize("Staff Backend Architect");
      expect(staff.seniority.level).toBe("STAFF");
      expect(staff.seniority.minYears).toBe(8);

      const lead = RoleNormalizer.normalize("Tech Lead - DevOps");
      expect(lead.seniority.level).toBe("LEAD");
      expect(lead.seniority.minYears).toBe(6);
    });

    it("should provide safe generic fallback for unknown roles without crashing", () => {
      const unknown = RoleNormalizer.normalize("Astronaut / Space Pilot");
      expect(unknown.isFallback).toBe(true);
      expect(unknown.canonicalTitle).toBe("Software Engineer");
      expect(unknown.confidence).toBe("LOW");

      const empty = RoleNormalizer.normalize("");
      expect(empty.isFallback).toBe(true);
      expect(empty.canonicalTitle).toBe("Software Engineer");
    });
  });

  describe("3. Role Intelligence Service", () => {
    it("should retrieve canonical benchmark for any valid or alias role", () => {
      const benchmark = roleIntelligenceService.getRoleBenchmark("Full Stack Engineer");
      expect(benchmark).toBeDefined();
      expect(benchmark.title).toBe("Full-Stack Engineer");
      expect(benchmark.requiredSkills.some((s) => s.canonicalName === "React")).toBe(true);
      expect(benchmark.requiredSkills.some((s) => s.canonicalName === "Node.js")).toBe(true);
    });
  });
});
