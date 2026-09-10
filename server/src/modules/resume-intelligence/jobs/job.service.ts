import crypto from "crypto";
import { RoleProfile } from "../roles/role.types";
import { RoleNormalizer } from "../roles/role.normalizer";
import { JobValidator } from "./job.validator";
import { JobParser } from "./job.parser";
import { JobExtractor } from "./job.extractor";
import {
  JobRequirementEvidence,
  JobRequirementProfile,
  JobSkillRequirement,
  JD_ENGINE_VERSION,
} from "./job.types";

export class JobIntelligenceService {
  private static instance: JobIntelligenceService;

  public static getInstance(): JobIntelligenceService {
    if (!JobIntelligenceService.instance) {
      JobIntelligenceService.instance = new JobIntelligenceService();
    }
    return JobIntelligenceService.instance;
  }

  /**
   * Parses raw Job Description text into structured JobRequirementProfile.
   */
  public parseJobDescription(rawJd: string, jobId?: string): JobRequirementProfile | null {
    const validation = JobValidator.validateAndNormalize(rawJd);
    if (!validation.isValid || !validation.normalizedText) {
      return null;
    }

    const text = validation.normalizedText;
    const sourceHash = crypto.createHash("sha256").update(text).digest("hex");
    const evidenceList: JobRequirementEvidence[] = [];

    // 1. Parse Sections
    const sections = JobParser.parseSections(text);

    // 2. Extract Seniority
    const seniority = RoleNormalizer.extractSeniority(sections.title || text);

    // 3. Extract Skills with Phase 2 Canonical Mapping
    const { requiredSkills, preferredSkills } = JobExtractor.extractSkills(sections, text, evidenceList);

    // 4. Extract Experience, Education, Certifications, Responsibilities, Domains
    const experienceRequirements = JobParser.extractExperienceRequirements(text, evidenceList);
    const educationRequirements = JobParser.extractEducationRequirements(text, evidenceList);
    const certificationRequirements = JobParser.extractCertifications(text, evidenceList);
    const responsibilities = JobParser.extractResponsibilities(sections, evidenceList);
    const { domains, keywords } = JobParser.extractDomainsAndKeywords(text);

    return {
      jobId: jobId || `job_${sourceHash.slice(0, 12)}`,
      title: sections.title,
      seniority,
      requiredSkills,
      preferredSkills,
      responsibilities,
      experienceRequirements,
      educationRequirements,
      certificationRequirements,
      domains,
      keywords,
      evidence: evidenceList,
      sourceHash,
      parserVersion: JD_ENGINE_VERSION,
      extractionConfidence: 0.95,
      rawExcerpt: text.slice(0, 400),
    };
  }

  /**
   * Merges Role Benchmark and optional Job Description requirements.
   * Tracks sources ('ROLE_BENCHMARK' and/or 'JOB_DESCRIPTION') without mutating canonical role catalog.
   */
  public mergeRequirements(
    roleBenchmark: RoleProfile,
    jobProfile?: JobRequirementProfile | null
  ): {
    mergedRequiredSkills: JobSkillRequirement[];
    mergedPreferredSkills: JobSkillRequirement[];
    effectiveSeniority: any;
    effectiveDomains: string[];
    effectiveKeywords: string[];
  } {
    const requiredMap = new Map<string, JobSkillRequirement>();
    const preferredMap = new Map<string, JobSkillRequirement>();

    // 1. Ingest Role Benchmark Skills
    for (const reqSkill of roleBenchmark.requiredSkills) {
      requiredMap.set(reqSkill.skillId, {
        skillId: reqSkill.skillId,
        canonicalName: reqSkill.canonicalName,
        requirementType: "REQUIRED",
        confidence: 0.99,
        evidenceIds: [],
        sources: ["ROLE_BENCHMARK"],
        category: reqSkill.category,
      });
    }

    for (const prefSkill of roleBenchmark.preferredSkills) {
      if (!requiredMap.has(prefSkill.skillId)) {
        preferredMap.set(prefSkill.skillId, {
          skillId: prefSkill.skillId,
          canonicalName: prefSkill.canonicalName,
          requirementType: "PREFERRED",
          confidence: 0.99,
          evidenceIds: [],
          sources: ["ROLE_BENCHMARK"],
          category: prefSkill.category,
        });
      }
    }

    // 2. Ingest Job Description Skills (if present)
    if (jobProfile) {
      for (const jdReq of jobProfile.requiredSkills) {
        if (requiredMap.has(jdReq.skillId)) {
          const existing = requiredMap.get(jdReq.skillId)!;
          if (!existing.sources.includes("JOB_DESCRIPTION")) {
            existing.sources.push("JOB_DESCRIPTION");
          }
          existing.evidenceIds.push(...jdReq.evidenceIds);
        } else if (preferredMap.has(jdReq.skillId)) {
          // Upgrade to REQUIRED for employer-specific context
          const existing = preferredMap.get(jdReq.skillId)!;
          preferredMap.delete(jdReq.skillId);
          requiredMap.set(jdReq.skillId, {
            ...existing,
            requirementType: "REQUIRED",
            sources: [...existing.sources, "JOB_DESCRIPTION"],
            evidenceIds: [...existing.evidenceIds, ...jdReq.evidenceIds],
          });
        } else {
          requiredMap.set(jdReq.skillId, {
            ...jdReq,
            sources: ["JOB_DESCRIPTION"],
          });
        }
      }

      for (const jdPref of jobProfile.preferredSkills) {
        if (!requiredMap.has(jdPref.skillId)) {
          if (preferredMap.has(jdPref.skillId)) {
            const existing = preferredMap.get(jdPref.skillId)!;
            if (!existing.sources.includes("JOB_DESCRIPTION")) {
              existing.sources.push("JOB_DESCRIPTION");
            }
            existing.evidenceIds.push(...jdPref.evidenceIds);
          } else {
            preferredMap.set(jdPref.skillId, {
              ...jdPref,
              sources: ["JOB_DESCRIPTION"],
            });
          }
        }
      }
    }

    const effectiveDomains = Array.from(
      new Set([...(roleBenchmark.domains || []), ...(jobProfile?.domains || [])])
    );
    const effectiveKeywords = Array.from(
      new Set([...(roleBenchmark.keywords || []), ...(jobProfile?.keywords || [])])
    );

    return {
      mergedRequiredSkills: Array.from(requiredMap.values()),
      mergedPreferredSkills: Array.from(preferredMap.values()),
      effectiveSeniority: jobProfile?.seniority || roleBenchmark.seniority,
      effectiveDomains,
      effectiveKeywords,
    };
  }
}

export const jobIntelligenceService = JobIntelligenceService.getInstance();
