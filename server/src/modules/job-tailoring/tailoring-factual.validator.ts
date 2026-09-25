export interface CandidateVerificationContext {
  verifiedSkills: Set<string>;
  verifiedEmployers: Set<string>;
  verifiedTitles: Set<string>;
  verifiedProjectTitles: Set<string>;
  maxVerifiedYears: number;
  verifiedMetrics: Set<string>;
  hasLeadershipRole: boolean;
  verifiedDomains: Set<string>;
  fullCandidateCorpus: string; // Lowercase collapsed text of all authentic profile & resume facts
}

export interface FactualValidationResult {
  isValid: boolean;
  unsupportedClaims: string[];
  reason?: string;
}

export class TailoringFactualValidator {
  /**
   * Builds candidate verification context from ProfileModel and Master Resume facts.
   */
  public static buildVerificationContext(
    profileFacts: any,
    resumeDoc: any
  ): CandidateVerificationContext {
    const verifiedSkills = new Set<string>();
    const verifiedEmployers = new Set<string>();
    const verifiedTitles = new Set<string>();
    const verifiedProjectTitles = new Set<string>();
    const verifiedMetrics = new Set<string>();
    const verifiedDomains = new Set<string>();
    let maxVerifiedYears = 0;
    let hasLeadershipRole = false;

    const corpusParts: string[] = [];

    // 1. Profile Skills
    if (profileFacts?.skills && Array.isArray(profileFacts.skills)) {
      for (const s of profileFacts.skills) {
        const name = (typeof s === "string" ? s : s.name || s.skillName || "").trim().toLowerCase();
        if (name) {
          verifiedSkills.add(name);
          corpusParts.push(name);
        }
      }
    }

    // 2. Profile Experience
    if (profileFacts?.experience && Array.isArray(profileFacts.experience)) {
      for (const exp of profileFacts.experience) {
        const company = (exp.company || exp.companyName || "").trim().toLowerCase();
        if (company) {
          verifiedEmployers.add(company);
          corpusParts.push(company);
        }

        const title = (exp.title || exp.jobTitle || "").trim().toLowerCase();
        if (title) {
          verifiedTitles.add(title);
          corpusParts.push(title);
          if (
            title.includes("lead") ||
            title.includes("manager") ||
            title.includes("director") ||
            title.includes("head") ||
            title.includes("principal") ||
            title.includes("vp") ||
            title.includes("chief")
          ) {
            hasLeadershipRole = true;
          }
        }

        if (exp.technologies && Array.isArray(exp.technologies)) {
          for (const t of exp.technologies) {
            const tech = t.trim().toLowerCase();
            verifiedSkills.add(tech);
            corpusParts.push(tech);
          }
        }

        // Bullets / descriptions
        const bullets = exp.bullets || (exp.description ? [exp.description] : []);
        for (const b of bullets) {
          const text = (typeof b === "string" ? b : b.text || "").trim();
          if (text) {
            corpusParts.push(text.toLowerCase());
            // Extract metrics from authentic bullets
            const metrics = text.match(/\b\d+(?:\.\d+)?%|\$\d+[\d,]*|\b\d+x\b|\b\d+\+?\s*(?:users|clients|engineers|microservices|qps|rps|req\/s)\b/gi) || [];
            for (const m of metrics) verifiedMetrics.add(m.toLowerCase());
          }
        }

        // Compute experience duration
        if (exp.startDate) {
          const start = new Date(exp.startDate).getTime();
          const end = exp.endDate ? new Date(exp.endDate).getTime() : Date.now();
          if (!isNaN(start) && !isNaN(end) && end >= start) {
            const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
            maxVerifiedYears += Math.max(years, 0);
          }
        }
      }
    }

    // 3. Profile Projects
    if (profileFacts?.projects && Array.isArray(profileFacts.projects)) {
      for (const proj of profileFacts.projects) {
        const title = (proj.title || proj.name || "").trim().toLowerCase();
        if (title) {
          verifiedProjectTitles.add(title);
          corpusParts.push(title);
        }
        if (proj.technologies && Array.isArray(proj.technologies)) {
          for (const t of proj.technologies) {
            verifiedSkills.add(t.trim().toLowerCase());
            corpusParts.push(t.toLowerCase());
          }
        }
        if (proj.bullets && Array.isArray(proj.bullets)) {
          for (const b of proj.bullets) {
            const text = (typeof b === "string" ? b : b.text || "").trim();
            if (text) {
              corpusParts.push(text.toLowerCase());
              const metrics = text.match(/\b\d+(?:\.\d+)?%|\$\d+[\d,]*|\b\d+x\b/gi) || [];
              for (const m of metrics) verifiedMetrics.add(m.toLowerCase());
            }
          }
        }
      }
    }

    // 4. Master Resume Document (canonical)
    if (resumeDoc) {
      if (resumeDoc.summary?.text) corpusParts.push(resumeDoc.summary.text.toLowerCase());
      if (resumeDoc.skills && Array.isArray(resumeDoc.skills)) {
        for (const s of resumeDoc.skills) {
          const name = s.name?.toLowerCase().trim();
          if (name) {
            verifiedSkills.add(name);
            corpusParts.push(name);
          }
        }
      }
      if (resumeDoc.experience && Array.isArray(resumeDoc.experience)) {
        for (const exp of resumeDoc.experience) {
          if (exp.companyName) verifiedEmployers.add(exp.companyName.toLowerCase().trim());
          if (exp.jobTitle) verifiedTitles.add(exp.jobTitle.toLowerCase().trim());
          for (const b of exp.bullets || []) {
            if (b.text) {
              corpusParts.push(b.text.toLowerCase());
              const metrics = b.text.match(/\b\d+(?:\.\d+)?%|\$\d+[\d,]*|\b\d+x\b/gi) || [];
              for (const m of metrics) verifiedMetrics.add(m.toLowerCase());
            }
          }
        }
      }
      if (resumeDoc.projects && Array.isArray(resumeDoc.projects)) {
        for (const p of resumeDoc.projects) {
          if (p.title) verifiedProjectTitles.add(p.title.toLowerCase().trim());
          for (const t of p.technologies || []) verifiedSkills.add(t.toLowerCase().trim());
          for (const b of p.bullets || []) {
            corpusParts.push(b.toLowerCase());
            const metrics = b.match(/\b\d+(?:\.\d+)?%|\$\d+[\d,]*|\b\d+x\b/gi) || [];
            for (const m of metrics) verifiedMetrics.add(m.toLowerCase());
          }
        }
      }
    }

    const fullCandidateCorpus = corpusParts.join(" ").replace(/\s+/g, " ").trim();

    return {
      verifiedSkills,
      verifiedEmployers,
      verifiedTitles,
      verifiedProjectTitles,
      maxVerifiedYears: Math.ceil(maxVerifiedYears),
      verifiedMetrics,
      hasLeadershipRole,
      verifiedDomains,
      fullCandidateCorpus,
    };
  }

  /**
   * Validates proposed text against ALL material factual claims.
   * If any unsupported claim is found, returns isValid: false with reasons.
   */
  public static validateProposedText(
    proposedText: string,
    context: CandidateVerificationContext
  ): FactualValidationResult {
    if (!proposedText || !proposedText.trim()) {
      return { isValid: true, unsupportedClaims: [] };
    }

    const text = proposedText.trim();
    const unsupportedClaims: string[] = [];

    // 1. Metric / Number Fabrication Check
    const metricMatches = text.match(/\b\d+(?:\.\d+)?%|\$\d+[\d,]*|\b\d+x\b/gi) || [];
    for (const m of metricMatches) {
      const cleanM = m.toLowerCase();
      if (!context.verifiedMetrics.has(cleanM) && !context.fullCandidateCorpus.includes(cleanM)) {
        unsupportedClaims.push(`UNSUPPORTED_METRIC: "${m}" does not exist in candidate evidence`);
      }
    }

    // 2. Years / Duration Inflation Check
    const yearsMatches = text.match(/\b(\d+)\+?\s*(?:years?|yrs?)\b/gi) || [];
    for (const ym of yearsMatches) {
      const numMatch = ym.match(/\d+/);
      if (numMatch) {
        const claimedYears = parseInt(numMatch[0], 10);
        // Allow claimed years if context supports it (within 1 year margin of ceiling)
        if (context.maxVerifiedYears > 0 && claimedYears > context.maxVerifiedYears + 1) {
          unsupportedClaims.push(
            `DURATION_INFLATION: Claimed "${ym}" exceeds verified candidate duration of ~${context.maxVerifiedYears} years`
          );
        }
      }
    }

    // 3. Leadership & Team Size Claims
    const leadershipTeamMatches = text.match(/\b(?:led|managed|directed|supervised)\s+(?:a\s+team\s+of\s+)?(\d+)\s*(?:engineers|developers|people|reports)\b/gi) || [];
    for (const lm of leadershipTeamMatches) {
      if (!context.hasLeadershipRole || !context.fullCandidateCorpus.includes(lm.toLowerCase())) {
        unsupportedClaims.push(`UNSUPPORTED_LEADERSHIP_CLAIM: "${lm}" is not supported by career history`);
      }
    }

    // 4. Scale & Revenue Claims
    const scaleMatches = text.match(/\b(?:\$\d+[\d,]*\s*(?:m|million|b|billion)?\s*(?:arr|revenue|funding)|handling\s+\d+[\d,]*\s*(?:qps|rps|million\s+users))\b/gi) || [];
    for (const sm of scaleMatches) {
      if (!context.fullCandidateCorpus.includes(sm.toLowerCase())) {
        unsupportedClaims.push(`UNSUPPORTED_SCALE_CLAIM: "${sm}" not found in candidate facts`);
      }
    }

    const isValid = unsupportedClaims.length === 0;
    return {
      isValid,
      unsupportedClaims,
      reason: isValid ? undefined : unsupportedClaims.join("; "),
    };
  }
}
