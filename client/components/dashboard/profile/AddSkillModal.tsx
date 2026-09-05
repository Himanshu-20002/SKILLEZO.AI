'use client';

import React, { useState } from 'react';
import { X, Plus, Loader2, Award, Sparkles } from 'lucide-react';
import { CandidateSkill } from '@/services/profile.service';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (skill: CandidateSkill) => Promise<void>;
}

const CATEGORIES = [
  'Frontend',
  'Backend',
  'Language / Backend',
  'UI / UX',
  'Database',
  'DevOps',
  'Cloud & Architecture',
  'AI / Machine Learning',
  'Mobile',
  'System Design',
];

const PROFICIENCY_LEVELS = [
  { label: 'Expert', score: 98, level: 5 },
  { label: 'Advanced', score: 94, level: 4 },
  { label: 'Intermediate', score: 85, level: 3 },
  { label: 'Beginner', score: 70, level: 2 },
];

export const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [proficiency, setProficiency] = useState(PROFICIENCY_LEVELS[0].label);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    setIsSubmitting(true);
    const selectedLevel = PROFICIENCY_LEVELS.find((p) => p.label === proficiency) || PROFICIENCY_LEVELS[1];

    try {
      await onAdd({
        name: skillName.trim(),
        category,
        proficiency: selectedLevel.label,
        score: selectedLevel.score,
        level: selectedLevel.level,
        verified: selectedLevel.label === 'Expert' || selectedLevel.label === 'Advanced',
      });
      setSkillName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00D9C0]/15 text-[#00D9C0]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Technical Skill</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Attach new skill credential to your portfolio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Skill Name / Technology</label>
            <input
              type="text"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. Next.js 15, Python, Docker, Kubernetes"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D9C0]/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00D9C0]/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Proficiency Level</label>
            <div className="grid grid-cols-2 gap-2">
              {PROFICIENCY_LEVELS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setProficiency(p.label)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    proficiency === p.label
                      ? 'bg-[#3D5AFE]/10 border-[#3D5AFE] text-[#3D5AFE] dark:text-[#00D9C0] font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span>{p.label}</span>
                    <span className="font-extrabold text-[11px] opacity-80">{p.score}/100</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !skillName.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Add Skill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
