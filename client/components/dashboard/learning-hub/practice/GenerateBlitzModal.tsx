'use client';

import React, { useState } from 'react';
import { X, Sparkles, Zap, BookOpen, Layers } from 'lucide-react';

interface GenerateBlitzModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (payload: { skill: string; category: string; difficulty: string }) => Promise<void>;
  isLoading?: boolean;
}

export function GenerateBlitzModal({
  isOpen,
  onClose,
  onGenerate,
  isLoading = false,
}: GenerateBlitzModalProps) {
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [difficulty, setDifficulty] = useState('intermediate');

  if (!isOpen) return null;

  const quickSkillSuggestions = [
    { name: 'React 19 Actions', category: 'Frontend' },
    { name: 'Docker Compose & Networks', category: 'DevOps' },
    { name: 'PostgreSQL Indexing & EXPLAIN', category: 'Database' },
    { name: 'Node.js Event Loop', category: 'Backend' },
    { name: 'Redis Caching & Invalidation', category: 'Backend' },
    { name: 'System Design Rate Limiting', category: 'System Design' },
  ];

  const handleSelectSuggestion = (s: { name: string; category: string }) => {
    setSkill(s.name);
    setCategory(s.category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) return;
    await onGenerate({ skill: skill.trim(), category, difficulty });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Generate AI Practice Blitz
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by Gemini Flash with code snippet questions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Suggestions */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Missing Skill Gaps:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickSkillSuggestions.map((s) => (
                <button
                  type="button"
                  key={s.name}
                  onClick={() => handleSelectSuggestion(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    skill === s.name
                      ? 'bg-[#3D5AFE] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Name Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Target Skill or Concept
            </label>
            <input
              type="text"
              placeholder="e.g. Kubernetes Ingress, GraphQL Mutations, Kafka..."
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#3D5AFE] transition-colors"
              required
            />
          </div>

          {/* Category & Difficulty Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#3D5AFE]"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="System Design">System Design</option>
                <option value="AI/ML">AI/ML</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Target Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#3D5AFE]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !skill.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#3D5AFE] text-white hover:bg-[#324bdf] transition-colors flex items-center gap-1.5 shadow-sm shadow-[#3D5AFE]/30 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Blitz with Gemini...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Generate & Start Blitz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
