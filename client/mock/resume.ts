import { ResumeAnalysisData } from '@/types/resume';

export const mockResumeAnalysis: ResumeAnalysisData = {
  activeResumeName: 'Alex_Rivera_Senior_FullStack_Resume_2026.pdf',
  lastUpdated: '2026-08-28',
  overallAtsScore: 86,
  breakdown: {
    formattingScore: 92,
    keywordMatchScore: 84,
    brevityScore: 88,
    impactStatementsScore: 80,
  },
  atsCompatibility: [
    { system: 'Greenhouse', compatibilityPercentage: 92, status: 'Optimal' },
    { system: 'Lever', compatibilityPercentage: 88, status: 'Optimal' },
    { system: 'Workday', compatibilityPercentage: 79, status: 'Moderate' },
    { system: 'Taleo', compatibilityPercentage: 85, status: 'Optimal' },
  ],
  categoryKeywordMatches: [
    { category: 'Frontend', matchedCount: 8, totalRequired: 8, matchPercentage: 100, matchedSkills: ['React 19', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'Redux', 'HTML5/CSS3'] },
    { category: 'Backend & APIs', matchedCount: 6, totalRequired: 7, matchPercentage: 86, matchedSkills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'GraphQL', 'REST Architecture'] },
    { category: 'Cloud & Infrastructure', matchedCount: 4, totalRequired: 6, matchPercentage: 67, matchedSkills: ['AWS', 'Docker', 'Vercel Deployment', 'Linux'] },
    { category: 'DevOps & Tooling', matchedCount: 3, totalRequired: 5, matchPercentage: 60, matchedSkills: ['Git/GitHub', 'Postman', 'Webpack'] },
    { category: 'AI & Data Systems', matchedCount: 3, totalRequired: 4, matchPercentage: 75, matchedSkills: ['PyTorch', 'Generative AI', 'Vector DBs'] },
  ],
  missingKeywords: [
    { skill: 'CI/CD Pipelines', category: 'DevOps', importance: 'High', suggestedSection: 'Work Experience / Acme Cloud Corp' },
    { skill: 'Kubernetes (K8s)', category: 'Cloud', importance: 'High', suggestedSection: 'Technical Skills' },
    { skill: 'Microservices Architecture', category: 'Backend', importance: 'Medium', suggestedSection: 'Professional Summary' },
    { skill: 'Terraform / IaC', category: 'Cloud', importance: 'Low', suggestedSection: 'Technical Skills' },
  ],
  recommendations: [
    {
      id: 'rec-1',
      type: 'critical',
      title: 'Add Quantifiable Metric to Acme Cloud Corp Experience',
      description: 'Your second bullet under Acme Cloud mentions leading migration. Adding percentage improvement (e.g. "reduced build times by 35%") will boost your impact score.',
      targetSection: 'Experience',
    },
    {
      id: 'rec-2',
      type: 'warning',
      title: 'Include CI/CD & Automated Deployment Keyword',
      description: 'Senior Full Stack postings frequently screen for CI/CD. Adding GitHub Actions or GitLab CI to your tools list will increase match rate by ~6%.',
      targetSection: 'Skills',
    },
    {
      id: 'rec-3',
      type: 'suggestion',
      title: 'Shorten Summary Statement by 1 Line',
      description: 'Your executive summary is currently 4 lines. Compressing it to 3 lines improves quick recruiter scan readability.',
      targetSection: 'Summary',
    },
  ],
};
