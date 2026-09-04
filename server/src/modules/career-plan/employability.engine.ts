import {
  EmployabilityIndexResponseDTO,
  CareerGpsMilestoneDTO,
  EmployabilityActionDTO,
} from "./employability.dto";
import { SkillGapAnalysisResponseDTO } from "./skill-gap.dto";
import { ResumeAtsResponseDTO } from "@/modules/resume/resume.dto";

export interface EmployabilityEngineInput {
  targetRole: string;
  atsAnalysis?: ResumeAtsResponseDTO | null;
  skillGapAnalysis?: SkillGapAnalysisResponseDTO | null;
  projectCount?: number;
  hasGithubLink?: boolean;
  hasLiveDemoLink?: boolean;
  profileCompletenessScore?: number;
}

export class EmployabilityEngine {
  public static calculateEmployability(
    input: EmployabilityEngineInput
  ): EmployabilityIndexResponseDTO {
    const targetRole = input.targetRole || "Full-Stack Engineer";

    // 1. Extract / Normalize Factor 1: Technical Readiness (40%)
    const technicalReadiness = input.skillGapAnalysis
      ? Math.min(100, Math.max(0, input.skillGapAnalysis.overallMatchScore))
      : 50;

    // 2. Extract / Normalize Factor 2: Resume Strength (25%)
    const resumeStrength = input.atsAnalysis
      ? Math.min(100, Math.max(0, input.atsAnalysis.overallScore))
      : 50;

    // 3. Extract / Normalize Factor 3: Project Strength (15%)
    let projectStrength = 50;
    const projectCount = input.projectCount || 0;
    if (projectCount >= 3) projectStrength = 90;
    else if (projectCount === 2) projectStrength = 80;
    else if (projectCount === 1) projectStrength = 70;
    else projectStrength = 45;

    if (input.hasGithubLink) projectStrength = Math.min(100, projectStrength + 5);
    if (input.hasLiveDemoLink) projectStrength = Math.min(100, projectStrength + 5);

    // 4. Extract / Normalize Factor 4: Skill Alignment (10%)
    let skillAlignment = technicalReadiness;
    if (input.skillGapAnalysis) {
      const required = input.skillGapAnalysis.skillsRequiredCount || 1;
      const acquired = input.skillGapAnalysis.skillsAcquiredCount || 0;
      skillAlignment = Math.min(100, Math.max(20, Math.round((acquired / required) * 100)));
    }

    // 5. Extract / Normalize Factor 5: Recruiter Visibility (10%)
    const recruiterVisibility = input.profileCompletenessScore
      ? Math.min(100, Math.max(30, input.profileCompletenessScore))
      : 65;

    // 6. Compute Weighted Overall Employability Score (0-100)
    const overallScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          technicalReadiness * 0.40 +
          resumeStrength * 0.25 +
          projectStrength * 0.15 +
          skillAlignment * 0.10 +
          recruiterVisibility * 0.10
        )
      )
    );

    // 7. Determine Tier Status
    let tierStatus: "Top 5%" | "Top 15%" | "Top 30%" | "Developing" = "Developing";
    if (overallScore >= 88) tierStatus = "Top 5%";
    else if (overallScore >= 75) tierStatus = "Top 15%";
    else if (overallScore >= 60) tierStatus = "Top 30%";
    else tierStatus = "Developing";

    // 8. Generate Strengths & Improvement Areas
    const strengths: string[] = [];
    const improvementAreas: string[] = [];

    if (technicalReadiness >= 75) strengths.push(`Strong core technical competencies for ${targetRole}`);
    else improvementAreas.push(`Close critical skill gaps for ${targetRole}`);

    if (resumeStrength >= 80) strengths.push("High ATS resume parsing & keyword compatibility");
    else improvementAreas.push("Optimize resume impact statements and technical keywords");

    if (projectStrength >= 75) strengths.push("Strong practical portfolio with production projects");
    else improvementAreas.push("Add 1-2 deployed end-to-end projects with live demos");

    if (recruiterVisibility >= 70) strengths.push("Complete profile visibility & verified identity");
    else improvementAreas.push("Complete profile details to boost recruiter discoverability");

    if (strengths.length === 0) strengths.push("Solid foundation ready for accelerated growth");

    // 9. Generate Prioritized Action List
    const actionList: EmployabilityActionDTO[] = [];

    if (input.skillGapAnalysis?.priorityRecommendations) {
      input.skillGapAnalysis.priorityRecommendations.slice(0, 3).forEach((rec, idx) => {
        actionList.push({
          id: `act-skill-${idx + 1}`,
          title: `Master ${rec.skill} (${rec.requiredLevel})`,
          impactScore: rec.priority === "High" ? 15 : 8,
          category: "Skills",
          effort: rec.priority === "High" ? "High" : "Medium",
          priority: rec.priority,
          description: rec.suggestedAction,
          actionUrl: "/dashboard/skill-gap-analysis",
        });
      });
    }

    if (resumeStrength < 85) {
      actionList.push({
        id: "act-resume-1",
        title: "Boost Resume ATS Compatibility",
        impactScore: 10,
        category: "Resume",
        effort: "Low",
        priority: "High",
        description: "Add missing keywords and measurable impact statements to projects.",
        actionUrl: "/dashboard/resume-intelligence",
      });
    }

    if (projectCount < 2) {
      actionList.push({
        id: "act-proj-1",
        title: "Deploy 1 Production Full-Stack Project",
        impactScore: 12,
        category: "Projects",
        effort: "Medium",
        priority: "Medium",
        description: "Showcase end-to-end deployment with live URL and GitHub repository.",
        actionUrl: "/dashboard/projects",
      });
    }

    // 10. Generate Career GPS Milestones
    const milestones: CareerGpsMilestoneDTO[] = [];

    if (input.skillGapAnalysis?.priorityRecommendations) {
      input.skillGapAnalysis.priorityRecommendations.forEach((rec, idx) => {
        const priorityUpper = (rec.priority.toUpperCase()) as "HIGH" | "MEDIUM" | "LOW";
        milestones.push({
          id: `gps-ms-${idx + 1}`,
          title: `Learn & Apply ${rec.skill}`,
          description: rec.suggestedAction,
          source: "skill-gap",
          priority: priorityUpper,
          status: "not_started",
          relatedSkill: rec.skill,
          estimatedWeeks: rec.priority === "High" ? 2 : 1,
        });
      });
    }

    milestones.push({
      id: `gps-ms-${milestones.length + 1}`,
      title: "Optimize Resume & Achieve 90+ ATS Score",
      description: "Incorporate newly learned technical skills and measurable metrics into resume bullets.",
      source: "resume",
      priority: "MEDIUM",
      status: "not_started",
      estimatedWeeks: 1,
    });

    milestones.push({
      id: `gps-ms-${milestones.length + 1}`,
      title: "Apply to Curated Tier-1 Matching Roles",
      description: "Submit applications through Smart Job Center to positions with >85% compatibility match.",
      source: "profile",
      priority: "LOW",
      status: "not_started",
      estimatedWeeks: 1,
    });

    // Sort milestones (HIGH -> MEDIUM -> LOW)
    milestones.sort((a, b) => {
      const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return order[b.priority] - order[a.priority];
    });

    return {
      overallScore,
      tierStatus,
      targetTier: "Top 5%",
      targetRole,
      metrics: {
        technicalReadiness,
        resumeStrength,
        projectStrength,
        skillAlignment,
        recruiterVisibility,
      },
      factors: {
        technicalReadiness: {
          name: "Technical Readiness",
          score: technicalReadiness,
          weight: 40,
          status: "available",
          description: "Alignment with target role technical benchmarks",
        },
        resumeStrength: {
          name: "Resume Strength",
          score: resumeStrength,
          weight: 25,
          status: "available",
          description: "ATS keyword presence, brevity, structure & impact metrics",
        },
        projectStrength: {
          name: "Project Strength",
          score: projectStrength,
          weight: 15,
          status: "available",
          description: "Real-world project depth, live demos & code repositories",
        },
        skillAlignment: {
          name: "Skill Alignment",
          score: skillAlignment,
          weight: 10,
          status: "available",
          description: "Coverage ratio of required core industry skills",
        },
        recruiterVisibility: {
          name: "Recruiter Visibility",
          score: recruiterVisibility,
          weight: 10,
          status: "available",
          description: "Profile completeness and search discoverability score",
        },
      },
      strengths,
      improvementAreas,
      actionList,
      careerGps: {
        ready: true,
        milestones,
      },
    };
  }
}
