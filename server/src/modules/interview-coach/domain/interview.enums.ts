export enum InterviewMode {
  TEXT = "text",
  VOICE = "voice",
}

export enum InterviewType {
  TECHNICAL = "technical",
  HR = "hr",
  BEHAVIORAL = "behavioral",
  MANAGERIAL = "managerial",
}

export enum InterviewDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum InterviewSessionStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum QuestionSource {
  GENERATED = "generated",
  TEMPLATE = "template",
  FOLLOW_UP = "follow_up",
}

export const VALID_EXPERIENCE_LEVELS = [
  "entry",
  "junior",
  "mid",
  "senior",
  "lead",
] as const;

export type ExperienceLevel = (typeof VALID_EXPERIENCE_LEVELS)[number];

