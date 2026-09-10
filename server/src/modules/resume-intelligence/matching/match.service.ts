import { ResumeSkillProfile } from "../skills/skill.types";
import { RoleProfile } from "../roles/role.types";
import { JobRequirementProfile } from "../jobs/job.types";
import { jobIntelligenceService } from "../jobs/job.service";
import { SkillMatcher } from "./match.skill";
import { ExperienceMatcher } from "./match.experience";
import { EducationMatcher } from "./match.education";
import { CertificationMatcher } from "./match.certification";
import { ScoreEngine } from "./match.score";
import { GapEngine } from "./match.gap";
import { ResumeJobMatchResult, MATCH_ENGINE_VERSION } from "./match.types";

export class MatchingIntelligenceService {
  private static instance: MatchingIntelligenceService;

  public static getInstance(): MatchingIntelligenceService {
    if (!MatchingIntelligenceService.instance) {
      MatchingIntelligenceService.instance = new MatchingIntelligenceService();
    }
    return MatchingIntelligenceService.instance;
  }

  /**
   * Deterministically computes candidate resume alignment against target role and optional JD requirements.
   */
  public computeMatch(
    candidateProfile: ResumeSkillProfile,
    roleBenchmark: RoleProfile,
    jobProfile?: JobRequirementProfile | null,
    extractedData?: any
  ): ResumeJobMatchResult {
    // 1. Merge Requirements from Role Benchmark and optional JD
    const merged = jobIntelligenceService.mergeRequirements(roleBenchmark, jobProfile);
    const allSkillRequirements = [
      ...merged.mergedRequiredSkills,
      ...merged.mergedPreferredSkills,
    ];

    // 2. Perform Deterministic Requirement Matching
    const skillMatches = SkillMatcher.matchSkills(candidateProfile, allSkillRequirements);

    const experienceRequirements = [
      ...(roleBenchmark.experienceRequirements || []),
      ...(jobProfile?.experienceRequirements || []),
    ];
    const experienceMatches = ExperienceMatcher.matchExperience(extractedData, experienceRequirements);

    const educationRequirements = [
      ...(roleBenchmark.education || []),
      ...(jobProfile?.educationRequirements || []),
    ];
    const educationMatches = EducationMatcher.matchEducation(extractedData, educationRequirements);

    const certificationRequirements = [
      ...(roleBenchmark.certifications || []),
      ...(jobProfile?.certificationRequirements || []),
    ];
    const certificationMatches = CertificationMatcher.matchCertifications(extractedData, certificationRequirements);

    // 3. Compute Deterministic Scores & Coverage
    const scores = ScoreEngine.computeScores(
      skillMatches,
      experienceMatches,
      educationMatches,
      certificationMatches
    );

    // 4. Extract and Prioritize Gaps
    const allMatches = [
      ...skillMatches,
      ...experienceMatches,
      ...educationMatches,
      ...certificationMatches,
    ];
    const gaps = GapEngine.computeGaps(allMatches);

    return {
      overallMatchScore: scores.overallMatchScore,
      requiredCoverage: scores.requiredCoverage,
      preferredCoverage: scores.preferredCoverage,
      experienceMatch: scores.experienceMatch,
      educationCoverage: scores.educationCoverage,
      certificationCoverage: scores.certificationCoverage,
      matchStrengthLabel: scores.matchStrengthLabel,
      skillMatches,
      experienceMatches,
      educationMatches,
      certificationMatches,
      keywordMatches: [],
      gaps,
      summary: scores.summary,
      engineVersion: MATCH_ENGINE_VERSION,
    };
  }
}

export const matchingIntelligenceService = MatchingIntelligenceService.getInstance();
