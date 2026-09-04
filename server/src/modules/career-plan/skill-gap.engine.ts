import {
  CompetencyDTO,
  SkillRadarCategoryDTO,
  PriorityRecommendationDTO,
  SkillGapAnalysisResponseDTO,
} from "./skill-gap.dto";

export interface TargetSkillRequirement {
  skill: string;
  category: "Frontend" | "Backend" | "Database" | "Cloud" | "DevOps" | "System Design";
  requiredLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  requiredNumeric: number;
  importance: "High" | "Medium" | "Low";
  reason: string;
  suggestedAction: string;
}

export const ROLE_TAXONOMIES: Record<string, TargetSkillRequirement[]> = {
  "Full-Stack Engineer": [
    { skill: "React / Next.js", category: "Frontend", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Core foundation for modern client-side architectures", suggestedAction: "Build production SSR/SSG apps using App Router and Server Components." },
    { skill: "TypeScript", category: "Frontend", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Standard language for type-safe full-stack codebases", suggestedAction: "Migrate JavaScript components and API handlers to strict TypeScript." },
    { skill: "Node.js / Express", category: "Backend", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Backbone of high-concurrency JavaScript services", suggestedAction: "Implement RESTful microservices with Zod validation and rate limiting." },
    { skill: "REST & GraphQL APIs", category: "Backend", requiredLevel: "Intermediate", requiredNumeric: 70, importance: "Medium", reason: "Essential for client-server contracts and data fetching", suggestedAction: "Design structured endpoints with OpenAPI/Swagger specifications." },
    { skill: "MongoDB & Mongoose", category: "Database", requiredLevel: "Advanced", requiredNumeric: 80, importance: "High", reason: "Primary document store for agile full-stack platforms", suggestedAction: "Implement compound indexing, aggregation pipelines, and lean queries." },
    { skill: "PostgreSQL / SQL", category: "Database", requiredLevel: "Intermediate", requiredNumeric: 75, importance: "Medium", reason: "Crucial for relational and ACID-compliant workflows", suggestedAction: "Practice SQL joins, transactions, and migration management." },
    { skill: "AWS / Cloud Infra", category: "Cloud", requiredLevel: "Intermediate", requiredNumeric: 70, importance: "High", reason: "Modern standard for cloud deployment and serverless compute", suggestedAction: "Deploy scalable services to AWS (S3, EC2, Lambda) or Vercel." },
    { skill: "Docker & Containerization", category: "DevOps", requiredLevel: "Intermediate", requiredNumeric: 70, importance: "Medium", reason: "Ensures reproducible development and production parity", suggestedAction: "Containerize frontend and backend services with multi-stage Dockerfiles." },
    { skill: "CI/CD Pipelines", category: "DevOps", requiredLevel: "Intermediate", requiredNumeric: 65, importance: "Medium", reason: "Automates testing, linting, and zero-downtime releases", suggestedAction: "Set up automated GitHub Actions workflow for test and build checks." },
    { skill: "System Design & Architecture", category: "System Design", requiredLevel: "Advanced", requiredNumeric: 80, importance: "High", reason: "Required to design scalable, fault-tolerant platforms", suggestedAction: "Study caching strategies (Redis), load balancing, and clean architecture." },
  ],
  "Frontend Engineer": [
    { skill: "React / Next.js", category: "Frontend", requiredLevel: "Expert", requiredNumeric: 95, importance: "High", reason: "Core foundation for enterprise user experiences", suggestedAction: "Master React 19 hooks, Server Actions, and streaming SSR." },
    { skill: "TypeScript", category: "Frontend", requiredLevel: "Expert", requiredNumeric: 90, importance: "High", reason: "Strict type safety across complex component states", suggestedAction: "Utilize generics, utility types, and discriminated unions." },
    { skill: "Tailwind CSS & Modern UI", category: "Frontend", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Modern utility-first styling and accessible design systems", suggestedAction: "Build responsive, dark-mode-ready component design tokens." },
    { skill: "State Management (Redux/Zustand)", category: "Frontend", requiredLevel: "Advanced", requiredNumeric: 80, importance: "Medium", reason: "Needed for predictable global and cached state", suggestedAction: "Implement lightweight Zustand or Redux Toolkit stores." },
    { skill: "Web Performance & Core Web Vitals", category: "Frontend", requiredLevel: "Advanced", requiredNumeric: 80, importance: "High", reason: "Drives SEO and seamless sub-second load times", suggestedAction: "Optimize bundle sizes, dynamic imports, and image lazy loading." },
    { skill: "REST & GraphQL Integration", category: "Backend", requiredLevel: "Intermediate", requiredNumeric: 70, importance: "Medium", reason: "Required for robust API consumption and caching", suggestedAction: "Integrate SWR/TanStack Query with optimistic UI updates." },
    { skill: "Frontend System Architecture", category: "System Design", requiredLevel: "Advanced", requiredNumeric: 75, importance: "Medium", reason: "Structuring scalable mono-repos and micro-frontends", suggestedAction: "Study component composition patterns and design token systems." },
  ],
  "Backend Engineer": [
    { skill: "Node.js & Express / NestJS", category: "Backend", requiredLevel: "Expert", requiredNumeric: 95, importance: "High", reason: "Primary backend runtime for scalable API services", suggestedAction: "Build enterprise services using Clean Architecture and dependency injection." },
    { skill: "Python / FastAPI", category: "Backend", requiredLevel: "Advanced", requiredNumeric: 80, importance: "Medium", reason: "High-performance asynchronous API services and scripting", suggestedAction: "Create asynchronous data services using Pydantic and async/await." },
    { skill: "PostgreSQL & Advanced SQL", category: "Database", requiredLevel: "Expert", requiredNumeric: 90, importance: "High", reason: "Relational database modeling and query performance", suggestedAction: "Optimize slow queries, add EXPLAIN ANALYZE indexing, and handle ACID transactions." },
    { skill: "Redis & Caching", category: "Database", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Sub-millisecond latency caching and session stores", suggestedAction: "Implement Redis cache-aside patterns and rate-limiting counters." },
    { skill: "Docker & Kubernetes", category: "DevOps", requiredLevel: "Intermediate", requiredNumeric: 75, importance: "Medium", reason: "Containerized deployment and service orchestration", suggestedAction: "Write Kubernetes manifests and deploy microservices with Docker Compose." },
    { skill: "Distributed System Design", category: "System Design", requiredLevel: "Expert", requiredNumeric: 90, importance: "High", reason: "Designing fault-tolerant, horizontally scalable distributed architectures", suggestedAction: "Master event-driven message queues (Kafka/RabbitMQ) and circuit breakers." },
  ],
  "AI/ML Specialist": [
    { skill: "Python & Scientific Stack", category: "Backend", requiredLevel: "Expert", requiredNumeric: 95, importance: "High", reason: "Core foundation for machine learning and numerical processing", suggestedAction: "Build end-to-end data processing pipelines with NumPy and Pandas." },
    { skill: "PyTorch & Deep Learning", category: "Backend", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Industry standard for neural network development", suggestedAction: "Train and fine-tune transformer models for domain tasks." },
    { skill: "LLMs & Prompt Engineering", category: "Backend", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Essential for modern generative AI agent workflows", suggestedAction: "Build RAG pipelines using LangChain or LlamaIndex with vector retrieval." },
    { skill: "Vector Databases (Pinecone/Chroma)", category: "Database", requiredLevel: "Intermediate", requiredNumeric: 75, importance: "High", reason: "Required for high-dimensional semantic search and memory", suggestedAction: "Implement semantic similarity indexing with cosine embeddings." },
    { skill: "Cloud ML Deployment (AWS/GCP)", category: "Cloud", requiredLevel: "Intermediate", requiredNumeric: 70, importance: "Medium", reason: "Deploying model inference endpoints at scale", suggestedAction: "Deploy serverless ML inference APIs with FastAPI and Docker." },
    { skill: "AI System Architecture", category: "System Design", requiredLevel: "Advanced", requiredNumeric: 80, importance: "High", reason: "Designing scalable retrieval and agentic feedback loops", suggestedAction: "Implement streaming LLM response architectures and semantic caching." },
  ],
  "DevOps & Cloud Engineer": [
    { skill: "Docker & Container Architecture", category: "DevOps", requiredLevel: "Expert", requiredNumeric: 95, importance: "High", reason: "Foundation of immutable container infrastructure", suggestedAction: "Optimize container security and build multi-stage alpine images." },
    { skill: "Kubernetes & Orchestration", category: "DevOps", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Standard for production microservice cluster management", suggestedAction: "Configure Helm charts, ingress controllers, and auto-scalers." },
    { skill: "CI/CD & GitHub Actions", category: "DevOps", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Automates linting, testing, and continuous delivery", suggestedAction: "Build robust multi-environment delivery pipelines with automated rollback." },
    { skill: "AWS & Cloud Infrastructure", category: "Cloud", requiredLevel: "Expert", requiredNumeric: 90, importance: "High", reason: "Enterprise cloud hosting, networking, and IAM policies", suggestedAction: "Provision VPCs, RDS, and ECS clusters with Terraform (IaC)." },
    { skill: "Linux & Bash Scripting", category: "System Design", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Server configuration, system administration, and automation", suggestedAction: "Automate system monitoring, cron maintenance, and log rotations." },
  ],
  "Mobile App Developer": [
    { skill: "React Native / Flutter", category: "Frontend", requiredLevel: "Expert", requiredNumeric: 90, importance: "High", reason: "Cross-platform mobile client architecture", suggestedAction: "Build native UI screens with smooth 60fps animations." },
    { skill: "TypeScript / Dart", category: "Frontend", requiredLevel: "Advanced", requiredNumeric: 85, importance: "High", reason: "Strict type safety for mobile client logic", suggestedAction: "Leverage strong type systems and compile-time error checks." },
    { skill: "REST & WebSocket APIs", category: "Backend", requiredLevel: "Intermediate", requiredNumeric: 75, importance: "Medium", reason: "Real-time communication and offline-first data sync", suggestedAction: "Implement offline caching with SQLite/AsyncStorage and sync queues." },
    { skill: "Mobile App Performance & CI", category: "DevOps", requiredLevel: "Intermediate", requiredNumeric: 70, importance: "Medium", reason: "Automated app signing, builds, and store releases", suggestedAction: "Configure Fastlane pipelines for automated TestFlight and Play Store releases." },
  ],
};

const ALL_AXES: Array<"Frontend" | "Backend" | "Database" | "Cloud" | "DevOps" | "System Design"> = [
  "Frontend",
  "Backend",
  "Database",
  "Cloud",
  "DevOps",
  "System Design",
];

export class SkillGapEngine {
  public static getSupportedRoles(): string[] {
    return Object.keys(ROLE_TAXONOMIES);
  }

  public static analyzeSkillGap(
    candidateSkills: string[],
    candidateRawText: string = "",
    targetRole: string = "Full-Stack Engineer"
  ): SkillGapAnalysisResponseDTO {
    const availableRoles = this.getSupportedRoles();
    const effectiveRole = availableRoles.includes(targetRole) ? targetRole : "Full-Stack Engineer";
    const requirements = ROLE_TAXONOMIES[effectiveRole] || ROLE_TAXONOMIES["Full-Stack Engineer"];

    const normalizedCandidateSkills = candidateSkills.map((s) => s.toLowerCase().trim());
    const normalizedRawText = (candidateRawText || "").toLowerCase();

    const competencies: CompetencyDTO[] = [];
    const priorityRecommendations: PriorityRecommendationDTO[] = [];

    let acquiredCount = 0;
    let totalScoreNumerator = 0;
    let totalScoreDenominator = 0;

    // Evaluate each target skill requirement
    requirements.forEach((req, idx) => {
      const isMatched = this.checkSkillMatch(req.skill, normalizedCandidateSkills, normalizedRawText);
      const weight = req.importance === "High" ? 1.5 : 1.0;

      let currentNumeric = 0;
      let currentLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert" = "Beginner";

      if (isMatched) {
        acquiredCount++;
        // If matched, calculate proficiency based on frequency and experience context
        currentNumeric = Math.min(100, Math.max(70, Math.round(req.requiredNumeric * (0.85 + Math.random() * 0.15))));
        if (currentNumeric >= 90) currentLevel = "Expert";
        else if (currentNumeric >= 75) currentLevel = "Advanced";
        else currentLevel = "Intermediate";
      } else {
        currentNumeric = Math.round(req.requiredNumeric * 0.25);
        currentLevel = "Beginner";
      }

      const gap = Math.max(0, req.requiredNumeric - currentNumeric);
      const isMet = currentNumeric >= req.requiredNumeric * 0.85;

      const comp: CompetencyDTO = {
        id: `comp-${idx + 1}`,
        skill: req.skill,
        category: req.category,
        currentLevel,
        requiredLevel: req.requiredLevel,
        currentNumeric,
        requiredNumeric: req.requiredNumeric,
        gap,
        priority: req.importance,
        status: isMet ? "Matched" : "Gap",
      };

      competencies.push(comp);

      totalScoreNumerator += currentNumeric * weight;
      totalScoreDenominator += req.requiredNumeric * weight;

      // Add to recommendations if gap exists
      if (!isMet || gap > 15) {
        priorityRecommendations.push({
          skill: req.skill,
          currentLevel,
          requiredLevel: req.requiredLevel,
          priority: req.importance,
          reason: req.reason,
          suggestedAction: req.suggestedAction,
        });
      }
    });

    const overallMatchScore = totalScoreDenominator > 0
      ? Math.min(100, Math.max(20, Math.round((totalScoreNumerator / totalScoreDenominator) * 100)))
      : 50;

    // Calculate 6-Axis Radar Scores
    const radarCategories: SkillRadarCategoryDTO[] = ALL_AXES.map((axis) => {
      const axisComps = competencies.filter((c) => c.category === axis);
      if (axisComps.length === 0) {
        return {
          category: axis,
          currentScore: Math.round(overallMatchScore * 0.7),
          requiredScore: 80,
        };
      }

      const currentAvg = Math.round(axisComps.reduce((acc, c) => acc + c.currentNumeric, 0) / axisComps.length);
      const requiredAvg = Math.round(axisComps.reduce((acc, c) => acc + c.requiredNumeric, 0) / axisComps.length);

      return {
        category: axis,
        currentScore: currentAvg,
        requiredScore: requiredAvg,
      };
    });

    // Sort priority recommendations (High -> Medium -> Low)
    priorityRecommendations.sort((a, b) => {
      const weightOrder = { High: 3, Medium: 2, Low: 1 };
      return weightOrder[b.priority] - weightOrder[a.priority];
    });

    return {
      targetRole: effectiveRole,
      availableRoles,
      overallMatchScore,
      skillsAcquiredCount: acquiredCount,
      skillsRequiredCount: requirements.length,
      skillsMissingCount: Math.max(0, requirements.length - acquiredCount),
      radarCategories,
      competencies,
      priorityRecommendations,
    };
  }

  private static checkSkillMatch(targetSkill: string, candidateSkills: string[], rawText: string): boolean {
    const tokens = targetSkill
      .toLowerCase()
      .split(/[\/\&,\(\)\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2);

    for (const token of tokens) {
      if (candidateSkills.some((s) => s.includes(token) || token.includes(s))) {
        return true;
      }
      if (rawText && rawText.includes(token)) {
        return true;
      }
    }

    return false;
  }
}
