import { ResumeAnalysisData } from '@/types/resume';

export const mockResumeAnalysis: ResumeAnalysisData = {
  overallScore: 86,
  atsScore: 91,
  impactScore: 84,
  brevityScore: 88,
  extractedData: {
    fileName: 'Alex_Rivera_Senior_FullStack_Resume.pdf',
    fileSize: '1.4 MB',
    uploadedAt: '2026-08-01',
    candidateName: 'Alex Rivera',
    email: 'alex.rivera@skillezo.ai',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    summary: 'Results-driven Senior Full Stack Engineer with 6+ years of experience building high-throughput microservices, Next.js web applications, and AI workflow integrations.',
    skillsExtracted: [
      'React 19', 'Next.js 15', 'TypeScript', 'Node.js', 'PostgreSQL',
      'Tailwind CSS', 'GraphQL', 'Docker', 'REST APIs', 'Jest'
    ],
    experienceCount: 2,
    educationCount: 1,
  },
  atsCompatibility: [
    { system: 'Greenhouse', compatibilityScore: 94, status: 'High Match' },
    { system: 'Lever', compatibilityScore: 92, status: 'High Match' },
    { system: 'Workday', compatibilityScore: 88, status: 'High Match' },
    { system: 'Taleo', compatibilityScore: 82, status: 'Moderate Match' },
  ],
  keywords: [
    { keyword: 'Next.js / React 19', category: 'Frontend', matched: true, frequency: 8, importance: 'Required' },
    { keyword: 'TypeScript', category: 'Backend', matched: true, frequency: 12, importance: 'Required' },
    { keyword: 'Node.js & Express', category: 'Backend', matched: true, frequency: 6, importance: 'Required' },
    { keyword: 'PostgreSQL', category: 'Database', matched: true, frequency: 4, importance: 'Required' },
    { keyword: 'Microservices Architecture', category: 'Backend', matched: true, frequency: 3, importance: 'Preferred' },
    { keyword: 'CI/CD Pipelines', category: 'DevOps', matched: false, frequency: 0, importance: 'Required' },
    { keyword: 'Kubernetes Cluster', category: 'DevOps', matched: false, frequency: 0, importance: 'Preferred' },
    { keyword: 'Redis Caching', category: 'Database', matched: true, frequency: 2, importance: 'Preferred' },
    { keyword: 'Agile & Scrum', category: 'Soft Skill', matched: true, frequency: 3, importance: 'Optional' },
  ],
  missingSkills: [
    { skill: 'CI/CD Pipelines (GitHub Actions / GitLab)', category: 'DevOps', impactLevel: 'High', recommendation: 'Add automated build & deployment workflow bullet points to recent NexusCloud experience.' },
    { skill: 'Kubernetes Container Orchestration', category: 'DevOps', impactLevel: 'Medium', recommendation: 'Include k8s deployment configuration examples or complete the Skillezo Docker/k8s audit.' },
    { skill: 'Unit Test Coverage Metrics (Jest / Cypress)', category: 'Testing', impactLevel: 'Medium', recommendation: 'Quantify test coverage % in bullet points (e.g. "Maintained 95%+ test coverage").' },
  ],
  recommendations: [
    {
      id: 'rec-1',
      title: 'Quantify Engineering Impact in Apex Labs experience',
      category: 'Impact Statements',
      description: 'Replace generic job duties with metric-driven accomplishments (e.g., "Improved page load latency by 42% across 200k daily users").',
      impactScoreBoost: 6,
      actionText: 'Optimize Statements',
    },
    {
      id: 'rec-2',
      title: 'Add Missing CI/CD & DevOps Keywords',
      category: 'Keywords',
      description: 'Target job postings require explicit mention of GitHub Actions, Docker, and Automated Testing pipelines.',
      impactScoreBoost: 5,
      actionText: 'Add Keywords',
    },
    {
      id: 'rec-3',
      title: 'Streamline Resume Length & Section Headers',
      category: 'Formatting',
      description: 'Ensure standard single-column ATS headers (Work Experience, Technical Skills, Education) for 100% parsing accuracy.',
      impactScoreBoost: 3,
      actionText: 'Apply ATS Layout',
    },
  ],
};
