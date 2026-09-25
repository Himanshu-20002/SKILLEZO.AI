"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { jobMatchService } from "@/services/job-match.service";
import { JobMatchResultDTO, JobRequirementMatchDTO } from "@/types/job-match.types";

export type MatchFilterTab =
  | "ALL"
  | "PROVEN"
  | "UNDERREPRESENTED"
  | "RELATED"
  | "MISSING";

export function useJobMatch(jobProfileId?: string | null) {
  const [matchResult, setMatchResult] = useState<JobMatchResultDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MatchFilterTab>("ALL");
  const [requiredOnly, setRequiredOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const runMatch = useCallback(
    async (idOverride?: string): Promise<JobMatchResultDTO | null> => {
      const id = idOverride || jobProfileId;
      if (!id) return null;

      setLoading(true);
      setError(null);

      try {
        const result = await jobMatchService.runJobMatch(id);
        setMatchResult(result);
        toast.success("Career evidence successfully matched!");
        return result;
      } catch (err: any) {
        const message = err?.message || "Failed to match career evidence against job requirements.";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [jobProfileId]
  );

  const loadMatch = useCallback(
    async (idOverride?: string): Promise<JobMatchResultDTO | null> => {
      const id = idOverride || jobProfileId;
      if (!id) return null;

      setLoading(true);
      setError(null);

      try {
        const result = await jobMatchService.getJobMatch(id);
        setMatchResult(result);
        return result;
      } catch {
        // If not found yet, run it automatically
        return await runMatch(id);
      } finally {
        setLoading(false);
      }
    },
    [jobProfileId, runMatch]
  );

  const filteredMatches = useMemo(() => {
    if (!matchResult?.requirementMatches) return [];

    return matchResult.requirementMatches.filter((item: JobRequirementMatchDTO) => {
      // 1. Filter by importance toggle
      if (requiredOnly && item.importance !== "REQUIRED") {
        return false;
      }

      // 2. Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesTech = item.category.toLowerCase().includes(q);
        const matchesEvidence = item.evidence.some(
          (ev) => ev.label.toLowerCase().includes(q) || (ev.excerpt && ev.excerpt.toLowerCase().includes(q))
        );
        if (!matchesName && !matchesTech && !matchesEvidence) return false;
      }

      // 3. Filter by Tab
      switch (filter) {
        case "PROVEN":
          return item.matchState === "PROVEN_RELEVANT";
        case "UNDERREPRESENTED":
          return item.matchState === "PROVEN_UNDERREPRESENTED";
        case "RELATED":
          return item.matchState === "RELATED_EVIDENCE" || item.matchState === "PARTIAL_MATCH";
        case "MISSING":
          return item.matchState === "MISSING" || item.matchState === "INSUFFICIENT_EVIDENCE";
        case "ALL":
        default:
          return true;
      }
    });
  }, [matchResult, filter, requiredOnly, searchQuery]);

  return {
    matchResult,
    loading,
    error,
    filter,
    setFilter,
    requiredOnly,
    setRequiredOnly,
    searchQuery,
    setSearchQuery,
    filteredMatches,
    loadMatch,
    runMatch,
  };
}
