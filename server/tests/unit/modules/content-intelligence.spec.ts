import { describe, it, expect } from "vitest";
import {
  contentIntelligenceService,
  ContentBulletAnalyzer,
  ContentImpactDetector,
  ContentScoreEngine,
  CONTENT_ENGINE_VERSION,
} from "@/modules/resume-intelligence";

describe("Phase 5: Impact + Content Intelligence Engine", () => {
  describe("Bullet Extraction", () => {
    it("should extract normalized bullets from experience, projects, and summary", () => {
      const extractedData = {
        summary: "Senior Full-Stack Engineer with 6 years of experience building scalable distributed systems.",
        experience: [
          {
            jobTitle: "Senior Software Engineer",
            companyName: "Acme Corp",
            description: "• Built Node.js microservices with PostgreSQL and Redis.\n• Optimized database indexing, reducing query times by 45%.\n• Mentored 4 junior developers.",
          },
        ],
        projects: [
          {
            title: "Real-Time Chat App",
            description: "Engineered a WebSocket chat application handling 10k concurrent users.",
          },
        ],
      };

      const bullets = ContentBulletAnalyzer.extractBullets(extractedData);

      expect(bullets.length).toBe(5); // 3 experience + 1 project + 1 summary
      expect(bullets.some((b) => b.section === "EXPERIENCE" && b.sourceText.includes("Built Node.js"))).toBe(true);
      expect(bullets.some((b) => b.section === "PROJECTS" && b.sourceText.includes("WebSocket chat"))).toBe(true);
      expect(bullets.some((b) => b.section === "SUMMARY" && b.sourceText.includes("Senior Full-Stack"))).toBe(true);
    });
  });

  describe("Action & Weak Action Detection", () => {
    it("should score strong action verbs highly (>= 90)", () => {
      const strong = ContentBulletAnalyzer.analyzeActionAndOwnership("Designed and implemented scalable API gateway.");
      expect(strong.actionScore).toBeGreaterThanOrEqual(90);
      expect(strong.isWeakAction).toBe(false);
      expect(strong.signals.length).toBe(0);
    });

    it("should detect weak action phrases and emit WEAK_ACTION signals", () => {
      const weak = ContentBulletAnalyzer.analyzeActionAndOwnership("Worked on backend services and bug fixes.");
      expect(weak.actionScore).toBeLessThanOrEqual(40);
      expect(weak.isWeakAction).toBe(true);
      expect(weak.signals.some((s) => s.type === "WEAK_ACTION")).toBe(true);
    });

    it("should detect ownership verbs and classify accordingly", () => {
      const ownership = ContentBulletAnalyzer.analyzeActionAndOwnership("Led the migration of legacy monolith to Kubernetes.");
      expect(ownership.isOwnership).toBe(true);
      expect(ownership.ownershipScore).toBeGreaterThanOrEqual(90);
    });
  });

  describe("Metric & Scope Extraction (Zero Fabrication)", () => {
    it("should deterministically extract percentages, multipliers, currencies, scale, and time", () => {
      const text = "Reduced p95 latency by 35% and saved $50K annually across 1M+ requests with 25 ms response time, accelerating deployment by 3x.";
      const metrics = ContentImpactDetector.extractMetrics(text, "test_b1");

      const types = metrics.map((m) => m.metricType);
      expect(types).toContain("PERCENTAGE");
      expect(types).toContain("CURRENCY");
      expect(types).toContain("SCALE");
      expect(types).toContain("TIME");
      expect(types).toContain("MULTIPLIER");

      expect(metrics.find((m) => m.metricType === "PERCENTAGE")?.rawValue).toBe("35%");
      expect(metrics.find((m) => m.metricType === "CURRENCY")?.rawValue).toBe("$50K");
      expect(metrics.find((m) => m.metricType === "MULTIPLIER")?.rawValue).toBe("3x");

      // Verify source traceability
      metrics.forEach((m) => {
        expect(m.sourceText).toBe(text);
        expect(m.confidence).toBeGreaterThan(0.7);
      });
    });

    it("should extract scope units correctly", () => {
      const text = "Managed 5 applications across 3 cross-functional teams with 10 microservices.";
      const scopes = ContentImpactDetector.extractScope(text);

      expect(scopes.length).toBeGreaterThanOrEqual(2);
      expect(scopes.some((s) => s.value.includes("5 applications"))).toBe(true);
      expect(scopes.some((s) => s.value.includes("10 microservices"))).toBe(true);
    });

    it("should return empty metrics array when no numbers or metrics exist (no fabrication)", () => {
      const text = "Worked on team documentation and daily standups.";
      const metrics = ContentImpactDetector.extractMetrics(text, "test_b2");
      expect(metrics).toEqual([]);
    });
  });

  describe("Outcome Detection & Impact Levels", () => {
    it("should detect outcome verbs and causal phrases", () => {
      const outcome = ContentImpactDetector.detectOutcomes("Optimized SQL queries, resulting in improved throughput.");
      expect(outcome.hasOutcome).toBe(true);
      expect(outcome.outcomeScore).toBeGreaterThanOrEqual(75);
    });

    it("should determine HIGH impact when metrics and outcomes coexist", () => {
      const metrics = ContentImpactDetector.extractMetrics("Reduced error rates by 40%.", "b_1");
      const scopes = ContentImpactDetector.extractScope("Managed 5 applications.");
      const level = ContentImpactDetector.determineImpactLevel(metrics, true, scopes);
      expect(level).toBe("HIGH");
    });
  });

  describe("Responsibility vs Achievement Classification", () => {
    it("should classify responsibility-heavy bullets without outcomes as RESPONSIBILITY", () => {
      const bullet = {
        bulletId: "exp_0_bullet_0",
        section: "EXPERIENCE" as const,
        sourceText: "Responsible for writing unit tests and attending agile ceremonies.",
        normalizedText: "responsible for writing unit tests and attending agile ceremonies",
        order: 0,
        evidenceIds: ["exp_0"],
      };

      const analysis = ContentScoreEngine.analyzeBullet(bullet);
      expect(analysis.classification).toContain("RESPONSIBILITY");
      expect(analysis.classification).not.toContain("ACHIEVEMENT");
    });

    it("should classify impactful bullets with metrics as ACHIEVEMENT and IMPACT", () => {
      const bullet = {
        bulletId: "exp_0_bullet_1",
        section: "EXPERIENCE" as const,
        sourceText: "Designed Node.js payment APIs, reducing p95 latency by 31% across 2M monthly transactions.",
        normalizedText: "designed nodejs payment apis reducing p95 latency by 31 across 2m monthly transactions",
        order: 1,
        evidenceIds: ["exp_1"],
      };

      const analysis = ContentScoreEngine.analyzeBullet(bullet);
      expect(analysis.classification).toContain("ACHIEVEMENT");
      expect(analysis.classification).toContain("IMPACT");
      expect(analysis.classification).toContain("METRIC");
      expect(analysis.classification).toContain("TECHNICAL");
      expect(analysis.classification).toContain("OWNERSHIP");
    });
  });

  describe("Evidence Strength Ordering (Strict Ordering Test)", () => {
    it("should rank evidence strength: Low < Medium < High", () => {
      const bulletLow = {
        bulletId: "b_low",
        section: "EXPERIENCE" as const,
        sourceText: "Worked on React.",
        normalizedText: "worked on react",
        order: 0,
        evidenceIds: ["b_low"],
      };

      const bulletMed = {
        bulletId: "b_med",
        section: "EXPERIENCE" as const,
        sourceText: "Built React dashboard components used by 5 internal teams.",
        normalizedText: "built react dashboard components used by 5 internal teams",
        order: 1,
        evidenceIds: ["b_med"],
      };

      const bulletHigh = {
        bulletId: "b_high",
        section: "EXPERIENCE" as const,
        sourceText: "Architected reusable React component library used by 5 teams, reducing duplicate UI code by 35%.",
        normalizedText: "architected reusable react component library used by 5 teams reducing duplicate ui code by 35",
        order: 2,
        evidenceIds: ["b_high"],
      };

      const analysisLow = ContentScoreEngine.analyzeBullet(bulletLow);
      const analysisMed = ContentScoreEngine.analyzeBullet(bulletMed);
      const analysisHigh = ContentScoreEngine.analyzeBullet(bulletHigh);

      expect(analysisLow.evidenceStrengthScore).toBeLessThan(analysisMed.evidenceStrengthScore);
      expect(analysisMed.evidenceStrengthScore).toBeLessThan(analysisHigh.evidenceStrengthScore);

      expect(analysisLow.evidenceStrengthScore).toBeLessThan(50);
      expect(analysisHigh.evidenceStrengthScore).toBeGreaterThanOrEqual(75);
    });
  });

  describe("Repetition and Duplicate Signals", () => {
    it("should flag repeated opening verbs across multiple bullets", () => {
      const bullets = [
        { bulletId: "b1", section: "EXPERIENCE" as const, sourceText: "Built React user interfaces.", normalizedText: "built react user interfaces", order: 0, evidenceIds: ["b1"] },
        { bulletId: "b2", section: "EXPERIENCE" as const, sourceText: "Built Node.js microservices.", normalizedText: "built nodejs microservices", order: 1, evidenceIds: ["b2"] },
        { bulletId: "b3", section: "EXPERIENCE" as const, sourceText: "Built automated CI/CD pipelines.", normalizedText: "built automated cicd pipelines", order: 2, evidenceIds: ["b3"] },
      ];

      const signals = ContentBulletAnalyzer.detectCrossBulletRepetition(bullets);
      expect(signals.some((s) => s.type === "REPETITION" && s.explanationCode === "REPEATED_ACTION_VERB")).toBe(true);
    });

    it("should flag exact duplicate bullets across sections", () => {
      const bullets = [
        { bulletId: "exp_1", section: "EXPERIENCE" as const, sourceText: "Optimized database queries reducing latency by 30 percent.", normalizedText: "optimized database queries reducing latency by 30 percent", order: 0, evidenceIds: ["exp_1"] },
        { bulletId: "proj_1", section: "PROJECTS" as const, sourceText: "Optimized database queries reducing latency by 30 percent.", normalizedText: "optimized database queries reducing latency by 30 percent", order: 1, evidenceIds: ["proj_1"] },
      ];

      const signals = ContentBulletAnalyzer.detectDuplicates(bullets);
      expect(signals.some((s) => s.type === "POSSIBLE_DUPLICATE")).toBe(true);
    });
  });

  describe("Content Intelligence Service Integration", () => {
    it("should perform complete end-to-end content analysis with deterministic score and opportunities", () => {
      const extractedData = {
        summary: "Passionate engineer with experience in cloud architectures and REST APIs.",
        skills: ["React", "Node.js", "PostgreSQL", "AWS"],
        experience: [
          {
            jobTitle: "Senior Full Stack Engineer",
            companyName: "TechCorp",
            description: "• Designed and deployed Node.js microservices on AWS Lambda, handling 500k requests/day.\n• Automated CI/CD pipeline with GitHub Actions, reducing release time by 40%.\n• Worked on React frontend components.",
          },
        ],
        projects: [
          {
            title: "E-Commerce Microservice",
            description: "Engineered payment processing service in Go and Redis with sub-50ms latency.",
          },
        ],
      };

      const result = contentIntelligenceService.analyzeContent(
        extractedData,
        undefined,
        "Full-Stack Engineer",
        { skillBreakdown: { matched: [{ canonicalName: "React" }, { canonicalName: "Node.js" }] } }
      );

      expect(result.engineVersion).toBe(CONTENT_ENGINE_VERSION);
      expect(result.contentScore).toBeGreaterThanOrEqual(60);
      expect(result.contentScore).toBeLessThanOrEqual(100);
      expect(typeof result.label).toBe("string");

      expect(result.sections.experience.bulletCount).toBe(3);
      expect(result.sections.projects.bulletCount).toBe(1);
      expect(result.impactSummary.bulletsAnalyzed).toBeGreaterThanOrEqual(4);
      expect(result.metrics.length).toBeGreaterThanOrEqual(2);

      // Verify opportunities generated for Phase 6
      expect(result.opportunities.length).toBeGreaterThan(0);
      expect(result.opportunities.some((o) => o.type === "SHOW_OWNERSHIP" || o.type === "ADD_MEASURABLE_IMPACT" || o.type === "STRENGTHEN_TECHNICAL_DEPTH")).toBe(true);
    });
  });
});
