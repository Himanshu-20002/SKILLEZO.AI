import { ExtendedUserProfile } from '@/types/profile';

export const mockExtendedProfile: ExtendedUserProfile = {
  id: 'usr-101',
  name: 'Alex Rivera',
  email: 'alex.rivera@skillezo.ai',
  phone: '+1 (555) 234-5678',
  role: 'Senior Full Stack Engineer',
  headline: 'Building AI-driven Enterprise Systems | Next.js, React & Node.js Specialist',
  bio: 'Passionate software engineer with 6+ years of experience designing scalable cloud solutions, microservices, and modern web applications. Focused on automated skill verification and AI integrations.',
  location: 'San Francisco, California',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  completionPercentage: 92,
  skills: [
    { id: 'sk-1', name: 'React 19 & Next.js 15', category: 'Frontend', proficiency: 'Expert', verified: true, score: 98, verifiedAt: '2026-07-15' },
    { id: 'sk-2', name: 'TypeScript & Node.js', category: 'Language / Backend', proficiency: 'Advanced', verified: true, score: 94, verifiedAt: '2026-06-20' },
    { id: 'sk-3', name: 'Tailwind CSS & Design Systems', category: 'UI / UX', proficiency: 'Expert', verified: true, score: 96, verifiedAt: '2026-07-02' },
    { id: 'sk-4', name: 'GraphQL & REST APIs', category: 'Backend', proficiency: 'Advanced', verified: true, score: 91, verifiedAt: '2026-05-18' },
    { id: 'sk-5', name: 'PostgreSQL & Redis Caching', category: 'Database', proficiency: 'Intermediate', verified: true, score: 88, verifiedAt: '2026-04-10' },
    { id: 'sk-6', name: 'Docker & Kubernetes', category: 'DevOps', proficiency: 'Intermediate', verified: false }
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      issueDate: 'Aug 2024',
      expiryDate: 'Aug 2027',
      credentialId: 'AWS-PSA-884920',
      verificationBadge: 'AWS Enterprise Verified'
    },
    {
      id: 'cert-2',
      title: 'Skillezo Master Full-Stack Verification',
      issuer: 'Skillezo AI Network',
      issueDate: 'Jan 2025',
      credentialId: 'SKL-AI-99482',
      verificationBadge: 'Cryptographic AI Verified'
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science & Engineering',
      startYear: '2016',
      endYear: '2020',
      grade: '3.9 GPA'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'SKILLEZO AI — Enterprise Career Intelligence Platform',
      description: 'Architected a full-stack career acceleration ecosystem with ATS resume optimization, cryptographic skill verification badges, and automated 7-stage Career GPS roadmap tracking.',
      techStack: ['Next.js 15', 'React 19', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Redis'],
      githubUrl: 'https://github.com/Himanshu-20002/SKILLEZO.AI',
      liveDemoUrl: 'https://skillezo-ai.vercel.app',
      featured: true,
    },
    {
      id: 'proj-2',
      title: 'Distributed Real-Time Job Ingestion & Crawler Engine',
      description: 'High-throughput asynchronous job stream processing pipeline that ingests, deduplicates, and vector-indexes multi-source tech listings from Remotive, Arbeitnow, and custom ATS feeds.',
      techStack: ['Node.js', 'Express', 'Redis Pub/Sub', 'Docker', 'MongoDB', 'BullMQ'],
      githubUrl: 'https://github.com/Himanshu-20002/job-ingestion-worker',
      liveDemoUrl: 'https://skillezo-api.vercel.app',
      featured: true,
    },
    {
      id: 'proj-3',
      title: 'CloudScale — Microservices Orchestration & Kubernetes Mesh',
      description: 'Zero-trust service mesh architecture managing multi-region container deployments with automated canary rollouts, Prometheus telemetry dashboards, and AWS ECS Fargate autoscaling.',
      techStack: ['Kubernetes', 'Docker', 'AWS ECS', 'Terraform', 'Prometheus', 'Grafana'],
      githubUrl: 'https://github.com/Himanshu-20002/cloudscale-mesh',
      liveDemoUrl: 'https://cloudscale-demo.vercel.app',
      featured: false,
    },
    {
      id: 'proj-4',
      title: 'DevFlow — Collaborative Real-Time Code Canvas',
      description: 'Interactive developer collaboration workspace featuring CRDT-based multi-user state synchronization, WebSockets room management, and automated AST syntax parsing.',
      techStack: ['React', 'TypeScript', 'WebSockets', 'Tailwind CSS', 'PostgreSQL', 'Zustand'],
      githubUrl: 'https://github.com/Himanshu-20002/devflow-canvas',
      liveDemoUrl: 'https://devflow-canvas.vercel.app',
      featured: false,
    },
  ]
};
