"use client";

import React from "react";
import { TailoringIntensity } from "@/types/tailoring-plan.types";
import { Feather, Compass, Flame } from "lucide-react";

interface TailoringIntensitySelectorProps {
  value: TailoringIntensity;
  onChange: (intensity: TailoringIntensity) => void;
  disabled?: boolean;
}

const INTENSITY_OPTIONS: Array<{
  id: TailoringIntensity;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}> = [
  {
    id: "LIGHT",
    title: "Light Touch",
    badge: "Conservative",
    description: "Subtle phrasing alignments and verified keywords. Preserves your exact section ordering and project positions.",
    icon: Feather,
    accentColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
  },
  {
    id: "BALANCED",
    title: "Balanced",
    badge: "Recommended",
    description: "Sharpens bullets toward job keywords, features high-relevance projects, and highlights unrepresented verified skills.",
    icon: Compass,
    accentColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800",
  },
  {
    id: "AGGRESSIVE",
    title: "Role Targeted",
    badge: "High Impact",
    description: "Reorders layout sections to spotlight relevant evidence, reshapes summary, and demotes off-target skills (truth strictly preserved).",
    icon: Flame,
    accentColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
  },
];

export const TailoringIntensitySelector: React.FC<TailoringIntensitySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Tailoring Intensity Level
        </label>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Affects proposal scope & boldness
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {INTENSITY_OPTIONS.map((opt) => {
          const isSelected = value === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? `border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/30`
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1 rounded-lg ${opt.accentColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {opt.title}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {opt.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {opt.description}
                </p>
              </div>

              {isSelected && (
                <div className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <span>● Active Mode</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
