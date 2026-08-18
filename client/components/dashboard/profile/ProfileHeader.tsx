'use client';

import React from 'react';
import { MapPin, Mail, Phone, Edit3, ShieldCheck } from 'lucide-react';
import { ExtendedUserProfile } from '@/types/profile';
import { UserAvatar } from '@/components/dashboard/common/UserAvatar';

interface ProfileHeaderProps {
  profile: ExtendedUserProfile;
  onEditProfile?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, onEditProfile }) => {
  return (
    <div className="relative rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md p-6 sm:p-8 space-y-6 overflow-hidden shadow-sm dark:shadow-md">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#3D5AFE]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <UserAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="xl" showStatusBadge />

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">{profile.name}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise Verified</span>
              </span>
            </div>

            <p className="text-sm font-medium text-[#3D5AFE]">{profile.headline}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onEditProfile}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-semibold shrink-0 cursor-pointer"
        >
          <Edit3 className="w-4 h-4 text-[#3D5AFE] dark:text-[#00D9C0]" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};
