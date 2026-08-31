import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { JobModel } from "./models/Job.model";
import { JobSourceType, JobStatus, CompetencyImportance } from "../core/constants/enums";

const seedJobsData = [
  {
    title: "Senior Full-Stack Engineer (React & Node.js)",
    companyName: "Nexus Cloud Systems",
    description: "We are seeking a Senior Full-Stack Engineer to architect, build, and scale high-throughput cloud dashboards and microservices. You will work across modern React, Next.js, TypeScript, Node.js, and MongoDB/PostgreSQL backends.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Remote",
    rawLocation: "Remote (India / Global)",
    location: { city: "Bengaluru", state: "Karnataka", country: "India", raw: "Remote • Bengaluru, India" },
    minExperienceYears: 3,
    salary: { min: 2200000, max: 3200000, currency: "INR", raw: "₹22–32 LPA" },
    rawSalary: "₹22–32 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    requiredSkills: [
      { name: "React", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "Node.js", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "TypeScript", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "Next.js", requiredLevel: 3, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "MongoDB", requiredLevel: 3, importance: CompetencyImportance.MEDIUM, minYearsOfExperience: 2 },
      { name: "Tailwind CSS", requiredLevel: 3, importance: CompetencyImportance.MEDIUM, minYearsOfExperience: 1 },
    ],
  },
  {
    title: "AI Solutions & Backend Engineer",
    companyName: "Aetheria Intelligence",
    description: "Join our core AI team to build real-time agent pipelines, vector search integration, and scalable LLM orchestration microservices using Python, Node.js, and Redis.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Hybrid",
    rawLocation: "Hyderabad, Telangana (Hybrid)",
    location: { city: "Hyderabad", state: "Telangana", country: "India", raw: "Hyderabad, India" },
    minExperienceYears: 2,
    salary: { min: 1800000, max: 2800000, currency: "INR", raw: "₹18–28 LPA" },
    rawSalary: "₹18–28 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    requiredSkills: [
      { name: "Python", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "Node.js", requiredLevel: 3, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "TypeScript", requiredLevel: 3, importance: CompetencyImportance.HIGH, minYearsOfExperience: 1 },
      { name: "Docker", requiredLevel: 3, importance: CompetencyImportance.MEDIUM, minYearsOfExperience: 1 },
      { name: "FastAPI", requiredLevel: 3, importance: CompetencyImportance.HIGH, minYearsOfExperience: 1 },
    ],
  },
  {
    title: "Frontend Platform Engineer",
    companyName: "Hyperion Digital",
    description: "Looking for a Frontend Specialist passionate about UI architecture, micro-interactions, web performance, and state management in Next.js 15+ and Tailwind CSS.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Remote",
    rawLocation: "Remote (Anywhere in India)",
    location: { city: "Remote", country: "India", raw: "Remote, India" },
    minExperienceYears: 2,
    salary: { min: 1500000, max: 2400000, currency: "INR", raw: "₹15–24 LPA" },
    rawSalary: "₹15–24 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    requiredSkills: [
      { name: "React", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "Next.js", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "TypeScript", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "Tailwind CSS", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "Framer Motion", requiredLevel: 3, importance: CompetencyImportance.MEDIUM, minYearsOfExperience: 1 },
    ],
  },
  {
    title: "DevOps & Cloud Infrastructure Engineer",
    companyName: "StrataScale Cloud",
    description: "Help scale our multi-region Kubernetes clusters, CI/CD automated deployment pipelines, and cloud observability stack on AWS and GCP.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Remote",
    rawLocation: "Bengaluru, Karnataka (Remote)",
    location: { city: "Bengaluru", state: "Karnataka", country: "India", raw: "Bengaluru, India" },
    minExperienceYears: 3,
    salary: { min: 2000000, max: 3500000, currency: "INR", raw: "₹20–35 LPA" },
    rawSalary: "₹20–35 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    requiredSkills: [
      { name: "Docker", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "Kubernetes", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "AWS", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "CI/CD", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "Terraform", requiredLevel: 3, importance: CompetencyImportance.MEDIUM, minYearsOfExperience: 1 },
    ],
  },
  {
    title: "Junior Backend Developer (Node.js & Express)",
    companyName: "Vanguard Tech Labs",
    description: "Great entry/early career opportunity to work on RESTful APIs, database schema design, and secure authentication workflows alongside senior software architects.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "On-site",
    rawLocation: "Pune, Maharashtra (On-site)",
    location: { city: "Pune", state: "Maharashtra", country: "India", raw: "Pune, India" },
    minExperienceYears: 0,
    salary: { min: 600000, max: 1000000, currency: "INR", raw: "₹6–10 LPA" },
    rawSalary: "₹6–10 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    requiredSkills: [
      { name: "JavaScript", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 1 },
      { name: "Node.js", requiredLevel: 3, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 1 },
      { name: "Express", requiredLevel: 3, importance: CompetencyImportance.HIGH, minYearsOfExperience: 1 },
      { name: "MongoDB", requiredLevel: 3, importance: CompetencyImportance.HIGH, minYearsOfExperience: 1 },
      { name: "Git", requiredLevel: 3, importance: CompetencyImportance.MEDIUM, minYearsOfExperience: 1 },
    ],
  },
  {
    title: "Lead Full-Stack Architect",
    companyName: "OmniCore Global",
    description: "Drive technical architecture, lead engineering squads, and design enterprise microservices and event-driven architectures with high availability SLAs.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Hybrid",
    rawLocation: "Mumbai, Maharashtra (Hybrid)",
    location: { city: "Mumbai", state: "Maharashtra", country: "India", raw: "Mumbai, India" },
    minExperienceYears: 5,
    salary: { min: 3500000, max: 5500000, currency: "INR", raw: "₹35–55 LPA" },
    rawSalary: "₹35–55 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(),
    requiredSkills: [
      { name: "System Design", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 5 },
      { name: "Node.js", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 5 },
      { name: "React", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 4 },
      { name: "TypeScript", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 4 },
      { name: "AWS", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 3 },
    ],
  },
];

async function seedJobs() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in environment");
    process.exit(1);
  }

  console.log("[Seeder] Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("[Seeder] Connected!");

  const existingCount = await JobModel.countDocuments();
  console.log(`[Seeder] Current jobs count in database: ${existingCount}`);

  if (existingCount === 0) {
    console.log("[Seeder] Inserting initial production job listings...");
    const created = await JobModel.insertMany(seedJobsData);
    console.log(`[Seeder] Successfully seeded ${created.length} live jobs into MongoDB Atlas!`);
  } else {
    console.log("[Seeder] Jobs already exist. Adding any missing sample jobs...");
    for (const jobData of seedJobsData) {
      const exists = await JobModel.findOne({ title: jobData.title, companyName: jobData.companyName });
      if (!exists) {
        await JobModel.create(jobData);
        console.log(`[Seeder] Added job: ${jobData.title}`);
      }
    }
  }

  const finalCount = await JobModel.countDocuments();
  console.log(`[Seeder] Final active jobs count in MongoDB: ${finalCount}`);

  await mongoose.disconnect();
  console.log("[Seeder] Done!");
}

seedJobs().catch((err) => {
  console.error("[Seeder] Error:", err);
  process.exit(1);
});
