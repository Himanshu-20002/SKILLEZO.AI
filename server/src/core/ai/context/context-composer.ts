import crypto from "crypto";
import {
  CandidateContextSnapshot,
  ProfileContextSummary,
  ResumeContextSummary,
} from "./candidate-context.types";
import { CandidateEvidenceBundle } from "../evidence/types";

export interface ContextComposerParams {
  candidateId: string;
  targetRole?: string;
  profile?: any;
  resume?: any;
  evidenceBundle: CandidateEvidenceBundle;
  generationLatencyMs?: number;
}

export class ContextComposer {
  public static readonly CURRENT_VERSION = "v1";

  /**
   * Composes a compact, deterministic, serializable CandidateContextSnapshot
   * containing verified deterministic evidence and candidate profile/resume state.
   */
  public static compose(params: ContextComposerParams): CandidateContextSnapshot {
    const { candidateId, targetRole, profile, resume, evidenceBundle, generationLatencyMs } = params;

    // 1. Compose compact Profile summary
    let profileSummary: ProfileContextSummary | null = null;
    if (profile) {
      const skills: string[] = Array.isArray(profile.skills)
        ? profile.skills
            .map((s: any) => (typeof s === "string" ? s.trim() : (s?.name || "").trim()))
            .filter(Boolean)
            .sort()
        : [];

      profileSummary = {
        id: profile._id ? profile._id.toString() : undefined,
        headline: profile.headline || undefined,
        bio: profile.bio || undefined,
        skills,
        projectsCount: Array.isArray(profile.projects) ? profile.projects.length : 0,
        location: profile.location?.city
          ? `${profile.location.city}${profile.location.country ? ", " + profile.location.country : ""}`
          : undefined,
      };
    }

    // 2. Compose compact Resume summary
    let resumeSummary: ResumeContextSummary | null = null;
    if (resume) {
      const extracted = resume.extractedData || {};
      const resumeSkills: string[] = Array.isArray(extracted.skills)
        ? extracted.skills
            .map((s: any) => (typeof s === "string" ? s.trim() : (s?.name || "").trim()))
            .filter(Boolean)
            .sort()
        : [];

      resumeSummary = {
        resumeId: resume._id ? resume._id.toString() : "active_resume",
        title: resume.title || "Default Resume",
        atsScore: typeof resume.atsScore === "number" ? resume.atsScore : undefined,
        extractedSkills: resumeSkills,
        isDefault: !!resume.isDefault,
      };
    }

    // 3. Count unique source engines in evidence bundle
    const sourceEngines = new Set<string>();
    for (const item of evidenceBundle.items) {
      sourceEngines.add(item.sourceEngine);
    }

    // 4. Calculate deterministic snapshot hash
    const snapshotHash = this.calculateDeterministicHash({
      candidateId,
      targetRole: targetRole || "",
      version: this.CURRENT_VERSION,
      profile: profileSummary,
      resume: resumeSummary,
      evidenceItems: evidenceBundle.items.map((i) => ({
        id: i.id,
        metric: i.metric,
        value: i.value,
        type: i.evidenceType,
        status: i.verificationStatus,
      })),
    });

    const now = new Date();

    const snapshotWithoutSize: Omit<CandidateContextSnapshot, "metadata"> & {
      metadata: CandidateContextSnapshot["metadata"];
    } = {
      candidateId,
      targetRole: targetRole || undefined,
      generatedAt: now,
      version: this.CURRENT_VERSION,
      profile: profileSummary,
      resume: resumeSummary,
      evidence: evidenceBundle,
      metadata: {
        sourceCount: sourceEngines.size,
        evidenceCount: evidenceBundle.items.length,
        snapshotHash,
        generationLatencyMs,
      },
    };

    // Calculate serializable byte size
    const jsonString = JSON.stringify(snapshotWithoutSize);
    const byteSize = Buffer.byteLength(jsonString, "utf8");

    snapshotWithoutSize.metadata.byteSize = byteSize;

    return snapshotWithoutSize as CandidateContextSnapshot;
  }

  /**
   * Generates a stable deterministic SHA-256 hash invariant to key order or insertion variations.
   */
  public static calculateDeterministicHash(data: any): string {
    const stableString = this.stableStringify(data);
    return crypto.createHash("sha256").update(stableString).digest("hex");
  }

  private static stableStringify(obj: any): string {
    if (obj === null || typeof obj !== "object") {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return `[${obj.map((item) => this.stableStringify(item)).join(",")}]`;
    }
    const sortedKeys = Object.keys(obj).sort();
    const pairs = sortedKeys.map((key) => `${JSON.stringify(key)}:${this.stableStringify(obj[key])}`);
    return `{${pairs.join(",")}}`;
  }
}
