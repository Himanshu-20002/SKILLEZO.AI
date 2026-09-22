'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { resumeService } from '@/services/resume.service';
import {
  ResumePortfolioItem,
  ResumePortfolioResponse,
  CreateVariantInput,
  ResumeRecord,
} from '@/types/resume';
import { toast } from 'sonner';

/**
 * useResumePortfolio — Thin coordinator for the candidate's Resume Portfolio.
 * Strictly manages UI state and API orchestration without encoding business domain rules.
 */
export function useResumePortfolio() {
  const [portfolio, setPortfolio] = useState<ResumePortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  // Modal Dialog UI States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeVariant, setActiveVariant] = useState<ResumePortfolioItem | null>(null);

  // 1. Fetch Lightweight Portfolio
  const loadPortfolio = useCallback(async () => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const data = await resumeService.getResumePortfolio();
      setPortfolio(data);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load resume portfolio';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  // 2. Create Variant
  const handleCreateVariant = useCallback(
    async (input: CreateVariantInput): Promise<ResumeRecord | null> => {
      try {
        setActionLoading(true);
        const created = await resumeService.createResumeVariant(input);
        toast.success(`Created variant "${input.displayName.trim()}"`);
        setIsCreateOpen(false);
        await loadPortfolio();
        return created;
      } catch (err: any) {
        const msg = err?.message || 'Failed to create resume variant';
        toast.error(msg);
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [loadPortfolio]
  );

  // 3. Rename Variant
  const handleRenameVariant = useCallback(
    async (resumeId: string, newDisplayName: string): Promise<boolean> => {
      try {
        setActionLoading(true);
        await resumeService.renameResume(resumeId, newDisplayName.trim());
        toast.success('Resume renamed successfully');
        setIsRenameOpen(false);
        setActiveVariant(null);
        await loadPortfolio();
        return true;
      } catch (err: any) {
        const msg = err?.message || 'Failed to rename resume';
        toast.error(msg);
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [loadPortfolio]
  );

  // 4. Delete Variant
  const handleDeleteVariant = useCallback(
    async (resumeId: string): Promise<boolean> => {
      try {
        setActionLoading(true);
        await resumeService.deleteResume(resumeId);
        toast.success('Resume variant deleted');
        setIsDeleteOpen(false);
        setActiveVariant(null);
        await loadPortfolio();
        return true;
      } catch (err: any) {
        const msg = err?.message || 'Failed to delete resume variant';
        toast.error(msg);
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [loadPortfolio]
  );

  // 5. Sync Master Resume
  const handleSyncMaster = useCallback(async (): Promise<void> => {
    try {
      setActionLoading(true);
      await resumeService.syncMasterResume();
      toast.success('Master Resume synced with latest Career Profile facts');
      await loadPortfolio();
    } catch (err: any) {
      const msg = err?.message || 'Failed to sync Master Resume';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }, [loadPortfolio]);

  // Modal Helpers
  const openCreateModal = () => setIsCreateOpen(true);
  const closeCreateModal = () => setIsCreateOpen(false);

  const openRenameModal = (variant: ResumePortfolioItem) => {
    setActiveVariant(variant);
    setIsRenameOpen(true);
  };
  const closeRenameModal = () => {
    setActiveVariant(null);
    setIsRenameOpen(false);
  };

  const openDeleteModal = (variant: ResumePortfolioItem) => {
    setActiveVariant(variant);
    setIsDeleteOpen(true);
  };
  const closeDeleteModal = () => {
    setActiveVariant(null);
    setIsDeleteOpen(false);
  };

  return {
    portfolio,
    loading,
    actionLoading,
    error,
    refreshPortfolio: loadPortfolio,

    // Actions
    handleCreateVariant,
    handleRenameVariant,
    handleDeleteVariant,
    handleSyncMaster,

    // Modal States & Triggers
    isCreateOpen,
    isRenameOpen,
    isDeleteOpen,
    activeVariant,
    openCreateModal,
    closeCreateModal,
    openRenameModal,
    closeRenameModal,
    openDeleteModal,
    closeDeleteModal,
  };
}
