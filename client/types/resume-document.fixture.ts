import { ResumeDocument } from "./resume-document";

export const SAMPLE_RESUME_DOCUMENT_FIXTURE: ResumeDocument = {
  id: "doc_himanshu_sample_01",
  userId: "user_himanshu_20002",
  title: "Himanshu Kumar — Full Stack Engineer Master Resume",

  contact: {
    fullName: "Himanshu Kumar",
    email: "himanshu@skillezo.ai",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/webuxhimanshu" },
      { label: "GitHub", url: "https://github.com/Himanshu-20002" },
      { label: "Portfolio", url: "https://himanshu.dev" },
    ],
  },

  summary: {
    text: "Product-minded Full-Stack Engineer with 3+ years of experience designing high-throughput TypeScript, Next.js, and Node.js microservices. Proven track record in building AI-powered SaaS platforms and reducing API latency by 40%.",
    targetRole: "Full-Stack Engineer",
    yearsOfExperience: 3.5,
  },

  skills: [
    { id: "sk_01", name: "TypeScript", category: "LANGUAGE", proficiency: "EXPERT", evidenceIds: ["ev_ts_01"] },
    { id: "sk_02", name: "React", category: "FRONTEND", proficiency: "EXPERT", evidenceIds: ["ev_react_01"] },
    { id: "sk_03", name: "Next.js", category: "FRONTEND", proficiency: "EXPERT", evidenceIds: ["ev_next_01"] },
    { id: "sk_04", name: "Node.js", category: "BACKEND", proficiency: "ADVANCED", evidenceIds: ["ev_node_01"] },
    { id: "sk_05", name: "MongoDB", category: "DATABASE", proficiency: "ADVANCED", evidenceIds: ["ev_mongo_01"] },
    { id: "sk_06", name: "PostgreSQL", category: "DATABASE", proficiency: "INTERMEDIATE", evidenceIds: ["ev_pg_01"] },
    { id: "sk_07", name: "Docker", category: "DEVOPS", proficiency: "INTERMEDIATE", evidenceIds: ["ev_docker_01"] },
    { id: "sk_08", name: "Tailwind CSS", category: "FRONTEND", proficiency: "EXPERT", evidenceIds: ["ev_tailwind_01"] },
    { id: "sk_09", name: "Redis", category: "DATABASE", proficiency: "INTERMEDIATE", evidenceIds: ["ev_redis_01"] },
    { id: "sk_10", name: "REST APIs", category: "BACKEND", proficiency: "EXPERT", evidenceIds: ["ev_rest_01"] },
  ],

  experience: [
    {
      id: "exp_01",
      companyName: "Skillezo AI Tech",
      jobTitle: "Senior Full Stack Engineer",
      location: "Bangalore, India",
      startDate: "2023-01",
      endDate: "Present",
      isCurrent: true,
      technologiesUsed: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS"],
      bullets: [
        {
          id: "exp_01_b1",
          text: "Architected enterprise AI resume analytics engine evaluating candidate skill profiles against real market benchmarks in <15ms.",
          verbs: ["Architected", "Evaluated"],
          metrics: ["<15ms"],
          evidenceIds: ["ev_exp_01_1"],
        },
        {
          id: "exp_01_b2",
          text: "Engineered scalable Job Center pagination with server-side caching, supporting 10,000+ live job listings with zero layout shifts.",
          verbs: ["Engineered"],
          metrics: ["10,000+"],
          evidenceIds: ["ev_exp_01_2"],
        },
        {
          id: "exp_01_b3",
          text: "Integrated live Google Gemini 2.5 Flash provider with strict Zod structured outputs, eliminating hallucinations in bullet optimizations.",
          verbs: ["Integrated", "Eliminating"],
          evidenceIds: ["ev_exp_01_3"],
        },
      ],
    },
    {
      id: "exp_02",
      companyName: "Nexus Digital Cloud",
      jobTitle: "Full Stack Developer",
      location: "New Delhi, India",
      startDate: "2021-06",
      endDate: "2022-12",
      isCurrent: false,
      technologiesUsed: ["React", "Express", "PostgreSQL", "Docker", "Redis"],
      bullets: [
        {
          id: "exp_02_b1",
          text: "Developed responsive React interfaces and built RESTful Express microservices handling 250,000 daily API requests.",
          verbs: ["Developed", "Built"],
          metrics: ["250,000 daily"],
          evidenceIds: ["ev_exp_02_1"],
        },
        {
          id: "exp_02_b2",
          text: "Optimized database query indexing on PostgreSQL, cutting average p99 response times from 420ms to 85ms.",
          verbs: ["Optimized", "Cutting"],
          metrics: ["420ms to 85ms"],
          evidenceIds: ["ev_exp_02_2"],
        },
      ],
    },
  ],

  projects: [
    {
      id: "proj_01",
      title: "SKILLEZO.AI Career Intelligence Platform",
      subtitle: "Enterprise Candidate Career GPS & Employability Index",
      description: "AI-powered candidate portal benchmarking resumes against live hiring market data with deterministic scoring and live bullet optimization.",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Mongoose", "Gemini 2.5 Flash"],
      link: "https://skillezo.vercel.app",
      repoUrl: "https://github.com/skilledhyre22/SKILLEZO",
      bullets: [
        "Built modular 7-phase intelligence pipeline delivering instant ATS compatibility, skill gap detection, and impact evaluation.",
        "Deployed high-performance client on Vercel Edge Network and Express API on Railway.",
      ],
    },
    {
      id: "proj_02",
      title: "Airwave Multimodal Logistics Engine",
      subtitle: "Real-time International Freight Quotation & Container Tracking",
      description: "End-to-end logistics platform providing real-time sea and air freight calculator, customs tracking, and automated schedule queries.",
      technologies: ["Next.js 15", "React", "TypeScript", "Tailwind CSS"],
      link: "https://airwave.global",
      bullets: [
        "Engineered instant volumetric weight calculator for air and ocean LCL shipments with real-time currency conversion.",
      ],
    },
  ],

  education: [
    {
      id: "edu_01",
      institution: "Delhi Technological University (DTU)",
      degree: "Bachelor of Technology (B.Tech)",
      fieldOfStudy: "Computer Science and Engineering",
      startDate: "2017-08",
      endDate: "2021-05",
      gradeOrGpa: "8.8 / 10.0 CGPA",
      honors: ["Dean's Merit List", "First Class with Distinction"],
    },
  ],

  achievements: [
    {
      id: "ach_01",
      title: "1st Place Winner — National Hackathon 2022",
      issuer: "Ministry of Electronics and Information Technology",
      date: "2022-04",
      description: "Developed decentralized credential verification platform for academic institutions with zero-knowledge proofs.",
      url: "https://hackathon.gov.in/winners/2022",
    },
    {
      id: "ach_02",
      title: "AWS Certified Solutions Architect — Associate",
      issuer: "Amazon Web Services",
      date: "2023-08",
      url: "https://aws.amazon.com/verification",
    },
  ],

  evidence: [
    {
      id: "ev_ts_01",
      type: "SKILL",
      source: "CONFIRMED",
      value: "TypeScript",
      confidence: 1.0,
      verified: true,
      sectionId: "skills",
      itemId: "sk_01",
      createdAt: "2026-09-10T12:00:00Z",
    },
    {
      id: "ev_react_01",
      type: "SKILL",
      source: "CONFIRMED",
      value: "React",
      confidence: 1.0,
      verified: true,
      sectionId: "skills",
      itemId: "sk_02",
      createdAt: "2026-09-10T12:00:00Z",
    },
  ],

  targetRole: "Full-Stack Engineer",
  targetJobDescription: "Senior Full-Stack Engineer seeking strong proficiency in React, TypeScript, Next.js, and Node.js microservices with distributed database experience.",

  templateConfig: {
    templateId: "modern",
    primaryColor: "#3D5AFE",
    fontFamily: "Inter, sans-serif",
    fontSize: "regular",
    margins: "normal",
  },

  scores: {
    overall: {
      overallScore: 84,
      atsReadiness: 91,
      jobMatch: 82,
      contentQuality: 80,
      impactScore: 78,
      calculatedAt: "2026-09-10T12:00:00Z",
    },
    sections: {
      contact: {
        score: 100,
        status: "OPTIMIZED",
        strengths: ["All required contact fields provided", "Valid LinkedIn and GitHub URLs attached"],
        weaknesses: [],
        suggestionsCount: 0,
      },
      summary: {
        score: 88,
        status: "OPTIMIZED",
        strengths: ["Clear target role statement", "Quantified performance achievements included"],
        weaknesses: [],
        suggestionsCount: 0,
      },
      skills: {
        score: 92,
        status: "OPTIMIZED",
        strengths: ["Strong modern full-stack coverage (TypeScript, React, Next.js, Node.js)", "Zero duplicate skills"],
        weaknesses: [],
        suggestionsCount: 0,
      },
      experience: {
        score: 82,
        status: "OPTIMIZED",
        strengths: ["Active action verbs on every bullet", "Quantifiable metrics and latency benchmarks"],
        weaknesses: ["Can expand business impact on Nexus Digital Cloud"],
        suggestionsCount: 1,
      },
      projects: {
        score: 86,
        status: "OPTIMIZED",
        strengths: ["Live URLs and repositories provided", "Clear technology stack definition"],
        weaknesses: [],
        suggestionsCount: 0,
      },
      education: {
        score: 95,
        status: "OPTIMIZED",
        strengths: ["Accredited institution", "Complete dates and degree specification"],
        weaknesses: [],
        suggestionsCount: 0,
      },
      achievements: {
        score: 85,
        status: "OPTIMIZED",
        strengths: ["Verified hackathon and industry AWS certification"],
        weaknesses: [],
        suggestionsCount: 0,
      },
    },
  },

  currentVersion: {
    versionId: "ver_himanshu_v1",
    versionNumber: 1,
    name: "Initial Master Import",
    createdAt: "2026-09-10T12:00:00Z",
    changeSummary: "Parsed from PDF upload and verified with canonical catalog",
  },
  versions: [
    {
      versionId: "ver_himanshu_v1",
      versionNumber: 1,
      name: "Initial Master Import",
      createdAt: "2026-09-10T12:00:00Z",
      changeSummary: "Parsed from PDF upload and verified with canonical catalog",
    },
  ],

  schemaVersion: "1.0.0",
  isMaster: true,
  createdAt: "2026-09-10T12:00:00Z",
  updatedAt: "2026-09-10T12:00:00Z",
};
