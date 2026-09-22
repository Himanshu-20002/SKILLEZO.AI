import { IProfile } from "@/database/models/Profile.model";
import {
  ResumeDocument,
  ResumeContact,
  ResumeSummary,
  ResumeSkillItem,
  ResumeExperienceItem,
  ResumeProjectItem,
  ResumeEducationItem,
  ResumeTemplateConfig,
  ResumeLink,
  ResumeEvidence,
} from "../document/resume-document.types";
import { ResumeBuilderConfig } from "../builder/builder.types";

const DEFAULT_TEMPLATE_CONFIG: ResumeTemplateConfig = {
  templateId: "modern",
  primaryColor: "#0284c7",
  fontFamily: "Inter",
  fontSize: "regular",
  margins: "normal",
};

export interface MasterResumeBuildOptions {
  candidateName?: string;
  email?: string;
  existingDoc?: ResumeDocument | null;
  builderConfig?: ResumeBuilderConfig | null;
}

const VALID_SKILL_CATEGORIES = new Set<string>([
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "CLOUD",
  "DEVOPS",
  "LANGUAGE",
  "TESTING",
  "MOBILE",
  "AI_ML",
  "TOOLS",
  "OTHER",
]);

const VALID_PROFICIENCIES = new Set<string>([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);

export class MasterResumeBuilder {
  /**
   * Deterministically builds or synchronizes a canonical ResumeDocument presentation AST
   * from the candidate's ProfileModel.
   *
   * Invariants:
   * 1. No candidate fact fabrication (missing fields remain undefined/empty).
   * 2. Skill mapping is deterministic without category/proficiency inference.
   * 3. Preserves presentation customizations (templateConfig, typography, margins, spacing) from existingDoc.
   * 4. Preserves Phase 1 evidence IDs and provenance relationships.
   */
  public static buildFromProfile(
    profile: Partial<IProfile> | IProfile,
    options?: MasterResumeBuildOptions
  ): ResumeDocument {
    const existingDoc = options?.existingDoc;

    // 1. Contact
    const rawName =
      options?.candidateName ||
      existingDoc?.contact?.fullName ||
      (profile as any).fullName ||
      "";
    const fullName = rawName.trim().length > 0 ? rawName.trim() : "Resume";

    const email = options?.email || existingDoc?.contact?.email || undefined;
    const phone = profile.phone?.trim() || existingDoc?.contact?.phone || undefined;

    const locParts = [
      profile.location?.city,
      profile.location?.state,
      profile.location?.country,
    ].filter((p): p is string => Boolean(p && p.trim()));

    const location =
      locParts.length > 0
        ? locParts.join(", ")
        : existingDoc?.contact?.location || undefined;

    const links: ResumeLink[] = [];
    if (profile.links?.linkedin) {
      links.push({ label: "LinkedIn", url: profile.links.linkedin });
    }
    if (profile.links?.github) {
      links.push({ label: "GitHub", url: profile.links.github });
    }
    if (profile.links?.portfolio) {
      links.push({ label: "Portfolio", url: profile.links.portfolio });
    }

    // Preserve any existing non-duplicate links from existingDoc
    if (existingDoc?.contact?.links) {
      const existingUrls = new Set(links.map((l) => l.url.toLowerCase()));
      for (const exLink of existingDoc.contact.links) {
        if (!existingUrls.has(exLink.url.toLowerCase())) {
          links.push(exLink);
          existingUrls.add(exLink.url.toLowerCase());
        }
      }
    }

    const contact: ResumeContact = {
      fullName,
      email,
      phone,
      location,
      links,
    };

    // 2. Summary
    const summaryText = profile.bio?.trim() || existingDoc?.summary?.text || "";
    const targetRole =
      profile.targetRole?.trim() ||
      profile.headline?.trim() ||
      existingDoc?.summary?.targetRole ||
      undefined;

    const summary: ResumeSummary = {
      text: summaryText,
      targetRole,
    };

    // 3. Skills (Deterministic mapping without AI or category inference)
    const skills: ResumeSkillItem[] = (profile.skills || []).map((s, idx) => {
      const rawCat = (s.category || "").trim().toUpperCase();
      let category: ResumeSkillItem["category"] | undefined;
      if (s.category && VALID_SKILL_CATEGORIES.has(rawCat)) {
        category = rawCat as ResumeSkillItem["category"];
      }

      const rawProf = (s.proficiency || "").trim().toUpperCase();
      let proficiency: ResumeSkillItem["proficiency"] | undefined;
      if (s.proficiency && VALID_PROFICIENCIES.has(rawProf)) {
        proficiency = rawProf as ResumeSkillItem["proficiency"];
      }

      const evidenceIds: string[] = [];
      if ((s as any).evidenceId) evidenceIds.push((s as any).evidenceId);
      if (Array.isArray(s.evidenceIds)) {
        for (const eid of s.evidenceIds) {
          if (!evidenceIds.includes(eid)) evidenceIds.push(eid);
        }
      }

      return {
        id: `sk_${idx + 1}_${s.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        name: s.name.trim(),
        category,
        proficiency,
        evidenceIds,
        evidenceId: (s as any).evidenceId,
      } as any;
    });

    // 4. Experience
    const experience: ResumeExperienceItem[] = (profile.experience || []).map((e, idx) => {
      const expId = `exp_${idx + 1}`;
      const expEvidenceIds: string[] = [];
      if ((e as any).evidenceId) expEvidenceIds.push((e as any).evidenceId);
      if (Array.isArray(e.evidenceIds)) {
        for (const eid of e.evidenceIds) {
          if (!expEvidenceIds.includes(eid)) expEvidenceIds.push(eid);
        }
      }

      const bullets = (e.bullets && e.bullets.length > 0)
        ? e.bullets.map((bText, bIdx) => ({
            id: `b_${idx + 1}_${bIdx + 1}`,
            text: bText.trim(),
            evidenceIds: expEvidenceIds,
          }))
        : e.description
        ? e.description.split("\n").filter((l) => l.trim().length > 0).map((l, bIdx) => ({
            id: `b_${idx + 1}_${bIdx + 1}`,
            text: l.trim(),
            evidenceIds: expEvidenceIds,
          }))
        : [];

      return {
        id: expId,
        companyName: e.companyName ? e.companyName.trim() : undefined,
        jobTitle: e.jobTitle ? e.jobTitle.trim() : undefined,
        startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 7) : undefined,
        endDate: e.isCurrent
          ? undefined
          : e.endDate
          ? new Date(e.endDate).toISOString().slice(0, 7)
          : undefined,
        isCurrent: !!e.isCurrent,
        bullets,
        technologiesUsed: e.technologiesUsed || [],
        evidenceIds: expEvidenceIds,
        evidenceId: (e as any).evidenceId,
      } as any;
    });

    // 5. Projects
    const projects: ResumeProjectItem[] = (profile.projects || []).map((p, idx) => {
      const projId = `proj_${idx + 1}`;
      const projEvidenceIds: string[] = [];
      if ((p as any).evidenceId) projEvidenceIds.push((p as any).evidenceId);
      if (Array.isArray(p.evidenceIds)) {
        for (const eid of p.evidenceIds) {
          if (!projEvidenceIds.includes(eid)) projEvidenceIds.push(eid);
        }
      }

      const rawDesc = (p.description || "").trim();
      const splitItems = rawDesc
        .split(/(?:^|\s+)[•\-\*]\s+|\n+/)
        .map((s) => s.trim().replace(/^[•\-\*]\s*/, ""))
        .filter((s) => s.length > 0);

      let shortSummary: string | undefined = undefined;
      let projectBullets: string[] = [];

      if (splitItems.length > 1) {
        projectBullets = splitItems.slice(0, 4);
      } else if (splitItems.length === 1) {
        if (rawDesc.startsWith("•") || rawDesc.startsWith("-")) {
          projectBullets = [splitItems[0]];
        } else {
          shortSummary = splitItems[0];
          projectBullets = [];
        }
      }

      return {
        id: projId,
        title: p.title.trim(),
        description: shortSummary,
        technologies: p.techStack || [],
        link: p.liveDemoUrl?.trim() || undefined,
        repoUrl: p.githubUrl?.trim() || undefined,
        bullets: projectBullets,
        evidenceIds: projEvidenceIds,
        evidenceId: (p as any).evidenceId,
      } as any;
    });

    // 6. Education
    const education: ResumeEducationItem[] = (profile.education || []).map((ed, idx) => {
      const eduId = `edu_${idx + 1}`;
      const eduEvidenceIds: string[] = [];
      if ((ed as any).evidenceId) eduEvidenceIds.push((ed as any).evidenceId);
      if (Array.isArray(ed.evidenceIds)) {
        for (const eid of ed.evidenceIds) {
          if (!eduEvidenceIds.includes(eid)) eduEvidenceIds.push(eid);
        }
      }

      return {
        id: eduId,
        institution: ed.institution.trim(),
        degree: ed.degree?.trim() || undefined,
        fieldOfStudy: ed.fieldOfStudy?.trim() || undefined,
        startDate: ed.startYear ? String(ed.startYear) : undefined,
        endDate: ed.endYear ? String(ed.endYear) : undefined,
        evidenceIds: eduEvidenceIds,
        evidenceId: (ed as any).evidenceId,
      } as any;
    });

    // 7. Achievements (Preserved from existing presentation document)
    const achievements = existingDoc?.achievements || [];

    // 8. Visual Presentation Configuration (Preserved strictly)
    const templateConfig: ResumeTemplateConfig =
      existingDoc?.templateConfig || DEFAULT_TEMPLATE_CONFIG;

    // 9. Fact & Provenance Ledger
    const evidenceLedger: ResumeEvidence[] = [...(existingDoc?.evidence || [])];
    const existingEvIds = new Set(evidenceLedger.map((ev) => ev.id));

    const addEvidenceRecord = (id: string, type: any, value: string) => {
      if (!id || existingEvIds.has(id)) return;
      evidenceLedger.push({
        id,
        type,
        source: "USER",
        value,
        verified: false,
        createdAt: new Date().toISOString(),
      });
      existingEvIds.add(id);
    };

    (profile.skills || []).forEach((s) => {
      if ((s as any).evidenceId) addEvidenceRecord((s as any).evidenceId, "SKILL", s.name);
    });
    (profile.experience || []).forEach((e) => {
      if ((e as any).evidenceId) addEvidenceRecord((e as any).evidenceId, "EMPLOYER", e.companyName || "");
    });
    (profile.education || []).forEach((ed) => {
      if ((ed as any).evidenceId) addEvidenceRecord((ed as any).evidenceId, "INSTITUTION", ed.institution || "");
    });
    (profile.projects || []).forEach((p) => {
      if ((p as any).evidenceId) addEvidenceRecord((p as any).evidenceId, "PROJECT_CLAIM", p.title || "");
    });

    // 10. Versioning & System Metadata
    const currentVersionNumber = existingDoc?.currentVersion?.versionNumber
      ? existingDoc.currentVersion.versionNumber + 1
      : 1;

    const resumeDoc: ResumeDocument = {
      id: existingDoc?.id || `res_doc_${profile.userId || "master"}_master`,
      userId: profile.userId || existingDoc?.userId || "",
      title: existingDoc?.title || "Master Resume",
      contact,
      summary,
      skills,
      experience,
      projects,
      education,
      achievements,
      evidence: evidenceLedger,
      targetRole,
      templateConfig,
      currentVersion: {
        versionId: `v${currentVersionNumber}`,
        versionNumber: currentVersionNumber,
        name: "Master Resume",
        createdAt: new Date().toISOString(),
        changeSummary: "Synchronized from Career Profile",
      },
      schemaVersion: "1.0.0",
      isMaster: true,
      createdAt: existingDoc?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return resumeDoc;
  }
}
