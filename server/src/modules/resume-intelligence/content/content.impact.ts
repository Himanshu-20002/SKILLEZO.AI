import {
  MetricEvidence,
  MetricType,
  ScopeEvidence,
  ImpactLevel,
} from "./content.types";
import { OUTCOME_VERBS } from "./content.constants";

export class ContentImpactDetector {
  /**
   * Deterministically extract metrics from bullet text with source traceability.
   */
  public static extractMetrics(text: string, evidenceId: string): MetricEvidence[] {
    const metrics: MetricEvidence[] = [];
    if (!text || typeof text !== "string") return metrics;

    const seenValues = new Set<string>();

    // 1. Percentage (e.g., 42%, 35.5%, 100%)
    const pctRegex = /\b(\d+(?:\.\d+)?%)/gi;
    let match: RegExpExecArray | null;
    while ((match = pctRegex.exec(text)) !== null) {
      const raw = match[1];
      if (!seenValues.has(raw.toLowerCase())) {
        seenValues.add(raw.toLowerCase());
        metrics.push({
          metricId: `m_pct_${evidenceId}_${metrics.length}`,
          rawValue: raw,
          metricType: "PERCENTAGE",
          sourceText: text,
          evidenceId,
          confidence: this.calculateMetricConfidence(text, raw),
        });
      }
    }

    // 2. Multiplier (e.g., 3x, 2.5x, 10X)
    const multRegex = /\b(\d+(?:\.\d+)?x)\b/gi;
    while ((match = multRegex.exec(text)) !== null) {
      const raw = match[1];
      if (!seenValues.has(raw.toLowerCase())) {
        seenValues.add(raw.toLowerCase());
        metrics.push({
          metricId: `m_mult_${evidenceId}_${metrics.length}`,
          rawValue: raw,
          metricType: "MULTIPLIER",
          sourceText: text,
          evidenceId,
          confidence: this.calculateMetricConfidence(text, raw),
        });
      }
    }

    // 3. Currency (e.g., $2M, $50K, $10,000, $500, €50k, £100k)
    const currRegex = /([$€£]\s*\d+[\d,]*(?:\.\d+)?[kmb]?)\b/gi;
    while ((match = currRegex.exec(text)) !== null) {
      const raw = match[1];
      if (!seenValues.has(raw.toLowerCase())) {
        seenValues.add(raw.toLowerCase());
        metrics.push({
          metricId: `m_curr_${evidenceId}_${metrics.length}`,
          rawValue: raw,
          metricType: "CURRENCY",
          sourceText: text,
          evidenceId,
          confidence: this.calculateMetricConfidence(text, raw),
        });
      }
    }

    // 4. Scale & Scale Counts (e.g., 1M+ users, 500K records, 100k requests/day, 50k DAU)
    const scaleRegex = /\b(\d+[\d,]*(?:\.\d+)?[kmb]?\+?\s*(?:users|clients|customers|requests|transactions|records|endpoints|services|queries|events|rps|qps|dau|mau)(?:\s*(?:\/|per\s*)(?:day|sec|s|second|month|year|hr|hour|week))?)\b/gi;
    while ((match = scaleRegex.exec(text)) !== null) {
      const raw = match[1];
      if (!seenValues.has(raw.toLowerCase())) {
        seenValues.add(raw.toLowerCase());
        metrics.push({
          metricId: `m_scale_${evidenceId}_${metrics.length}`,
          rawValue: raw,
          metricType: "SCALE",
          sourceText: text,
          evidenceId,
          confidence: 0.95,
        });
      }
    }

    // 5. Time / Latency / Duration (e.g., 25 ms, sub-50ms, 500ms, 40 hours/week, 3 seconds)
    const timeRegex = /(?:sub-)?\b(\d+(?:\.\d+)?\s*(?:ms|milliseconds|seconds|mins|minutes|hrs|hours(?:\/week)?|days|weeks))\b/gi;
    while ((match = timeRegex.exec(text)) !== null) {
      const raw = match[1];
      if (!seenValues.has(raw.toLowerCase())) {
        seenValues.add(raw.toLowerCase());
        metrics.push({
          metricId: `m_time_${evidenceId}_${metrics.length}`,
          rawValue: raw,
          metricType: "TIME",
          sourceText: text,
          evidenceId,
          confidence: 0.90,
        });
      }
    }

    // 6. Rates (e.g., 100 req/s, 50 tps, 10 mb/s)
    const rateRegex = /\b(\d+[\d,]*(?:\.\d+)?\s*(?:req\/s|rps|tps|mb\/s|gb\/s))\b/gi;
    while ((match = rateRegex.exec(text)) !== null) {
      const raw = match[1];
      if (!seenValues.has(raw.toLowerCase())) {
        seenValues.add(raw.toLowerCase());
        metrics.push({
          metricId: `m_rate_${evidenceId}_${metrics.length}`,
          rawValue: raw,
          metricType: "RATE",
          sourceText: text,
          evidenceId,
          confidence: 0.90,
        });
      }
    }

    return metrics;
  }

  /**
   * Deterministically extract scope indicators (e.g. "5 applications", "20-person team", "10 microservices").
   */
  public static extractScope(text: string): ScopeEvidence[] {
    const scopes: ScopeEvidence[] = [];
    if (!text || typeof text !== "string") return scopes;

    const scopeRegex = /\b(\d+[\d,]*(?:\+)?\s*(applications|apps|services|microservices|teams|engineers|developers|team\s+members|person\s+team|platforms|systems|repositories|repos|modules))\b/gi;
    let match: RegExpExecArray | null;
    const seen = new Set<string>();

    while ((match = scopeRegex.exec(text)) !== null) {
      const fullMatch = match[1];
      const unit = match[2];
      if (!seen.has(fullMatch.toLowerCase())) {
        seen.add(fullMatch.toLowerCase());
        scopes.push({
          value: fullMatch,
          unit: unit.toLowerCase(),
          sourceText: text,
          confidence: 0.90,
        });
      }
    }

    return scopes;
  }

  /**
   * Detects explicit outcome expressions in the text.
   */
  public static detectOutcomes(text: string): { hasOutcome: boolean; matchedVerbs: string[]; outcomeScore: number } {
    if (!text || typeof text !== "string") {
      return { hasOutcome: false, matchedVerbs: [], outcomeScore: 0 };
    }

    const textLower = text.toLowerCase();
    const matchedVerbs: string[] = [];

    for (const verb of OUTCOME_VERBS) {
      const regex = new RegExp(`\\b${verb}\\b`, "i");
      if (regex.test(textLower)) {
        matchedVerbs.push(verb);
      }
    }

    // Additional causal connective indicators (e.g., "resulting in", "leading to", "which reduced", "to improve")
    const causalRegex = /\b(resulting in|leading to|enabling|which reduced|which increased|which saved|in order to|thereby|to achieve|to optimize)\b/i;
    const hasCausal = causalRegex.test(textLower);

    const hasOutcome = matchedVerbs.length > 0 || hasCausal;
    let outcomeScore = 0;

    if (matchedVerbs.length >= 2) {
      outcomeScore = 100;
    } else if (matchedVerbs.length === 1 && hasCausal) {
      outcomeScore = 90;
    } else if (matchedVerbs.length === 1) {
      outcomeScore = 75;
    } else if (hasCausal) {
      outcomeScore = 50;
    }

    return { hasOutcome, matchedVerbs, outcomeScore };
  }

  /**
   * Evaluates overall impact level based on metrics, outcomes, and scope.
   */
  public static determineImpactLevel(
    metrics: MetricEvidence[],
    hasOutcome: boolean,
    scopes: ScopeEvidence[]
  ): ImpactLevel {
    if (metrics.length > 0 && (hasOutcome || scopes.length > 0)) {
      return "HIGH";
    }
    if (metrics.length > 0 || (hasOutcome && scopes.length > 0)) {
      return "HIGH";
    }
    if (hasOutcome || scopes.length > 0) {
      return "MEDIUM";
    }
    return "LOW";
  }

  /**
   * Contextual confidence calculation for a metric: checks if surrounded by action/object/outcome.
   */
  private static calculateMetricConfidence(text: string, rawMetric: string): number {
    const textLower = text.toLowerCase();
    const metricIdx = textLower.indexOf(rawMetric.toLowerCase());
    if (metricIdx === -1) return 0.50;

    // Check surrounding words for action verbs or outcome verbs
    const hasOutcome = OUTCOME_VERBS.some((v) => textLower.includes(v));
    const isContextRich = text.split(/\s+/).length >= 6;

    if (hasOutcome && isContextRich) {
      return 0.95;
    }
    if (hasOutcome || isContextRich) {
      return 0.80;
    }
    return 0.60;
  }
}
