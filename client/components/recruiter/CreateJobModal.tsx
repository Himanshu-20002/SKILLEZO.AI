'use client';

import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import { recruiterService, RecruiterJobItem } from '@/services/recruiter.service';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { toast } from 'sonner';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (newJob: RecruiterJobItem) => void;
}

const COMMON_SKILLS = [
  'React 19',
  'Next.js 15',
  'TypeScript',
  'Node.js',
  'Python',
  'FastAPI',
  'AWS',
  'Kubernetes',
  'Docker',
  'PostgreSQL',
  'MongoDB',
  'TailwindCSS',
  'GraphQL',
];

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Core Engineering');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [workplaceType, setWorkplaceType] = useState('Remote');
  const [location, setLocation] = useState('Remote (Global)');
  const [salaryMin, setSalaryMin] = useState(120000);
  const [salaryMax, setSalaryMax] = useState(160000);
  const [minExp, setMinExp] = useState(3);
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>(['React 19', 'TypeScript', 'Node.js']);
  const [customSkillInput, setCustomSkillInput] = useState('');

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Validation Error', { description: 'Please provide both a Job Title and Description.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const newJob = await recruiterService.createJob({
        title,
        department,
        employmentType,
        workplaceType,
        location,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        requiredSkills: skills,
        description,
      });

      toast.success('Job Opening Published!', {
        description: `"${title}" is now live and accepting verified candidate applications.`,
      });
      onJobCreated(newJob);
      onClose();
    } catch (err: any) {
      toast.error('Failed to create job', {
        description: err?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-[#111736]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#8098FF] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Create & Publish Job Requisition
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Source pre-verified AI & Software engineering talent
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Job Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer (Next.js & Cloud)"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
            />
          </div>

          {/* Department & Workplace Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Core Engineering">Core Engineering</option>
                <option value="Frontend Architecture">Frontend Architecture</option>
                <option value="Backend / Distributed Systems">Backend Systems</option>
                <option value="AI / ML Platforms">AI / ML Platforms</option>
                <option value="DevOps & Cloud SRE">DevOps & Cloud SRE</option>
                <option value="Product & Design">Product & Design</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Workplace Type
              </label>
              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-Site">On-Site</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Contract">Contract</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Location & Min Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Location / Region
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Min. Experience Years
              </label>
              <select
                value={minExp}
                onChange={(e) => setMinExp(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value={0}>0-1 years (Junior / Entry)</option>
                <option value={2}>2-3 years (Mid-Level)</option>
                <option value={4}>4-5 years (Senior)</option>
                <option value={7}>6+ years (Staff / Lead)</option>
              </select>
            </div>
          </div>

          {/* Salary Compensation Band (USD) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Salary Range (USD / Year)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative flex items-center">
                <span className="text-xs font-bold text-slate-400 absolute left-3">$</span>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(Number(e.target.value))}
                  placeholder="Min"
                  className="w-full text-xs pl-7 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="relative flex items-center">
                <span className="text-xs font-bold text-slate-400 absolute left-3">$</span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(Number(e.target.value))}
                  placeholder="Max"
                  className="w-full text-xs pl-7 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Verified Skills Requirement */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Required Verified Skills & Tech Stack</span>
              <span className="text-[11px] text-slate-400">Select chips or type custom</span>
            </label>

            {/* Common Skill Chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#3D5AFE] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#182046] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#202b5c]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={handleAddCustomSkill}
                placeholder="Add other required skill..."
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Role Summary & Requirements *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail key responsibilities, team structure, tech architecture, and what makes a standout candidate..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30 leading-relaxed"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-bold shadow-md shadow-[#3D5AFE]/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish Opening</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
