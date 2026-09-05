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
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 backdrop-blur-xl space-y-5 shadow-sm dark:shadow-md">
      <CardHeader
        title="Personal Information"
        subtitle="Primary identity and summary details"
        icon={<User className="w-5 h-5 text-[#3D5AFE]" />}
      />

      <div className="space-y-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Biography</span>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-750">
            {displayBio}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Target Role */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-750 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Target Role
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{displayRole}</p>
          </div>

          {/* Location */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-750 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{displayLocation}</p>
          </div>

          {/* Email Address */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-750 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{displayEmail}</p>
          </div>

          {/* Phone Number */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-750 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone Number
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{displayPhone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
