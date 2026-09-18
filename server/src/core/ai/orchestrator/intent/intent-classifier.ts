import { AIIntent, IntentClassificationResult } from "./intent-types";
import {
  INTENT_RULES,
  normalizeTargetRole,
  extractTargetRoleFromMessage,
} from "./intent-rules";

export class IntentClassifier {
  /**
   * Deterministically classifies the candidate's query into one of 10 supported AIIntent variants.
   * Emits matchedRule and confidence without fake LLM-style reasoning traces.
   */
  public static classify(
    message: string,
    explicitTargetRole?: string
  ): IntentClassificationResult {
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return {
        intent: "UNKNOWN",
        confidence: 0,
        matchedRule: "RULE_EMPTY_MESSAGE",
      };
    }

    const cleanMessage = message.trim();

    // 1. Resolve target role if explicitly provided or extractable
    const normalizedExplicit = normalizeTargetRole(explicitTargetRole);
    const extractedRole = extractTargetRoleFromMessage(cleanMessage);
    const detectedRole = normalizedExplicit || extractedRole;

    // 2. Evaluate against deterministic rule-set
    for (const rule of INTENT_RULES) {
      if (rule.pattern.test(cleanMessage)) {
        return {
          intent: rule.intent,
          confidence: rule.weight,
          detectedRole,
          matchedRule: rule.id,
        };
      }
    }

    // 3. Check for general career-related words before marking UNKNOWN
    const generalCareerTerms =
      /\b(job|career|work|interview|hire|salary|role|promotion|tech|stack|resume|skills?|cv|ats|score|roadmap|plan|employability|portfolio|developer|engineer|software|code|learning|experience|guidance|advice|switch|help)\b/i;
    if (generalCareerTerms.test(cleanMessage)) {
      return {
        intent: "GENERAL_CAREER_GUIDANCE",
        confidence: 0.6,
        detectedRole,
        matchedRule: "RULE_BROAD_CAREER_KEYWORD",
      };
    }

    // 4. Default to UNKNOWN (out of scope)
    return {
      intent: "UNKNOWN",
      confidence: 0.2,
      detectedRole,
      matchedRule: "RULE_NO_MATCH_UNKNOWN",
    };
  }
}
