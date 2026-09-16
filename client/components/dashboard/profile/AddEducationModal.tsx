'use client';

import React, { useState } from 'react';
import { X, Plus, Loader2, GraduationCap, Building2, Calendar, BookOpen } from 'lucide-react';
import { CandidateEducation } from '@/services/profile.service';

interface AddEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (education: CandidateEducation) => Promise<void>;
}

export const AddEducationModal: React.FC<AddEducationModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        institution: institution.trim(),
        degree: degree.trim() || 'Degree',
        fieldOfStudy: fieldOfStudy.trim() || undefined,
        startYear: startYear.trim() ? parseInt(startYear.trim(), 10) : undefined,
        endYear: endYear.trim() ? parseInt(endYear.trim(), 10) : undefined,
      });
      setInstitution('');
      setDegree('');
      setFieldOfStudy('');
      setStartYear('');
      setEndYear('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Education</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Specify degree, university, and graduation timeline</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Institution */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> College / University / Institution *
            </label>
            <input
              type="text"
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Stanford University or University of California, Berkeley"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50"
            />
          </div>

          {/* Degree & Field of Study */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Degree
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech, B.S., M.S."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Major / Field of Study
              </label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50"
              />
            </div>
          </div>

          {/* Start Year & End Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Year
              </label>
              <input
                type="number"
                min="1950"
                max="2035"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder="2020"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Graduation Year
              </label>
              <input
                type="number"
                min="1950"
                max="2035"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="2024"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !institution.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Add Education</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
