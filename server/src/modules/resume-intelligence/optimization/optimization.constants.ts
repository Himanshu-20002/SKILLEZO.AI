import { OPTIMIZATION_ENGINE_VERSION, OptimizationConstraint } from "./optimization.types";
export { OPTIMIZATION_ENGINE_VERSION };

export const SCORE_REGRESSION_THRESHOLD = 3;

export const DEFAULT_OPTIMIZATION_CONSTRAINTS: OptimizationConstraint[] = [
  "NO_NEW_FACTS",
  "NO_NEW_METRICS",
  "NO_NEW_SKILLS",
  "PRESERVE_MEANING",
  "PRESERVE_NUMERIC_VALUES",
  "PRESERVE_EMPLOYMENT_FACTS",
  "PRESERVE_EDUCATION_FACTS",
  "PRESERVE_CERTIFICATION_FACTS",
];

export const OWNERSHIP_ESCALATION_PAIRS: Array<{ passive: string[]; unauthorizedLeads: string[] }> = [
  {
    passive: ["worked with", "worked on", "involved in"],
    unauthorizedLeads: ["led", "architected", "owned", "spearheaded", "directed", "managed", "founded", "pioneered"],
  },
  {
    passive: ["assisted with", "assisted", "helped with", "helped", "aided in", "shadowed"],
    unauthorizedLeads: ["owned", "led", "architected", "spearheaded", "directed", "managed", "delivered entirely"],
  },
  {
    passive: ["contributed to", "participated in", "part of a team that"],
    unauthorizedLeads: ["architected", "owned single-handedly", "directed", "managed"],
  },
];
