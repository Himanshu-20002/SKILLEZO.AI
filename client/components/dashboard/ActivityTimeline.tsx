'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, User, ShieldCheck, Activity, Clock, ArrowRight } from 'lucide-react';
import { CardHeader } from '@/components/dashboard/common/CardHeader';
import { verificationService } from '@/services/verification.service';
import { SkillVerificationRecord } from '@/types/verification';

export const ActivityTimeline: React.FC = () => {
  const [records, setRecords] = useState<SkillVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadActivity() {
      try {
        const liveRecords = await verificationService.getUserRecords().catch(() => []);
        if (isMounted) {
          setRecords(liveRecords || []);
        }
      } catch (err) {
        console.error('Error loading activity:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] flex flex-col justify-between">
      <div>
        <CardHeader
          title="Recent Activity"
          subtitle="Live audit trail & verification updates"
          icon={<Activity className="w-4 h-4 text-[#3D5AFE] dark:text-[#00D9C0]" />}
        />

        {loading ? (
          <div className="space-y-3 mt-4">
            {[1, 2].map((id) => (
              <div
                key={id}
                className="h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="mt-4 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No activity yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your verified skill assessments, score upgrades, and credentials will be logged here in your audit trail.
              </p>
            </div>
            <Link
              href="/dashboard/verification"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>Take First Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {records.map((item) => {
              const isVerified = item.status === 'verified';
              return (
                <div
                  key={item.id}
                  className="group relative flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.05] hover:bg-white dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${
                      isVerified
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    } flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200`}
                  >
                    {isVerified ? <CheckCircle2 className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#3D5AFE] dark:group-hover:text-[#00D9C0] transition-colors">
                        {item.skillName}
                      </h4>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isVerified
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {isVerified ? `Score ${item.score}%` : 'Pending'}
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          <Clock className="w-3 h-3" />
                          {item.verifiedDate || item.submittedDate || 'Recent'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.details || `${item.category} evaluation completed`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


