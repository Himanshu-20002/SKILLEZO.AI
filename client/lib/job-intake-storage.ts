/**
 * Job Intake & Tailoring Session Persistence
 *
 * Persists job description draft inputs across page navigations, tab switches,
 * and step transitions until the user explicitly clears them or successfully
 * generates a tailored resume.
 */

export interface JobIntakeDraft {
  jobTitle?: string | null;
  company?: string | null;
  jobUrl?: string | null;
  rawDescription?: string | null;
  lastUpdated?: number;
}

export interface JobTailoringSession {
  jobProfileId: string;
  jobTitle: string;
  company?: string | null;
  activeStep: "ANALYSIS" | "MATCH" | "TAILORING_PLAN";
  lastUpdated?: number;
}

const DRAFT_STORAGE_KEY = "skillezo_job_intake_draft";
const SESSION_STORAGE_KEY = "skillezo_job_tailoring_session";
export const JOB_INTAKE_CLEARED_EVENT = "skillezo:job-intake-cleared";

export function getJobIntakeDraft(): JobIntakeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      jobTitle: parsed.jobTitle || "",
      company: parsed.company || "",
      jobUrl: parsed.jobUrl || "",
      rawDescription: parsed.rawDescription || "",
      lastUpdated: parsed.lastUpdated,
    };
  } catch (e) {
    console.error("Failed to read job intake draft:", e);
    return null;
  }
}

export function saveJobIntakeDraft(draft: Partial<JobIntakeDraft>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getJobIntakeDraft() || {
      jobTitle: "",
      company: "",
      jobUrl: "",
      rawDescription: "",
    };
    const updated: JobIntakeDraft = {
      jobTitle: draft.jobTitle !== undefined ? (draft.jobTitle || "") : existing.jobTitle,
      company: draft.company !== undefined ? (draft.company || "") : existing.company,
      jobUrl: draft.jobUrl !== undefined ? (draft.jobUrl || "") : existing.jobUrl,
      rawDescription: draft.rawDescription !== undefined ? (draft.rawDescription || "") : existing.rawDescription,
      lastUpdated: Date.now(),
    };
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save job intake draft:", e);
  }
}

export function clearJobIntakeDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(JOB_INTAKE_CLEARED_EVENT));
  } catch (e) {
    console.error("Failed to clear job intake draft:", e);
  }
}

export function getJobTailoringSession(): JobTailoringSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read job tailoring session:", e);
    return null;
  }
}

export function saveJobTailoringSession(session: JobTailoringSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ ...session, lastUpdated: Date.now() })
    );
  } catch (e) {
    console.error("Failed to save job tailoring session:", e);
  }
}

export function clearJobTailoringSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear job tailoring session:", e);
  }
}
