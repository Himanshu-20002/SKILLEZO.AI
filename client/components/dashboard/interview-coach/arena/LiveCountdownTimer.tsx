'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface LiveCountdownTimerProps {
  allocatedMinutes?: number;
  questionSequence: number;
  onTimeExpired?: () => void;
}

export const LiveCountdownTimer: React.FC<LiveCountdownTimerProps> = ({
  allocatedMinutes = 3,
  questionSequence,
  onTimeExpired,
}) => {
  const initialSeconds = allocatedMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);

  // Reset timer on question switch
  useEffect(() => {
    setSecondsRemaining(initialSeconds);
  }, [questionSequence, initialSeconds]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimeExpired?.();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onTimeExpired]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = secondsRemaining <= 30;
  const isWarning = secondsRemaining <= 60 && !isUrgent;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold transition-all duration-300 ${
        isUrgent
          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse shadow-xs'
          : isWarning
          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800'
          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      }`}
      title="Estimated recommended time for this question"
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
      ) : (
        <Clock className={`w-4 h-4 ${isWarning ? 'text-amber-500' : 'text-indigo-500'}`} />
      )}
      <span>{formattedTime}</span>
      <span className="text-[11px] font-sans font-normal opacity-70">left</span>
    </div>
  );
};

