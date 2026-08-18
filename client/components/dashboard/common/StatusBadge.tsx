'use client';

import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export type StatusType = 'verified' | 'pending' | 'failed' | 'in_review' | 'active' | 'suspended';

interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel, className = '' }) => {
  const configs: Record<StatusType, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    verified: {
      label: 'Verified',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    },
    active: {
      label: 'Active',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    },
    pending: {
      label: 'Pending',
      bg: 'bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
      icon: <Clock className="w-3.5 h-3.5 animate-pulse" />
    },
    in_review: {
      label: 'In Review',
      bg: 'bg-blue-500/15',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-500/30',
      icon: <AlertCircle className="w-3.5 h-3.5" />
    },
    failed: {
      label: 'Failed',
      bg: 'bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/30',
      icon: <XCircle className="w-3.5 h-3.5" />
    },
    suspended: {
      label: 'Suspended',
      bg: 'bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/30',
      icon: <ShieldAlert className="w-3.5 h-3.5" />
    }
  };

  const config = configs[status] || configs.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-all ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.icon}
      {customLabel || config.label}
    </span>
  );
};
