import { ValidatedJoobleJob } from "./jooble.schema";
import { NormalizedExternalJob } from "../../types/normalized-job.types";

function cleanHtmlSnippet(snippet?: string | null): string {
  if (!snippet) return "No description provided";
  return snippet
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

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
      title: cleanHtmlSnippet(job.title) || "Untitled Position",
      companyName: cleanHtmlSnippet(job.company || "Unknown Company"),
      description: cleanHtmlSnippet(job.snippet),
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
