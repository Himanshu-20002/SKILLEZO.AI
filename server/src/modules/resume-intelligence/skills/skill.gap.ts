import { SkillNormalizer } from "./skill.normalizer";
import { ResumeSkillProfile, SkillGap, SkillCategory } from "./skill.types";

export interface RoleSkillBenchmark {
  roleName: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

export const ROLE_SKILL_BENCHMARKS: Record<string, RoleSkillBenchmark> = {
  "Full-Stack Engineer": {
    roleName: "Full-Stack Engineer",
    requiredSkills: ["React", "Next.js", "TypeScript", "Node.js", "REST APIs", "SQL", "Git"],
    preferredSkills: ["AWS", "Docker", "PostgreSQL", "MongoDB", "Tailwind CSS", "CI/CD", "Redis", "GraphQL"],
  },
  "Frontend Engineer": {
    roleName: "Frontend Engineer",
    requiredSkills: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Next.js", "Tailwind CSS"],
    preferredSkills: ["Redux", "GSAP", "Vue.js", "Automated Testing", "REST APIs", "Vercel"],
  },
  "Backend Engineer": {
    roleName: "Backend Engineer",
    requiredSkills: ["Node.js", "Express.js", "REST APIs", "PostgreSQL", "SQL", "Git"],
    preferredSkills: ["MongoDB", "Redis", "Docker", "AWS", "FastAPI", "Python", "GraphQL", "JWT"],
  },
  "DevOps & Cloud Engineer": {
    roleName: "DevOps & Cloud Engineer",
    requiredSkills: ["AWS", "Docker", "CI/CD", "Linux", "Git"],
    preferredSkills: ["Kubernetes", "Cloud Architecture", "GCP", "Azure", "Serverless", "Postman"],
  },
  "AI/ML Specialist": {
    roleName: "AI/ML Specialist",
    requiredSkills: ["Python", "AI/ML", "REST APIs", "SQL"],
    preferredSkills: ["FastAPI", "PostgreSQL", "Docker", "AWS", "Git"],
  },
  "Mobile App Developer": {
    roleName: "Mobile App Developer",
    requiredSkills: ["React", "TypeScript", "JavaScript", "REST APIs", "Git"],
    preferredSkills: ["Node.js", "Tailwind CSS", "Firebase", "Automated Testing"],
  },
};

export class SkillGapEngine {
  /**
   * Deterministic comparison between candidate skill profile and target role benchmark.
   */
  public static computeGaps(
    profile: ResumeSkillProfile,
    targetRole = "Full-Stack Engineer"
  ): {
    matchedGaps: SkillGap[];
    notDetectedGaps: SkillGap[];
    gapScore: number;
    benchmark: RoleSkillBenchmark;
  } {
    const benchmark = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS["Full-Stack Engineer"];
    const detectedSkillNames = new Set(profile.skills.map((s) => s.canonicalName.toLowerCase()));

    const matchedGaps: SkillGap[] = [];
    const notDetectedGaps: SkillGap[] = [];

    let requiredMatched = 0;
    let preferredMatched = 0;

    // 1. Process Required Skills
    for (const reqSkill of benchmark.requiredSkills) {
      const canonical = SkillNormalizer.normalize(reqSkill);
      const skillId = canonical?.id || `skill_${reqSkill.toLowerCase().replace(/\s+/g, "_")}`;
      const category = (canonical?.category || "OTHER") as SkillCategory;
      const canonicalName = canonical?.canonicalName || reqSkill;
      const isMatched = detectedSkillNames.has(canonicalName.toLowerCase());

      if (isMatched) {
        requiredMatched += 1;
        const candidateSkill = profile.skills.find((s) => s.canonicalName.toLowerCase() === canonicalName.toLowerCase());
        matchedGaps.push({
          skillId,
          canonicalName,
          displayName: canonical?.displayName || canonicalName,
          category,
          status: "MATCHED",
          priority: "HIGH",
          evidenceIds: candidateSkill?.evidenceIds || [],
          frequency: candidateSkill?.frequency || 1,
        });
      } else {
        notDetectedGaps.push({
          skillId,
          canonicalName,
          displayName: canonical?.displayName || canonicalName,
          category,
          status: "NOT_DETECTED",
          priority: "HIGH",
          evidenceIds: [],
        });
      }
    }

    // 2. Process Preferred Skills
    for (const prefSkill of benchmark.preferredSkills) {
      const canonical = SkillNormalizer.normalize(prefSkill);
      const skillId = canonical?.id || `skill_${prefSkill.toLowerCase().replace(/\s+/g, "_")}`;
      const category = (canonical?.category || "OTHER") as SkillCategory;
      const canonicalName = canonical?.canonicalName || prefSkill;
      const isMatched = detectedSkillNames.has(canonicalName.toLowerCase());

      if (isMatched) {
        preferredMatched += 1;
        const candidateSkill = profile.skills.find((s) => s.canonicalName.toLowerCase() === canonicalName.toLowerCase());
        matchedGaps.push({
          skillId,
          canonicalName,
          displayName: canonical?.displayName || canonicalName,
          category,
          status: "MATCHED",
          priority: "MEDIUM",
          evidenceIds: candidateSkill?.evidenceIds || [],
          frequency: candidateSkill?.frequency || 1,
        });
      } else {
        notDetectedGaps.push({
          skillId,
          canonicalName,
          displayName: canonical?.displayName || canonicalName,
          category,
          status: "NOT_DETECTED",
          priority: "MEDIUM",
          evidenceIds: [],
        });
      }
    }

    const totalWeight = benchmark.requiredSkills.length * 2 + benchmark.preferredSkills.length;
    const earnedWeight = requiredMatched * 2 + preferredMatched;
    const gapScore = Math.min(100, Math.round((earnedWeight / Math.max(1, totalWeight)) * 100));

    return {
      matchedGaps,
      notDetectedGaps,
      gapScore,
      benchmark,
    };
  }
}
