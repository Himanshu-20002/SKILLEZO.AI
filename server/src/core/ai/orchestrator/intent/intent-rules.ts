import { AIIntent } from "./intent-types";
import { RoleNormalizer } from "@/modules/resume-intelligence/roles/role.normalizer";

export interface IntentRule {
  id: string;
  intent: AIIntent;
  pattern: RegExp;
  weight: number;
}

/**
 * Deterministic regex patterns for instant zero-latency rule matching across the 10 intents.
 */
export const INTENT_RULES: IntentRule[] = [
  // 1. SKILL_GAP_ANALYSIS
  {
    id: "RULE_SKILL_GAP_KEYWORDS",
    intent: "SKILL_GAP_ANALYSIS",
    pattern: /\b(skill\s*gaps?|missing\s*skills?|skills?\s*(needed|required|missing|lacking)|gap\s*analysis|what\s*skills\s*(do\s*i\s*need|am\s*i\s*missing))\b/i,
    weight: 0.95,
  },
  // 2. RESUME_IMPROVEMENT
  {
    id: "RULE_RESUME_IMPROVEMENT",
    intent: "RESUME_IMPROVEMENT",
    pattern: /\b(improve\s*(my\s*)?resume|rewrite\s*(my\s*)?(bullet|bullets|resume)|optimize\s*(my\s*)?resume|make\s*(my\s*)?resume\s*better|resume\s*(feedback|suggestions|critique))\b/i,
    weight: 0.95,
  },
  // 3. RESUME_ANALYSIS
  {
    id: "RULE_RESUME_ANALYSIS",
    intent: "RESUME_ANALYSIS",
    pattern: /\b(ats\s*(score|check|review|grade)|review\s*(my\s*)?resume|how\s*good\s*is\s*my\s*resume|resume\s*(score|analysis|audit|grade|evaluation))\b/i,
    weight: 0.92,
  },
  // 4. EMPLOYABILITY_ANALYSIS
  {
    id: "RULE_EMPLOYABILITY_INDEX",
    intent: "EMPLOYABILITY_ANALYSIS",
    pattern: /\b(employability(\s*index|\s*score)?|job\s*readiness(\s*score)?|how\s*employable\s*am\s*i|market\s*readiness)\b/i,
    weight: 0.95,
  },
  // 5. CAREER_PLAN
  {
    id: "RULE_CAREER_PLAN",
    intent: "CAREER_PLAN",
    pattern: /\b(career\s*(plan|roadmap|path|milestones?)|learning\s*(plan|roadmap)|create\s*(a\s*)?roadmap|steps\s*to\s*become|guide\s*me\s*to\s*become)\b/i,
    weight: 0.95,
  },
  // 6. JOB_MATCHING
  {
    id: "RULE_JOB_MATCHING",
    intent: "JOB_MATCHING",
    pattern: /\b(matching\s*jobs?|jobs?\s*(match|for\s*me)|find\s*(me\s*)?jobs?|recommended\s*jobs?|what\s*jobs\s*can\s*i\s*apply)\b/i,
    weight: 0.92,
  },
  // 7. CAREER_READINESS
  {
    id: "RULE_CAREER_READINESS",
    intent: "CAREER_READINESS",
    pattern: /\b(overall\s*readiness|am\s*i\s*ready|career\s*readiness|complete\s*(career\s*)?overview|holistic\s*audit)\b/i,
    weight: 0.9,
  },
  // 8. PROFILE_OVERVIEW
  {
    id: "RULE_PROFILE_OVERVIEW",
    intent: "PROFILE_OVERVIEW",
    pattern: /\b(my\s*profile|profile\s*(summary|completion|overview|details)|who\s*am\s*i|show\s*my\s*profile)\b/i,
    weight: 0.9,
  },
  // 9. GENERAL_CAREER_GUIDANCE
  {
    id: "RULE_GENERAL_CAREER_GUIDANCE",
    intent: "GENERAL_CAREER_GUIDANCE",
    pattern: /\b(career\s*(advice|tips|help|guidance|direction)|interview\s*(prep|preparation)|advice(\s+\w+){0,4}\s+interview|how\s*to\s*switch\s*careers?)\b/i,
    weight: 0.85,
  },
];

/**
 * Normalizes target role string without blindly title-casing.
 * Trims, normalizes whitespace, preserves meaningful technology/acronym casing (e.g. AWS, CI/CD, iOS, Node.js),
 * and uses existing RoleNormalizer without inventing a new taxonomy.
 */
export function normalizeTargetRole(rawRole: string | undefined | null): string | undefined {
  if (!rawRole) return undefined;
  const trimmed = rawRole.trim().replace(/\s+/g, " ");
  if (!trimmed) return undefined;

  // Preserve meaningful technology/acronym casing
  const knownTech: Record<string, string> = {
    ios: "iOS",
    "node.js": "Node.js",
    nodejs: "Node.js",
    aws: "AWS",
    gcp: "GCP",
    ai: "AI",
    ml: "ML",
    devops: "DevOps",
    "ci/cd": "CI/CD",
  };

  let formatted = trimmed;
  for (const [lower, proper] of Object.entries(knownTech)) {
    const regex = new RegExp(`\\b${lower.replace(".", "\\.")}\\b`, "gi");
    formatted = formatted.replace(regex, proper);
  }

  // Check against RoleNormalizer
  const canonical = RoleNormalizer.normalize(formatted);
  if (!canonical.isFallback && canonical.canonicalTitle) {
    // If the input already had a specific tech prefix or seniority, preserve the enriched formatted title
    if (formatted.toLowerCase().includes("senior") && !canonical.canonicalTitle.toLowerCase().includes("senior")) {
      return `Senior ${canonical.canonicalTitle}`;
    }
    if (formatted.toLowerCase().includes("node.js") && !canonical.canonicalTitle.toLowerCase().includes("node.js")) {
      return `Node.js ${canonical.canonicalTitle}`;
    }
    return canonical.canonicalTitle;
  }

  return formatted;
}

/**
 * Extracts target role mentions from the prompt if present.
 * e.g., "roadmap to become a Senior React Developer" -> "Senior React Developer"
 */
export function extractTargetRoleFromMessage(message: string): string | undefined {
  if (!message) return undefined;

  const patterns = [
    /(?:become|as|for|role\s*of|transition\s*to|target\s*role(?:\s*is|\s*[:=])?)\s+([a-zA-Z0-9\s.+#/-]{3,40})/i,
    /(?:senior|junior|lead|staff|principal)?\s*(?:frontend|backend|fullstack|full-stack|devops|cloud|data|ml|ai|software|product)\s*(?:developer|engineer|manager|architect|designer)/i,
  ];

  for (const regex of patterns) {
    const match = message.match(regex);
    if (match) {
      const extracted = match[1] || match[0];
      const cleaned = extracted
        .replace(/\b(for|as|a|an|the|to|become|role|of)\b/gi, "")
        .trim();
      if (cleaned.length >= 3) {
        return normalizeTargetRole(cleaned);
      }
    }
  }

  return undefined;
}

