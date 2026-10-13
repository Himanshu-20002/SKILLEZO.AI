'use client';

import React from 'react';
import { TokenUsageLogItem } from '@/services/plan.service';
import {
  FileText,
  MessageSquare,
  Sparkles,
  Award,
  Layers,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
} from 'lucide-react';

interface TokenHistoryTableProps {
  logs: TokenUsageLogItem[];
  page: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

export const TokenHistoryTable: React.FC<TokenHistoryTableProps> = ({
  logs,
  page,
  totalPages,
  totalRecords,
  onPageChange,
  isLoading,
}) => {
  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'WELCOME_BONUS':
      case 'PROMOTION_BONUS':
      case 'PLAN_UPGRADE':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'RESUME_ATS':
        return <FileText className="w-4 h-4 text-[#3D5AFE]" />;
      case 'TAILORED_RESUME':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'CAREER_COACH':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'MOCK_INTERVIEW':
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-3xl p-6 sm:p-7 bg-white/80 dark:bg-[#0E1538]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#3D5AFE]" />
            <span>Token Usage History</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of your AI tokens and platform credit deductions ({totalRecords} records)
          </p>
        </div>
      </div>

      {/* Table */}
      {logs.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No token activity yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            When you run AI tools like Resume ATS or Career Coach, usage entries will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-3">Action / Feature</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 text-right">Tokens</th>
                <th className="py-3 px-3 text-right">Balance After</th>
                <th className="py-3 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {logs.map((item) => {
                const isBonus = item.tokensDeducted === 0 || item.feature.includes('BONUS');

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0">
                          {getFeatureIcon(item.feature)}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {item.feature.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {item.description}
                    </td>

                    <td className="py-3 px-3 text-right font-bold">
                      {isBonus ? (
                        <span className="text-emerald-500 font-extrabold">Grant</span>
                      ) : (
                        <span className="text-rose-500">
                          -{item.tokensDeducted.toLocaleString()}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {item.balanceAfter.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Page <strong className="text-slate-700 dark:text-slate-200">{page}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
