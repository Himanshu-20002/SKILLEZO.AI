import { ValidatedJoobleJob } from "./jooble.schema";
import { NormalizedExternalJob } from "../../types/normalized-job.types";

export class JoobleMapper {
  static toNormalized(job: ValidatedJoobleJob): NormalizedExternalJob {
    const rawLocation = (job.location || "").trim();
    const rawSalary = String(job.salary || "").trim();
    const parsedDate = job.updated ? new Date(job.updated) : undefined;
    const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

    return {
      externalId: String(job.id).trim(),
      sourceType: "external",
      sourceProvider: "jooble",
      title: job.title.trim() || "Untitled Position",
      companyName: (job.company || "Unknown Company").trim(),
      description: job.snippet?.trim() || "No description provided",
      location: {
        raw: rawLocation || "Not specified",
      },
      employmentType: (job.type || "").trim() || undefined,
      salary: rawSalary ? { raw: rawSalary } : undefined,
      sourceUrl: (job.link || "").trim(),
      sourceName: (job.source || "Jooble").trim(),
      sourceUpdatedAt: isValidDate ? parsedDate : undefined,
    };
  }
}
