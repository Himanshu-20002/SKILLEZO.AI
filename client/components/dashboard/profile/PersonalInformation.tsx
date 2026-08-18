'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { ExtendedUserProfile } from '@/types/profile';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

interface PersonalInformationProps {
  profile: ExtendedUserProfile;
}

export const PersonalInformation: React.FC<PersonalInformationProps> = ({ profile }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md space-y-4 shadow-sm dark:shadow-md">
      <CardHeader
        title="Personal Information"
        subtitle="Primary identity and summary details"
        icon={<User className="w-5 h-5 text-[#3D5AFE]" />}
      />

      <div className="space-y-4">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Biography</span>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            {profile.bio}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Target Role
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-200">{profile.role}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-200">{profile.location}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-200">{profile.email}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone Number
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-200">{profile.phone || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
