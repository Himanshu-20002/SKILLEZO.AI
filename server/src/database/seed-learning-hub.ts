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

import { LearningTrackModel } from "./models/LearningTrack.model";
import { LearningResourceModel } from "./models/LearningResource.model";

export async function seedLearningHub() {
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/skillezo";

  console.log(`[LearningHubSeeder] Connecting to MongoDB: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`);
  await mongoose.connect(mongoUri);
  console.log("[LearningHubSeeder] Connected successfully.");

  // Define 5 Core Enterprise Tracks with Resources
  const tracksDefinition = [
    {
      title: "React 19 & Next.js Server Components Architecture",
      slug: "react-nextjs-architecture",
      category: "Frontend" as const,
      description: "Master React 19 primitives, Server Actions, streaming SSR with Suspense, and production Next.js App Router patterns.",
      targetRoles: ["Frontend Engineer", "Full-Stack Engineer"],
      targetSkills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      difficulty: "advanced" as const,
      estimatedMinutes: 180,
      iconName: "Atom",
      accentColor: "#61DAFB",
      finalAssessmentTopicId: "react",
      isFeatured: true,
      modules: [
        {
          id: "mod_react_1",
          title: "Module 1: React 19 Primitives & Actions",
          description: "Understanding useActionState, useOptimistic, and asynchronous transition handling.",
          order: 1,
          resources: [
            {
              title: "React 19 Actions & Asynchronous State Transitions",
              slug: "react-19-actions-guide",
              type: "lesson" as const,
              category: "Frontend",
              skills: ["React", "Hooks"],
              difficulty: "advanced" as const,
              estimatedMinutes: 20,
              content: {
                provider: "SKILLEZO Architecture",
                markdown: `# React 19 Actions & Asynchronous State Transitions\n\nReact 19 introduces native support for handling asynchronous state transitions with zero manual loading flags.\n\n### Core Primitives\n1. **\`useActionState\`**: Simplifies async actions by automatically handling pending states and errors.\n2. **\`useOptimistic\`**: Provides immediate visual feedback while background operations are inflight.\n\n\`\`\`tsx\nconst [state, formAction, isPending] = useActionState(async (prevState, formData) => {\n  const res = await updateProfile(formData);\n  return res;\n}, null);\n\`\`\`\n\nAlways use \`startTransition\` when updating non-urgent UI states to keep the main thread responsive.`,
              },
            },
            {
              title: "Official React 19 Documentation & Upgrade Guide",
              slug: "official-react-19-docs",
              type: "external_doc" as const,
              category: "Frontend",
              skills: ["React"],
              difficulty: "intermediate" as const,
              estimatedMinutes: 15,
              content: {
                provider: "React Official Docs",
                externalUrl: "https://react.dev/blog/2024/04/25/react-19",
              },
            },
          ],
        },
        {
          id: "mod_react_2",
          title: "Module 2: Server Components & Streaming SSR",
          description: "Decoupling server data fetching from browser bundle hydration with Next.js App Router.",
          order: 2,
          resources: [
            {
              title: "RSC Execution Model vs Client Component Hydration",
              slug: "rsc-execution-model",
              type: "lesson" as const,
              category: "Frontend",
              skills: ["React", "Next.js", "Server Components"],
              difficulty: "advanced" as const,
              estimatedMinutes: 25,
              content: {
                provider: "SKILLEZO Architecture",
                markdown: `# RSC Execution Model vs Client Component Hydration\n\nReact Server Components (RSC) execute exclusively on the server and transmit a serialized JSON-like virtual DOM tree (the RSC payload) to the browser.\n\n### Key Benefits\n- Zero JavaScript bundle shipped to the client for server-only logic.\n- Direct database access from component tree.\n- Incremental streaming using HTML Chunked Transfer Encoding.`,
              },
            },
            {
              title: "Next.js App Router Masterclass: Server & Client Components",
              slug: "nextjs-app-router-video-guide",
              type: "external_video" as const,
              category: "Frontend",
              skills: ["Next.js"],
              difficulty: "intermediate" as const,
              estimatedMinutes: 35,
              content: {
                provider: "YouTube / Vercel",
                externalUrl: "https://www.youtube.com/watch?v=gSSsZReIFRk",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Node.js, Express & Microservice Architecture",
      slug: "nodejs-express-microservices",
      category: "Backend" as const,
      description: "Build robust, high-throughput backend services with Node.js, Express, strict TypeScript, and Zod validation.",
      targetRoles: ["Backend Engineer", "Full-Stack Engineer"],
      targetSkills: ["Node.js", "Express", "TypeScript", "REST APIs"],
      difficulty: "advanced" as const,
      estimatedMinutes: 190,
      iconName: "Server",
      accentColor: "#68A063",
      finalAssessmentTopicId: "nodejs",
      isFeatured: true,
      modules: [
        {
          id: "mod_node_1",
          title: "Module 1: Event Loop, Streams & Concurrency",
          description: "Deep dive into libuv, thread pools, streams, and non-blocking I/O architectures.",
          order: 1,
          resources: [
            {
              title: "Node.js Event Loop Phases & Concurrency Mechanics",
              slug: "nodejs-event-loop-deep-dive",
              type: "lesson" as const,
              category: "Backend",
              skills: ["Node.js", "Event Loop"],
              difficulty: "advanced" as const,
              estimatedMinutes: 25,
              content: {
                provider: "SKILLEZO Engineering",
                markdown: `# Node.js Event Loop Phases & Concurrency Mechanics\n\nThe Node.js event loop orchestrates asynchronous execution across 6 primary phases:\n\n1. **Timers**: \`setTimeout\` and \`setInterval\`.\n2. **Pending Callbacks**: I/O callbacks deferred to the next loop iteration.\n3. **Idle, Prepare**: Internal library maintenance.\n4. **Poll**: Retrieves new I/O events; executes I/O callbacks.\n5. **Check**: \`setImmediate\` callbacks execute here.\n6. **Close Callbacks**: \`socket.on('close')\`.\n\n*Microtasks* (\`process.nextTick\` and resolved Promises) execute immediately after each operation, before moving to the next loop phase.`,
              },
            },
            {
              title: "Node.js Official Documentation: Asynchronous Flow",
              slug: "nodejs-official-async-docs",
              type: "external_doc" as const,
              category: "Backend",
              skills: ["Node.js"],
              difficulty: "intermediate" as const,
              estimatedMinutes: 15,
              content: {
                provider: "Node.js Official Docs",
                externalUrl: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick",
              },
            },
          ],
        },
        {
          id: "mod_node_2",
          title: "Module 2: Resilient RESTful APIs & Zod Contracts",
          description: "Clean Architecture, route controllers, Zod payload validation, and rate limiting.",
          order: 2,
          resources: [
            {
              title: "Bulletproof Error Handling & Request Validation with Zod",
              slug: "express-zod-resilience",
              type: "lesson" as const,
              category: "Backend",
              skills: ["Express", "TypeScript", "Zod"],
              difficulty: "intermediate" as const,
              estimatedMinutes: 20,
              content: {
                provider: "SKILLEZO Engineering",
                markdown: `# Bulletproof Error Handling & Request Validation with Zod\n\nBy enforcing type validation at the network boundary, runtime bugs and SQL/NoSQL injections are eliminated before hitting service layers.\n\n\`\`\`typescript\nexport const CreateUserSchema = z.object({\n  email: z.string().email(),\n  password: z.string().min(8),\n});\n\`\`\``,
              },
            },
          ],
        },
      ],
    },
    {
      title: "PostgreSQL & High-Performance Database Optimization",
      slug: "postgresql-database-optimization",
      category: "Database" as const,
      description: "Master relational schema design, B-tree vs GIN indexes, query performance tuning with EXPLAIN ANALYZE, and ACID locks.",
      targetRoles: ["Backend Engineer", "Full-Stack Engineer"],
      targetSkills: ["PostgreSQL", "SQL", "Database Optimization"],
      difficulty: "advanced" as const,
      estimatedMinutes: 160,
      iconName: "Database",
      accentColor: "#336791",
      finalAssessmentTopicId: "postgresql",
      isFeatured: false,
      modules: [
        {
          id: "mod_pg_1",
          title: "Module 1: Query Execution Plans & Indexing",
          description: "Understanding seq scans vs index scans, composite indexes, and index selectivity.",
          order: 1,
          resources: [
            {
              title: "Demystifying EXPLAIN ANALYZE & Buffer Hits",
              slug: "postgres-explain-analyze-guide",
              type: "lesson" as const,
              category: "Database",
              skills: ["PostgreSQL", "SQL"],
              difficulty: "advanced" as const,
              estimatedMinutes: 25,
              content: {
                provider: "SKILLEZO Database Team",
                markdown: `# Demystifying EXPLAIN ANALYZE & Buffer Hits\n\nWhen optimizing slow queries, never guess—always run \`EXPLAIN (ANALYZE, BUFFERS)\`.\n\n### Key Metrics\n- **Planning Time vs Execution Time**\n- **Shared Hit Blocks**: Blocks retrieved from RAM buffer pool (fast).\n- **Shared Read Blocks**: Blocks fetched from disk I/O (slow).\n- **Sequential Scans**: If occurring on tables with >10,000 rows, consider compound B-tree indexing.`,
              },
            },
            {
              title: "PostgreSQL Official Documentation: Index Types",
              slug: "postgres-official-indexing-docs",
              type: "external_doc" as const,
              category: "Database",
              skills: ["PostgreSQL"],
              difficulty: "intermediate" as const,
              estimatedMinutes: 20,
              content: {
                provider: "PostgreSQL Docs",
                externalUrl: "https://www.postgresql.org/docs/current/indexes-types.html",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Docker, CI/CD & Cloud Infrastructure",
      slug: "docker-cicd-cloud-infrastructure",
      category: "DevOps" as const,
      description: "Containerize multi-tier applications with multi-stage Dockerfiles, Docker Compose, and automated GitHub Actions workflows.",
      targetRoles: ["DevOps & Cloud Engineer", "Full-Stack Engineer", "Backend Engineer"],
      targetSkills: ["Docker", "CI/CD", "GitHub Actions", "Cloud Infrastructure"],
      difficulty: "intermediate" as const,
      estimatedMinutes: 150,
      iconName: "Box",
      accentColor: "#2496ED",
      finalAssessmentTopicId: "docker",
      isFeatured: true,
      modules: [
        {
          id: "mod_docker_1",
          title: "Module 1: Production Multi-Stage Docker Builds",
          description: "Creating minimal, secure, non-root Alpine container images for Node.js and Next.js.",
          order: 1,
          resources: [
            {
              title: "Building Sub-100MB Production Node.js Docker Images",
              slug: "production-docker-builds-guide",
              type: "lesson" as const,
              category: "DevOps",
              skills: ["Docker", "DevOps"],
              difficulty: "intermediate" as const,
              estimatedMinutes: 20,
              content: {
                provider: "SKILLEZO Cloud Team",
                markdown: `# Building Sub-100MB Production Node.js Docker Images\n\nMulti-stage Docker builds separate build dependencies (compilers, devDependencies) from runtime artifacts.\n\n\`\`\`dockerfile\n# Build Stage\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Production Stage\nFROM node:20-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nUSER node\nCOPY --from=builder /app/dist ./dist\nCMD ["node", "dist/server.js"]\n\`\`\``,
              },
            },
            {
              title: "Docker Official Get-Started Guide",
              slug: "docker-official-getting-started",
              type: "external_doc" as const,
              category: "DevOps",
              skills: ["Docker"],
              difficulty: "beginner" as const,
              estimatedMinutes: 15,
              content: {
                provider: "Docker Docs",
                externalUrl: "https://docs.docker.com/get-started/",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Distributed System Design & Microservice Scalability",
      slug: "system-design-microservice-scalability",
      category: "System Design" as const,
      description: "Master high-scale architectural design: Redis caching tiers, message queues, rate limiters, and idempotency keys.",
      targetRoles: ["Full-Stack Engineer", "Backend Engineer", "AI/ML Specialist"],
      targetSkills: ["System Design", "Redis", "Distributed Systems", "Caching"],
      difficulty: "advanced" as const,
      estimatedMinutes: 210,
      iconName: "Cpu",
      accentColor: "#8B5CF6",
      finalAssessmentTopicId: "system_design",
      isFeatured: true,
      modules: [
        {
          id: "mod_sd_1",
          title: "Module 1: Caching Strategies & Redis Invalidation",
          description: "Cache-Aside, Write-Through, Write-Behind, TTL jitter, and mitigating thundering herds.",
          order: 1,
          resources: [
            {
              title: "Cache-Aside Pattern & Thundering Herd Defense",
              slug: "cache-aside-patterns-guide",
              type: "lesson" as const,
              category: "System Design",
              skills: ["Redis", "System Design", "Caching"],
              difficulty: "advanced" as const,
              estimatedMinutes: 30,
              content: {
                provider: "SKILLEZO Architecture",
                markdown: `# Cache-Aside Pattern & Thundering Herd Defense\n\nUnder heavy read traffic, when a popular cache key expires, thousands of concurrent requests hit the primary database simultaneously. This is called **Cache Stampede / Thundering Herd**.\n\n### Mitigation Strategies\n1. **Probabilistic Early Expiration (XFetch)**: Recompute value before expiration based on read frequency.\n2. **Distributed Locks (Redlock)**: Only allow a single worker to query the database and repopulate Redis.\n3. **TTL Jitter**: Add random variance (e.g. \`TTL + random(0, 60)\`) so keys do not expire at the exact same millisecond.`,
              },
            },
            {
              title: "System Design Primer: Distributed Caching",
              slug: "system-design-primer-caching",
              type: "external_doc" as const,
              category: "System Design",
              skills: ["System Design"],
              difficulty: "advanced" as const,
              estimatedMinutes: 25,
              content: {
                provider: "GitHub / System Design Primer",
                externalUrl: "https://github.com/donnemartin/system-design-primer#cache",
              },
            },
          ],
        },
      ],
    },
  ];

  console.log(`[LearningHubSeeder] Seeding ${tracksDefinition.length} core learning tracks...`);

  for (const trackDef of tracksDefinition) {
    const modulesWithCreatedResources = [];

    for (const mod of trackDef.modules) {
      const resourceIds = [];

      for (const resDef of mod.resources) {
        let resource = await LearningResourceModel.findOne({ slug: resDef.slug });
        if (!resource) {
          resource = await LearningResourceModel.create({
            title: resDef.title,
            slug: resDef.slug,
            type: resDef.type,
            category: resDef.category,
            skills: resDef.skills,
            difficulty: resDef.difficulty,
            estimatedMinutes: resDef.estimatedMinutes,
            content: resDef.content,
            source: "curated",
            reviewStatus: "published",
          });
          console.log(`  -> Created Resource: ${resDef.title} (${resDef.type})`);
        } else {
          // Update content
          resource.content = resDef.content;
          resource.reviewStatus = "published";
          await resource.save();
        }
        resourceIds.push(resource._id);
      }

      modulesWithCreatedResources.push({
        id: mod.id,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        resourceIds,
      });
    }

    let existingTrack = await LearningTrackModel.findOne({ slug: trackDef.slug });
    if (!existingTrack) {
      await LearningTrackModel.create({
        title: trackDef.title,
        slug: trackDef.slug,
        category: trackDef.category,
        description: trackDef.description,
        targetRoles: trackDef.targetRoles,
        targetSkills: trackDef.targetSkills,
        difficulty: trackDef.difficulty,
        estimatedMinutes: trackDef.estimatedMinutes,
        iconName: trackDef.iconName,
        accentColor: trackDef.accentColor,
        finalAssessmentTopicId: trackDef.finalAssessmentTopicId,
        isFeatured: trackDef.isFeatured,
        published: true,
        modules: modulesWithCreatedResources,
      });
      console.log(`[LearningHubSeeder] ✅ Created Track: ${trackDef.title}`);
    } else {
      existingTrack.title = trackDef.title;
      existingTrack.description = trackDef.description;
      existingTrack.targetRoles = trackDef.targetRoles;
      existingTrack.targetSkills = trackDef.targetSkills;
      existingTrack.difficulty = trackDef.difficulty;
      existingTrack.estimatedMinutes = trackDef.estimatedMinutes;
      existingTrack.iconName = trackDef.iconName;
      existingTrack.accentColor = trackDef.accentColor;
      existingTrack.finalAssessmentTopicId = trackDef.finalAssessmentTopicId;
      existingTrack.isFeatured = trackDef.isFeatured;
      existingTrack.published = true;
      existingTrack.modules = modulesWithCreatedResources;
      await existingTrack.save();
      console.log(`[LearningHubSeeder] 🔄 Updated Track: ${trackDef.title}`);
    }
  }

  const trackCount = await LearningTrackModel.countDocuments();
  const resCount = await LearningResourceModel.countDocuments();

  console.log("\n=======================================================");
  console.log(`[LearningHubSeeder] Successfully seeded Learning Hub!`);
  console.log(`  -> Total Learning Tracks: ${trackCount}`);
  console.log(`  -> Total Learning Resources: ${resCount}`);
  console.log("=======================================================\n");

  await mongoose.disconnect();
}

if (require.main === module || process.argv[1]?.includes("seed-learning-hub")) {
  seedLearningHub().catch((err) => {
    console.error("[LearningHubSeeder] Error seeding learning hub:", err);
    process.exit(1);
  });
}
