import { describe, it, expect } from "vitest";
import { extractSkillsFromText } from "./skill-extractor";
import { CompetencyImportance } from "../constants/enums";

describe("Skill Extractor Utility", () => {
  it("should extract AI/ML skills from job title and description", () => {
    const title = "Senior Machine Learning & Generative AI Engineer";
    const description = "Build agentic RAG workflows using Python, PyTorch, and Dataiku platform.";

    const skills = extractSkillsFromText(title, description);
    const skillNames = skills.map((s) => s.name);

    expect(skillNames).toContain("Machine Learning");
    expect(skillNames).toContain("Generative AI");
    expect(skillNames).toContain("RAG");
    expect(skillNames).toContain("Python");
    expect(skillNames).toContain("PyTorch");
    expect(skillNames).toContain("Dataiku");

    // Critical importance for title skills
    const mlSkill = skills.find((s) => s.name === "Machine Learning");
    expect(mlSkill?.importance).toBe(CompetencyImportance.CRITICAL);
  });

  it("should extract Full-Stack Web Development skills", () => {
    const title = "Full Stack Engineer (MERN)";
    const description = "Looking for strong React, Next.js, Node.js, TypeScript, and MongoDB experience.";

    const skills = extractSkillsFromText(title, description);
    const skillNames = skills.map((s) => s.name);

    expect(skillNames).toContain("React");
    expect(skillNames).toContain("Next.js");
    expect(skillNames).toContain("Node.js");
    expect(skillNames).toContain("TypeScript");
    expect(skillNames).toContain("MongoDB");
  });

  it("should extract DevOps and Cloud skills", () => {
    const title = "DevOps Engineer";
    const description = "Experience with AWS, Docker containers, Kubernetes clusters, and CI/CD pipelines.";

    const skills = extractSkillsFromText(title, description);
    const skillNames = skills.map((s) => s.name);

    expect(skillNames).toContain("AWS");
    expect(skillNames).toContain("Docker");
    expect(skillNames).toContain("Kubernetes");
    expect(skillNames).toContain("CI/CD");
  });

  it("should provide fallback Software Engineering competency when no specific tech stack matches", () => {
    const title = "Product Manager";
    const description = "Lead cross functional teams on business strategy.";

    const skills = extractSkillsFromText(title, description);
    const skillNames = skills.map((s) => s.name);

    expect(skillNames).toEqual(["Software Engineering"]);
    expect(skills[0].requiredLevel).toBe(3);
  });
});
