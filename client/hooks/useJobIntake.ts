"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { jobProfileService } from "@/services/job-profile.service";
import { JobProfile, CreateJobProfileDTO } from "@/types/job-profile.types";
import {
  saveJobIntakeDraft,
  saveJobTailoringSession,
  getJobTailoringSession,
  clearJobTailoringSession,
} from "@/lib/job-intake-storage";

export type IntakeStatus = "idle" | "submitting" | "analyzing" | "success" | "error";

export function useJobIntake() {
  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null);
  const [status, setStatus] = useState<IntakeStatus>("idle");
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [progressStep, setProgressStep] = useState<number>(0);

  // Restore active job profile from session if user navigates or reopens modal
  useEffect(() => {
    const session = getJobTailoringSession();
    if (session?.jobProfileId) {
      jobProfileService
        .getJobProfile(session.jobProfileId)
        .then((profile) => {
          if (profile) {
            setJobProfile(profile);
            setStatus("success");
          }
        })
        .catch(() => {
          // If profile not found, session expired or cleared
        });
    }
  }, []);

  const submitJob = useCallback(async (input: CreateJobProfileDTO): Promise<JobProfile | null> => {
    // Preserve input in draft immediately
    saveJobIntakeDraft(input);

    setStatus("analyzing");
    setError(null);
    setProgressStep(1);

    // Dynamic progress step timers for responsive visual feedback
    const timer1 = setTimeout(() => setProgressStep(2), 1200);
    const timer2 = setTimeout(() => setProgressStep(3), 2800);

    try {
      const profile = await jobProfileService.createAndAnalyze(input);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgressStep(4);
      setJobProfile(profile);
      setStatus("success");

      // Save ongoing tailoring session
      saveJobTailoringSession({
        jobProfileId: profile.id,
        jobTitle: profile.jobTitle,
        company: profile.company,
        activeStep: "ANALYSIS",
      });

      toast.success("Job description successfully analyzed!");
      return profile;
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      const code = err?.code || err?.details?.code || "AI_ANALYSIS_FAILED";
      const message = err?.message || "Failed to analyze job description. Please try again.";
      setError({ message, code });
      setStatus("error");
      toast.error(message);
      return null;
    }
  }, []);

  const reanalyzeJob = useCallback(async (id: string): Promise<JobProfile | null> => {
    setStatus("analyzing");
    setError(null);
    setProgressStep(2);

    const timer = setTimeout(() => setProgressStep(3), 2000);

    try {
      const profile = await jobProfileService.reanalyze(id);
      clearTimeout(timer);
      setProgressStep(4);
      setJobProfile(profile);
      setStatus("success");
      toast.success("Job analysis refreshed!");
      return profile;
    } catch (err: any) {
      clearTimeout(timer);
      const code = err?.code || err?.details?.code || "AI_ANALYSIS_FAILED";
      const message = err?.message || "Failed to re-analyze job description.";
      setError({ message, code });
      setStatus("error");
      toast.error(message);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setJobProfile(null);
    setStatus("idle");
    setError(null);
    setProgressStep(0);
    clearJobTailoringSession();
  }, []);

  return {
    jobProfile,
    setJobProfile,
    status,
    error,
    progressStep,
    submitJob,
    reanalyzeJob,
    reset,
  };
}
