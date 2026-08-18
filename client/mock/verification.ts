import { SkillVerificationRecord } from '@/types/verification';

export const mockVerificationRecords: SkillVerificationRecord[] = [
  {
    id: 'ver-001',
    skillName: 'React 19 & App Router',
    category: 'Frontend Development',
    applicantName: 'Alex Rivera',
    score: 98,
    maxScore: 100,
    status: 'verified',
    verifiedDate: '2026-08-01',
    submittedDate: '2026-07-30',
    assessor: 'Skillezo Autonomous AI Engine v4',
    credentialHash: '0x8f92a41d90c0b31e77f2',
    details: 'Evaluated production-ready React 19 Server Components, custom hook lifecycle management, and SSR state synchronization.'
  },
  {
    id: 'ver-002',
    skillName: 'TypeScript Strict Architecture',
    category: 'Software Engineering',
    applicantName: 'Alex Rivera',
    score: 94,
    maxScore: 100,
    status: 'verified',
    verifiedDate: '2026-07-28',
    submittedDate: '2026-07-25',
    assessor: 'Skillezo Autonomous AI Engine v4',
    credentialHash: '0x7e11b34c20d1f42a98e1',
    details: 'Analyzed complex generic constraints, mapped types, conditional infer models, and zero implicit any policy.'
  },
  {
    id: 'ver-003',
    skillName: 'Distributed Systems & Microservices',
    category: 'System Architecture',
    applicantName: 'Alex Rivera',
    score: 89,
    maxScore: 100,
    status: 'verified',
    verifiedDate: '2026-07-15',
    submittedDate: '2026-07-10',
    assessor: 'Skillezo Senior Reviewer Board',
    credentialHash: '0x4c99e12a80f3d99b12c4',
    details: 'Verified event-driven messaging, circuit breaker fault tolerance, and eventual consistency database patterns.'
  },
  {
    id: 'ver-004',
    skillName: 'GraphQL API & Schema Federation',
    category: 'Backend Development',
    applicantName: 'Alex Rivera',
    score: 0,
    maxScore: 100,
    status: 'pending',
    submittedDate: '2026-08-04',
    assessor: 'Skillezo Autonomous AI Engine v4',
    details: 'Currently undergoing automated benchmark testing and latency analysis.'
  },
  {
    id: 'ver-005',
    skillName: 'Kubernetes Cluster Orchestration',
    category: 'DevOps & Infrastructure',
    applicantName: 'Alex Rivera',
    score: 62,
    maxScore: 100,
    status: 'failed',
    submittedDate: '2026-06-12',
    assessor: 'Skillezo Autonomous AI Engine v4',
    details: 'Did not achieve minimum passing threshold (75/100) on auto-scaling and ingress security policies.'
  },
  {
    id: 'ver-006',
    skillName: 'PostgreSQL Query Optimization',
    category: 'Database Administration',
    applicantName: 'Alex Rivera',
    score: 0,
    maxScore: 100,
    status: 'in_review',
    submittedDate: '2026-08-05',
    assessor: 'Skillezo Peer Reviewer Panel',
    details: 'Submission queued for peer architecture review.'
  }
];
