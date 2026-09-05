'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { CandidateProfile } from '@/services/profile.service';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

interface PersonalInformationProps {
  profile: CandidateProfile;
  email?: string;
}

export const PersonalInformation: React.FC<PersonalInformationProps> = ({ profile, email }) => {
  const displayLocation = profile.location
    ? [profile.location.city, profile.location.state].filter(Boolean).join(', ') || 'San Francisco, California'
    : 'San Francisco, California';
  const displayEmail = email || 'testuser@gmail.com';
  const displayPhone = profile.phone || '+1 (555) 234-5678';
  const displayRole = profile.targetRole || 'Senior Full Stack Engineer';
  const displayBio = profile.bio || 'Passionate software engineer with 6+ years of experience designing scalable cloud solutions, microservices, and modern web applications. Focused on automated skill verification and AI integrations.';

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white space-y-6 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_10px_-2px_rgba(15,23,42,0.04)] dark:shadow-xl relative overflow-hidden backdrop-blur-xl transition-all">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#3D5AFE]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2.5 rounded-2xl bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#38BDF8] border border-[#3D5AFE]/20 dark:border-[#3D5AFE]/30">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Personal Information</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Primary identity and summary details</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Biography</span>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/90 dark:bg-[#1c263d] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/90 shadow-sm">
            {displayBio}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Target Role */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#1c263d] border border-slate-200/80 dark:border-slate-800/90 space-y-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Target Role
            </span>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{displayRole}</p>
          </div>

          {/* Location */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#1c263d] border border-slate-200/80 dark:border-slate-800/90 space-y-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location
            </span>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{displayLocation}</p>
          </div>

          {/* Email Address */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#1c263d] border border-slate-200/80 dark:border-slate-800/90 space-y-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </span>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{displayEmail}</p>
          </div>

          {/* Phone Number */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#1c263d] border border-slate-200/80 dark:border-slate-800/90 space-y-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone Number
            </span>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{displayPhone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
