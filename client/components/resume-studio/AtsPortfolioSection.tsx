'use client';

import React from 'react';
import { useResumePortfolio } from '@/hooks/useResumePortfolio';
import {
  MasterResumeCard,
  ResumeVariantCard,
  CreateVariantModal,
  RenameVariantModal,
  DeleteVariantModal,
  PortfolioSkeleton,
} from '@/components/portfolio';
import { Plus, Layers, Sparkles } from 'lucide-react';

interface AtsPortfolioSectionProps {
  selectedResumeId?: string | null;
  onSelectResume?: (resumeId: string) => void;
  onOpenEditor?: () => void;
}

export const AtsPortfolioSection: React.FC<AtsPortfolioSectionProps> = ({
  selectedResumeId,
  onSelectResume,
  onOpenEditor,
}) => {
  const {
    portfolio,
    loading,
    actionLoading,
    handleCreateVariant,
    handleRenameVariant,
    handleDeleteVariant,
    handleSyncMaster,
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
  } = useResumePortfolio();

  if (loading || !portfolio) {
    return (
      <div className="space-y-4 pt-2">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <PortfolioSkeleton />
      </div>
    );
  }

  const { master, variants } = portfolio;
  const isMasterActive = Boolean(master && selectedResumeId === master.id);

  return (
    <div className="space-y-4 pt-2">
      {/* 1. Header with Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Resume Portfolio & Variants
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {1 + variants.length} Available
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fixed Master baseline (orange) + branched role-tailored variants. Click any resume to load its score and preview.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Variant</span>
        </button>
      </div>

      {/* 2. Unified Grid: Master Fixed First + Variants in the Same Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 items-stretch">
        {/* Slot 1 (Fixed Position): Master Resume in Orange Shade */}
        {master && (
          <MasterResumeCard
            master={master}
            onSync={handleSyncMaster}
            syncing={actionLoading}
            isActive={isMasterActive}
            onSelect={() => onSelectResume?.(master.id)}
            onOpenEditor={onOpenEditor}
          />
        )}

        {/* Slot 2..N: Role & Targeted Variants */}
        {variants.map((variant) => (
          <ResumeVariantCard
            key={variant.id}
            variant={variant}
            isActive={selectedResumeId === variant.id}
            onSelect={() => onSelectResume?.(variant.id)}
            onOpenEditor={onOpenEditor}
            onRenameClick={openRenameModal}
            onDeleteClick={openDeleteModal}
          />
        ))}

        {/* Slot if 0 variants: Beautiful dashed invitation card in the same row */}
        {variants.length === 0 && (
          <button
            onClick={openCreateModal}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 text-center transition-all cursor-pointer group min-h-[220px]"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Create First Variant
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 max-w-[210px] mt-1 leading-relaxed">
              Branch a targeted resume for a specific job title or company without altering your Master baseline.
            </span>
          </button>
        )}
      </div>

      {/* 3. Portfolio Management Modals */}
      <CreateVariantModal
        isOpen={isCreateOpen}
        onClose={closeCreateModal}
        loading={actionLoading}
        onSubmit={async (input) => {
          const created = await handleCreateVariant(input);
          if (created?._id) {
            onSelectResume?.(created._id);
          }
          return created;
        }}
      />

      <RenameVariantModal
        isOpen={isRenameOpen}
        variant={activeVariant}
        onClose={closeRenameModal}
        loading={actionLoading}
        onSubmit={handleRenameVariant}
      />

      <DeleteVariantModal
        isOpen={isDeleteOpen}
        variant={activeVariant}
        onClose={closeDeleteModal}
        loading={actionLoading}
        onConfirm={async (id) => {
          const success = await handleDeleteVariant(id);
          if (success && selectedResumeId === id && master?.id) {
            onSelectResume?.(master.id);
          }
          return success;
        }}
      />
    </div>
  );
};
