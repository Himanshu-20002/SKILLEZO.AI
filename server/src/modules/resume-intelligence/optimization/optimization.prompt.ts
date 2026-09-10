import { OptimizationTarget } from "./optimization.types";

export interface BuildUserPromptOptions {
  originalText: string;
  recommendation?: any;
  relevantSkills?: string[];
  verifiedMetrics?: string[];
  targetRole?: string;
}

export class OptimizationPromptBuilder {
  /**
   * Builds the system prompt enforcing strict anti-hallucination rules.
   */
  public static buildSystemPrompt(targetRole = "Full-Stack Engineer"): string {
    return `You are a strict, factual Resume Optimization Engine for ${targetRole}.

CRITICAL ANTI-HALLUCINATION RULES:
1. You are rewriting ONE existing bullet point.
2. Use ONLY facts, tools, and outcomes supported by the candidate's existing background.
3. DO NOT invent new metrics (%, $, scale numbers, latency ms, team sizes). If the original text does not have a metric, do not add one.
4. DO NOT invent new technologies or skills not in the verified skills list.
5. DO NOT escalate ownership (e.g. do not turn "worked on" or "assisted with" into "led", "architected", or "managed").
6. Focus on clarity, strong power verbs (e.g. 'Developed', 'Engineered', 'Optimized'), and crisp technical framing.
7. Return ONLY valid JSON matching the required schema.`;
  }

  /**
   * Builds the user prompt for a specific optimization target.
   */
  public static buildUserPrompt(options: BuildUserPromptOptions): string {
    const recommendationId = options.recommendation?.id || "rec_general";
    const skillList = (options.relevantSkills || []).join(", ") || "None specified";
    const metricList = (options.verifiedMetrics || []).join(", ") || "None";

    return `TARGET INFORMATION:
Original Text: "${options.originalText}"
Recommendation Context: ${options.recommendation?.title || "Improve bullet impact"}

CANDIDATE VERIFIED SKILLS:
${skillList}

CANDIDATE EXISTING METRICS IN EVIDENCE:
${metricList}

Return ONLY a JSON object matching this schema:
{
  "proposalId": "prop_01",
  "recommendationId": "${recommendationId}",
  "originalText": "${options.originalText.replace(/"/g, '\\"')}",
  "optimizedText": "Improved professional wording preserving exact facts",
  "changes": [
    { "type": "CLARITY", "description": "Replaced passive opening with active power verb" }
  ],
  "preservedEvidenceIds": [],
  "addedClaims": [],
  "removedClaims": [],
  "confidence": 0.95
}`;
  }

  /**
   * Builds a combined prompt for single-turn engines.
   */
  public static buildPrompt(
    target: OptimizationTarget,
    candidateSkills: string[] = [],
    verifiedMetrics: string[] = [],
    targetRole = "Full-Stack Engineer"
  ): string {
    return `SYSTEM: ${this.buildSystemPrompt(targetRole)}\n\nUSER: ${this.buildUserPrompt({
      originalText: target.sourceText,
      recommendation: { id: target.recommendationId, title: target.type },
      relevantSkills: candidateSkills,
      verifiedMetrics,
      targetRole,
    })}`;
  }
}
