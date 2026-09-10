import {
  ResumeBullet,
  BulletClassification,
  ContentSignal,
} from "./content.types";
import {
  STRONG_ACTION_VERBS,
  WEAK_ACTION_PHRASES,
  OWNERSHIP_VERBS,
  PASSIVE_OWNERSHIP_PHRASES,
  GENERIC_FILLER_PHRASES,
  TECHNICAL_DEPTH_KEYWORDS,
} from "./content.constants";

export class ContentBulletAnalyzer {
  /**
   * Deterministically extracts normalized bullets from extracted resume data.
   */
  public static extractBullets(extractedData: any): ResumeBullet[] {
    const bullets: ResumeBullet[] = [];
    let order = 0;

    // 1. Experience Bullets
    (extractedData?.experience || []).forEach((exp: any, expIdx: number) => {
      const rawBullets = this.splitIntoBullets(exp.description || "");
      rawBullets.forEach((text, bIdx) => {
        if (text.trim().length > 0) {
          bullets.push({
            bulletId: `exp_${expIdx}_bullet_${bIdx}`,
            section: "EXPERIENCE",
            sourceText: text.trim(),
            normalizedText: this.normalizeText(text),
            order: order++,
            evidenceIds: [`experience_${expIdx}_bullet_${bIdx}`],
            roleTitle: exp.jobTitle || exp.role,
            companyName: exp.companyName || exp.company,
          });
        }
      });
    });

    // 2. Project Bullets
    (extractedData?.projects || []).forEach((proj: any, pIdx: number) => {
      const projText = proj.description || "";
      const rawBullets = this.splitIntoBullets(projText);
      if (rawBullets.length === 0 && proj.title) {
        bullets.push({
          bulletId: `proj_${pIdx}_bullet_0`,
          section: "PROJECTS",
          sourceText: proj.title,
          normalizedText: this.normalizeText(proj.title),
          order: order++,
          evidenceIds: [`project_${pIdx}`],
        });
      } else {
        rawBullets.forEach((text, bIdx) => {
          if (text.trim().length > 0) {
            bullets.push({
              bulletId: `proj_${pIdx}_bullet_${bIdx}`,
              section: "PROJECTS",
              sourceText: text.trim(),
              normalizedText: this.normalizeText(text),
              order: order++,
              evidenceIds: [`project_${pIdx}`],
            });
          }
        });
      }
    });

    // 3. Summary Bullets
    if (extractedData?.summary && typeof extractedData.summary === "string") {
      const sentences = extractedData.summary
        .split(/(?<=[.!?])\s+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 5);

      sentences.forEach((sent: string, sIdx: number) => {
        bullets.push({
          bulletId: `summary_bullet_${sIdx}`,
          section: "SUMMARY",
          sourceText: sent,
          normalizedText: this.normalizeText(sent),
          order: order++,
          evidenceIds: [`summary_0`],
        });
      });
    }

    return bullets;
  }

  /**
   * Evaluates action opening and ownership of a single bullet.
   */
  public static analyzeActionAndOwnership(text: string): {
    actionScore: number;
    ownershipScore: number;
    firstWord: string;
    isWeakAction: boolean;
    isOwnership: boolean;
    signals: ContentSignal[];
  } {
    const textLower = text.toLowerCase().trim();
    const words = textLower.split(/\s+/);
    const firstWord = words[0]?.replace(/[^a-z]/g, "") || "";
    const firstTwoWords = `${firstWord} ${words[1]?.replace(/[^a-z]/g, "") || ""}`.trim();
    const firstThreeWords = `${firstTwoWords} ${words[2]?.replace(/[^a-z]/g, "") || ""}`.trim();

    const signals: ContentSignal[] = [];

    // Check for weak phrases
    const isWeakAction = WEAK_ACTION_PHRASES.some(
      (phrase) =>
        textLower.startsWith(phrase) ||
        firstTwoWords === phrase ||
        firstThreeWords === phrase
    );

    let actionScore = 60;
    if (STRONG_ACTION_VERBS.includes(firstWord)) {
      actionScore = 95;
    } else if (isWeakAction) {
      actionScore = 30;
      signals.push({
        signalId: `sig_weak_action_${Math.random().toString(36).substring(2, 7)}`,
        type: "WEAK_ACTION",
        severity: "MEDIUM",
        evidenceIds: [],
        explanationCode: "WEAK_ACTION_VERB",
        detail: `Bullet begins with passive phrasing: "${firstThreeWords}"`,
      });
    } else if (STRONG_ACTION_VERBS.some((v) => textLower.includes(v))) {
      actionScore = 75;
    }

    // Check ownership
    let isOwnership = false;
    let ownershipScore = 50;

    if (OWNERSHIP_VERBS.includes(firstWord)) {
      isOwnership = true;
      ownershipScore = 95;
    } else if (OWNERSHIP_VERBS.some((v) => textLower.includes(` ${v} `) || textLower.startsWith(`${v} `))) {
      isOwnership = true;
      ownershipScore = 80;
    } else if (PASSIVE_OWNERSHIP_PHRASES.some((p) => textLower.includes(p))) {
      ownershipScore = 35;
    }

    return {
      actionScore,
      ownershipScore,
      firstWord,
      isWeakAction,
      isOwnership,
      signals,
    };
  }

  /**
   * Evaluates technical depth based on architecture, tooling, and concrete technical concepts.
   */
  public static analyzeTechnicalDepth(text: string): {
    technicalDepthScore: number;
    matchedKeywords: string[];
  } {
    const textLower = text.toLowerCase();
    const matchedKeywords: string[] = [];

    for (const kw of TECHNICAL_DEPTH_KEYWORDS) {
      const regex = new RegExp(`\\b${kw.replace(".", "\\.")}\\b`, "i");
      if (regex.test(textLower)) {
        matchedKeywords.push(kw);
      }
    }

    let technicalDepthScore = 40;
    if (matchedKeywords.length >= 4) {
      technicalDepthScore = 95;
    } else if (matchedKeywords.length >= 2) {
      technicalDepthScore = 80;
    } else if (matchedKeywords.length === 1) {
      technicalDepthScore = 65;
    }

    return { technicalDepthScore, matchedKeywords };
  }

  /**
   * Evaluates bullet specificity and detects generic/vague language.
   */
  public static analyzeSpecificity(text: string): {
    specificityScore: number;
    genericPhrases: string[];
    signals: ContentSignal[];
  } {
    const textLower = text.toLowerCase();
    const words = text.trim().split(/\s+/);
    const signals: ContentSignal[] = [];
    const genericPhrases: string[] = [];

    for (const phrase of GENERIC_FILLER_PHRASES) {
      if (textLower.includes(phrase)) {
        genericPhrases.push(phrase);
      }
    }

    if (genericPhrases.length > 0) {
      signals.push({
        signalId: `sig_generic_${Math.random().toString(36).substring(2, 7)}`,
        type: "GENERIC_LANGUAGE",
        severity: "LOW",
        evidenceIds: [],
        explanationCode: "GENERIC_FILLER_DETECTED",
        detail: `Contains vague/filler phrasing: ${genericPhrases.join(", ")}`,
      });
    }

    // Length signals
    if (words.length < 6) {
      signals.push({
        signalId: `sig_short_${Math.random().toString(36).substring(2, 7)}`,
        type: "SHORT_BULLET",
        severity: "MEDIUM",
        evidenceIds: [],
        explanationCode: "BULLET_TOO_SHORT",
        detail: "Bullet is very short (< 6 words) and lacks context or detail.",
      });
    } else if (words.length > 35) {
      signals.push({
        signalId: `sig_long_${Math.random().toString(36).substring(2, 7)}`,
        type: "LONG_BULLET",
        severity: "LOW",
        evidenceIds: [],
        explanationCode: "BULLET_TOO_LONG",
        detail: "Bullet exceeds 35 words; consider splitting or tightening focus.",
      });
    }

    // Compute specificity score
    let specificityScore = 50;
    if (words.length >= 10 && words.length <= 30) {
      specificityScore += 25;
    } else if (words.length >= 6) {
      specificityScore += 15;
    }

    if (genericPhrases.length > 0) {
      specificityScore -= genericPhrases.length * 15;
    }

    specificityScore = Math.max(10, Math.min(100, specificityScore));

    return { specificityScore, genericPhrases, signals };
  }

  /**
   * Evaluates repetition across all bullets (e.g. 3+ bullets starting with the same verb).
   */
  public static detectCrossBulletRepetition(bullets: ResumeBullet[]): ContentSignal[] {
    const signals: ContentSignal[] = [];
    const verbCounts = new Map<string, string[]>();

    bullets.forEach((b) => {
      const firstWord = b.sourceText.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
      if (firstWord && firstWord.length > 2) {
        const list = verbCounts.get(firstWord) || [];
        list.push(b.bulletId);
        verbCounts.set(firstWord, list);
      }
    });

    verbCounts.forEach((bulletIds, verb) => {
      if (bulletIds.length >= 3 && STRONG_ACTION_VERBS.includes(verb)) {
        signals.push({
          signalId: `sig_rep_${verb}`,
          type: "REPETITION",
          severity: "LOW",
          evidenceIds: bulletIds,
          explanationCode: "REPEATED_ACTION_VERB",
          detail: `Action verb "${verb}" is repeated ${bulletIds.length} times across resume bullets.`,
        });
      }
    });

    return signals;
  }

  /**
   * Detects duplicate achievements between different bullets (e.g. experience vs project).
   */
  public static detectDuplicates(bullets: ResumeBullet[]): ContentSignal[] {
    const signals: ContentSignal[] = [];

    for (let i = 0; i < bullets.length; i++) {
      for (let j = i + 1; j < bullets.length; j++) {
        const b1 = bullets[i];
        const b2 = bullets[j];

        if (b1.normalizedText.length > 20 && b1.normalizedText === b2.normalizedText) {
          signals.push({
            signalId: `sig_dup_${b1.bulletId}_${b2.bulletId}`,
            type: "POSSIBLE_DUPLICATE",
            severity: "HIGH",
            evidenceIds: [b1.bulletId, b2.bulletId],
            explanationCode: "EXACT_DUPLICATE_BULLET",
            detail: "Identical bullet text repeated across sections.",
          });
        }
      }
    }

    return signals;
  }

  /**
   * Helper to split text into distinct bullet lines.
   */
  private static splitIntoBullets(text: string): string[] {
    if (!text) return [];
    return text
      .split(/\r?\n|[•*–—]\s+/)
      .map((s) => s.replace(/^[•*–—\-\d.]+\s*/, "").trim())
      .filter((s) => s.length > 0);
  }

  /**
   * Normalizes text for comparison.
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}
