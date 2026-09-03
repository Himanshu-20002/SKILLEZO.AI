import { ResumeAnalysisData } from '@/types/resume';

export const mockResumeAnalysis: ResumeAnalysisData = {
  overallScore: 86,
  atsScore: 88,
  impactScore: 82,
  brevityScore: 90,
  extractedData: {
    fileName: 'Alex_Rivera_Senior_FullStack_Resume_2026.pdf',
    candidateName: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    summary: 'Senior Full Stack Engineer with 6+ years of experience in React, Next.js, Node.js and AWS.',
    skillsExtracted: ['React 19', 'Next.js 15', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    totalExperienceYears: 6,
  },
  atsCompatibility: [
    { system: 'Greenhouse', compatibilityScore: 92, status: 'High Match' },
    { system: 'Lever', compatibilityScore: 88, status: 'High Match' },
    { system: 'Workday', compatibilityScore: 79, status: 'Moderate Match' },
    { system: 'Taleo', compatibilityScore: 85, status: 'High Match' },
  ],
  keywords: [
    { keyword: 'React 19 & Next.js', category: 'Frontend', matched: true, frequency: 6, importance: 'Required' },
    { keyword: 'TypeScript', category: 'Frontend', matched: true, frequency: 5, importance: 'Required' },
    { keyword: 'Node.js & Express', category: 'Backend', matched: true, frequency: 4, importance: 'Required' },
    { keyword: 'PostgreSQL & MongoDB', category: 'Database', matched: true, frequency: 3, importance: 'Preferred' },
    { keyword: 'AWS Cloud Architecture', category: 'DevOps', matched: true, frequency: 3, importance: 'Preferred' },
    { keyword: 'CI/CD Pipelines (GitHub Actions)', category: 'DevOps', matched: false, frequency: 0, importance: 'Required' },
    { keyword: 'Docker & Kubernetes', category: 'DevOps', matched: false, frequency: 1, importance: 'Preferred' },
  ],
  missingSkills: [
    { skill: 'CI/CD Pipelines', category: 'DevOps', impactLevel: 'High', recommendation: 'Add automated testing & deployment workflow to experience section.' },
    { skill: 'Kubernetes (K8s)', category: 'Cloud', impactLevel: 'High', recommendation: 'Highlight container orchestration in technical skills list.' },
    { skill: 'Microservices Architecture', category: 'Backend', impactLevel: 'Medium', recommendation: 'Mention distributed service boundary design in professional summary.' },
  ],
  recommendations: [
    {
      id: 'rec-1',
      title: 'Add Quantifiable Metric to Experience',
      category: 'Impact Statements',
      description: 'Your second bullet under Acme Cloud mentions leading migration. Adding percentage improvement (e.g. "reduced build times by 35%") will boost impact score.',
      impactScoreBoost: 6,
      actionText: 'Optimize Experience',
    },
    {
      id: 'rec-2',
      title: 'Include CI/CD & Automated Deployment Keyword',
      category: 'Keywords',
      description: 'Senior Full Stack postings frequently screen for CI/CD. Adding GitHub Actions or GitLab CI to your tools list will increase match rate by ~6%.',
      impactScoreBoost: 5,
      actionText: 'Add Keyword',
    },
    {
      id: 'rec-3',
      title: 'Shorten Summary Statement by 1 Line',
      category: 'Brevity',
      description: 'Your executive summary is currently 4 lines. Compressing it to 3 lines improves quick recruiter scan readability.',
      impactScoreBoost: 3,
      actionText: 'Refine Summary',
    },
  ],
};
