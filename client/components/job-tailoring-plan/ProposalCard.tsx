"use client";

import React, { useState } from "react";
import {
  TailoringProposalDTO,
  TailoringAction,
  ProposalDecision,
} from "@/types/tailoring-plan.types";
import {
  Check,
  X,
  Edit3,
  ChevronDown,
  ChevronUp,
  Shield,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface ProposalCardProps {
  proposal: TailoringProposalDTO;
  onAccept: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onEdit: (id: string, customValue: string) => void;
  isUpdating?: boolean;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onAccept,
  onReject,
  onEdit,
  isUpdating = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    proposal.userEditedValue || proposal.proposedValue || ""
  );
  const [showEvidence, setShowEvidence] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      onEdit(proposal.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleConfirmReject = () => {
    onReject(proposal.id, rejectReason.trim() || undefined);
    setRejectModalOpen(false);
  };

  // Action badge styles
  const getActionBadge = (action: TailoringAction) => {
    switch (action) {
      case "PROMOTE":
        return {
          label: "Promote",
          className: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "EMPHASIZE":
        return {
          label: "Emphasize",
          className: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
        };
      case "REWRITE":
        return {
          label: "Rewrite",
          className: "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        };
      case "REORDER":
        return {
          label: "Reorder",
          className: "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      case "DE_EMPHASIZE":
        return {
          label: "De-emphasize",
          className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        };
      case "DO_NOT_ADD":
        return {
          label: "Shielded Exclusion",
          className: "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        };
      default:
        return {
          label: action,
          className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        };
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "EXPERIENCE":
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case "PROJECT":
        return <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "EDUCATION":
        return <GraduationCap className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Award className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const actionMeta = getActionBadge(proposal.action);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        proposal.userDecision === "ACCEPTED"
          ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300/80 dark:border-emerald-800/80"
          : proposal.userDecision === "EDITED"
          ? "bg-blue-50/20 dark:bg-blue-950/10 border-blue-300/80 dark:border-blue-800/80"
          : proposal.userDecision === "REJECTED"
          ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
          : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
      }`}
    >
      {/* 1. Header Badges & Decision Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${actionMeta.className}`}
          >
            {actionMeta.label}
          </span>
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {proposal.target.section}
          </span>
          {proposal.priority === "HIGH" && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
              High Priority
            </span>
          )}
        </div>

        {/* Current Decision Pill */}
        <div>
          {proposal.isProtected ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Shield className="w-3 h-3" />
              <span>System Shield</span>
            </span>
          ) : proposal.userDecision === "ACCEPTED" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <Check className="w-3 h-3" />
              <span>Accepted</span>
            </span>
          ) : proposal.userDecision === "EDITED" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
              <Edit3 className="w-3 h-3" />
              <span>Custom Edited</span>
            </span>
          ) : proposal.userDecision === "REJECTED" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
              <X className="w-3 h-3" />
              <span>Rejected</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
              Pending Review
            </span>
          )}
        </div>
      </div>

      {/* 2. Proposal Title & Rationale */}
      <div className="mb-3">
        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {proposal.title}
        </h5>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          {proposal.reason}
        </p>
      </div>

      {/* 3. Diff View / Value Comparison */}
      {(proposal.currentValue || proposal.proposedValue) && (
        <div className="mb-3 space-y-2">
          {/* Current Master Resume Value */}
          {proposal.currentValue && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                Current Resume Value
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono leading-relaxed line-through decoration-rose-400/60">
                {proposal.currentValue}
              </div>
            </div>
          )}

          {/* Proposed / Custom Value */}
          {!isEditing ? (
            <div
              className={`p-2.5 rounded-xl border ${
                proposal.userDecision === "EDITED"
                  ? "bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900"
                  : "bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  {proposal.userDecision === "EDITED"
                    ? "Your Custom Approved Text"
                    : "Proposed Tailored Text"}
                </span>
                {!proposal.isProtected && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditValue(proposal.userEditedValue || proposal.proposedValue || "");
                      setIsEditing(true);
                    }}
                    className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Edit Text</span>
                  </button>
                )}
              </div>
              <div className="text-xs font-mono font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                {proposal.userEditedValue || proposal.proposedValue}
              </div>
            </div>
          ) : (
            /* Inline Text Editor */
            <div className="p-3 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/30 border border-indigo-300 dark:border-indigo-800 space-y-2">
              <label className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                Customize Proposed Text (Truth Preserved)
              </label>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 outline-none"
                placeholder="Enter custom phrasing..."
              />
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  Must be supported by authentic career evidence.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!editValue.trim() || isUpdating}
                    className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Save & Approve
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Grounding Evidence Drawer Toggle */}
      {proposal.evidence.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowEvidence(!showEvidence)}
            className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Verified Career Evidence ({proposal.evidence.length})</span>
            {showEvidence ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showEvidence && (
            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in">
              {proposal.evidence.map((ev, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <div className="mt-0.5 shrink-0">{getSourceIcon(ev.sourceType)}</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-[11px]">
                      {ev.label}{" "}
                      <span className="font-mono text-[9px] text-slate-400 uppercase">
                        ({ev.sourceType})
                      </span>
                    </div>
                    {ev.excerpt && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 italic">
                        "{ev.excerpt}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Action Control Buttons (for Non-Protected Proposals) */}
      {!proposal.isProtected && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[10px] text-slate-400 dark:text-slate-500">
            Confidence: {Math.round(proposal.confidence * 100)}% grounded
          </div>

          <div className="flex items-center gap-1.5">
            {/* Accept Button */}
            <button
              type="button"
              disabled={isUpdating || proposal.userDecision === "ACCEPTED"}
              onClick={() => onAccept(proposal.id)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                proposal.userDecision === "ACCEPTED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{proposal.userDecision === "ACCEPTED" ? "Accepted" : "Accept"}</span>
            </button>

            {/* Reject Button */}
            <button
              type="button"
              disabled={isUpdating || proposal.userDecision === "REJECTED"}
              onClick={() => setRejectModalOpen(true)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                proposal.userDecision === "REJECTED"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>{proposal.userDecision === "REJECTED" ? "Rejected" : "Reject"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Rejection Note Modal/Prompt */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Reject Proposal
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              This change will be excluded from your tailored resume variant. Optionally provide a reason:
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Prefer keeping original bullet phrasing"
              className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
