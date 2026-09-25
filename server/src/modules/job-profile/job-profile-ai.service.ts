import { modelGateway } from "@/core/ai/gateway";
import {
  IJobProfileAnalysis,
  IJobProfileAnalysisMetadata,
  IJobRequirementItem,
} from "@/database/models/JobProfile.model";
import {
  JobAnalysisOutputSchema,
  JobAnalysisOutput,
} from "./job-profile.types";
import { JobProfileNormalizer } from "./job-profile.normalizer";

export class JobProfileAiService {
  private static instance: JobProfileAiService;

  public static getInstance(): JobProfileAiService {
    if (!JobProfileAiService.instance) {
      JobProfileAiService.instance = new JobProfileAiService();
    }
    return JobProfileAiService.instance;
  }

  /**
   * Prompts ModelGateway with strict anti-hallucination guardrails and extracts structured
   * JobProfile requirements, enforcing grounded evidence spans.
   */
  public async analyzeJobDescription(
    normalizedText: string,
    jobTitle: string,
    company?: string | null
  ): Promise<{
    analysis: IJobProfileAnalysis;
    metadata: IJobProfileAnalysisMetadata;
  }> {
    // 1. Controlled Mock Mode (for automated deterministic tests or explicit mock env)
    if (process.env.JOB_ANALYSIS_MODE === "mock") {
      return this.generateMockAnalysis(normalizedText, jobTitle, company);
    }

    const prompt = this.buildPrompt(normalizedText, jobTitle, company);

    try {
      const response = await modelGateway.generateStructured<JobAnalysisOutput>(
        { prompt },
        "Job Description Requirements and Intelligence Analysis",
        JobAnalysisOutputSchema
      );

      const data = response.data;

      // 2. Validate Grounded Evidence Spans
      const validRequirements: IJobRequirementItem[] = [];
      for (const req of data.requirements) {
        const isGrounded = JobProfileNormalizer.verifyEvidenceGrounding(
          req.evidence.text,
          normalizedText
        );
        let evidenceText = req.evidence.text ? req.evidence.text.trim() : "";
        if (!isGrounded) {
          // If citation had minor paraphrase/formatting difference, recover line containing the requirement
          const lines = normalizedText.split("\n");
          const matchingLine = lines.find((l) =>
            l.toLowerCase().includes(req.name.toLowerCase())
          );
          if (matchingLine) {
            evidenceText = matchingLine.trim();
          } else {
            // Requirement not grounded anywhere in source text - omit to prevent hallucination
            continue;
          }
        }

        validRequirements.push({
          name: req.name.trim(),
          normalizedName: (req.normalizedName || req.name).trim().toLowerCase(),
          category: req.category || "SKILL",
          importance: req.importance || "REQUIRED",
          evidence: {
            text: evidenceText,
            section: req.evidence.section ? req.evidence.section.trim() : null,
          },
          confidence: Math.min(Math.max(req.confidence ?? 1.0, 0), 1),
        });
      }

      const analysis: IJobProfileAnalysis = {
        normalizedRoleTitle: data.normalizedRoleTitle || jobTitle,
        seniority: data.seniority || "UNKNOWN",
        responsibilities: data.responsibilities || [],
        requirements: validRequirements,
        experienceRequirements: data.experienceRequirements || [],
        educationRequirements: data.educationRequirements || [],
        domain: data.domain || null,
        location: data.location || null,
        employmentType: data.employmentType || null,
        keywords: data.keywords || [],
      };

      const metadata: IJobProfileAnalysisMetadata = {
        source: "AI",
        provider: response.provider || "model-gateway",
        model: response.model || null,
        analyzedAt: new Date(),
      };

      return { analysis, metadata };
    } catch (err: any) {
      // Re-throw with descriptive technical context for the orchestrating service
      throw err;
    }
  }

  private buildPrompt(
    normalizedText: string,
    jobTitle: string,
    company?: string | null
  ): string {
    return `You are an expert Job Intelligence Analyzer for SKILLEZO AI.
Your task is to extract structured requirements from the supplied Job Description.

TARGET JOB TITLE: ${jobTitle}
TARGET COMPANY: ${company || "Not Specified"}

================ SOURCE JOB DESCRIPTION ================
${normalizedText}
========================================================

CRITICAL EXTRACTION RULES (HARD INVARIANTS):
1. FACTUAL GROUNDING: Extract ONLY requirements explicitly mentioned in the text.
   DO NOT invent technologies, tools, or requirements not in the text.
   DO NOT infer or evaluate candidate qualifications.
2. IMPORTANCE HIERARCHY:
   - "REQUIRED": Explicitly stated as required, essential, mandatory, or core qualification.
   - "PREFERRED": Explicitly stated as nice-to-have, preferred, bonus, plus, or optional.
   - "UNKNOWN": Requirements where mandatory vs preferred distinction is ambiguous in the text.
3. GROUNDED EVIDENCE:
   Every item in "requirements" MUST include an exact verbatim citation in "evidence.text" extracted from the text above.
4. CATEGORIZATION:
   - "SKILL": Core programming/technical capabilities (e.g. "REST APIs", "System Design").
   - "TECHNOLOGY": Programming languages, frameworks, databases (e.g. "TypeScript", "React", "PostgreSQL").
   - "TOOL": Developer tools, platforms, CI/CD (e.g. "Git", "Docker", "Jira", "Figma").
   - "DOMAIN": Industry/domain concepts (e.g. "FinTech", "Healthcare", "E-commerce").
   - "QUALIFICATION": Professional certifications, clearances, or licenses.
   - "EDUCATION": Degree or educational criteria.
   - "EXPERIENCE": Years of experience requirements.
5. RESPONSIBILITIES: Keep day-to-day responsibilities separate from technical requirements.
6. SENIORITY: Must be strictly one of "INTERN", "JUNIOR", "MID", "SENIOR", "LEAD", "PRINCIPAL", "EXECUTIVE", "UNKNOWN". If unclear or not specified, use "UNKNOWN".

REQUIRED JSON FORMAT (YOU MUST USE THIS EXACT SCHEMA):
{
  "normalizedRoleTitle": "${jobTitle}",
  "seniority": "INTERN | JUNIOR | MID | SENIOR | LEAD | PRINCIPAL | EXECUTIVE | UNKNOWN",
  "responsibilities": ["Develop features", "Collaborate with team"],
  "requirements": [
    {
      "name": "Exact Skill / Tool / Requirement Name (e.g. React, Node.js, AWS)",
      "category": "SKILL | TECHNOLOGY | TOOL | DOMAIN | QUALIFICATION | EDUCATION | EXPERIENCE",
      "importance": "REQUIRED | PREFERRED | UNKNOWN",
      "evidence": {
        "text": "Exact sentence quoted from the JD text above"
      }
    }
  ],
  "experienceRequirements": ["5+ years experience in software engineering"],
  "educationRequirements": ["Bachelor's in Computer Science or equivalent"],
  "domain": null,
  "keywords": ["React", "TypeScript", "Node.js"]
}

Return ONLY valid JSON matching this exact structure.`;
  }

  /**
   * Deterministic mock generator for tests and offline development.
   */
  public generateMockAnalysis(
    normalizedText: string,
    jobTitle: string,
    company?: string | null
  ): {
    analysis: IJobProfileAnalysis;
    metadata: IJobProfileAnalysisMetadata;
  } {
    const textLower = normalizedText.toLowerCase();

    const requirements: IJobRequirementItem[] = [];

    // Detect common skills and extract exact grounded sentences
    const potentialSkills = [
      { name: "TypeScript", normalizedName: "typescript", category: "TECHNOLOGY" as const },
      { name: "React", normalizedName: "react", category: "TECHNOLOGY" as const },
      { name: "Next.js", normalizedName: "next.js", category: "TECHNOLOGY" as const },
      { name: "Node.js", normalizedName: "node.js", category: "TECHNOLOGY" as const },
      { name: "AWS", normalizedName: "aws", category: "TOOL" as const },
      { name: "Docker", normalizedName: "docker", category: "TOOL" as const },
      { name: "PostgreSQL", normalizedName: "postgresql", category: "TECHNOLOGY" as const },
    ];

    for (const skill of potentialSkills) {
      if (textLower.includes(skill.normalizedName)) {
        // Find line or sentence containing the skill to use as grounded evidence
        const lines = normalizedText.split("\n");
        const matchingLine = lines.find((l) =>
          l.toLowerCase().includes(skill.normalizedName)
        ) || `${skill.name} mentioned in job description`;

        const isPreferred =
          matchingLine.toLowerCase().includes("preferred") ||
          matchingLine.toLowerCase().includes("plus") ||
          matchingLine.toLowerCase().includes("bonus");

        requirements.push({
          name: skill.name,
          normalizedName: skill.normalizedName,
          category: skill.category,
          importance: isPreferred ? "PREFERRED" : "REQUIRED",
          evidence: {
            text: matchingLine.trim(),
            section: "Requirements",
          },
          confidence: 0.98,
        });
      }
    }

    // Determine seniority from job title
    let seniority: any = "MID";
    if (jobTitle.toLowerCase().includes("senior") || jobTitle.toLowerCase().includes("sr")) {
      seniority = "SENIOR";
    } else if (jobTitle.toLowerCase().includes("lead") || jobTitle.toLowerCase().includes("staff")) {
      seniority = "LEAD";
    } else if (jobTitle.toLowerCase().includes("junior") || jobTitle.toLowerCase().includes("entry")) {
      seniority = "JUNIOR";
    }

    const analysis: IJobProfileAnalysis = {
      normalizedRoleTitle: jobTitle,
      seniority,
      responsibilities: [
        "Design, build, and maintain frontend applications",
        "Collaborate with cross-functional teams to deliver customer value",
      ],
      requirements,
      experienceRequirements: ["3+ years of professional software engineering experience"],
      educationRequirements: ["Bachelor's degree in Computer Science or equivalent practical experience"],
      domain: "Software Engineering",
      location: "Remote / Hybrid",
      employmentType: "Full-Time",
      keywords: requirements.map((r) => r.name),
    };

    const metadata: IJobProfileAnalysisMetadata = {
      source: "MOCK",
      provider: "synthetic-mock-provider",
      model: "mock-analyzer-v1",
      analyzedAt: new Date(),
    };

    return { analysis, metadata };
  }
}

export const jobProfileAiService = JobProfileAiService.getInstance();
