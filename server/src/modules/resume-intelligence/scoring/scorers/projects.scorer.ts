import { ProjectsSectionAnalysis } from "../../sections/section.types";
import { SectionScore, ScoreComponent, RESUME_STUDIO_SECTION_WEIGHTS, getScoreRatingTier } from "../scoring.types";

export class ProjectsScorer {
  score(analysis?: ProjectsSectionAnalysis | null): SectionScore {
    const sectionId = "projects";
    const title = "Projects & Execution";
    const weight = RESUME_STUDIO_SECTION_WEIGHTS.projects; // 0.15
    const evidenceIds = analysis?.evidenceIds || [];

    if (!analysis || analysis.status === "MISSING") {
      return {
        sectionId,
        title,
        score: 0,
        maxScore: 100,
        weight,
        weightedScore: 0,
        status: "MISSING",
        tier: "Needs Work",
        components: [
          {
            id: "projects.presence_structure",
            label: "Project Volume & Structure",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: ">=2 projects (+30), 1 project (+20), 0 (0)",
            reason: "Projects section is completely missing.",
            evidenceIds: [],
          },
          {
            id: "projects.tech_stack_clarity",
            label: "Technology Stack Clarity",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: "Tech stack defined for >=75% projects (+30), >=50% (+20), <50% (+10)",
            reason: "No project tech stack to evaluate.",
            evidenceIds: [],
          },
          {
            id: "projects.live_repo_links",
            label: "Repository & Live Deployment Links",
            score: 0,
            maxScore: 25,
            weight: 0.25,
            rule: "Repo or live demo links present (+25), 0 links (0)",
            reason: "No project links found.",
            evidenceIds: [],
          },
          {
            id: "projects.bullet_depth",
            label: "Project Description & Bullet Depth",
            score: 0,
            maxScore: 15,
            weight: 0.15,
            rule: "Detailed bullet descriptions present (+15), single summary (+8)",
            reason: "No project descriptions found.",
            evidenceIds: [],
          },
        ],
        strengths: [],
        weaknesses: ["Projects section is completely missing."],
        deductions: ["Missing projects (-100 pts)"],
        evidenceIds: [],
      };
    }

    const { signals } = analysis;
    const components: ScoreComponent[] = [];
    const deductions: string[] = [];
    const strengths: string[] = [...(analysis.strengths || [])];
    const weaknesses: string[] = [...(analysis.weaknesses || [])];

    const projCount = signals.projectCount || 0;

    // 1. Volume & Structure (Max 30)
    let volumeScore = 0;
    if (projCount >= 2) volumeScore = 30;
    else if (projCount === 1) {
      volumeScore = 20;
      deductions.push("Single project listed (2+ projects recommended for depth) (-10 pts)");
    } else {
      volumeScore = 0;
      deductions.push("Zero projects found (-30 pts)");
    }

    components.push({
      id: "projects.presence_structure",
      label: "Project Volume & Structure",
      score: volumeScore,
      maxScore: 30,
      weight: 0.30,
      rule: ">=2 projects (+30), 1 project (+20), 0 (0)",
      reason: `${projCount} project(s) documented.`,
      evidenceIds,
    });

    // 2. Tech Stack Clarity (Max 30)
    let stackScore = 0;
    const stackRatio = projCount > 0 ? (signals.projectsWithTechnologies || 0) / projCount : 0;
    if (stackRatio >= 0.75) stackScore = 30;
    else if (stackRatio >= 0.5) {
      stackScore = 20;
      deductions.push(`Technologies listed in ${signals.projectsWithTechnologies} of ${projCount} projects (-10 pts)`);
    } else if (stackRatio > 0) {
      stackScore = 10;
      deductions.push(`Limited tech stack specifications across projects (-20 pts)`);
    } else {
      stackScore = 0;
      deductions.push("No technologies associated with projects (-30 pts)");
    }

    components.push({
      id: "projects.tech_stack_clarity",
      label: "Technology Stack Clarity",
      score: stackScore,
      maxScore: 30,
      weight: 0.30,
      rule: "Tech stack defined for >=75% projects (+30), >=50% (+20), <50% (+10)",
      reason: `${signals.uniqueTechnologiesCount} distinct technologies specified across projects.`,
      evidenceIds,
    });

    // 3. Live & Repo Links (Max 25)
    let linkScore = 0;
    const linksTotal = (signals.projectsWithLink || 0) + (signals.projectsWithRepoUrl || 0);
    if (linksTotal >= 2 || (projCount === 1 && linksTotal >= 1)) {
      linkScore = 25;
    } else if (linksTotal === 1) {
      linkScore = 15;
      deductions.push("Only 1 project includes a live or repository link (-10 pts)");
    } else {
      linkScore = 0;
      deductions.push("No GitHub or live demo links provided for projects (-25 pts)");
    }

    components.push({
      id: "projects.live_repo_links",
      label: "Repository & Live Deployment Links",
      score: linkScore,
      maxScore: 25,
      weight: 0.25,
      rule: "Repo or live demo links present (+25), 1 link (+15), 0 links (0)",
      reason: linksTotal > 0
        ? `${linksTotal} project repository/live deployment links detected.`
        : "No external verification links found.",
      evidenceIds,
    });

    // 4. Bullet & Description Depth (Max 15)
    let depthScore = 0;
    if (signals.projectsWithBullets > 0 && signals.totalBulletsCount >= projCount) {
      depthScore = 15;
    } else if (signals.projectsWithDescription > 0 || signals.projectsWithBullets > 0) {
      depthScore = 8;
      deductions.push("Projects use summary paragraphs rather than quantified bullet points (-7 pts)");
    } else {
      depthScore = 0;
      deductions.push("Projects lack descriptions or technical deliverables (-15 pts)");
    }

    components.push({
      id: "projects.bullet_depth",
      label: "Project Description & Bullet Depth",
      score: depthScore,
      maxScore: 15,
      weight: 0.15,
      rule: "Detailed bullet descriptions (+15), single summary (+8), missing (0)",
      reason: `${signals.totalBulletsCount} bullet points across ${projCount} project(s).`,
      evidenceIds,
    });

    // Sum total section score
    const rawScore = components.reduce((acc, c) => acc + c.score, 0);
    const score = Math.min(100, Math.max(0, Math.round(rawScore)));
    const weightedScore = Number((score * weight).toFixed(2));
    const tier = getScoreRatingTier(score);

    return {
      sectionId,
      title,
      score,
      maxScore: 100,
      weight,
      weightedScore,
      status: analysis.status,
      tier,
      components,
      strengths,
      weaknesses,
      deductions,
      evidenceIds,
    };
  }
}

export const projectsScorer = new ProjectsScorer();
