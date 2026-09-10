import { CONTENT_ENGINE_VERSION } from "./content.types";
export { CONTENT_ENGINE_VERSION };

export const CONTENT_SCORING_WEIGHTS = {
  ACTION_OWNERSHIP: 0.15,
  SPECIFICITY: 0.20,
  TECHNICAL_DEPTH: 0.15,
  OUTCOME: 0.20,
  MEASURABLE_IMPACT: 0.20,
  SCOPE: 0.10,
};

export const SECTION_WEIGHTS = {
  EXPERIENCE: 0.60,
  PROJECTS: 0.30,
  SUMMARY: 0.10,
};

export const CONTENT_SCORE_LABELS = [
  { min: 90, max: 100, label: "Excellent Content" },
  { min: 75, max: 89, label: "Strong Content" },
  { min: 60, max: 74, label: "Moderate Content" },
  { min: 40, max: 59, label: "Needs Improvement" },
  { min: 0, max: 39, label: "Weak Content" },
];

export const STRONG_ACTION_VERBS = [
  "built", "designed", "developed", "implemented", "optimized", "automated",
  "led", "architected", "reduced", "improved", "migrated", "launched",
  "delivered", "scaled", "orchestrated", "engineered", "spearheaded",
  "refactored", "integrated", "deployed", "accelerated", "overhauled",
  "established", "mentored", "authored", "configured", "formulated",
  "streamlined", "transformed", "created", "constructed", "programmed",
  "executed", "diagnosed", "secured", "standardized", "centralized"
];

export const WEAK_ACTION_PHRASES = [
  "worked on", "helped with", "responsible for", "involved in",
  "participated in", "assisted with", "handled", "used", "worked with",
  "tasked with", "supported", "contributed to", "aided in", "assisted in",
  "part of a team that", "duties included"
];

export const OWNERSHIP_VERBS = [
  "led", "owned", "architected", "designed", "drove", "implemented",
  "built", "managed", "delivered", "spearheaded", "directed", "founded",
  "pioneered", "headed", "championed"
];

export const PASSIVE_OWNERSHIP_PHRASES = [
  "assisted", "supported", "helped", "participated", "contributed",
  "shadowed", "observed"
];

export const GENERIC_FILLER_PHRASES = [
  "various", "multiple", "several", "dynamic", "hardworking", "hard working",
  "team player", "results-driven", "results driven", "detail-oriented",
  "detail oriented", "self-starter", "self starter", "fast-paced",
  "fast paced", "broad range of", "hands-on", "hands on", "go-getter",
  "seasoned professional", "proven track record"
];

export const OUTCOME_VERBS = [
  "reduced", "reducing", "reduce", "reduction",
  "increased", "increasing", "increase", "growth",
  "improved", "improving", "improve", "improvement",
  "accelerated", "accelerating", "accelerate", "acceleration",
  "saved", "saving", "save", "savings",
  "generated", "generating", "generate", "generation",
  "eliminated", "eliminating", "eliminate", "elimination",
  "automated", "automating", "automate", "automation",
  "scaled", "scaling", "scale",
  "optimized", "optimizing", "optimize", "optimization",
  "decreased", "decreasing", "decrease",
  "boosted", "boosting", "boost",
  "maximized", "maximizing", "maximize",
  "minimized", "minimizing", "minimize",
  "expanded", "expanding", "expand",
  "resolved", "resolving", "resolve",
  "cut", "cutting",
  "enhanced", "enhancing", "enhance", "enhancement",
  "streamlined", "streamlining", "streamline",
  "upgraded", "upgrading", "upgrade",
  "doubled", "doubling", "double",
  "tripled", "tripling", "triple",
  "lowered", "lowering", "lower",
  "curbed", "curbing", "curb",
  "prevented", "preventing", "prevent",
  "mitigated", "mitigating", "mitigate"
];

export const TECHNICAL_DEPTH_KEYWORDS = [
  "api", "apis", "rest", "restful", "graphql", "grpc", "microservices",
  "microservice", "architecture", "caching", "redis", "memcached", "indexing",
  "database", "sql", "postgresql", "mysql", "mongodb", "dynamodb", "docker",
  "kubernetes", "k8s", "aws", "gcp", "azure", "ci/cd", "pipeline", "pipelines",
  "async", "concurrency", "distributed", "latency", "throughput", "p95", "p99",
  "oauth", "jwt", "kafka", "rabbitmq", "sqs", "websocket", "multithreading",
  "load balancing", "sharding", "replication", "event-driven", "serverless",
  "lambda", "state management", "redux", "zustand", "react", "next.js",
  "node.js", "nodejs", "typescript", "javascript", "python", "golang", "go",
  "rust", "terraform", "helm", "components", "component", "library", "sdk",
  "platform", "systems", "infrastructure", "backend", "frontend", "devops"
];

