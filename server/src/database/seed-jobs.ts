import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch {
  // Use default OS settings
}

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { JobModel } from "./models/Job.model";
import { JobSourceType, JobStatus, CompetencyImportance } from "../core/constants/enums";

export const seedJobsData = [
  {
    title: "Senior Full-Stack Engineer (React & Node.js)",
    companyName: "Nexus Cloud Systems",
    description: "Architect, build, and scale high-throughput cloud dashboards and microservices. You will work across modern React, Next.js, TypeScript, Node.js, and MongoDB/PostgreSQL backends with high reliability.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Remote",
    rawLocation: "Remote (India / Global)",
    location: { city: "Bengaluru", state: "Karnataka", country: "India", raw: "Remote • Bengaluru, India" },
    minExperienceYears: 3,
    salary: { min: 2200000, max: 3200000, currency: "INR", raw: "₹22–32 LPA" },
    rawSalary: "₹22–32 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
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
    companyName: "Hyperion Design Labs",
    description: "Design and implement lightning-fast UI components, state management architectures, design systems, and responsive interactive web experiences with Next.js and Tailwind CSS.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Remote",
    rawLocation: "Remote (Anywhere in India)",
    location: { city: "Remote", country: "India", raw: "Remote, India" },
    minExperienceYears: 2,
    salary: { min: 1500000, max: 2400000, currency: "INR", raw: "₹15–24 LPA" },
    rawSalary: "₹15–24 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
    description: "Help scale our multi-region Kubernetes clusters, CI/CD automated deployment pipelines, and cloud observability stack on AWS and GCP with high availability.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Remote",
    rawLocation: "Bengaluru, Karnataka (Remote)",
    location: { city: "Bengaluru", state: "Karnataka", country: "India", raw: "Bengaluru, India" },
    minExperienceYears: 3,
    salary: { min: 2000000, max: 3500000, currency: "INR", raw: "₹20–35 LPA" },
    rawSalary: "₹20–35 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    requiredSkills: [
      { name: "Docker", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "Kubernetes", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "AWS", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "CI/CD", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "Terraform", requiredLevel: 3, importance: CompetencyImportance.MEDIUM, minYearsOfExperience: 1 },
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
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    requiredSkills: [
      { name: "System Design", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 5 },
      { name: "Node.js", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 5 },
      { name: "React", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 4 },
      { name: "TypeScript", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 4 },
      { name: "AWS", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 3 },
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
    title: "Senior React & Next.js Frontend Architect",
    companyName: "Razorpay Financial",
    description: "Lead frontend architecture for high-conversion merchant checkout SDKs, payment dashboards, and developer docs using Next.js, React Server Components, and WebSockets.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Hybrid",
    rawLocation: "Bengaluru, Karnataka (Hybrid)",
    location: { city: "Bengaluru", state: "Karnataka", country: "India", raw: "Bengaluru, India" },
    minExperienceYears: 4,
    salary: { min: 2800000, max: 4200000, currency: "INR", raw: "₹28–42 LPA" },
    rawSalary: "₹28–42 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(),
    requiredSkills: [
      { name: "React", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 4 },
      { name: "Next.js", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "TypeScript", requiredLevel: 5, importance: CompetencyImportance.HIGH, minYearsOfExperience: 3 },
      { name: "Tailwind CSS", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "REST API", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 3 },
    ],
  },
  {
    title: "Backend Platform Engineer (Go & Node.js)",
    companyName: "CRED Technologies",
    description: "Design low-latency reward distribution engines, distributed financial ledgers, and secure transaction pipelines serving millions of active users daily.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "On-site",
    rawLocation: "Bengaluru, Karnataka (On-site)",
    location: { city: "Bengaluru", state: "Karnataka", country: "India", raw: "Bengaluru, India" },
    minExperienceYears: 3,
    salary: { min: 3000000, max: 4800000, currency: "INR", raw: "₹30–48 LPA" },
    rawSalary: "₹30–48 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(),
    requiredSkills: [
      { name: "Node.js", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "PostgreSQL", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "Redis", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "Microservices", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "System Design", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 3 },
    ],
  },
  {
    title: "AI Engineer / LLM Application Developer",
    companyName: "Postman API Platform",
    description: "Build generative AI features into the Postman developer workflow: automated test script generation, natural language API query copilots, and agentic workflows.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Remote",
    rawLocation: "Remote (India / APAC)",
    location: { city: "Remote", state: "Karnataka", country: "India", raw: "Remote, India" },
    minExperienceYears: 2,
    salary: { min: 2500000, max: 3800000, currency: "INR", raw: "₹25–38 LPA" },
    rawSalary: "₹25–38 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(),
    requiredSkills: [
      { name: "Python", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "TypeScript", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "FastAPI", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "REST API", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "Docker", requiredLevel: 3, importance: CompetencyImportance.MEDIUM, minYearsOfExperience: 1 },
    ],
  },
  {
    title: "Full-Stack Software Engineer (MERN Stack)",
    companyName: "Zomato Quick Commerce",
    description: "Build real-time inventory management microservices, delivery fleet dispatch dashboards, and merchant portal tools with Next.js, Node.js, and MongoDB.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Hybrid",
    rawLocation: "Gurugram, Haryana (Hybrid)",
    location: { city: "Gurugram", state: "Haryana", country: "India", raw: "Gurugram, India" },
    minExperienceYears: 2,
    salary: { min: 1800000, max: 2800000, currency: "INR", raw: "₹18–28 LPA" },
    rawSalary: "₹18–28 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(),
    requiredSkills: [
      { name: "React", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "Node.js", requiredLevel: 4, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "MongoDB", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "Express", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "TypeScript", requiredLevel: 3, importance: CompetencyImportance.HIGH, minYearsOfExperience: 1 },
    ],
  },
  {
    title: "Cloud Security & Infrastructure Engineer",
    companyName: "Zerodha Tech",
    description: "Design zero-trust architecture, automated threat detection, IAM policies, and infrastructure hardening for India's largest discount brokerage platform.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Hybrid",
    rawLocation: "Bengaluru, Karnataka (Hybrid)",
    location: { city: "Bengaluru", state: "Karnataka", country: "India", raw: "Bengaluru, India" },
    minExperienceYears: 3,
    salary: { min: 2400000, max: 3600000, currency: "INR", raw: "₹24–36 LPA" },
    rawSalary: "₹24–36 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(),
    requiredSkills: [
      { name: "AWS", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "Docker", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "Linux", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 3 },
      { name: "CI/CD", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "Python", requiredLevel: 3, importance: CompetencyImportance.MEDIUM, minYearsOfExperience: 1 },
    ],
  },
  {
    title: "Frontend UI/UX Engineer",
    companyName: "Swiggy Design Systems",
    description: "Craft rich animations, micro-interactions, responsive consumer food ordering web apps, and design tokens across mobile and desktop browser platforms.",
    sourceType: JobSourceType.PLATFORM,
    employmentType: "Full-Time",
    workplaceType: "Remote",
    rawLocation: "Remote (India)",
    location: { city: "Remote", state: "Karnataka", country: "India", raw: "Remote, India" },
    minExperienceYears: 1,
    salary: { min: 1400000, max: 2200000, currency: "INR", raw: "₹14–22 LPA" },
    rawSalary: "₹14–22 LPA",
    status: JobStatus.ACTIVE,
    publishedAt: new Date(),
    requiredSkills: [
      { name: "React", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "JavaScript", requiredLevel: 5, importance: CompetencyImportance.CRITICAL, minYearsOfExperience: 2 },
      { name: "HTML", requiredLevel: 5, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "CSS", requiredLevel: 5, importance: CompetencyImportance.HIGH, minYearsOfExperience: 2 },
      { name: "Tailwind CSS", requiredLevel: 4, importance: CompetencyImportance.HIGH, minYearsOfExperience: 1 },
    ],
  }
];

export async function seedJobs(): Promise<void> {
  console.log("[Seeder] Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("[Seeder] Connected!");

  console.log("[Seeder] Upserting verified Direct Platform job listings...");
  let addedCount = 0;
  for (const jobData of seedJobsData) {
    const exists = await JobModel.findOne({ title: jobData.title, companyName: jobData.companyName });
    if (!exists) {
      await JobModel.create({
        ...jobData,
        sourceType: JobSourceType.PLATFORM,
        status: JobStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[Seeder] ✅ Created Direct Platform Job: ${jobData.title} at ${jobData.companyName}`);
      addedCount++;
    } else {
      // Ensure existing ones have latest timestamp and status
      await JobModel.updateOne(
        { _id: exists._id },
        { $set: { status: JobStatus.ACTIVE, sourceType: JobSourceType.PLATFORM, updatedAt: new Date() } }
      );
    }
  }

  const totalInDb = await JobModel.countDocuments();
  const platformCount = await JobModel.countDocuments({ sourceType: "platform", status: "active" });
  const externalCount = await JobModel.countDocuments({ sourceType: "external", status: "active" });

  console.log("\n=======================================================");
  console.log(`[Seeder] Done! Added ${addedCount} new platform jobs.`);
  console.log(`[Seeder] Total Active Jobs in MongoDB: ${totalInDb}`);
  console.log(`  -> Direct Platform Jobs: ${platformCount}`);
  console.log(`  -> Live Jooble External Jobs: ${externalCount}`);
  console.log("=======================================================\n");

  await mongoose.disconnect();
}

if (require.main === module || process.argv[1]?.includes("seed-jobs")) {
  seedJobs().catch((err) => {
    console.error("[Seeder] Error:", err);
    process.exit(1);
  });
}
