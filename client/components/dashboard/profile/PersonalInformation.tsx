'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, Briefcase, FolderGit2, Link2, Globe, ExternalLink } from 'lucide-react';
import { CandidateProfile } from '@/services/profile.service';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

interface PersonalInformationProps {
  profile: CandidateProfile;
  email?: string;
  onEditProfile?: () => void;
}

export const PersonalInformation: React.FC<PersonalInformationProps> = ({ profile, email, onEditProfile }) => {
  const displayLocation = profile.location
    ? [profile.location.city, profile.location.state, profile.location.country].filter(Boolean).join(', ')
    : '';
  const displayEmail = email || '';

  const displayPhone = profile.phone?.trim() || '';
  const displayRole = profile.targetRole?.trim() || '';
  const displayBio = profile.bio?.trim() || '';
  const githubUrl = profile.links?.github?.trim() || '';
  const linkedinUrl = profile.links?.linkedin?.trim() || '';
  const portfolioUrl = profile.links?.portfolio?.trim() || '';

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white space-y-6 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_10px_-2px_rgba(15,23,42,0.04)] dark:shadow-xl relative overflow-hidden backdrop-blur-xl transition-all">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#3D5AFE]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#38BDF8] border border-[#3D5AFE]/20 dark:border-[#3D5AFE]/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Personal Information</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Primary identity and contact summary</p>
          </div>
        </div>
        {onEditProfile && (
          <button
            onClick={onEditProfile}
            className="text-xs font-bold text-[#3D5AFE] dark:text-[#38BDF8] hover:underline"
          >
            Edit Info
          </button>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Biography</span>
          {displayBio ? (
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/90 dark:bg-[#1c263d] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/90 shadow-sm">
              {displayBio}
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/60 dark:bg-[#1c263d]/60 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <span>No biography provided yet. Add an executive summary or upload your resume to auto-fill.</span>
              {onEditProfile && (
                <button
                  onClick={onEditProfile}
                  className="shrink-0 text-xs font-semibold text-[#3D5AFE] dark:text-[#38BDF8] hover:underline"
                >
                  + Add Bio
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Target Role */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#1c263d] border border-slate-200/80 dark:border-slate-800/90 space-y-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Target Role
            </span>
            {displayRole ? (
              <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{displayRole}</p>
            ) : (
              <p className="text-slate-400 italic text-xs">Target role not specified</p>
            )}
          </div>

          {/* Location */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#1c263d] border border-slate-200/80 dark:border-slate-800/90 space-y-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location
            </span>
            {displayLocation ? (
              <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{displayLocation}</p>
            ) : (
              <p className="text-slate-400 italic text-xs">Location not specified</p>
            )}
          </div>

          {/* Email Address */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#1c263d] border border-slate-200/80 dark:border-slate-800/90 space-y-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </span>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
              {displayEmail || <span className="text-slate-400 italic font-normal text-xs">Not specified</span>}
            </p>
          </div>

          {/* Phone Number */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#1c263d] border border-slate-200/80 dark:border-slate-800/90 space-y-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone Number
            </span>
            {displayPhone ? (
              <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{displayPhone}</p>
            ) : (
              <p className="text-slate-400 italic text-xs">Phone not provided</p>
            )}
          </div>
        </div>

        {/* Links Grid: GitHub, LinkedIn, Portfolio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* GitHub URL */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-[#3D5AFE] dark:text-[#38BDF8]" /> GitHub URL
            </span>
            {githubUrl ? (
              <a
                href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/50 dark:from-[#131b2e] dark:via-[#17203b] dark:to-[#2e1065]/25 border border-indigo-100 dark:border-indigo-950/70 hover:border-[#3D5AFE]/50 dark:hover:border-[#3D5AFE]/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all duration-300 group shadow-[0_4px_12px_-2px_rgba(61,90,254,0.06)] dark:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:bg-[#3D5AFE]/20 dark:text-[#38BDF8] group-hover:scale-110 transition-transform">
                    <FolderGit2 className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="truncate font-mono text-[11px] tracking-tight">{githubUrl}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#3D5AFE] dark:group-hover:text-[#38BDF8] shrink-0 ml-1.5 opacity-70 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onEditProfile}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-[#3D5AFE]/40 text-slate-400 hover:text-[#3D5AFE] dark:hover:text-[#38BDF8] text-xs font-medium transition-all"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>+ Connect GitHub</span>
              </button>
            )}
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#00D9C0] dark:text-[#00D9C0]" /> LinkedIn URL
            </span>
            {linkedinUrl ? (
              <a
                href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-white via-sky-50/30 to-blue-50/50 dark:from-[#131b2e] dark:via-[#16233f] dark:to-[#172554]/30 border border-sky-100 dark:border-sky-950/70 hover:border-blue-400/50 dark:hover:border-blue-400/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all duration-300 group shadow-[0_4px_12px_-2px_rgba(2,132,199,0.06)] dark:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="truncate font-mono text-[11px] tracking-tight">{linkedinUrl}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 ml-1.5 opacity-70 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onEditProfile}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400/40 text-slate-400 hover:text-blue-500 text-xs font-medium transition-all"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>+ Connect LinkedIn</span>
              </button>
            )}
          </div>

          {/* Portfolio URL */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-500 dark:text-[#00D9C0]" /> Portfolio URL
            </span>
            {portfolioUrl ? (
              <a
                href={portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/50 dark:from-[#131b2e] dark:via-[#142938] dark:to-[#064e3b]/25 border border-emerald-100 dark:border-emerald-950/70 hover:border-[#00D9C0]/50 dark:hover:border-[#00D9C0]/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all duration-300 group shadow-[0_4px_12px_-2px_rgba(0,217,192,0.08)] dark:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-[#00D9C0] group-hover:scale-110 transition-transform">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="truncate font-mono text-[11px] tracking-tight">{portfolioUrl}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-[#00D9C0] shrink-0 ml-1.5 opacity-70 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onEditProfile}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-400/40 text-slate-400 hover:text-emerald-500 text-xs font-medium transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>+ Add Portfolio</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
