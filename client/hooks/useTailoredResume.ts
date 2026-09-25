"use client";

import { useState, useCallback, useEffect } from "react";
import {
  tailoredResumeService,
  TailoredResumeMetadataDTO,
  TailoredResumeGenerationResultDTO,
} from "@/services/tailored-resume.service";

export interface UseTailoredResumeOptions {
  jobProfileId?: string;
  autoFetch?: boolean;
}

export function useTailoredResume({
  jobProfileId,
  autoFetch = false,
}: UseTailoredResumeOptions = {}) {
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<TailoredResumeMetadataDTO | null>(null);

  const fetchMetadata = useCallback(
    async (id?: string): Promise<TailoredResumeMetadataDTO | null> => {
      const targetId = id || jobProfileId;
      if (!targetId) return null;

      try {
        setLoading(true);
        const data = await tailoredResumeService.getTailoredResume(targetId);
        setTailoredResume(data);
        return data;
      } catch (err: any) {
        console.error("Failed to fetch tailored resume metadata:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [jobProfileId]
  );

  const generate = useCallback(
    async (
      force: boolean = false,
      id?: string
    ): Promise<TailoredResumeGenerationResultDTO | null> => {
      const targetId = id || jobProfileId;
      if (!targetId) {
        setError("Missing job profile ID for generation.");
        return null;
      }

      try {
        setGenerating(true);
        setError(null);
        setErrorCode(null);
        setRequiresConfirmation(false);

        const result = await tailoredResumeService.generateTailoredResume(targetId, force);
        if (result?.resume) {
          setTailoredResume(result.resume);
        }
        return result;
      } catch (err: any) {
        const message = err?.message || "Failed to generate tailored resume.";
        const code = err?.code || err?.details?.code || null;
        setError(message);
        setErrorCode(code);

        if (code === "EXISTING_TAILORED_RESUME_EDITED") {
          setRequiresConfirmation(true);
        }
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [jobProfileId]
  );

  const resetError = useCallback(() => {
    setError(null);
    setErrorCode(null);
    setRequiresConfirmation(false);
  }, []);

  useEffect(() => {
    if (autoFetch && jobProfileId) {
      fetchMetadata(jobProfileId);
    }
  }, [autoFetch, jobProfileId, fetchMetadata]);

  return {
    generating,
    loading,
    error,
    errorCode,
    requiresConfirmation,
    tailoredResume,
    generate,
    fetchMetadata,
    resetError,
  };
}
