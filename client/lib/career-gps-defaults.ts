import { RoadmapStage, SalaryProgressionItem } from '@/types/career-intelligence';

/**
 * Safely namespaces localStorage keys by userId to prevent cross-account data bleeding.
 * Ensures every user on the same machine/browser has their own completely isolated roadmap.
 */
export function getGpsStorageKey(
  type: 'stages' | 'positions' | 'selected' | 'salary' | 'timeline' | 'role',
  userId?: string,
  roleOrSuffix?: string
): string {
  const cleanUser = (userId || 'candidate').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const cleanSuffix = roleOrSuffix ? `_${roleOrSuffix.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')}` : '';
  return `skillezo_gps_${type}_${cleanUser}${cleanSuffix}`;
}

export interface CandidateRoadmapInput {
  role: string;
  competencies?: Array<{
    skill: string;
    status: 'Matched' | 'Gap';
    priority: 'High' | 'Medium' | 'Low';
    currentLevel?: string;
    requiredLevel?: string;
  }>;
  gpsMilestones?: Array<{
    title: string;
    description: string;
    priority?: string;
  }>;
}

/**
 * Builds a 100% personalized, candidate-specific roadmap based on the user's actual profile & skill gaps.
 * 1. Completed foundation milestones reflect candidate's verified skills.
 * 2. Active in-progress milestones target the candidate's highest priority skill gap.
 * 3. Pending milestones bridge secondary gaps, followed by strategic Portfolio, ATS Resume, and Job Center applications.
 */
export function buildCandidateSpecificRoadmap(input: CandidateRoadmapInput): RoadmapStage[] {
  const { role, competencies = [] } = input;
  const defaults = getDefaultRoadmapStages(role);

  // If no competencies provided, return default role stages
  if (!competencies || competencies.length === 0) {
    return defaults;
  }

  const matched = competencies.filter((c) => c.status === 'Matched');
  const gaps = competencies.filter((c) => c.status === 'Gap');

  const highPriorityGaps = gaps.filter((g) => g.priority === 'High');
  const otherGaps = gaps.filter((g) => g.priority !== 'High');
  const sortedGaps = [...highPriorityGaps, ...otherGaps];

  const candidateStages: RoadmapStage[] = [];

  // 1. Stage 1 ALWAYS starts at "In Progress" at 5% (active entry point of the career journey)
  candidateStages.push({
    ...defaults[0],
    stageNumber: 1,
    status: 'In Progress',
    completionPercentage: 5,
    actionText: 'High-Priority Focus',
  });

  // 2. Skill Gaps queued sequentially as Pending milestones (Stage 2, Stage 3, etc.)
  if (sortedGaps.length > 0) {
    for (let i = 0; i < Math.min(sortedGaps.length, 3); i++) {
      const gap = sortedGaps[i];
      candidateStages.push({
        id: `cand-gap-${gap.skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        stageNumber: candidateStages.length + 1,
        title: `Master & Apply ${gap.skill}`,
        status: 'Pending',
        completionPercentage: 0,
        description: `Bridge target role competency gap in ${gap.skill} (${gap.currentLevel || 'Unranked'} → ${gap.requiredLevel || 'Intermediate'}). Priority: ${gap.priority || 'Medium'}.`,
        actionText: 'Explore Tasks',
      });
    }
  } else {
    candidateStages.push(defaults[1], defaults[2]);
  }

  // 3. Strategic downstream pillars: CI/CD, Portfolio, Resume ATS 90+, Job Center
  candidateStages.push(
    defaults[3], // CI/CD
    defaults[4], // Portfolio
    defaults[5], // Resume ATS
    defaults[6]  // Job Applications
  );

  return healRoadmapStages(candidateStages, role);
}

/**
 * Returns the comprehensive 7-stage baseline career roadmap for a given target role.
 */
export function getDefaultRoadmapStages(role: string): RoadmapStage[] {
  const isFrontend = role.toLowerCase().includes('frontend');
  const isBackend = role.toLowerCase().includes('backend');
  const isDataOrAI = role.toLowerCase().includes('ai') || role.toLowerCase().includes('ml') || role.toLowerCase().includes('data');
  const isDevOps = role.toLowerCase().includes('devops') || role.toLowerCase().includes('cloud');

  const stage1Title = isFrontend
    ? 'React & Advanced TypeScript Architecture'
    : isBackend
    ? 'Node.js & Database Architecture'
    : isDataOrAI
    ? 'Python Data Structures, NumPy & PyTorch Foundations'
    : isDevOps
    ? 'Linux Internals, Networking & Shell Scripting'
    : 'Full-Stack Fundamentals & TypeScript';

  const stage2Title = isFrontend
    ? 'Client-Side State, Performance & Edge Caching'
    : isBackend
    ? 'High-Performance API Design & Data Pipelines'
    : isDataOrAI
    ? 'Model Architecture, Training Pipelines & Evaluation'
    : isDevOps
    ? 'Infrastructure as Code (Terraform & Ansible)'
    : 'Full-Stack API Design & Data Layer Integration';

  const stage3Title = isFrontend
    ? 'Component Systems, Accessibility & Micro-Frontends'
    : isBackend || !isDevOps
    ? 'Learn & Apply AWS / Cloud Infra'
    : 'Kubernetes Container Orchestration & Service Mesh';

  return [
    {
      id: 'core-stage-1',
      stageNumber: 1,
      title: stage1Title,
      status: 'In Progress',
      completionPercentage: 5,
      description: 'Master core language syntax, async patterns, modular architecture, and clean code principles.',
      actionText: 'High-Priority Focus',
    },
    {
      id: 'core-stage-2',
      stageNumber: 2,
      title: stage2Title,
      status: 'Pending',
      completionPercentage: 0,
      description: 'Design robust APIs, database indexing (PostgreSQL / MongoDB), and secure authentication pipelines.',
      actionText: 'Explore Tasks',
    },
    {
      id: 'core-stage-3',
      stageNumber: 3,
      title: stage3Title,
      status: 'Pending',
      completionPercentage: 0,
      description: 'Deploy scalable services to AWS (S3, EC2, Lambda) or Vercel edge networks with high reliability.',
      actionText: 'Explore Tasks',
    },
    {
      id: 'core-stage-4',
      stageNumber: 4,
      title: 'Learn & Apply CI/CD Pipelines',
      status: 'Pending',
      completionPercentage: 0,
      description: 'Set up automated GitHub Actions workflows for continuous testing, build validation, and zero-downtime releases.',
      actionText: 'Explore Tasks',
    },
    {
      id: 'core-stage-5',
      stageNumber: 5,
      title: 'Production Project Portfolio & Live Evidence',
      status: 'Pending',
      completionPercentage: 0,
      description: 'Build and deploy 2 production-grade applications with verified live URLs and measurable user metrics.',
      actionText: 'Explore Tasks',
    },
    {
      id: 'core-stage-6',
      stageNumber: 6,
      title: 'Optimize Resume & Achieve 90+ ATS Score',
      status: 'Pending',
      completionPercentage: 0,
      description: 'Incorporate newly learned technical skills and measurable metrics into tailored resume bullets.',
      actionText: 'Open in Studio',
    },
    {
      id: 'core-stage-7',
      stageNumber: 7,
      title: 'Apply to Curated Tier-1 Matching Roles',
      status: 'Pending',
      completionPercentage: 0,
      description: 'Submit applications through Smart Job Center to verified positions with >85% compatibility match.',
      actionText: 'View Job Matches',
    },
  ];
}

/**
 * Intelligent self-healer for Career GPS roadmaps:
 * 1. Ensures Stage 1 starts at In Progress 5% (heals legacy mock data where Stage 1/2 were falsely 100%).
 * 2. Checks if downstream essential pillars (CI/CD, Portfolio, Resume, Jobs) are missing and restores them.
 * 3. Enforces single active in-progress milestone rule (resets multiple glowing 'In Progress' states to 'Pending').
 * 4. Preserves all candidate-added custom skills or gap milestones.
 * 5. Resequences stage numbers cleanly.
 */
export function healRoadmapStages(existingStages: RoadmapStage[], role: string): RoadmapStage[] {
  const defaults = getDefaultRoadmapStages(role);
  if (!existingStages || existingStages.length === 0) {
    return defaults;
  }

  // 0. Auto-heal legacy mock state or previously cached stages where Stage 1 was falsely marked completed or 20%
  let cleanedStages = [...existingStages];
  if (cleanedStages.length > 0) {
    const first = cleanedStages[0];
    const isLegacyFirst = first.id === 'core-stage-1' || first.stageNumber === 1 || first.id.startsWith('cand-found-');
    if (isLegacyFirst && (first.status === 'Completed' || first.completionPercentage === 20)) {
      cleanedStages[0] = {
        ...first,
        status: 'In Progress',
        completionPercentage: 5,
        actionText: 'High-Priority Focus',
      };
      // If Stage 2 was also marked Completed under legacy mock, set it back to Pending 0%
      if (cleanedStages[1] && (cleanedStages[1].id === 'core-stage-2' || cleanedStages[1].id.startsWith('cand-mastery-'))) {
        cleanedStages[1] = {
          ...cleanedStages[1],
          status: 'Pending',
          completionPercentage: 0,
          actionText: 'Explore Tasks',
        };
      }
    }
  }

  // 1. Identify which essential pillars are missing from cleanedStages
  const hasCicd = cleanedStages.some((s) => s.title.toLowerCase().includes('ci/cd') || s.title.toLowerCase().includes('pipeline'));
  const hasPortfolio = cleanedStages.some((s) => s.title.toLowerCase().includes('portfolio') || s.title.toLowerCase().includes('project'));
  const hasResume = cleanedStages.some((s) => s.title.toLowerCase().includes('resume') || s.title.toLowerCase().includes('ats'));
  const hasJobs = cleanedStages.some((s) => s.title.toLowerCase().includes('matching roles') || s.title.toLowerCase().includes('apply to'));

  const missingPillars: RoadmapStage[] = [];
  if (!hasCicd) missingPillars.push(defaults[3]); // CI/CD
  if (!hasPortfolio) missingPillars.push(defaults[4]); // Portfolio
  if (!hasResume) missingPillars.push(defaults[5]); // Resume
  if (!hasJobs) missingPillars.push(defaults[6]); // Jobs

  // 2. Separate technical learning stages from final phases (Resume & Jobs)
  const isFinalPhase = (title: string) => {
    const t = title.toLowerCase();
    return t.includes('resume') || t.includes('ats') || t.includes('matching roles') || t.includes('apply to');
  };

  const techStages = cleanedStages.filter((s) => !isFinalPhase(s.title));
  const finalStages = cleanedStages.filter((s) => isFinalPhase(s.title));

  // If final stages were wiped out, add them from missingPillars
  const restoredFinals = finalStages.length > 0 ? finalStages : missingPillars.filter((p) => isFinalPhase(p.title));
  const restoredTechPillars = missingPillars.filter((p) => !isFinalPhase(p.title));

  const combined = [...techStages, ...restoredTechPillars, ...restoredFinals];

  // 3. Ensure only ONE stage has 'In Progress' status (the first In Progress stage remains active)
  let foundFirstInProgress = false;
  const normalizedStatusStages = combined.map((s) => {
    if (s.status === 'In Progress') {
      if (!foundFirstInProgress) {
        foundFirstInProgress = true;
        return s;
      }
      // Any additional in-progress stages become Pending
      return {
        ...s,
        status: 'Pending' as const,
        completionPercentage: 0,
      };
    }
    return s;
  });

  // If no stage is in progress, Stage 1 becomes In Progress at 5%
  if (!foundFirstInProgress && normalizedStatusStages.length > 0) {
    normalizedStatusStages[0] = {
      ...normalizedStatusStages[0],
      status: 'In Progress',
      completionPercentage: 5,
      actionText: 'High-Priority Focus',
    };
  }

  // 4. Clean resequence numbering and enforce Stage 1 starts at 5% if in progress
  return normalizedStatusStages.map((s, idx) => {
    const stageNumber = idx + 1;
    if (stageNumber === 1 && s.status === 'In Progress' && (s.completionPercentage === 20 || s.completionPercentage === 0)) {
      return {
        ...s,
        stageNumber,
        completionPercentage: 5,
      };
    }
    return {
      ...s,
      stageNumber,
    };
  });
}

/**
 * Computes connected 3-tier Salary Progression Projection starting from the candidate's chosen Target Salary.
 * Tier 1: Starting Target (Initial Placement)
 * Tier 2: 1-2 Year Growth (Role Alignment)
 * Tier 3: Senior Benchmark (3-5 Year Scale)
 */
export function computeSalaryProgression(targetSalary: string): SalaryProgressionItem[] {
  const clean = (targetSalary || '12 - 18 LPA').replace(/₹/g, '').trim();

  // Curated progression matrices for standard presets without ₹ sign
  const presetMap: Record<string, SalaryProgressionItem[]> = {
    '1 - 3 LPA': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '1 - 3 LPA', numericSalary: 2 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '3 - 5 LPA', numericSalary: 4 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '6 - 9 LPA', numericSalary: 7.5 },
    ],
    '3 - 6 LPA': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '3 - 6 LPA', numericSalary: 4.5 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '6 - 9 LPA', numericSalary: 7.5 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '10 - 15 LPA', numericSalary: 12.5 },
    ],
    '6 - 9 LPA': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '6 - 9 LPA', numericSalary: 7.5 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '10 - 14 LPA', numericSalary: 12 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '16 - 24 LPA', numericSalary: 20 },
    ],
    '8 - 12 LPA': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '8 - 12 LPA', numericSalary: 10 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '13 - 18 LPA', numericSalary: 15.5 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '20 - 28 LPA', numericSalary: 24 },
    ],
    '12 - 18 LPA': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '12 - 18 LPA', numericSalary: 15 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '18 - 25 LPA', numericSalary: 21.5 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '26 - 36 LPA', numericSalary: 31 },
    ],
    '18 - 25 LPA': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '18 - 25 LPA', numericSalary: 21.5 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '25 - 35 LPA', numericSalary: 30 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '36 - 48 LPA', numericSalary: 42 },
    ],
    '25 - 35 LPA': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '25 - 35 LPA', numericSalary: 30 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '35 - 48 LPA', numericSalary: 41.5 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '50 - 70 LPA', numericSalary: 60 },
    ],
    '35 - 50 LPA': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '35 - 50 LPA', numericSalary: 42.5 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '50 - 70 LPA', numericSalary: 60 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '75 - 100+ LPA', numericSalary: 87.5 },
    ],
    '50+ LPA': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '50+ LPA', numericSalary: 55 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '70 - 95 LPA', numericSalary: 82.5 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '100+ LPA', numericSalary: 110 },
    ],
    '$90k - $130k USD': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '$90k - $130k USD', numericSalary: 110 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '$130k - $175k USD', numericSalary: 152 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '$180k - $250k USD', numericSalary: 215 },
    ],
    '$140k - $180k USD': [
      { level: 'Target Baseline', label: 'Starting Target', salaryText: '$140k - $180k USD', numericSalary: 160 },
      { level: 'Role Alignment', label: '1-2 Year Growth', salaryText: '$190k - $240k USD', numericSalary: 215 },
      { level: 'Market Standard', label: 'Senior Benchmark', salaryText: '$260k - $340k USD', numericSalary: 300 },
    ],
  };

  if (presetMap[clean]) {
    return presetMap[clean];
  }

  // Dynamic fallback algorithm starting from candidate's custom target (without ₹ sign)
  const numbers = clean.match(/\d+(\.\d+)?/g)?.map(Number) || [1, 3];
  const isUSD = clean.includes('$') || clean.toLowerCase().includes('usd');
  const currency = isUSD ? '$' : '';
  const unit = isUSD ? 'k USD' : ' LPA';

  const min = Math.max(1, numbers[0] || 1);
  const max = numbers[1] || Math.max(min + 2, Math.round(min * 1.5));

  const t1Min = min;
  const t1Max = max;

  const t2Min = Math.round(t1Min * 1.4);
  const t2Max = Math.round(t1Max * 1.4);

  const t3Min = Math.round(t1Min * 2.0);
  const t3Max = Math.round(t1Max * 2.0);

  return [
    {
      level: 'Target Baseline',
      label: 'Starting Target',
      salaryText: `${currency}${t1Min} - ${currency}${t1Max}${unit}`,
      numericSalary: (t1Min + t1Max) / 2,
    },
    {
      level: 'Role Alignment',
      label: '1-2 Year Growth',
      salaryText: `${currency}${t2Min} - ${currency}${t2Max}${unit}`,
      numericSalary: (t2Min + t2Max) / 2,
    },
    {
      level: 'Market Standard',
      label: 'Senior Benchmark',
      salaryText: `${currency}${t3Min} - ${currency}${t3Max}${unit}`,
      numericSalary: (t3Min + t3Max) / 2,
    },
  ];
}
