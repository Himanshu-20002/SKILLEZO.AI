import { ResumeProjectItem, ResumeEvidence } from "../../document/resume-document.types";
import { ProjectsSectionAnalysis, ProjectsSignals, SectionStatus } from "../section.types";

export class ProjectsAnalyzer {
  analyze(projects: ResumeProjectItem[] = [], evidenceLedger: ResumeEvidence[] = []): ProjectsSectionAnalysis {
    const evidenceIds: string[] = [];
    const missing: string[] = [];
    const warnings: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const projList = Array.isArray(projects) ? projects : [];
    const projectCount = projList.length;

    // Collect linked evidence IDs
    for (const ev of evidenceLedger) {
      if (ev.type === "PROJECT_CLAIM") {
        evidenceIds.push(ev.id);
      }
    }

    if (projectCount === 0) {
      return {
        sectionId: "projects",
        title: "Featured Projects",
        status: "MISSING",
        completeness: 0,
        itemCount: 0,
        strengths: [],
        weaknesses: ["Featured projects section is empty."],
        missing: ["projects"],
        warnings: ["No technical projects listed."],
        evidenceIds: [],
        signals: {
          projectCount: 0,
          projectsWithDescription: 0,
          projectsWithTechnologies: 0,
          projectsWithBullets: 0,
          projectsWithLink: 0,
          projectsWithRepoUrl: 0,
          totalTechnologiesCount: 0,
          uniqueTechnologiesCount: 0,
          projectsMissingTitle: 0,
          projectsMissingDescription: 0,
          projectsMissingTechnologies: 0,
          totalBulletsCount: 0,
        },
      };
    }

    let projectsWithDescription = 0;
    let projectsWithTechnologies = 0;
    let projectsWithBullets = 0;
    let projectsWithLink = 0;
    let projectsWithRepoUrl = 0;
    let totalTechnologiesCount = 0;
    let projectsMissingTitle = 0;
    let projectsMissingDescription = 0;
    let projectsMissingTechnologies = 0;
    let totalBulletsCount = 0;

    const uniqueTechSet = new Set<string>();

    projList.forEach((proj, idx) => {
      const prefix = `projects[${idx}]`;
      const title = (proj.title || "").trim();
      const description = (proj.description || "").trim();
      const tech = Array.isArray(proj.technologies) ? proj.technologies : [];
      const bullets = Array.isArray(proj.bullets) ? proj.bullets : [];
      const link = (proj.link || "").trim();
      const repoUrl = (proj.repoUrl || "").trim();

      if (title.length >= 2) {
        // Valid title
      } else {
        projectsMissingTitle++;
        missing.push(`${prefix}.title`);
        warnings.push(`Project #${idx + 1} lacks a title.`);
      }

      if (description.length >= 10) {
        projectsWithDescription++;
      } else {
        projectsMissingDescription++;
        missing.push(`${prefix}.description`);
        warnings.push(`Project "${title || `#${idx + 1}`}" lacks an explanatory description.`);
      }

      if (tech.length > 0) {
        projectsWithTechnologies++;
        totalTechnologiesCount += tech.length;
        tech.forEach((t) => uniqueTechSet.add(t.trim().toLowerCase()));
      } else {
        projectsMissingTechnologies++;
        missing.push(`${prefix}.technologies`);
        warnings.push(`Project "${title || `#${idx + 1}`}" has no technology tags specified.`);
      }

      if (bullets.length > 0) {
        projectsWithBullets++;
        totalBulletsCount += bullets.length;
      }

      if (link) {
        projectsWithLink++;
        try {
          new URL(link);
        } catch {
          warnings.push(`Invalid project URL in "${title}": ${link}`);
        }
      }

      if (repoUrl) {
        projectsWithRepoUrl++;
        try {
          new URL(repoUrl);
        } catch {
          warnings.push(`Invalid repository URL in "${title}": ${repoUrl}`);
        }
      }
    });

    const uniqueTechnologiesCount = uniqueTechSet.size;

    // Strengths
    if (projectCount >= 1 && projectsWithDescription === projectCount && projectsWithTechnologies === projectCount) {
      strengths.push(`${projectCount} project(s) documented with full technical architectures and descriptions.`);
    }
    if (uniqueTechnologiesCount >= 4) {
      strengths.push(`Diverse technology stack across projects (${uniqueTechnologiesCount} unique technologies).`);
    }
    if (projectsWithLink > 0 || projectsWithRepoUrl > 0) {
      strengths.push("Direct live application and/or GitHub repository links included.");
    }

    // Weaknesses
    if (projectsWithTechnologies < projectCount) {
      weaknesses.push(`${projectCount - projectsWithTechnologies} project(s) lack explicit technology stack lists.`);
    }
    if (projectsWithLink === 0 && projectsWithRepoUrl === 0) {
      weaknesses.push("No live demo or code repository links provided for projects.");
    }
    if (projectsWithDescription < projectCount) {
      weaknesses.push(`${projectCount - projectsWithDescription} project(s) lack descriptions.`);
    }

    // Completeness (Title & Description = 40%, Tech stack = 30%, Bullets/Details = 15%, Links = 15%)
    let completeness = 0;
    const descRatio = projectsWithDescription / projectCount;
    const techRatio = projectsWithTechnologies / projectCount;
    const bulletsRatio = projectsWithBullets / projectCount;
    const linkRatio = (projectsWithLink + projectsWithRepoUrl > 0) ? 1.0 : 0.0;

    completeness += descRatio * 0.40;
    completeness += techRatio * 0.30;
    completeness += bulletsRatio * 0.15;
    completeness += linkRatio * 0.15;

    completeness = Math.min(1.0, Math.max(0.0, Number(completeness.toFixed(2))));

    let status: SectionStatus = "PARTIAL";
    if (completeness >= 0.80 && projectsMissingTitle === 0 && projectsMissingDescription === 0) {
      status = "COMPLETE";
    }

    const signals: ProjectsSignals = {
      projectCount,
      projectsWithDescription,
      projectsWithTechnologies,
      projectsWithBullets,
      projectsWithLink,
      projectsWithRepoUrl,
      totalTechnologiesCount,
      uniqueTechnologiesCount,
      projectsMissingTitle,
      projectsMissingDescription,
      projectsMissingTechnologies,
      totalBulletsCount,
    };

    return {
      sectionId: "projects",
      title: "Featured Projects",
      status,
      completeness,
      itemCount: projectCount,
      strengths,
      weaknesses,
      missing,
      warnings,
      evidenceIds: Array.from(new Set(evidenceIds)),
      signals,
    };
  }
}

export const projectsAnalyzer = new ProjectsAnalyzer();
