import crypto from "crypto";
import {
  ResumeAIContext,
  ResumeEvidence,
  AI_ENGINE_VERSION,
  ATS_ENGINE_VERSION,
  SKILL_ENGINE_VERSION,
  ROLE_ENGINE_VERSION,
  JD_ENGINE_VERSION,
  MATCH_ENGINE_VERSION,
  CONTENT_ENGINE_VERSION,
  RECOMMENDATION_ENGINE_VERSION,
  OPTIMIZATION_ENGINE_VERSION,
} from "./ai.types";
import {
  skillIntelligenceService,
  roleIntelligenceService,
  jobIntelligenceService,
  matchingIntelligenceService,
  contentIntelligenceService,
  recommendationIntelligenceService,
} from "@/modules/resume-intelligence";

export class AIContextBuilder {
  /**
   * Builds normalized, evidence-tagged AI context from parsed resume data, role benchmark, and optional JD intelligence.
   */
  public static buildContext(
    extractedData: any,
    rawText: string,
    diagnostics: any,
    targetRole = "Full-Stack Engineer",
    jobDescription?: string,
    resumeId?: string,
    version = 1
  ): ResumeAIContext {
    const evidence: ResumeEvidence[] = [];

    // 1. Build deterministic skill profile & gaps
    const skillProfile = skillIntelligenceService.buildProfile(extractedData, rawText, resumeId);
    const gaps = skillIntelligenceService.computeGaps(skillProfile, targetRole);

    // 2. Build role benchmark & optional JD intelligence
    const roleBenchmark = roleIntelligenceService.getRoleBenchmark(targetRole);
    const jobProfile = jobDescription ? jobIntelligenceService.parseJobDescription(jobDescription) : null;

    // 3. Compute Phase 4 deterministic match intelligence
    const matchResult = matchingIntelligenceService.computeMatch(
      skillProfile,
      roleBenchmark,
      jobProfile,
      extractedData
    );

    // 4. Compute Phase 5 deterministic impact + content intelligence
    const contentResult = contentIntelligenceService.analyzeContent(
      extractedData,
      rawText,
      targetRole,
      matchResult
    );

    // 5. Compute Phase 6 deterministic AI recommendation orchestration
    const recommendationResult = recommendationIntelligenceService.generateRecommendations({
      atsResult: diagnostics,
      skillProfile,
      roleProfile: roleBenchmark,
      jobRequirements: jobProfile,
      matchResult,
      contentResult,
      rawText,
      targetRole,
    });

    // 1. Summary Evidence
    if (extractedData?.summary) {
      evidence.push({
        id: "summary_0",
        section: "summary",
        text: extractedData.summary,
        detectedSkills: this.extractMatchedSkills(extractedData.summary, extractedData.skills),
        confidence: 0.95,
      });
    }

    // 2. Experience Bullets Evidence
    (extractedData?.experience || []).forEach((exp: any, expIdx: number) => {
      const bullets = exp.description
        ? exp.description.split("\n").filter((b: string) => b.trim().length > 0)
        : [];

      bullets.forEach((bullet: string, bIdx: number) => {
        evidence.push({
          id: `experience_${expIdx}_bullet_${bIdx}`,
          section: "experience",
          text: bullet.trim(),
          sourceIndex: bIdx,
          detectedSkills: this.extractMatchedSkills(bullet, extractedData.skills),
          detectedMetrics: this.extractMetrics(bullet),
          confidence: 0.95,
        });
      });
    });

    // 3. Projects Evidence
    (extractedData?.projects || []).forEach((proj: any, pIdx: number) => {
      evidence.push({
        id: `project_${pIdx}`,
        section: "projects",
        text: `${proj.title}: ${proj.description || ""}`,
        sourceIndex: pIdx,
        detectedSkills: proj.technologies || [],
        detectedMetrics: this.extractMetrics(proj.description || ""),
        confidence: 0.90,
      });
    });

    // 4. Skills Evidence
    (extractedData?.skills || []).forEach((sk: any, sIdx: number) => {
      const skillName = typeof sk === "string" ? sk : sk.name;
      if (skillName) {
        evidence.push({
          id: `skill_${sIdx}`,
          section: "skills",
          text: skillName,
          detectedSkills: [skillName],
          confidence: 0.99,
        });
      }
    });

    const expContext = (extractedData?.experience || []).map((e: any) => ({
      company: e.companyName || "Organization",
      role: e.jobTitle || "Engineer",
      startDate: e.startDate,
      endDate: e.endDate,
      bullets: e.description ? e.description.split("\n").filter((b: string) => b.trim().length > 0) : [],
    }));

    const projContext = (extractedData?.projects || []).map((p: any) => ({
      title: p.title || "Project",
      description: p.description,
      technologies: p.technologies || [],
      link: p.link,
    }));

    const eduContext = (extractedData?.education || []).map((ed: any) => ({
      institution: ed.institution || "University",
      degree: ed.degree,
      fieldOfStudy: ed.fieldOfStudy,
      graduationYear: ed.endYear,
    }));

    return {
      resumeId,
      version,
      resume: {
        candidate: {
          fullName: extractedData?.personalInfo?.fullName || extractedData?.candidateName,
          email: extractedData?.personalInfo?.email || extractedData?.email,
          phone: extractedData?.personalInfo?.phone || extractedData?.phone,
          location: extractedData?.personalInfo?.location || extractedData?.location,
        },
        summary: extractedData?.summary,
        skills: (extractedData?.skills || []).map((s: any) => ({
          name: typeof s === "string" ? s : s.name,
          category: s.category || "General",
        })),
        experience: expContext,
        projects: projContext,
        education: eduContext,
        certifications: (extractedData?.certifications || []).map((c: any) => ({
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate,
        })),
      },
      evidence,
      targetRole,
      roleProfile: {
        roleId: roleBenchmark.roleId,
        title: roleBenchmark.title,
        seniority: roleBenchmark.seniority,
        requiredSkills: roleBenchmark.requiredSkills.map((r) => ({
          skillId: r.skillId,
          canonicalName: r.canonicalName,
          importance: r.importance,
        })),
        preferredSkills: roleBenchmark.preferredSkills.map((p) => ({
          skillId: p.skillId,
          canonicalName: p.canonicalName,
          importance: p.importance,
        })),
        keywords: roleBenchmark.keywords,
      },
      jobRequirements: jobProfile
        ? {
            jobId: jobProfile.jobId,
            title: jobProfile.title,
            seniority: jobProfile.seniority,
            requiredSkills: jobProfile.requiredSkills.map((r) => ({
              skillId: r.skillId,
              canonicalName: r.canonicalName,
              requirementType: r.requirementType,
            })),
            preferredSkills: jobProfile.preferredSkills.map((p) => ({
              skillId: p.skillId,
              canonicalName: p.canonicalName,
              requirementType: p.requirementType,
            })),
            domains: jobProfile.domains,
            keywords: jobProfile.keywords,
          }
        : undefined,
      matchResult: {
        overallMatchScore: matchResult.overallMatchScore,
        requiredCoverage: matchResult.requiredCoverage,
        preferredCoverage: matchResult.preferredCoverage,
        experienceMatch: matchResult.experienceMatch,
        matchStrengthLabel: matchResult.matchStrengthLabel,
        gaps: matchResult.gaps.slice(0, 5).map((g) => ({
          skillName: g.skillName,
          priority: g.priority,
          status: g.status,
        })),
      },
      contentResult: {
        contentScore: contentResult.contentScore,
        label: contentResult.label,
        sections: {
          experience: {
            score: contentResult.sections.experience.score,
            bulletCount: contentResult.sections.experience.bulletCount,
            strongBulletsCount: contentResult.sections.experience.strongBulletsCount,
            weakBulletsCount: contentResult.sections.experience.weakBulletsCount,
          },
          projects: {
            score: contentResult.sections.projects.score,
            bulletCount: contentResult.sections.projects.bulletCount,
            strongBulletsCount: contentResult.sections.projects.strongBulletsCount,
            weakBulletsCount: contentResult.sections.projects.weakBulletsCount,
          },
          summary: {
            score: contentResult.sections.summary.score,
            bulletCount: contentResult.sections.summary.bulletCount,
            strongBulletsCount: contentResult.sections.summary.strongBulletsCount,
            weakBulletsCount: contentResult.sections.summary.weakBulletsCount,
          },
        },
        impactSummary: contentResult.impactSummary,
        opportunities: contentResult.opportunities.map((o) => ({
          type: o.type,
          bulletIds: o.bulletIds,
          requirementIds: o.requirementIds,
        })),
      },
      recommendationResult: {
        engineVersion: recommendationResult.engineVersion,
        summary: recommendationResult.summary,
        topAction: recommendationResult.topAction,
        recommendations: recommendationResult.recommendations.map((r) => ({
          id: r.id,
          category: r.category,
          title: r.title,
          summary: r.summary,
          priority: r.priority,
          impact: r.impact,
          actionability: r.actionability,
          suggestedAction: r.suggestedAction,
        })),
      },
      skillsProfile: {
        detected: skillProfile.skills.map((s) => ({
          skillId: s.skillId,
          canonicalName: s.canonicalName,
          displayName: s.displayName,
          category: s.category,
          frequency: s.frequency,
          confidence: s.confidence,
          evidenceIds: s.evidenceIds,
        })),
        categories: skillProfile.categorySummary.map((c) => ({
          category: c.category,
          count: c.count,
          skills: c.skills,
        })),
        matchedTargetSkills: gaps.matchedGaps.map((m) => m.canonicalName),
        notDetectedTargetSkills: gaps.notDetectedGaps.map((n) => n.canonicalName),
      },
      diagnostics: {
        atsScore: diagnostics?.atsScore || diagnostics?.overallScore || 80,
        keywordMatchScore: diagnostics?.breakdown?.keywordMatch || 75,
        impactScore: diagnostics?.breakdown?.impact || 70,
        structureScore: diagnostics?.breakdown?.structure || 90,
        brevityScore: diagnostics?.breakdown?.brevity || 85,
        readabilityScore: diagnostics?.breakdown?.readability || 90,
        missingSkills: (diagnostics?.missingKeywords || []).map((m: any) => m.keyword || m.skill || m),
        detectedMetrics: evidence.flatMap((e) => e.detectedMetrics || []),
        weakAreas: [],
      },
      jobDescription: jobDescription ? { rawText: jobDescription } : undefined,
    };
  }

  /**
   * Deterministic input hash for caching AI analysis responses.
   * Accounts for AI, ATS, SKILL, ROLE, JD, MATCH, CONTENT, and RECOMMENDATION engine versions + JD text hash.
   */
  public static computeInputHash(
    resumeId: string,
    version: number,
    targetRole: string,
    jobDescription = ""
  ): string {
    const jdHash = jobDescription ? crypto.createHash("sha256").update(jobDescription.trim()).digest("hex") : "none";
    const raw = `${resumeId}:${version}:${targetRole}:${jdHash}:${AI_ENGINE_VERSION}:${ATS_ENGINE_VERSION}:${SKILL_ENGINE_VERSION}:${ROLE_ENGINE_VERSION}:${JD_ENGINE_VERSION}:${MATCH_ENGINE_VERSION}:${CONTENT_ENGINE_VERSION}:${RECOMMENDATION_ENGINE_VERSION}:${OPTIMIZATION_ENGINE_VERSION}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  private static extractMatchedSkills(text: string, skills: any[]): string[] {
    const matched: string[] = [];
    const textLower = (text || "").toLowerCase();

    (skills || []).forEach((sk) => {
      const name = typeof sk === "string" ? sk : sk.name;
      if (name && textLower.includes(name.toLowerCase())) {
        matched.push(name);
      }
    });

    return matched;
  }

  private static extractMetrics(text: string): string[] {
    const metrics: string[] = [];
    const patterns = [
      /\b\d+%/g,
      /\$\d+[\d,.]*[kmb]?/gi,
      /\b\d+x\b/gi,
      /\b\d+\+\s*(users|clients|requests|endpoints|services|queries|ms|seconds|minutes|hours)/gi,
      /reduced\s+\w+\s+by\s+\d+%/gi,
      /improved\s+\w+\s+by\s+\d+%/gi,
    ];

    patterns.forEach((p) => {
      const found = text.match(p);
      if (found) {
        metrics.push(...found);
      }
    });

    return metrics;
  }
}
