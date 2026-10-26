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

import { LearningResourceModel } from "./models/LearningResource.model";

export async function seedPdfVault() {
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/skillezo";

  console.log(`[PdfVaultSeeder] Connecting to MongoDB: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`);
  await mongoose.connect(mongoUri);
  console.log("[PdfVaultSeeder] Connected successfully.");

  const pdfDocuments = [
    {
      title: "React 19 & Next.js 15 Full-Stack Interview Guide",
      slug: "react-19-nextjs-interview-guide-pdf",
      type: "pdf_document" as const,
      category: "Frontend",
      skills: ["React", "Next.js", "Server Components", "TypeScript"],
      difficulty: "advanced" as const,
      estimatedMinutes: 45,
      content: {
        provider: "SKILLEZO Curated Vault",
        pdfKey: "react-19-interview-guide.pdf",
        pdfPageCount: 32,
        downloadAllowed: true,
        markdown: `# React 19 & Next.js 15 Technical Interview Guide\n\nComprehensive 32-page compilation covering React 19 Actions (\`useActionState\`, \`useOptimistic\`), Server Components vs Client Components, Streaming SSR, Fiber scheduler, and Core Web Vitals optimizations.\n\n### Included Chapters\n1. React 19 Action Primitives and Transition Lifecycle\n2. Next.js 15 App Router Architecture & Parallel Routes\n3. Memory Leak Prevention & Profiling in Large Component Trees\n4. Hydration Mismatches & Edge Case Troubleshooting`,
        questions: [
          {
            id: "q_r19_pdf_1",
            question: "How does React 19's `useActionState` eliminate manual pending booleans during async mutations?",
            codeSnippet: "const [state, formAction, isPending] = useActionState(updateUser, null);",
            options: [
              "It automatically wraps the async action in a React Transition, updating isPending natively during Promise resolution.",
              "It forces the browser thread to lock synchronously until the server responds.",
              "It delegates async dispatching to an external Web Worker automatically.",
              "It bypasses the virtual DOM and mutates browser DOM nodes directly."
            ],
            correctOptionIndex: 0,
            explanation: "useActionState natively invokes startTransition internally, keeping the UI interactive and providing accurate pending states without manual boolean flags.",
            difficulty: "intermediate" as const,
          },
          {
            id: "q_r19_pdf_2",
            question: "Under what conditions should a Next.js component be marked with `'use client'`?",
            options: [
              "Only when it uses browser APIs (window/document), React lifecycle hooks (useState, useEffect), or interactive event listeners (onClick).",
              "Whenever a component fetches data from a database or remote microservice.",
              "On every root page.tsx file in the App Router.",
              "Only when rendering static SVG graphic icons."
            ],
            correctOptionIndex: 0,
            explanation: "By default all components in App Router are Server Components. 'use client' is only required at the boundary where browser interactivity or client hooks are needed.",
            difficulty: "intermediate" as const,
          },
          {
            id: "q_r19_pdf_3",
            question: "What is the primary benefit of React Server Components streaming over traditional SSR?",
            options: [
              "Pages stream HTML chunks incrementally using HTTP Chunked Transfer Encoding, unblocking fast TTFB.",
              "Server Components compile into WebAssembly for 10x faster execution.",
              "Streaming eliminates the need for CSS stylesheets in the browser.",
              "It converts client-side state into cookie headers automatically."
            ],
            correctOptionIndex: 0,
            explanation: "RSC streaming enables the server to immediately flush initial layout shells with Suspense fallbacks while slower data dependencies finish asynchronously.",
            difficulty: "advanced" as const,
          },
        ],
      },
      source: "public_bank" as const,
      reviewStatus: "published" as const,
    },
    {
      title: "Node.js Backend Concurrency & Event Loop Q&A Bank",
      slug: "nodejs-concurrency-event-loop-qa-pdf",
      type: "pdf_document" as const,
      category: "Backend",
      skills: ["Node.js", "Event Loop", "Microservices", "Concurrency"],
      difficulty: "advanced" as const,
      estimatedMinutes: 50,
      content: {
        provider: "SKILLEZO Curated Vault",
        pdfKey: "nodejs-concurrency-qa.pdf",
        pdfPageCount: 26,
        downloadAllowed: true,
        markdown: `# Node.js Backend Concurrency & Event Loop Q&A Bank\n\nDeep technical analysis of libuv event loop phases, microtask queue starvation, streams backpressure, clustering, and worker threads.\n\n### Key Sections\n1. Event Loop Phases (Timers, Poll, Check, Close)\n2. process.nextTick vs Promise.then vs setImmediate\n3. Handling Stream Backpressure with pipe() and pipeline()\n4. Clustering vs Worker Threads in Production`,
        questions: [
          {
            id: "q_node_pdf_1",
            question: "In what exact order does Node.js execute `process.nextTick`, `Promise.resolve()`, and `setImmediate()`?",
            options: [
              "process.nextTick queue first, then Promise microtask queue, and finally setImmediate in the Check phase.",
              "setImmediate executes first, followed by process.nextTick and Promise.resolve.",
              "All three execute randomly based on CPU scheduler thread priority.",
              "Promise microtasks execute before process.nextTick in all Node versions."
            ],
            correctOptionIndex: 0,
            explanation: "Node.js drains the nextTickQueue immediately before resolving any other microtasks, while setImmediate callbacks are deferred to the Check phase of the event loop.",
            difficulty: "advanced" as const,
          },
          {
            id: "q_node_pdf_2",
            question: "What failure scenario occurs if a Node.js readable stream pushes data faster than a writable stream can consume it without backpressure handling?",
            options: [
              "Unbounded memory accumulation in RAM buffers leading to process crash via OOM (Out Of Memory).",
              "The Node process automatically drops slow HTTP requests silently.",
              "The event loop switches to multi-threaded execution to absorb the data.",
              "Data packets are automatically serialized into disk swap partitions."
            ],
            correctOptionIndex: 0,
            explanation: "Without backpressure (or using stream.pipeline()), the internal buffer queue expands indefinitely until Node exhausts memory and terminates with an OOM error.",
            difficulty: "advanced" as const,
          },
        ],
      },
      source: "public_bank" as const,
      reviewStatus: "published" as const,
    },
    {
      title: "PostgreSQL Indexing & Performance Tuning Cheat-Sheet",
      slug: "postgresql-indexing-performance-cheatsheet-pdf",
      type: "pdf_document" as const,
      category: "Database",
      skills: ["PostgreSQL", "SQL", "Indexing", "Query Optimization"],
      difficulty: "advanced" as const,
      estimatedMinutes: 40,
      content: {
        provider: "SKILLEZO Curated Vault",
        pdfKey: "postgres-indexing-cheatsheet.pdf",
        pdfPageCount: 18,
        downloadAllowed: true,
        markdown: `# PostgreSQL Indexing & Query Tuning Reference\n\nHigh-density architectural cheat-sheet for database engineers. Covers B-tree vs GIN vs GiST, composite index column ordering, partial indexes, and interpreting EXPLAIN (ANALYZE, BUFFERS).\n\n### Highlights\n- Left-to-right composite index selectivity\n- Eliminating sequential scans on high-cardinality tables\n- Partitioning strategies (Range vs Hash) for 10M+ row tables\n- Dead tuple bloat and VACUUM tuning`,
        questions: [
          {
            id: "q_pg_pdf_1",
            question: "When creating a composite B-tree index on columns (A, B), which query CANNOT utilize this index effectively?",
            options: [
              "SELECT * FROM tbl WHERE B = 'value'; (skipping leading column A)",
              "SELECT * FROM tbl WHERE A = 'value' AND B = 'value';",
              "SELECT * FROM tbl WHERE A = 'value';",
              "SELECT * FROM tbl WHERE A = 'value' ORDER BY B;"
            ],
            correctOptionIndex: 0,
            explanation: "B-tree indexes require query predicates to specify the leftmost leading columns in sequence. Filtering solely on column B cannot navigate the composite index tree.",
            difficulty: "intermediate" as const,
          },
          {
            id: "q_pg_pdf_2",
            question: "In `EXPLAIN (ANALYZE, BUFFERS)` output, what does `Buffers: shared hit=42 read=1200` indicate?",
            options: [
              "42 disk blocks were found in RAM buffer cache, while 1200 blocks had to be read from slow disk storage.",
              "1200 queries hit the cache while 42 were rejected.",
              "The table has 42 dead tuples and 1200 indexes.",
              "The query ran 42 times faster than default sequential scan."
            ],
            correctOptionIndex: 0,
            explanation: "'Shared hit' represents memory cache hits in shared_buffers, while 'read' represents disk I/O fetches from storage.",
            difficulty: "advanced" as const,
          },
        ],
      },
      source: "public_bank" as const,
      reviewStatus: "published" as const,
    },
    {
      title: "Docker & Kubernetes Production Commands & Architecture Manual",
      slug: "docker-k8s-production-manual-pdf",
      type: "pdf_document" as const,
      category: "DevOps",
      skills: ["Docker", "Kubernetes", "DevOps", "Containers"],
      difficulty: "intermediate" as const,
      estimatedMinutes: 45,
      content: {
        provider: "SKILLEZO Curated Vault",
        pdfKey: "docker-k8s-manual.pdf",
        pdfPageCount: 24,
        downloadAllowed: true,
        markdown: `# Docker & Kubernetes Production Reference Manual\n\nCommand cheatsheet, YAML manifest templates, and security hardening guidelines for microservice container deployment.\n\n### Core Chapters\n- Multi-stage Docker builds and Alpine vs Distroless images\n- Pod lifecycle, liveness vs readiness probes\n- ConfigMaps, Secrets, and non-root security contexts\n- Rolling updates, Horizontal Pod Autoscaling (HPA)`,
        questions: [
          {
            id: "q_k8s_pdf_1",
            question: "What is the key difference between a Kubernetes `livenessProbe` and a `readinessProbe`?",
            options: [
              "A failing liveness probe restarts the container; a failing readiness probe removes the Pod from Service endpoints to stop receiving traffic.",
              "Liveness probes only run at startup; readiness probes run every second indefinitely.",
              "Readiness probes allocate more RAM to the Pod when traffic surges.",
              "Liveness probes communicate with DNS servers directly while readiness probes do not."
            ],
            correctOptionIndex: 0,
            explanation: "Liveness probes detect deadlocks and restart containers. Readiness probes determine when a Pod is ready to serve traffic without restarting it.",
            difficulty: "intermediate" as const,
          },
        ],
      },
      source: "public_bank" as const,
      reviewStatus: "published" as const,
    },
    {
      title: "System Design Distributed Patterns & Tradeoffs Vault",
      slug: "system-design-patterns-tradeoffs-pdf",
      type: "pdf_document" as const,
      category: "System Design",
      skills: ["System Design", "Distributed Systems", "Redis", "Kafka"],
      difficulty: "advanced" as const,
      estimatedMinutes: 60,
      content: {
        provider: "SKILLEZO Curated Vault",
        pdfKey: "system-design-patterns.pdf",
        pdfPageCount: 36,
        downloadAllowed: true,
        markdown: `# System Design Distributed Patterns & Tradeoffs Vault\n\n36-page deep dive covering CAP theorem, PACELC, distributed locks (Redlock), event-driven queues (Kafka), idempotent API design, and database sharding.\n\n### Chapters\n1. Cache-Aside vs Write-Through and Stampede Mitigation\n2. Idempotency Keys in Payment & Order Processing\n3. Eventual Consistency & Two-Phase Commit (2PC) Tradeoffs\n4. Rate Limiting Algorithms (Token Bucket, Leaky Bucket, Sliding Window)`,
        questions: [
          {
            id: "q_sd_pdf_1",
            question: "How do Idempotency Keys protect financial payment processing endpoints against double-charging during network timeouts?",
            options: [
              "The server stores the unique request key; subsequent requests with the same key return the cached original response without reprocessing.",
              "They encrypt credit card numbers using symmetric AES-256 keys.",
              "They delete duplicate rows from the database every midnight via cron.",
              "They automatically refund duplicate transactions within 24 hours."
            ],
            correctOptionIndex: 0,
            explanation: "Idempotency keys ensure that duplicate or retried requests produce the exact same outcome without executing side-effects multiple times.",
            difficulty: "advanced" as const,
          },
        ],
      },
      source: "public_bank" as const,
      reviewStatus: "published" as const,
    },
  ];

  console.log(`[PdfVaultSeeder] Seeding ${pdfDocuments.length} PDF question bank documents...`);

  for (const doc of pdfDocuments) {
    let existing = await LearningResourceModel.findOne({ slug: doc.slug });
    if (!existing) {
      await LearningResourceModel.create(doc);
      console.log(`  -> Created PDF Resource: ${doc.title}`);
    } else {
      existing.title = doc.title;
      existing.content = doc.content;
      existing.reviewStatus = "published";
      await existing.save();
      console.log(`  -> Updated PDF Resource: ${doc.title}`);
    }
  }

  const count = await LearningResourceModel.countDocuments({ type: "pdf_document" });
  console.log("\n=======================================================");
  console.log(`[PdfVaultSeeder] Successfully seeded PDF Vault!`);
  console.log(`  -> Total Technical PDFs in Vault: ${count}`);
  console.log("=======================================================\n");

  await mongoose.disconnect();
}

if (require.main === module || process.argv[1]?.includes("seed-pdf-vault")) {
  seedPdfVault().catch((err) => {
    console.error("[PdfVaultSeeder] Error seeding PDF vault:", err);
    process.exit(1);
  });
}
