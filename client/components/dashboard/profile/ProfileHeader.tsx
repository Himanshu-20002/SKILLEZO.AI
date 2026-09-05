'use client';

import React from 'react';
import { MapPin, Mail, Phone, Edit3, ShieldCheck } from 'lucide-react';
import { CandidateProfile } from '@/services/profile.service';
import { UserAvatar } from '@/components/dashboard/common/UserAvatar';

interface ProfileHeaderProps {
  profile: CandidateProfile;
  name?: string;
  email?: string;
  onEditProfile?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  name = 'testuser',
  email = 'testuser@gmail.com',
  onEditProfile,
}) => {
  const displayName = name || 'testuser';
  const displayEmail = email || profile.links?.portfolio || 'testuser@gmail.com';
  const displayHeadline = profile.headline || 'Building AI-driven Enterprise Systems | Next.js, React & Node.js Specialist';
  const displayLocation = profile.location
    ? [profile.location.city, profile.location.state].filter(Boolean).join(', ') || 'San Francisco, California'
    : 'San Francisco, California';
  const displayPhone = profile.phone || '+1 (555) 234-5678';

  return (
    <div className="relative rounded-3xl bg-[#131b2e] border border-slate-800/90 text-white backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl overflow-hidden transition-all">
      {/* Background Refraction Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#3D5AFE]/15 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <UserAvatar name={displayName} size="xl" showStatusBadge />

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {displayName}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Verified</span>
              </span>
            </div>

            <p className="text-sm font-semibold text-[#38BDF8]">
              {displayHeadline}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-300">{displayLocation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-300">{displayEmail}</span>
              </div>
              {displayPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-300">{displayPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onEditProfile}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-white font-bold transition-all text-xs shrink-0 cursor-pointer shadow-sm hover:border-slate-600"
        >
          <Edit3 className="w-4 h-4 text-[#00D9C0]" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};
