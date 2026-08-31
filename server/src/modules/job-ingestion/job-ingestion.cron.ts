import cron from "node-cron";
import { JobIngestionService } from "./job-ingestion.service";
import { JobRepository } from "@/database/repositories/job/JobRepository";

interface IngestionTrack {
  name: string;
  keywords: string;
  location: string;
  limit: number;
}

const INGESTION_TRACKS: IngestionTrack[] = [
  { name: "Frontend / React / Next.js", keywords: "Frontend Developer React Next.js", location: "India", limit: 20 },
  { name: "Backend / Node.js / Python", keywords: "Backend Developer Node.js Python Express", location: "India", limit: 20 },
  { name: "Full-Stack / TypeScript", keywords: "Full Stack Engineer MERN TypeScript", location: "India", limit: 20 },
  { name: "DevOps / Cloud / AWS", keywords: "DevOps AWS Kubernetes Docker Cloud", location: "India", limit: 20 },
  { name: "AI / Machine Learning", keywords: "AI Machine Learning Engineer Python", location: "India", limit: 20 },
];

export class JobIngestionCron {
  private readonly ingestionService: JobIngestionService;
  private readonly jobRepository: JobRepository;
  private isRunning: boolean = false;

  constructor(
    ingestionService?: JobIngestionService,
    jobRepository?: JobRepository
  ) {
    this.ingestionService = ingestionService || new JobIngestionService();
    this.jobRepository = jobRepository || new JobRepository();
  }

  /**
   * Run the end-to-end ingestion and stale cleanup cycle.
   */
  async runCycle(): Promise<{ ingested: number; cleaned: number }> {
    if (this.isRunning) {
      console.log("[JobIngestionCron] Previous ingestion cycle is still running. Skipping.");
      return { ingested: 0, cleaned: 0 };
    }

    this.isRunning = true;
    const startTime = Date.now();
    console.log("[JobIngestionCron] ⏳ Starting scheduled external job lifecycle cycle...");

    let totalIngested = 0;

    try {
      // Step 1: Ingest fresh jobs across tracks with credit control
      for (const track of INGESTION_TRACKS) {
        try {
          console.log(`[JobIngestionCron] Fetching track: "${track.name}"...`);
          const res = await this.ingestionService.ingestJobs({
            provider: "jooble",
            keywords: track.keywords,
            location: track.location,
            limit: track.limit,
          });

          console.log(
            `[JobIngestionCron] -> "${track.name}" complete: received ${res.received}, created ${res.created}, updated ${res.updated}`
          );
          totalIngested += res.created;
        } catch (err: any) {
          console.error(`[JobIngestionCron] Failed track "${track.name}":`, err.message);
        }
      }

      // Step 2: Auto-prune/close stale external jobs older than 14 days
      console.log("[JobIngestionCron] Running 14-day stale job cleanup sweep...");
      const cleanedCount = await this.jobRepository.cleanupStaleExternalJobs(14);
      console.log(`[JobIngestionCron] Stale sweep finished: marked ${cleanedCount} jobs as closed.`);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(
        `[JobIngestionCron] ✅ Lifecycle cycle finished in ${elapsed}s (New jobs: ${totalIngested}, Stale closed: ${cleanedCount})`
      );

      return { ingested: totalIngested, cleaned: cleanedCount };
    } catch (err: any) {
      console.error("[JobIngestionCron] Critical error in lifecycle cycle:", err);
      return { ingested: totalIngested, cleaned: 0 };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Initialize cron schedule (every 12 hours at minute 0: 00:00 and 12:00).
   */
  start(schedule: string = "0 */12 * * *"): void {
    console.log(`[JobIngestionCron] 🕒 Scheduled background job ingestion registered with expression: "${schedule}"`);
    cron.schedule(schedule, async () => {
      await this.runCycle();
    });
  }
}

let cronInstance: JobIngestionCron | null = null;

export function initJobIngestionCron(): JobIngestionCron {
  if (!cronInstance) {
    cronInstance = new JobIngestionCron();
    cronInstance.start();
  }
  return cronInstance;
}
