import { IResumeExtractedData } from "@/database/models/Resume.model";

export interface ATSWeights {
  keywordMatch: number;
  structure: number;
  brevity: number;
  impact: number;
  readability: number;
}

export const ATS_WEIGHTS: ATSWeights = {
  keywordMatch: 0.40,
  structure: 0.20,
  brevity: 0.15,
  impact: 0.15,
  readability: 0.10,
};

export interface ATSCategoryResult {
  score: number;
  matched: number;
  total: number;
  matchedSkills: string[];
}

export interface ATSMissingKeyword {
  skill?: string;
  keyword: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  impactLevel?: "High" | "Medium" | "Low";
  recommendation: string;
}

export interface ATSCompatibilityItem {
  system: "Workday" | "Taleo" | "Greenhouse" | "Lever" | "Generic ATS";
  compatibilityScore: number;
  status: "High Match" | "Moderate Match" | "Needs Optimization";
}

export interface KeywordMatchItem {
  keyword: string;
  category: "Frontend" | "Backend" | "DevOps" | "Database" | "Soft Skill";
  matched: boolean;
  frequency: number;
  importance: "Required" | "Preferred" | "Optional";
}

export interface ATSRecommendation {
  id: string;
  title: string;
  category: "Formatting" | "Keywords" | "Impact Statements" | "Brevity";
  description: string;
  impactScoreBoost: number;
  actionText: string;
}

export interface ATSAnalysisResult {
  overallScore: number;
  atsScore: number;
  impactScore: number;
  brevityScore: number;
  level: "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_IMPROVEMENT";
  breakdown: {
    keywordMatch: number;
    structure: number;
    brevity: number;
    impact: number;
    readability: number;
  };
  categories: Record<string, ATSCategoryResult>;
  atsCompatibility: ATSCompatibilityItem[];
  keywords: KeywordMatchItem[];
  missingKeywords: ATSMissingKeyword[];
  recommendations: ATSRecommendation[];
}

// Centralized reference taxonomy
export const KEYWORD_TAXONOMY: Record<string, { required: string[]; preferred: string[] }> = {
  Frontend: {
    required: ["React", "Next.js", "TypeScript", "JavaScript", "HTML/CSS"],
    preferred: ["Tailwind CSS", "Redux", "GSAP", "Vue", "Angular"],
  },
  Backend: {
    required: ["Node.js", "Express.js", "REST APIs"],
    preferred: ["GraphQL", "JWT", "Python", "FastAPI", "NestJS", "Django"],
  },
  Database: {
    required: ["MongoDB", "PostgreSQL", "SQL"],
    preferred: ["Redis", "Firebase", "MySQL", "DynamoDB"],
  },
  Cloud: {
    required: ["AWS", "Cloud Architecture"],
    preferred: ["Docker", "Vercel", "GCP", "Azure", "Serverless"],
  },
  DevOps: {
    required: ["Git", "GitHub", "CI/CD"],
    preferred: ["Docker", "Kubernetes", "Postman", "Linux"],
  },
};

export function normalizeSkill(name: string): string {
  const clean = name.trim().toLowerCase();
  if (clean === "js" || clean === "javascript" || clean === "es6") return "javascript";
  if (clean === "ts" || clean === "typescript") return "typescript";
  if (clean === "react" || clean === "react.js" || clean === "reactjs") return "react";
  if (clean === "next" || clean === "next.js" || clean === "nextjs") return "next.js";
  if (clean === "node" || clean === "node.js" || clean === "nodejs") return "node.js";
  if (clean === "express" || clean === "express.js" || clean === "expressjs") return "express.js";
  if (clean === "tailwind" || clean === "tailwindcss" || clean === "tailwind css") return "tailwind css";
  if (clean === "postgres" || clean === "postgresql") return "postgresql";
  if (clean === "mongo" || clean === "mongodb") return "mongodb";
  if (clean === "ci/cd" || clean === "cicd" || clean === "ci-cd" || clean === "github actions") return "ci/cd";
  if (clean === "k8s" || clean === "kubernetes") return "kubernetes";
  return clean;
}

export class ResumeAtsEngine {
  /**
   * Pure deterministic calculation of ATS score from parsed resume data and raw text.
   */
  public analyze(extractedData: IResumeExtractedData, rawText = ""): ATSAnalysisResult {
    const textLower = (rawText || "").toLowerCase();

    // 1. Gather all candidate skill tokens (from parsed skills + raw text matching)
    const candidateSkillsNormalized = new Set<string>();
    const originalSkillNames = new Set<string>();

    (extractedData.skills || []).forEach((s) => {
      if (s.name) {
        candidateSkillsNormalized.add(normalizeSkill(s.name));
        originalSkillNames.add(s.name);
      }
    });

    // 2. Keyword & Category Match Scoring
    const categories: Record<string, ATSCategoryResult> = {};
    const keywordsList: KeywordMatchItem[] = [];
    const missingKeywords: ATSMissingKeyword[] = [];
    let totalTargetKeywords = 0;
    let totalMatchedKeywords = 0;

    for (const [categoryName, { required, preferred }] of Object.entries(KEYWORD_TAXONOMY)) {
      const allCategoryKeywords = [...required, ...preferred];
      const matchedSkills: string[] = [];

      allCategoryKeywords.forEach((kw) => {
        const normKw = normalizeSkill(kw);
        const isRequired = required.includes(kw);
        const inExtracted = candidateSkillsNormalized.has(normKw);
        const inText = textLower.includes(normKw) || textLower.includes(kw.toLowerCase());
        const isMatched = inExtracted || inText;

        // Count frequency in text
        let frequency = 0;
        if (isMatched) {
          const kwRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
          const matches = textLower.match(kwRegex);
          frequency = matches ? matches.length : 1;
          matchedSkills.push(kw);
          totalMatchedKeywords += isRequired ? 1.5 : 1;
        } else {
          missingKeywords.push({
            skill: kw,
            keyword: kw,
            category: categoryName,
            priority: isRequired ? "High" : "Medium",
            impactLevel: isRequired ? "High" : "Medium",
            recommendation: isRequired
              ? `Core requirement for modern roles. Add ${kw} into your technical skills or project experience.`
              : `Recommended supporting skill for ${categoryName}. Consider listing ${kw} where applicable.`,
          });
        }

        totalTargetKeywords += isRequired ? 1.5 : 1;

        if (categoryName === "Frontend" || categoryName === "Backend" || categoryName === "Database" || categoryName === "DevOps") {
          keywordsList.push({
            keyword: kw,
            category: categoryName as any,
            matched: isMatched,
            frequency,
            importance: isRequired ? "Required" : "Preferred",
          });
        }
      });

      const catScore = Math.min(100, Math.round((matchedSkills.length / allCategoryKeywords.length) * 100));
      categories[categoryName.toLowerCase()] = {
        score: catScore,
        matched: matchedSkills.length,
        total: allCategoryKeywords.length,
        matchedSkills,
      };
    }

    // Category average match + bonus for broad multi-stack proficiency
    const categoryScores = Object.values(categories).map((c) => c.score);
    const avgCategoryScore = categoryScores.reduce((a, b) => a + b, 0) / Math.max(1, categoryScores.length);
    const matchedCount = Object.values(categories).reduce((acc, c) => acc + c.matched, 0);
    const keywordMatchScore = Math.min(100, Math.round(avgCategoryScore * 0.6 + Math.min(40, matchedCount * 4)));

    // 3. Structure Score (Personal info, Education, Experience, Skills, Summary)
    let structurePoints = 0;
    const personalInfo = extractedData.personalInfo;
    if (personalInfo?.fullName) structurePoints += 10;
    if (personalInfo?.email) structurePoints += 10;
    if (personalInfo?.phone) structurePoints += 5;
    if (extractedData.skills && extractedData.skills.length >= 5) structurePoints += 30;
    else if (extractedData.skills && extractedData.skills.length > 0) structurePoints += 15;
    if (extractedData.experience && extractedData.experience.length >= 1) structurePoints += 30;
    if (extractedData.education && extractedData.education.length >= 1) structurePoints += 10;
    if (extractedData.summary && extractedData.summary.length > 20) structurePoints += 5;
    const structureScore = Math.min(100, structurePoints);

    // 4. Brevity Score (Optimal 250 - 1200 words)
    const words = rawText ? rawText.trim().split(/\s+/).filter(Boolean).length : 0;
    let brevityScore = 80;
    if (words >= 50 && words <= 1200) {
      brevityScore = 95;
    } else if (words > 1200 && words <= 1600) {
      brevityScore = 80;
    } else if (words > 1600) {
      brevityScore = 65;
    } else if (words > 0 && words < 50) {
      brevityScore = 60;
    } else if (words === 0) {
      brevityScore = 40;
    }

    // 5. Impact Score (Measurable metrics, numbers, percentages, scale)
    const impactMatches = rawText.match(/\b(?:\d+%\+?|\d+x\b|\d+\+?\s*(?:users|clients|customers|million|k\b|lpa|lakh|crore)|reduced\s+by|increased\s+by|improved\s+by|delivered\s+\d+|optimized\s+\d+)/gi);
    const impactCount = impactMatches ? impactMatches.length : 0;
    let impactScore = 50;
    if (impactCount >= 4) impactScore = 95;
    else if (impactCount >= 2) impactScore = 85;
    else if (impactCount === 1) impactScore = 75;

    // 6. Readability Score
    let readabilityScore = 85;
    if (rawText.length > 200 && (extractedData.experience?.length || 0) > 0) {
      readabilityScore = 90;
    }

    // 7. Overall Composite ATS Score
    const overallScore = Math.min(
      100,
      Math.max(
        10,
        Math.round(
          keywordMatchScore * ATS_WEIGHTS.keywordMatch +
          structureScore * ATS_WEIGHTS.structure +
          brevityScore * ATS_WEIGHTS.brevity +
          impactScore * ATS_WEIGHTS.impact +
          readabilityScore * ATS_WEIGHTS.readability
        )
      )
    );

    let level: "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_IMPROVEMENT" = "GOOD";
    if (overallScore >= 88) level = "EXCELLENT";
    else if (overallScore >= 75) level = "GOOD";
    else if (overallScore >= 60) level = "AVERAGE";
    else level = "NEEDS_IMPROVEMENT";

    // 8. ATS System Simulations
    const greenhouseScore = Math.min(99, Math.round(overallScore * 0.95 + keywordMatchScore * 0.05));
    const leverScore = Math.min(99, Math.round(overallScore * 0.90 + structureScore * 0.10));
    const workdayScore = Math.min(99, Math.max(40, Math.round(structureScore * 0.45 + keywordMatchScore * 0.35 + brevityScore * 0.20)));
    const taleoScore = Math.min(99, Math.round(overallScore * 0.90 + impactScore * 0.10));

    const getMatchStatus = (score: number): "High Match" | "Moderate Match" | "Needs Optimization" => {
      if (score >= 80) return "High Match";
      if (score >= 60) return "Moderate Match";
      return "Needs Optimization";
    };

    const atsCompatibility: ATSCompatibilityItem[] = [
      {
        system: "Greenhouse",
        compatibilityScore: greenhouseScore,
        status: getMatchStatus(greenhouseScore),
      },
      {
        system: "Lever",
        compatibilityScore: leverScore,
        status: getMatchStatus(leverScore),
      },
      {
        system: "Workday",
        compatibilityScore: workdayScore,
        status: getMatchStatus(workdayScore),
      },
      {
        system: "Taleo",
        compatibilityScore: taleoScore,
        status: getMatchStatus(taleoScore),
      },
    ];

    // 9. Generate Actionable AI Improvement Recommendations
    const recommendations: ATSRecommendation[] = [];

    if (impactScore < 85) {
      recommendations.push({
        id: "rec-impact",
        title: "Add Quantifiable Metrics & Key Outcomes",
        category: "Impact Statements",
        description: "Add measurable percentages, performance gains, or scale numbers (e.g. 'reduced latency by 35%') under your work experience.",
        impactScoreBoost: 6,
        actionText: "Add Metrics",
      });
    }

    if (missingKeywords.length > 0) {
      const topMissing = missingKeywords.slice(0, 3).map((m) => m.keyword).join(", ");
      recommendations.push({
        id: "rec-keywords",
        title: `Include High-Demand Keywords: ${topMissing}`,
        category: "Keywords",
        description: `Your resume is missing key industry terms (${topMissing}) frequently screened by ATS filters for technical roles.`,
        impactScoreBoost: 5,
        actionText: "Add Keywords",
      });
    }

    if (structureScore < 85) {
      recommendations.push({
        id: "rec-structure",
        title: "Ensure All Core Resume Sections Are Explicit",
        category: "Formatting",
        description: "Ensure distinct headings for Skills, Experience, Education, and Contact Information are clearly identifiable.",
        impactScoreBoost: 4,
        actionText: "Fix Sections",
      });
    }

    if (brevityScore < 80) {
      recommendations.push({
        id: "rec-brevity",
        title: "Optimize Resume Length & Readability",
        category: "Brevity",
        description: words > 1100
          ? "Your resume text exceeds 1,100 words. Compressing bullet points to 1-2 lines will improve recruiter scanning."
          : "Your resume text is concise. Expanding on key technical contributions will improve ATS match depth.",
        impactScoreBoost: 3,
        actionText: "Refine Length",
      });
    }

    return {
      overallScore,
      atsScore: overallScore,
      impactScore,
      brevityScore,
      level,
      breakdown: {
        keywordMatch: keywordMatchScore,
        structure: structureScore,
        brevity: brevityScore,
        impact: impactScore,
        readability: readabilityScore,
      },
      categories,
      atsCompatibility,
      keywords: keywordsList.slice(0, 15),
      missingKeywords: missingKeywords
        .sort((a, b) => (a.priority === "High" ? -1 : 1))
        .slice(0, 15),
      recommendations: recommendations.slice(0, 4),
    };
  }
}

export const resumeAtsEngine = new ResumeAtsEngine();
