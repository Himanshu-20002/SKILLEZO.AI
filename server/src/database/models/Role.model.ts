import { Schema, model, Document, Types } from "mongoose";
import { RoleStatus } from "@/core/constants/enums";

export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: string;
  description?: string | null;
  defaultSkills: string[];
  icon: string;
  order: number;
  isFeatured: boolean;
  status: RoleStatus;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      default: "Engineering",
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    defaultSkills: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: "Briefcase",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(RoleStatus),
      required: true,
      default: RoleStatus.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "roles",
  }
);

export const RoleModel = model<IRole>("Role", roleSchema);

export const DEFAULT_PLATFORM_ROLES = [
  {
    name: "Full-Stack Engineer",
    slug: "full-stack-engineer",
    category: "Engineering",
    description: "End-to-end web architecture, frontend interfaces, and scalable backend services.",
    defaultSkills: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "Docker", "Tailwind CSS"],
    icon: "Layers",
    order: 1,
    isFeatured: true,
    status: RoleStatus.ACTIVE,
  },
  {
    name: "Frontend Engineer",
    slug: "frontend-engineer",
    category: "Engineering",
    description: "Modern UI engineering, React 19, Server Components, client state, and responsive web design.",
    defaultSkills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "HTML/CSS", "Web Vitals"],
    icon: "Code",
    order: 2,
    isFeatured: true,
    status: RoleStatus.ACTIVE,
  },
  {
    name: "Backend Engineer",
    slug: "backend-engineer",
    category: "Engineering",
    description: "Distributed REST/gRPC services, microservices, database tuning, and high-concurrency event loops.",
    defaultSkills: ["Node.js", "Express", "TypeScript", "PostgreSQL", "MongoDB", "Redis", "REST APIs"],
    icon: "Server",
    order: 3,
    isFeatured: true,
    status: RoleStatus.ACTIVE,
  },
  {
    name: "AI/ML Specialist",
    slug: "ai-ml-specialist",
    category: "Data & AI",
    description: "Data pipelines, predictive modeling, machine learning algorithms, and Generative AI orchestration.",
    defaultSkills: ["Python", "Machine Learning", "PyTorch", "TensorFlow", "Generative AI", "Pandas", "FastAPI"],
    icon: "Cpu",
    order: 4,
    isFeatured: true,
    status: RoleStatus.ACTIVE,
  },
  {
    name: "DevOps & Cloud Engineer",
    slug: "devops-cloud-engineer",
    category: "Cloud & DevOps",
    description: "Containerization, cloud infrastructure (AWS/GCP), CI/CD release automation, and Kubernetes orchestration.",
    defaultSkills: ["Docker", "Kubernetes", "AWS", "CI/CD", "GitHub Actions", "Terraform", "Linux"],
    icon: "Box",
    order: 5,
    isFeatured: true,
    status: RoleStatus.ACTIVE,
  },
  {
    name: "Mobile App Developer",
    slug: "mobile-app-developer",
    category: "Engineering",
    description: "Cross-platform and native mobile applications with React Native, Flutter, and performant client caching.",
    defaultSkills: ["React Native", "Flutter", "TypeScript", "iOS", "Android", "Mobile Architecture"],
    icon: "Smartphone",
    order: 6,
    isFeatured: true,
    status: RoleStatus.ACTIVE,
  },
  {
    name: "Cybersecurity Specialist",
    slug: "cybersecurity-specialist",
    category: "Security",
    description: "Vulnerability analysis, zero-trust network architectures, penetration testing, and security compliance.",
    defaultSkills: ["Network Security", "Penetration Testing", "OWASP", "SIEM", "Cryptography", "Linux"],
    icon: "Shield",
    order: 7,
    isFeatured: false,
    status: RoleStatus.ACTIVE,
  },
  {
    name: "Data Engineer",
    slug: "data-engineer",
    category: "Data & AI",
    description: "Large-scale data pipelines, ETL architectures, data warehousing with Snowflake/BigQuery, and Spark.",
    defaultSkills: ["Python", "SQL", "Apache Spark", "Airflow", "Kafka", "Data Warehousing"],
    icon: "Database",
    order: 8,
    isFeatured: false,
    status: RoleStatus.ACTIVE,
  },
];
