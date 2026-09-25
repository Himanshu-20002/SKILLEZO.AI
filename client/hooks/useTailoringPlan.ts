"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { tailoringPlanService } from "@/services/tailoring-plan.service";
import {
  TailoringPlanDTO,
  TailoringIntensity,
  TailoringProposalDTO,
  TargetSection,
} from "@/types/tailoring-plan.types";

export type ProposalFilterSection =
  | "ALL"
  | "SUMMARY"
  | "SKILLS"
  | "EXPERIENCE"
  | "PROJECTS"
  | "SECTION_ORDER"
  | "DO_NOT_ADD";

export function useTailoringPlan(jobProfileId?: string | null) {
  const [plan, setPlan] = useState<TailoringPlanDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [updatingProposalId, setUpdatingProposalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ProposalFilterSection>("ALL");
  const [confirmRegenModalOpen, setConfirmRegenModalOpen] = useState(false);
  const [pendingIntensity, setPendingIntensity] = useState<TailoringIntensity>("BALANCED");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  /**
   * Fetch existing plan or generate initial one.
   */
  const loadPlan = useCallback(
    async (idOverride?: string, intensity: TailoringIntensity = "BALANCED"): Promise<TailoringPlanDTO | null> => {
      const id = idOverride || jobProfileId;
      if (!id) return null;

      setLoading(true);
      setError(null);

      try {
        const result = await tailoringPlanService.createOrGetPlan(id, intensity);
        setPlan(result);
        return result;
      } catch (err: any) {
        const message = err?.message || "Failed to load tailoring plan.";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [jobProfileId]
  );

  /**
   * Regenerate plan with specified intensity.
   */
  const regeneratePlan = useCallback(
    async (newIntensity: TailoringIntensity, force = false): Promise<TailoringPlanDTO | null> => {
      if (!jobProfileId) return null;

      // Check if user has made decisions and force isn't confirmed yet
      const hasDecisions = (plan?.proposals || []).some(
        (p) => !p.isProtected && (p.userDecision === "ACCEPTED" || p.userDecision === "EDITED")
      );

      if (hasDecisions && !force) {
        setPendingIntensity(newIntensity);
        setConfirmRegenModalOpen(true);
        return null;
      }

      setRegenerating(true);
      setError(null);

      try {
        const updated = await tailoringPlanService.regeneratePlan(jobProfileId, newIntensity, force);
        setPlan(updated);
        setConfirmRegenModalOpen(false);
        toast.success(`Tailoring plan regenerated in ${newIntensity} mode!`);
        return updated;
      } catch (err: any) {
        if (err?.code === "REGENERATION_CONFIRMATION_REQUIRED") {
          setPendingIntensity(newIntensity);
          setConfirmRegenModalOpen(true);
        } else {
          const message = err?.message || "Failed to regenerate tailoring plan.";
          setError(message);
          toast.error(message);
        }
        return null;
      } finally {
        setRegenerating(false);
      }
    },
    [jobProfileId, plan]
  );

  /**
   * Accept an individual proposal.
   */
  const acceptProposal = useCallback(
    async (proposalId: string) => {
      if (!jobProfileId) return;
      setUpdatingProposalId(proposalId);
      try {
        const updated = await tailoringPlanService.updateDecision(jobProfileId, proposalId, {
          decision: "ACCEPTED",
        });
        setPlan(updated);
        toast.success("Proposal accepted.");
      } catch (err: any) {
        toast.error(err?.message || "Failed to accept proposal.");
      } finally {
        setUpdatingProposalId(null);
      }
    },
    [jobProfileId]
  );

  /**
   * Reject an individual proposal.
   */
  const rejectProposal = useCallback(
    async (proposalId: string, rejectionReason?: string) => {
      if (!jobProfileId) return;
      setUpdatingProposalId(proposalId);
      try {
        const updated = await tailoringPlanService.updateDecision(jobProfileId, proposalId, {
          decision: "REJECTED",
          rejectionReason,
        });
        setPlan(updated);
        toast.success("Proposal rejected.");
      } catch (err: any) {
        toast.error(err?.message || "Failed to reject proposal.");
      } finally {
        setUpdatingProposalId(null);
      }
    },
    [jobProfileId]
  );

  /**
   * Edit an individual proposal value.
   */
  const editProposal = useCallback(
    async (proposalId: string, editedValue: string) => {
      if (!jobProfileId) return;
      setUpdatingProposalId(proposalId);
      try {
        const updated = await tailoringPlanService.updateDecision(jobProfileId, proposalId, {
          decision: "EDITED",
          editedValue,
        });
        setPlan(updated);
        toast.success("Proposal updated with your custom text.");
      } catch (err: any) {
        toast.error(err?.message || "Failed to update proposal.");
      } finally {
        setUpdatingProposalId(null);
      }
    },
    [jobProfileId]
  );

  /**
   * Batch Accept all remaining actionable non-conflicting proposals.
   */
  const batchAcceptAll = useCallback(async () => {
    if (!jobProfileId || !plan) return;
    const proposals = Array.isArray(plan.proposals) ? plan.proposals : [];
    const pendingNonProtected = proposals.filter(
      (p) => !p.isProtected && p.userDecision === "PENDING"
    );
    if (pendingNonProtected.length === 0) {
      toast.info("No pending proposals to accept.");
      return;
    }

    setLoading(true);
    try {
      const updated = await tailoringPlanService.batchUpdateDecisions(jobProfileId, {
        decisions: pendingNonProtected.map((p) => ({
          proposalId: p.id,
          decision: "ACCEPTED",
        })),
      });
      setPlan(updated);
      toast.success(`Accepted ${pendingNonProtected.length} proposals.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to batch accept proposals.");
    } finally {
      setLoading(false);
    }
  }, [jobProfileId, plan]);

  /**
   * Reset all decisions back to PENDING.
   */
  const batchResetAll = useCallback(async () => {
    if (!jobProfileId || !plan) return;
    const proposals = Array.isArray(plan.proposals) ? plan.proposals : [];
    const actionable = proposals.filter((p) => !p.isProtected);
    if (actionable.length === 0) return;

    setLoading(true);
    try {
      const updated = await tailoringPlanService.batchUpdateDecisions(jobProfileId, {
        decisions: actionable.map((p) => ({
          proposalId: p.id,
          decision: "PENDING",
        })),
      });
      setPlan(updated);
      toast.success("All proposals reset to pending.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset decisions.");
    } finally {
      setLoading(false);
    }
  }, [jobProfileId, plan]);

  /**
   * Filtered proposal list based on active section tab.
   */
  const filteredProposals = useMemo(() => {
    const proposals = Array.isArray(plan?.proposals) ? plan.proposals : [];
    if (activeSection === "ALL") {
      // Exclude DO_NOT_ADD from main list; DO_NOT_ADD displayed in dedicated advisory section
      return proposals.filter((p) => p.action !== "DO_NOT_ADD");
    }
    if (activeSection === "DO_NOT_ADD") {
      return proposals.filter((p) => p.action === "DO_NOT_ADD");
    }
    return proposals.filter(
      (p) => p.target?.section === (activeSection as TargetSection) && p.action !== "DO_NOT_ADD"
    );
  }, [plan, activeSection]);

  const doNotAddProposals = useMemo(() => {
    const proposals = Array.isArray(plan?.proposals) ? plan.proposals : [];
    return proposals.filter((p) => p.action === "DO_NOT_ADD");
  }, [plan]);

  const actionableProposals = useMemo(() => {
    const proposals = Array.isArray(plan?.proposals) ? plan.proposals : [];
    return proposals.filter((p) => !p.isProtected);
  }, [plan]);

  const isFullyReviewed = useMemo(() => {
    if (!plan || !plan.summary) return false;
    return (plan.summary.pendingCount ?? 0) === 0;
  }, [plan]);

  return {
    plan,
    loading,
    regenerating,
    updatingProposalId,
    error,
    activeSection,
    setActiveSection,
    confirmRegenModalOpen,
    setConfirmRegenModalOpen,
    pendingIntensity,
    setPendingIntensity,
    reviewModalOpen,
    setReviewModalOpen,
    loadPlan,
    regeneratePlan,
    acceptProposal,
    rejectProposal,
    editProposal,
    batchAcceptAll,
    batchResetAll,
    filteredProposals,
    doNotAddProposals,
    actionableProposals,
    isFullyReviewed,
  };
}
