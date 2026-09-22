import { IResumeExtractedData } from "@/database/models/Resume.model";

/**
 * SKILLEZO AI — CANONICAL RESUME INGESTION FIXTURES
 * Used for deterministic normalization and regression testing.
 */

export const FULL_RESUME_PARSER_OUTPUT: IResumeExtractedData = {
  personalInfo: {
    fullName: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1-555-0199",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/alexmorgan",
    github: "https://github.com/alexmorgan",
    portfolio: "https://alexmorgan.dev",
  },
  summary: "Senior Full-Stack Engineer with 6+ years of experience architecting microservices and leading cloud migration initiatives.",
  totalExperienceYears: 6,
  skills: [
    { name: "TypeScript", category: "Language" },
    { name: "React", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "PostgreSQL", category: "Database" },
    { name: "Docker", category: "DevOps" },
    { name: "AWS", category: "Cloud" },
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "B.S. in Computer Science",
      fieldOfStudy: "Computer Science",
      startYear: 2014,
      endYear: 2018,
    },
  ],
  experience: [
    {
      companyName: "Acme Cloud Corp",
      jobTitle: "Senior Software Engineer",
      startDate: new Date("2021-03-01"),
      endDate: null,
      isCurrent: true,
      description: "Spearheaded the migration of monolithic services to event-driven microservices. Reduced server latency by 42% across 12 microservices. Automated CI/CD pipelines deploying over 50 times per week.",
    },
    {
      companyName: "Beta Systems Inc",
      jobTitle: "Software Engineer",
      startDate: new Date("2018-06-01"),
      endDate: new Date("2021-02-28"),
      isCurrent: false,
      description: "Developed customer-facing dashboards using React and TypeScript. Optimized database queries, cutting average response time from 450ms to 95ms. Collaborated with product teams to ship 8 major feature releases.",
    },
  ],
  projects: [
    {
      title: "Cloud Pulse Monitor",
      description: "Real-time telemetry and monitoring tool processing over 50,000 metrics per second.",
      technologies: ["Node.js", "Redis", "TypeScript", "Docker"],
      link: "https://cloudpulse.io",
      githubUrl: "https://github.com/alexmorgan/cloudpulse",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      issueDate: new Date("2022-05-15"),
    },
  ],
  parserVersion: "1.0.0",
};

export const PARTIAL_RESUME_PARSER_OUTPUT: IResumeExtractedData = {
  personalInfo: {
    fullName: "Morgan Taylor",
    email: "morgan.taylor@example.com",
    phone: "+1-555-8822",
    location: "Austin, TX",
  },
  summary: null,
  totalExperienceYears: null,
  skills: [
    { name: "Python", category: "Language" },
    { name: "SQL", category: "Database" },
  ],
  education: [
    {
      institution: "University of Texas",
      degree: "Bachelor of Arts in Economics",
      fieldOfStudy: "Economics",
      startYear: 2016,
      endYear: 2020,
    },
  ],
  experience: [],
  projects: [],
  certifications: [],
  parserVersion: "1.0.0",
};

export const MESSY_RESUME_PARSER_OUTPUT: IResumeExtractedData = {
  personalInfo: {
    fullName: "   Jordan   Lee  \n",
    email: " JORDAN.LEE@Example.COM ",
    phone: " +1 (555) 902-1234 ",
    location: "  New York,   NY  ",
  },
  summary: "  Professional Summary:   Experienced developer focused on high-throughput backend services and databases.   ",
  totalExperienceYears: 4,
  skills: [
    { name: "React", category: "frontend" },
    { name: "react", category: "Frontend" },
    { name: "REACT", category: "ui" },
    { name: "Node.js", category: "backend" },
    { name: "node.js", category: "Backend" },
    { name: "JavaScript", category: "lang" },
    { name: "Java", category: "lang" },
    { name: "C", category: "lang" },
    { name: "C++", category: "lang" },
  ],
  education: [
    {
      institution: "  NYU Polytechnic Institute  ",
      degree: " B.S. Computer Engineering ",
      startYear: 2017,
      endYear: 2021,
    },
  ],
  experience: [
    // Partial experience: has bullets and description, but empty companyName
    {
      companyName: "  ",
      jobTitle: "Lead Developer",
      startDate: null,
      endDate: null,
      isCurrent: true,
      description: "• Architected resilient Redis caching layer handling 100000 rps.\n* Optimized SQL queries reducing execution time by 55%.\n▪ Mentored 4 junior engineers on distributed systems best practices.",
    },
    // Another experience with messy formatting
    {
      companyName: "Tech Forward LLC",
      jobTitle: "Backend Developer",
      startDate: new Date("2021-01-01"),
      endDate: new Date("2023-06-30"),
      isCurrent: false,
      description: "- Engineered RESTful APIs serving 20k daily active users.\n- Refactored payment processing pipeline with zero downtime.",
    },
  ],
  projects: [
    {
      title: "  Async Job Queue  ",
      description: " Distributed task processor built with RabbitMQ and Go. ",
      technologies: ["Go", "RabbitMQ", "PostgreSQL"],
    },
  ],
  certifications: [],
  parserVersion: "1.0.0",
};

export const MINIMAL_RESUME_PARSER_OUTPUT: IResumeExtractedData = {
  personalInfo: {
    fullName: "Taylor Swift",
    email: "taylor.swift@example.com",
  },
  summary: null,
  totalExperienceYears: null,
  skills: [
    { name: "Creative Writing", category: "Other" },
    { name: "Public Speaking", category: "Other" },
  ],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  parserVersion: "1.0.0",
};

export const MISSING_EMAIL_OUTPUT: IResumeExtractedData = {
  personalInfo: {
    fullName: "Sam Wilson",
    phone: "+1-555-4321",
    location: "Atlanta, GA",
    email: null,
  },
  summary: "Aerospace logistics coordinator.",
  totalExperienceYears: 3,
  skills: [{ name: "Logistics", category: "Tools" }],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  parserVersion: "1.0.0",
};

export const MISSING_NAME_OUTPUT: IResumeExtractedData = {
  personalInfo: {
    fullName: null,
    email: "anonymous.dev@example.com",
    phone: "+1-555-9988",
  },
  summary: "Anonymous systems programmer.",
  totalExperienceYears: 2,
  skills: [{ name: "Rust", category: "Language" }],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  parserVersion: "1.0.0",
};

export const MALFORMED_PARSER_OUTPUT: any = {
  personalInfo: null,
  summary: 12345,
  skills: "not-an-array",
  experience: "invalid",
  education: null,
  projects: undefined,
  certifications: null,
};
