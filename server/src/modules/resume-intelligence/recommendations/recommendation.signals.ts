import {
  RecommendationSignal,
} from "./recommendation.types";

export class RecommendationSignalCollector {
  /**
   * Collects normalized raw signals across ATS, Skills, Role/JD Matching, and Content.
   */
  public static collectSignals(
    atsResult: any,
    skillProfile: any,
    matchResult: any,
    contentResult: any,
    targetRole = "Full-Stack Engineer"
  ): RecommendationSignal[] {
    const signals: RecommendationSignal[] = [];

    // 1. MATCH INTELLIGENCE SIGNALS (Phase 4)
    if (matchResult?.skillBreakdown) {
      // Required skills NOT_DETECTED
      (matchResult.skillBreakdown.missing || []).forEach((missing: any) => {
        const isRequired = missing.requirementType === "REQUIRED";
        signals.push({
          id: `sig_match_missing_${missing.canonicalName.toLowerCase().replace(/\s+/g, "_")}`,
          groupKey: `skill:${missing.canonicalName.toLowerCase()}`,
          category: isRequired ? "MATCH" : "SKILL",
          type: "MISSING_SKILL_REQUIREMENT",
          severity: isRequired ? 0.95 : 0.65,
          impact: isRequired ? "VERY_HIGH" : "MEDIUM",
          relevance: isRequired ? 1.0 : 0.70,
          actionability: "REQUIRES_NEW_EVIDENCE",
          confidence: 0.95,
          sourceIds: [`req_${missing.canonicalName}`],
          evidenceIds: [],
          requirementIds: [missing.canonicalName],
          skillIds: [missing.skillId || missing.canonicalName],
          title: `Address ${missing.canonicalName} requirement`,
          problem: `${missing.canonicalName} is not currently detected in your resume, but is expected for ${targetRole}.`,
          whyItMatters: isRequired
            ? `Required skills carry high weight in recruiter and ATS filtering.`
            : `Preferred skills strengthen role competitiveness.`,
          suggestedAction: `If you have genuine ${missing.canonicalName} experience, consider adding a concrete project or work example.`,
        });
      });

      // Related / Partial Skills
      (matchResult.skillBreakdown.related || []).forEach((rel: any) => {
        signals.push({
          id: `sig_match_related_${rel.candidateSkill.toLowerCase().replace(/\s+/g, "_")}`,
          groupKey: `skill:${rel.targetRequirement.toLowerCase()}`,
          category: "MATCH",
          type: "RELATED_SKILL_SUPPORT",
          severity: 0.60,
          impact: "HIGH",
          relevance: 0.85,
          actionability: "STRENGTHEN_EVIDENCE",
          confidence: 0.90,
          sourceIds: [`req_${rel.targetRequirement}`],
          evidenceIds: [],
          requirementIds: [rel.targetRequirement],
          skillIds: [rel.candidateSkill],
          title: `Explicitly connect ${rel.candidateSkill} to ${rel.targetRequirement}`,
          problem: `You demonstrated ${rel.candidateSkill}, which is related to ${rel.targetRequirement}, but the exact target skill wasn't explicitly named.`,
          whyItMatters: `Explicit naming ensures automated keyword screeners match the exact required terminology.`,
          suggestedAction: `If applicable, reference your ${rel.targetRequirement} experience alongside ${rel.candidateSkill}.`,
        });
      });
    }

    // Experience gap signal
    if (matchResult?.experienceBreakdown && !matchResult.experienceBreakdown.isMatch) {
      signals.push({
        id: "sig_match_exp_gap",
        groupKey: "section:experience:years",
        category: "EXPERIENCE",
        type: "EXPERIENCE_DURATION_GAP",
        severity: 0.75,
        impact: "HIGH",
        relevance: 0.90,
        actionability: "STRENGTHEN_EVIDENCE",
        confidence: 0.85,
        sourceIds: ["exp_matcher"],
        evidenceIds: [],
        title: "Emphasize depth and scope in experience entries",
        problem: `Total detected experience is ${matchResult.experienceBreakdown.candidateYears} years, while target benchmark expects ${matchResult.experienceBreakdown.requiredYears}+ years.`,
        whyItMatters: "Recruiters look for high-ownership contributions when candidate duration is near the threshold.",
        suggestedAction: "Highlight leadership, complex technical architecture, and ownership in your primary roles.",
      });
    }

    // 2. CONTENT INTELLIGENCE SIGNALS (Phase 5)
    if (contentResult) {
      // Measurable impact signal
      if (contentResult.impactSummary?.responsibilityFocusedBullets > 0) {
        const count = contentResult.impactSummary.responsibilityFocusedBullets;
        signals.push({
          id: "sig_content_resp_heavy",
          groupKey: "section:experience:impact",
          category: "IMPACT",
          type: "RESPONSIBILITY_HEAVY_BULLETS",
          severity: 0.80,
          impact: "HIGH",
          relevance: 0.85,
          actionability: "FIX_NOW",
          confidence: 0.90,
          sourceIds: ["content_impact_engine"],
          evidenceIds: contentResult.bullets
            ?.filter((b: any) => b.classification.includes("RESPONSIBILITY"))
            .map((b: any) => b.bulletId) || [],
          section: "EXPERIENCE",
          title: "Elevate responsibility bullets with quantifiable outcomes",
          problem: `${count} experience bullet${count > 1 ? "s" : ""} focus on routine responsibilities rather than measurable achievements.`,
          whyItMatters: "Recruiters prioritize quantifiable business and technical outcomes over generic task descriptions.",
          suggestedAction: "Add concrete results such as latency reductions, user scale, efficiency gains, or cost savings where available.",
        });
      }

      // Weak action verbs signal
      const weakActionBullets = contentResult.bullets?.filter((b: any) =>
        b.signals?.some((s: any) => s.type === "WEAK_ACTION")
      ) || [];
      if (weakActionBullets.length > 0) {
        signals.push({
          id: "sig_content_weak_actions",
          groupKey: "section:experience:ownership",
          category: "CONTENT",
          type: "WEAK_ACTION_OPENINGS",
          severity: 0.65,
          impact: "MEDIUM",
          relevance: 0.75,
          actionability: "FIX_NOW",
          confidence: 0.95,
          sourceIds: ["content_bullet_analyzer"],
          evidenceIds: weakActionBullets.map((b: any) => b.bulletId),
          section: "EXPERIENCE",
          title: "Replace passive verbs with active ownership verbs",
          problem: `Several bullets open with passive phrasing such as "worked on" or "helped with".`,
          whyItMatters: "Strong power verbs (e.g. 'Architected', 'Engineered', 'Optimized') demonstrate proactive ownership.",
          suggestedAction: "Begin bullet points with decisive action verbs showing what you personally designed or delivered.",
        });
      }

      // Repetition signal (Style / Low impact)
      const repetitionSignals = contentResult.signals?.filter((s: any) => s.type === "REPETITION") || [];
      if (repetitionSignals.length > 0) {
        signals.push({
          id: "sig_content_repetition",
          groupKey: "style:repetition",
          category: "STRUCTURE",
          type: "REPETITIVE_ACTION_VERBS",
          severity: 0.35,
          impact: "LOW",
          relevance: 0.40,
          actionability: "INFORMATIONAL",
          confidence: 0.90,
          sourceIds: repetitionSignals.map((s: any) => s.signalId),
          evidenceIds: repetitionSignals.flatMap((s: any) => s.evidenceIds),
          title: "Vary opening action verbs for writing diversity",
          problem: "The same action verb is repeated consecutively across multiple bullet points.",
          whyItMatters: "A varied technical vocabulary keeps recruiters engaged across long resume scans.",
          suggestedAction: "Use synonymous power verbs (e.g., 'Engineered', 'Constructed', 'Streamlined') for variety.",
        });
      }

      // Duplicate achievement signal
      const duplicateSignals = contentResult.signals?.filter((s: any) => s.type === "POSSIBLE_DUPLICATE") || [];
      if (duplicateSignals.length > 0) {
        signals.push({
          id: "sig_content_duplicates",
          groupKey: "section:content:duplicates",
          category: "CONTENT",
          type: "DUPLICATE_BULLET_CONTENT",
          severity: 0.85,
          impact: "HIGH",
          relevance: 0.80,
          actionability: "FIX_NOW",
          confidence: 0.95,
          sourceIds: duplicateSignals.map((s: any) => s.signalId),
          evidenceIds: duplicateSignals.flatMap((s: any) => s.evidenceIds),
          title: "Deduplicate identical bullet accomplishments",
          problem: "Identical bullet text was found repeated across experience and project sections.",
          whyItMatters: "Duplicate entries waste valuable 1-page resume real estate and appear uncurated.",
          suggestedAction: "Ensure each role or project highlights distinct achievements and technical responsibilities.",
        });
      }

      // Matched skills with weak evidence from Phase 5 content opportunities
      (contentResult.opportunities || []).forEach((opp: any) => {
        if (opp.type === "STRENGTHEN_TECHNICAL_DEPTH" && opp.requirementIds?.length > 0) {
          opp.requirementIds.forEach((reqName: string) => {
            signals.push({
              id: `sig_content_weak_req_${reqName.toLowerCase().replace(/\s+/g, "_")}`,
              groupKey: `skill:${reqName.toLowerCase()}`,
              category: "EVIDENCE",
              type: "WEAK_SKILL_EVIDENCE",
              severity: 0.70,
              impact: "HIGH",
              relevance: 0.85,
              actionability: "STRENGTHEN_EVIDENCE",
              confidence: 0.90,
              sourceIds: ["content_opp_" + opp.opportunityId],
              evidenceIds: opp.bulletIds || [],
              requirementIds: [reqName],
              skillIds: [reqName],
              title: `Strengthen technical evidence for ${reqName}`,
              problem: `Your resume matches ${reqName}, but the supporting bullet points lack technical depth or concrete outcomes.`,
              whyItMatters: `High-value technical skills need clear ownership and outcome evidence to convince hiring managers.`,
              suggestedAction: `Elaborate on how you utilized ${reqName} in your experience bullets with architectural or outcome details.`,
            });
          });
        }
      });
    }

    // 3. ATS & FORMATTING SIGNALS
    if (atsResult && typeof atsResult.overallScore === "number" && atsResult.overallScore < 70) {
      signals.push({
        id: "sig_ats_health_score",
        groupKey: "ats:overall_health",
        category: "ATS",
        type: "LOW_ATS_COMPATIBILITY",
        severity: 0.85,
        impact: "HIGH",
        relevance: 0.80,
        actionability: "FIX_NOW",
        confidence: 0.95,
        sourceIds: ["ats_engine"],
        evidenceIds: [],
        title: "Improve overall ATS readability and section structure",
        problem: "Resume formatting or keyword density scored below the 70% threshold.",
        whyItMatters: "ATS parsers may fail to extract key skills and dates correctly with non-standard formatting.",
        suggestedAction: "Ensure standard section headers (Experience, Skills, Education) and single-column formatting.",
      });
    }

    return signals;
  }
}
