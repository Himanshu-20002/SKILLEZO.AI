import { MasterCareerIntelligence } from '@/types/career-intelligence';
import { mockExtendedProfile } from './profile';
import { mockResumeAnalysis } from './resume';

export const mockCareerIntelligence: MasterCareerIntelligence = {
  studentProfile: mockExtendedProfile,
  resumeAnalysis: mockResumeAnalysis,

  skillGapAnalysis: {
    targetRole: 'Full-Stack Engineer',
    availableRoles: ['Full-Stack Engineer', 'AI/ML Specialist', 'DevOps Engineer'],
    overallMatchScore: 72,
    skillsAcquiredCount: 14,
    skillsRequiredCount: 19,
    skillsMissingCount: 5,

    radarCategories: [
      { category: 'Frontend', currentScore: 92, requiredScore: 90 },
      { category: 'Backend', currentScore: 85, requiredScore: 88 },
      { category: 'Database', currentScore: 80, requiredScore: 85 },
      { category: 'Cloud', currentScore: 60, requiredScore: 85 },
      { category: 'DevOps', currentScore: 55, requiredScore: 80 },
      { category: 'System Design', currentScore: 65, requiredScore: 80 },
    ],

    competencies: [
      { id: 'comp-1', skill: 'React 19 & Next.js 15', category: 'Frontend', currentLevel: 'Expert', requiredLevel: 'Expert', currentNumeric: 95, requiredNumeric: 90, gap: 0, priority: 'Low', status: 'Matched' },
      { id: 'comp-2', skill: 'TypeScript & Node.js', category: 'Backend', currentLevel: 'Advanced', requiredLevel: 'Advanced', currentNumeric: 88, requiredNumeric: 85, gap: 0, priority: 'Low', status: 'Matched' },
      { id: 'comp-3', skill: 'PostgreSQL & MongoDB', category: 'Database', currentLevel: 'Advanced', requiredLevel: 'Advanced', currentNumeric: 82, requiredNumeric: 85, gap: 0, priority: 'Low', status: 'Matched' },
      { id: 'comp-4', skill: 'AWS Cloud Services', category: 'Cloud', currentLevel: 'Beginner', requiredLevel: 'Intermediate', currentNumeric: 50, requiredNumeric: 80, gap: 1, priority: 'High', status: 'Gap' },
      { id: 'comp-5', skill: 'Docker & Kubernetes', category: 'DevOps', currentLevel: 'Intermediate', requiredLevel: 'Advanced', currentNumeric: 60, requiredNumeric: 85, gap: 1, priority: 'High', status: 'Gap' },
      { id: 'comp-6', skill: 'CI/CD Pipelines (GitHub Actions)', category: 'DevOps', currentLevel: 'Beginner', requiredLevel: 'Intermediate', currentNumeric: 45, requiredNumeric: 75, gap: 1, priority: 'High', status: 'Gap' },
      { id: 'comp-7', skill: 'Scalable Microservices Design', category: 'System Design', currentLevel: 'Intermediate', requiredLevel: 'Advanced', currentNumeric: 65, requiredNumeric: 80, gap: 1, priority: 'Medium', status: 'Gap' },
    ],

    priorityRecommendations: [
      {
        skill: 'AWS Cloud Services',
        currentLevel: 'Beginner',
        requiredLevel: 'Intermediate',
        priority: 'High',
        reason: 'Essential requirement for target Full-Stack Engineer job postings.',
        suggestedAction: 'Start AWS Practitioner & Solutions Architect path in Learning Hub',
      },
      {
        skill: 'CI/CD Pipelines & GitHub Actions',
        currentLevel: 'Beginner',
        requiredLevel: 'Intermediate',
        priority: 'High',
        reason: 'Detected as missing keyword in Resume Audit.',
        suggestedAction: 'Add automated testing & deployment workflow to NexusCloud project',
      },
      {
        skill: 'Docker Container Orchestration',
        currentLevel: 'Intermediate',
        requiredLevel: 'Advanced',
        priority: 'Medium',
        reason: 'Required for microservices deployment verification.',
        suggestedAction: 'Complete Skillezo Docker Assessment test',
      },
    ],
  },

  employabilityIndex: {
    overallScore: 78,
    tierStatus: 'Top 15%',
    targetTier: 'Top 5%',
    metrics: {
      technicalReadiness: 82,
      resumeStrength: 86,
      projectStrength: 74,
      skillAlignment: 72,
      recruiterVisibility: 68,
    },
    strengths: [
      'Strong frontend & Next.js 15 capabilities (95% mastery)',
      'Verified AWS Solutions Architect credential',
      'High resume ATS match rate (91% ATS Compatibility)',
      'Relevant hands-on portfolio project experience',
    ],
    improvementAreas: [
      'Improve cloud & DevOps skills (AWS & CI/CD pipeline gaps)',
      'Add 1 production-level microservice project to portfolio',
      'Increase recruiter search visibility score (currently 68%)',
      'Complete Docker & System Design skill verification tests',
    ],
    actionList: [
      { id: 'act-1', action: 'Complete AWS Cloud skill gap closure course', priority: 'High', estimatedImpact: '+6 Employability Points' },
      { id: 'act-2', action: 'Add CI/CD pipeline deployment to recent project', priority: 'High', estimatedImpact: '+5 Employability Points' },
      { id: 'act-3', action: 'Optimize Resume ATS score from 86 to 94+', priority: 'Medium', estimatedImpact: '+4 Employability Points' },
      { id: 'act-4', action: 'Pass Skillezo Docker & Microservices Assessment', priority: 'Medium', estimatedImpact: '+3 Employability Points' },
    ],
  },

  careerRoadmap: {
    targetRole: 'Senior Full-Stack Engineer',
    targetSalary: '₹14 LPA',
    targetTimeline: '6 Months',
    currentMilestone: {
      focusTitle: 'Close Highest-Priority Cloud & DevOps Skill Gaps',
      progressPercentage: 68,
      nextAction: 'Complete AWS Fundamentals & GitHub Actions Workflow',
    },
    salaryProgression: [
      { level: 'Current', label: 'Current Level', salaryText: '₹6 LPA', numericSalary: 6 },
      { level: 'Next Target', label: 'Mid-Senior Role', salaryText: '₹9.5 LPA', numericSalary: 9.5 },
      { level: 'Target Role', label: 'Senior Full-Stack', salaryText: '₹14 LPA', numericSalary: 14 },
    ],
    stages: [
      { id: 'stg-1', stageNumber: 1, title: 'Profile Setup', status: 'Completed', completionPercentage: 100, description: 'Personal identity & career preferences completed.', actionText: 'View Profile' },
      { id: 'stg-2', stageNumber: 2, title: 'Resume Audit', status: 'In Progress', completionPercentage: 86, description: 'ATS score 86/100. Keywords & formatting audited.', actionText: 'Optimize Resume' },
      { id: 'stg-3', stageNumber: 3, title: 'Skill Verification', status: 'In Progress', completionPercentage: 74, description: '6 verified skills. Docker & Cloud pending.', actionText: 'Verify Skills' },
      { id: 'stg-4', stageNumber: 4, title: 'Skill Gap Closure', status: 'In Progress', completionPercentage: 68, description: 'Closing AWS & CI/CD pipeline gaps.', actionText: 'Continue Path' },
      { id: 'stg-5', stageNumber: 5, title: 'Portfolio Projects', status: 'In Progress', completionPercentage: 74, description: '2 projects published. 1 microservice project recommended.', actionText: 'View Projects' },
      { id: 'stg-6', stageNumber: 6, title: 'Interview Preparation', status: 'Locked', completionPercentage: 0, description: 'Mock technical interviews & system design prep.', actionText: 'Unlock Stage' },
      { id: 'stg-7', stageNumber: 7, title: 'Job Ready', status: 'Locked', completionPercentage: 0, description: 'Recruiter spotlight active. Top 5% employability index.', actionText: 'Unlock Stage' },
    ],
  },
};
