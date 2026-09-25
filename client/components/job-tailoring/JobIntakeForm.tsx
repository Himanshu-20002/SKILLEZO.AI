"use client";

import React, { useState } from "react";
import { CreateJobProfileDTO } from "@/types/job-profile.types";
import { Briefcase, Building2, Link2, FileText, AlertCircle, Sparkles } from "lucide-react";

interface JobIntakeFormProps {
  onSubmit: (input: CreateJobProfileDTO) => Promise<unknown>;
  loading?: boolean;
}

export const JobIntakeForm: React.FC<JobIntakeFormProps> = ({ onSubmit, loading = false }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [rawDescription, setRawDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const charCount = rawDescription.length;
  const isDescTooShort = charCount > 0 && charCount < 50;
  const isDescTooLong = charCount > 50000;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!jobTitle.trim() || jobTitle.trim().length < 2) {
      errs.jobTitle = "Job title must be at least 2 characters.";
    } else if (jobTitle.trim().length > 120) {
      errs.jobTitle = "Job title cannot exceed 120 characters.";
    }

    if (company && company.trim().length > 120) {
      errs.company = "Company name cannot exceed 120 characters.";
    }

    if (jobUrl.trim()) {
      try {
        new URL(jobUrl.trim());
      } catch {
        errs.jobUrl = "Please enter a valid URL (e.g. https://company.com/job).";
      }
    }

    if (!rawDescription.trim() || rawDescription.trim().length < 50) {
      errs.rawDescription = "Job description must contain at least 50 characters of readable text.";
    } else if (rawDescription.trim().length > 50000) {
      errs.rawDescription = "Job description cannot exceed 50,000 characters.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    await onSubmit({
      jobTitle: jobTitle.trim(),
      company: company.trim() || null,
      jobUrl: jobUrl.trim() || null,
      rawDescription: rawDescription.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Job Title & Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Job Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                if (errors.jobTitle) setErrors((prev) => ({ ...prev, jobTitle: "" }));
              }}
              placeholder="e.g. Senior Full Stack Engineer"
              disabled={loading}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 border ${
                errors.jobTitle
                  ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-400"
                  : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              } text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all disabled:opacity-50`}
            />
          </div>
          {errors.jobTitle && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.jobTitle}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Company Name <span className="text-slate-400 font-normal normal-case">(Optional)</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (errors.company) setErrors((prev) => ({ ...prev, company: "" }));
              }}
              placeholder="e.g. Stripe, Acme Corp"
              disabled={loading}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* 2. Job URL */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Job Posting URL <span className="text-slate-400 font-normal normal-case">(Optional)</span>
        </label>
        <div className="relative">
          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => {
              setJobUrl(e.target.value);
              if (errors.jobUrl) setErrors((prev) => ({ ...prev, jobUrl: "" }));
            }}
            placeholder="https://jobs.lever.co/company/role-id"
            disabled={loading}
            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 border ${
              errors.jobUrl
                ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-400"
                : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            } text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all disabled:opacity-50`}
          />
        </div>
        {errors.jobUrl && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.jobUrl}</span>
          </p>
        )}
      </div>

      {/* 3. Job Description Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Job Description <span className="text-rose-500">*</span>
          </label>
          <span
            className={`text-xs font-mono transition-colors ${
              isDescTooShort
                ? "text-amber-500 font-semibold"
                : isDescTooLong
                ? "text-rose-500 font-semibold"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {charCount.toLocaleString()} / 50,000 characters
          </span>
        </div>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <textarea
            rows={8}
            value={rawDescription}
            onChange={(e) => {
              setRawDescription(e.target.value);
              if (errors.rawDescription) setErrors((prev) => ({ ...prev, rawDescription: "" }));
            }}
            placeholder="Paste the full job description here (requirements, qualifications, responsibilities, tech stack)..."
            disabled={loading}
            className={`w-full pl-10 pr-3.5 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 border ${
              errors.rawDescription || isDescTooShort || isDescTooLong
                ? "border-rose-400 focus:border-rose-500 ring-1 ring-rose-400"
                : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            } text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all disabled:opacity-50 font-sans leading-relaxed`}
          />
        </div>
        {errors.rawDescription && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.rawDescription}</span>
          </p>
        )}
        {isDescTooShort && !errors.rawDescription && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Need at least {50 - charCount} more characters for thorough JD analysis.</span>
          </p>
        )}
      </div>

      {/* 4. Submission Button */}
      <div className="pt-2 flex items-center justify-end">
        <button
          type="submit"
          disabled={loading || isDescTooShort || isDescTooLong}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Job Description...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze Job Requirements</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
