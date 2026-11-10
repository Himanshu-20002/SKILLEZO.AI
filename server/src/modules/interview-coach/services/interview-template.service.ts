import {
  InterviewTemplateRepository,
} from "@/database/repositories/interview";
import { IInterviewTemplate } from "@/database/models/InterviewTemplate.model";
import {
  InterviewType,
  InterviewDifficulty,
} from "../domain/interview.enums";

export interface RoleTemplateBlueprint {
  role: string;
  name: string;
  interviewType: InterviewType;
  competencyAreas: string[];
  defaultDurationMinutes: number;
  defaultQuestionCount: number;
}

export const INITIAL_ROLE_CATALOG: RoleTemplateBlueprint[] = [
  {
    role: "React Developer",
    name: "React & Modern Frontend Architecture",
    interviewType: InterviewType.TECHNICAL,
    competencyAreas: [
      "React 19 Hooks & State Transitions",
      "Server Components (RSC) & Streaming SSR",
      "State Management (Zustand, Redux, Context)",
      "Core Web Vitals & Frontend Performance",
      "Component Architecture & Design Patterns",
    ],
    defaultDurationMinutes: 30,
    defaultQuestionCount: 5,
  },
  {
    role: ".NET Developer",
    name: "C# & Modern .NET Core Enterprise Systems",
    interviewType: InterviewType.TECHNICAL,
    competencyAreas: [
      "C# Language Features & Memory Management",
      "ASP.NET Core Web API & Middleware",
      "Entity Framework Core & Query Optimization",
      "Dependency Injection & Clean Architecture",
      "Microservices & Message Brokers (RabbitMQ/Azure)",
    ],
    defaultDurationMinutes: 30,
    defaultQuestionCount: 5,
  },
  {
    role: "MERN Developer",
    name: "Full-Stack MERN Architecture",
    interviewType: InterviewType.TECHNICAL,
    competencyAreas: [
      "Node.js Event Loop & Concurrency",
      "Express.js Middleware & Security Hardening",
      "MongoDB Schema Design & Compound Indexing",
      "React Component State & Hydration",
      "RESTful API & JWT Session Authentication",
    ],
    defaultDurationMinutes: 30,
    defaultQuestionCount: 5,
  },
  {
    role: "Python Developer",
    name: "Python Systems & Backend Engineering",
    interviewType: InterviewType.TECHNICAL,
    competencyAreas: [
      "Python Idioms, Generators & Decorators",
      "FastAPI / Django REST Framework Architecture",
      "Asyncio & Asynchronous Programming",
      "PostgreSQL Integration & ORM Performance",
      "API Testing, Pytest & Containerization",
    ],
    defaultDurationMinutes: 30,
    defaultQuestionCount: 5,
  },
  {
    role: "Java Developer",
    name: "Java & Spring Boot Distributed Architecture",
    interviewType: InterviewType.TECHNICAL,
    competencyAreas: [
      "JVM Internals, Garbage Collection & Multithreading",
      "Spring Boot 3, Dependency Injection & Spring Security",
      "JPA / Hibernate Query Tuning & Transactions",
      "Kafka Messaging & Event-Driven Architecture",
      "Microservices Resiliency (Resilience4j / Circuit Breaker)",
    ],
    defaultDurationMinutes: 30,
    defaultQuestionCount: 5,
  },
  {
    role: "Data Analyst",
    name: "Data Analytics & Business Intelligence",
    interviewType: InterviewType.TECHNICAL,
    competencyAreas: [
      "Advanced SQL (Window Functions, CTEs, Joins)",
      "Python / Pandas Data Wrangling & Cleaning",
      "Statistical Analysis & Hypothesis Testing",
      "BI Dashboards (Power BI / Tableau / Metabase)",
      "Data Storytelling & Executive Communication",
    ],
    defaultDurationMinutes: 30,
    defaultQuestionCount: 5,
  },
  {
    role: "AI/ML Specialist",
    name: "Applied AI, LLMs & Machine Learning",
    interviewType: InterviewType.TECHNICAL,
    competencyAreas: [
      "Supervised & Unsupervised Learning Algorithms",
      "Transformer Architectures & Attention Mechanisms",
      "LLM Prompt Engineering, RAG & Vector Embeddings",
      "Model Evaluation Metrics & Hallucination Mitigation",
      "MLOps, Inference Latency & Quantization",
    ],
    defaultDurationMinutes: 30,
    defaultQuestionCount: 5,
  },
  {
    role: "Cloud Engineer",
    name: "Cloud Infrastructure & Scalability (AWS/GCP/Azure)",
    interviewType: InterviewType.TECHNICAL,
    competencyAreas: [
      "Cloud Virtual Networks, Subnets & VPC Peering",
      "IAM Policies, Least Privilege & Security Posture",
      "Serverless Compute & Container Services (ECS/Cloud Run)",
      "Infrastructure as Code (Terraform / CloudFormation)",
      "High Availability, Disaster Recovery & Cost Optimization",
    ],
    defaultDurationMinutes: 30,
    defaultQuestionCount: 5,
  },
  {
    role: "DevOps Engineer",
    name: "CI/CD & Kubernetes Platform Engineering",
    interviewType: InterviewType.TECHNICAL,
    competencyAreas: [
      "Docker Multi-Stage Builds & Image Security",
      "Kubernetes Pods, Services, Deployments & Ingress",
      "CI/CD Pipelines (GitHub Actions / GitLab CI)",
      "Observability, Prometheus, Grafana & ELK Stack",
      "GitOps (ArgoCD) & Production Deployment Strategies",
    ],
    defaultDurationMinutes: 30,
    defaultQuestionCount: 5,
  },
  {
    role: "Business Analyst",
    name: "Requirements Engineering & Agile Strategy",
    interviewType: InterviewType.TECHNICAL,
    competencyAreas: [
      "Stakeholder Interviewing & Requirements Elicitation",
      "User Stories, Acceptance Criteria & Gherkin Syntax",
      "Process Mapping, BPMN & Gap Analysis",
      "Agile/Scrum Ceremonies & Backlog Prioritization",
      "Data-Driven Impact Analysis & KPI Tracking",
    ],
    defaultDurationMinutes: 30,
    defaultQuestionCount: 5,
  },
];

export class InterviewTemplateService {
  constructor(private readonly templateRepo: InterviewTemplateRepository) {}

  /**
   * Ensure default 10 role templates are seeded in database
   */
  async ensureSeeded(): Promise<void> {
    try {
      const existingCount = await this.templateRepo.count();
      if (existingCount > 0) return;

      for (const bp of INITIAL_ROLE_CATALOG) {
        await this.templateRepo.create({
          name: bp.name,
          role: bp.role,
          interviewType: bp.interviewType,
          competencyAreas: bp.competencyAreas,
          supportedExperienceLevels: ["entry", "junior", "mid", "senior", "lead"],
          supportedDifficulties: [
            InterviewDifficulty.EASY,
            InterviewDifficulty.MEDIUM,
            InterviewDifficulty.HARD,
          ],
          defaultDurationMinutes: bp.defaultDurationMinutes,
          defaultQuestionCount: bp.defaultQuestionCount,
          isActive: true,
          version: 1,
        } as any);
      }
    } catch (err) {
      console.warn("[InterviewTemplateService] ensureSeeded error:", err);
    }
  }

  /**
   * Get all active role templates for the setup wizard
   */
  async getTemplates(): Promise<IInterviewTemplate[]> {
    await this.ensureSeeded();
    const templates = await this.templateRepo.findActiveTemplates();
    return templates;
  }

  /**
   * Find template by role name and type, with fallback defaults
   */
  async getTemplateForRole(
    role: string,
    interviewType: string
  ): Promise<IInterviewTemplate | null> {
    await this.ensureSeeded();
    return await this.templateRepo.findByRoleAndType(role, interviewType);
  }
}

export const interviewTemplateService = new InterviewTemplateService(
  new InterviewTemplateRepository()
);

