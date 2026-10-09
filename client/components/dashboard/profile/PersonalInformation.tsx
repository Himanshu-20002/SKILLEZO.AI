'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FolderGit2,
  Link2,
  Globe,
  ExternalLink,
  Save,
  Loader2,
  Target,
  ChevronDown,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import { CandidateProfile } from '@/services/profile.service';

interface PersonalInformationProps {
  profile: CandidateProfile;
  email?: string;
  onSave?: (updatedData: Partial<CandidateProfile>) => Promise<void>;
}

const TARGET_ROLE_GROUPS = [
  {
    group: 'Core Engineering',
    roles: [
      'Senior Full Stack Engineer',
      'Full-Stack Engineer',
      'Frontend Engineer',
      'Senior Frontend Engineer',
      'Backend Engineer',
      'Senior Backend Engineer',
    ],
  },
  {
    group: 'AI & Data Intelligence',
    roles: [
      'AI / ML Specialist',
      'AI Platform Engineer',
      'Data Engineer',
      'Prompt & LLM Engineer',
    ],
  },
  {
    group: 'Cloud & Infrastructure',
    roles: [
      'DevOps & Cloud Engineer',
      'DevOps / SRE Lead',
      'Cybersecurity Specialist',
      'Cloud Solutions Architect',
    ],
  },
  {
    group: 'Mobile & Product Leadership',
    roles: [
      'Mobile App Developer (iOS / Android)',
      'Software Architect / Tech Lead',
      'QA Automation Engineer',
      'Product Manager (Technical)',
    ],
  },
];

export const PersonalInformation: React.FC<PersonalInformationProps> = ({
  profile,
  email,
  onSave,
}) => {
  const searchParams = useSearchParams();
  const [headline, setHeadline] = useState(profile.headline || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [targetRole, setTargetRole] = useState(profile.targetRole || '');
  const [city, setCity] = useState(profile.location?.city || '');
  const [state, setState] = useState(profile.location?.state || '');
  const [country, setCountry] = useState(profile.location?.country || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [github, setGithub] = useState(profile.links?.github || '');
  const [linkedin, setLinkedin] = useState(profile.links?.linkedin || '');
  const [portfolio, setPortfolio] = useState(profile.links?.portfolio || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Target Role Dropdown & Highlight States
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isSaveHighlighted, setIsSaveHighlighted] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusParam = searchParams?.get('focus');
    const isHashTargetRole = typeof window !== 'undefined' && window.location.hash.includes('target-role');

    if (focusParam === 'target-role' || isHashTargetRole) {
      setIsHighlighted(true);
      setIsRoleOpen(true);

      const scrollTimer = setTimeout(() => {
        roleDropdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);

      const blinkTimer = setTimeout(() => {
        setIsHighlighted(false);
      }, 4500);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(blinkTimer);
      };
    }
  }, [searchParams]);

  useEffect(() => {
    setHeadline(profile.headline || '');
    setBio(profile.bio || '');
    setTargetRole(profile.targetRole || '');
    setCity(profile.location?.city || '');
    setState(profile.location?.state || '');
    setCountry(profile.location?.country || '');
    setPhone(profile.phone || '');
    setGithub(profile.links?.github || '');
    setLinkedin(profile.links?.linkedin || '');
    setPortfolio(profile.links?.portfolio || '');
  }, [profile]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleOpen(false);
      }
    };
    if (isRoleOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isRoleOpen]);

  const handleSelectRole = (newRole: string) => {
    setTargetRole(newRole);
    setIsRoleOpen(false);
    setRoleSearch('');
    setIsHighlighted(false);

    // Guide the user directly to the Save Changes button
    setIsSaveHighlighted(true);
    setTimeout(() => {
      document.getElementById('save-profile-btn')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    const timer = setTimeout(() => {
      setIsSaveHighlighted(false);
    }, 5000);

    return () => clearTimeout(timer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    setIsSaveHighlighted(false);
    try {
      setIsSubmitting(true);
      await onSave({
        headline: headline.trim(),
        bio: bio.trim(),
        targetRole: targetRole.trim(),
        phone: phone.trim(),
        location: { city: city.trim(), state: state.trim(), country: country.trim() },
        links: { github: github.trim(), linkedin: linkedin.trim(), portfolio: portfolio.trim() },
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getValidUrl = (url: string) =>
    url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

  // Filter roles based on roleSearch
  const filteredGroups = TARGET_ROLE_GROUPS.map((grp) => ({
    group: grp.group,
    roles: grp.roles.filter((r) =>
      r.toLowerCase().includes(roleSearch.toLowerCase())
    ),
  })).filter((grp) => grp.roles.length > 0);

  return (
    <form
      id="personal-information"
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white space-y-6 shadow-sm relative overflow-hidden backdrop-blur-xl"
    >
      {/* Background Refraction Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#3D5AFE]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Save Button */}
      <div className="flex items-center justify-between relative z-10 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#38BDF8] border border-[#3D5AFE]/20 dark:border-[#3D5AFE]/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Personal Information
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Manage and edit your identity, career targets, and public links directly
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSaveHighlighted && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-md animate-bounce">
              <Sparkles className="w-3 h-3 text-amber-200" />
              Save your changes! 👈
            </span>
          )}

          <button
            id="save-profile-btn"
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all duration-300 disabled:opacity-50 cursor-pointer shrink-0 ${
              isSaveHighlighted
                ? 'bg-gradient-to-r from-emerald-500 via-[#00D9C0] to-[#3D5AFE] ring-4 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-900 shadow-[0_0_25px_rgba(16,185,129,0.7)] animate-pulse scale-105'
                : 'bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] hover:opacity-95'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Saving...' : isSaved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Unified Form Body */}
      <div className="space-y-4 relative z-10 text-xs sm:text-sm">
        {/* Professional Headline */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Professional Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer | Next.js, Node.js & Distributed Systems"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50"
          />
        </div>

        {/* Biography */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Biography / Executive Summary
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Passionate engineer with experience designing scalable cloud architectures and enterprise applications..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50 leading-relaxed"
          />
        </div>

        {/* 3-Column Grid: Target Role with Grouped Dropdown, Phone Number, Account Email */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Target Role Dropdown */}
          <div id="target-role" className="space-y-1.5 relative" ref={roleDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#3D5AFE] dark:text-[#38BDF8]" /> Target Role
              </label>
              {isHighlighted && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#3D5AFE] text-white shadow-md animate-bounce">
                  ✨ Select your target role here!
                </span>
              )}
            </div>

            {/* Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setIsRoleOpen((prev) => !prev)}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-left flex items-center justify-between transition-all duration-300 ${
                isHighlighted
                  ? 'border-[#3D5AFE] ring-4 ring-[#3D5AFE]/70 ring-offset-2 dark:ring-offset-slate-900 shadow-[0_0_30px_rgba(61,90,254,0.6)] animate-pulse'
                  : isRoleOpen
                  ? 'border-[#3D5AFE] ring-2 ring-[#3D5AFE]/20 bg-white dark:bg-slate-800'
                  : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span className="font-medium text-slate-900 dark:text-white truncate">
                {targetRole || 'Select target role...'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                  isRoleOpen ? 'rotate-180 text-[#3D5AFE]' : ''
                }`}
              />
            </button>

            {/* Grouped Dropdown Menu */}
            {isRoleOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 max-h-72 overflow-y-auto space-y-2">
                {/* Search / Custom input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder="Search or enter custom role..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#3D5AFE]"
                    autoFocus
                  />
                </div>

                {/* Option to set custom role if typed something not in list */}
                {roleSearch.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSelectRole(roleSearch.trim())}
                    className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#38BDF8] hover:bg-[#3D5AFE]/20 font-medium transition-colors"
                  >
                    Use custom: &quot;{roleSearch.trim()}&quot;
                  </button>
                )}

                {/* Role Groups */}
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group, idx) => (
                    <div
                      key={group.group}
                      className={`space-y-0.5 ${
                        idx !== filteredGroups.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/80 pb-2' : ''
                      }`}
                    >
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {group.group}
                      </div>
                      {group.roles.map((role) => {
                        const isSelected = targetRole === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleSelectRole(role)}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#3D5AFE]/10 text-[#3D5AFE] dark:bg-[#3D5AFE]/20 dark:text-[#00D9C0] font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{role}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#3D5AFE] dark:text-[#00D9C0] shrink-0 ml-1.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                ) : !roleSearch.trim() ? (
                  <p className="text-xs text-slate-400 p-2 text-center">No roles available</p>
                ) : null}
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (555) 234-5678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50"
            />
          </div>

          {/* Account Email */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
            </label>
            <input
              type="email"
              disabled
              value={email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              title="Email is managed via your account authentication"
            />
          </div>
        </div>

        {/* Location: City, State, Country */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. San Francisco"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">State / Region</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. California"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Social & Portfolio Links with Direct External Link Action */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* GitHub URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-[#3D5AFE] dark:text-[#38BDF8]" /> GitHub URL
              </label>
              {github && (
                <a
                  href={getValidUrl(github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#3D5AFE] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="github.com/username"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#00D9C0]" /> LinkedIn URL
              </label>
              {linkedin && (
                <a
                  href={getValidUrl(linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#00D9C0] hover:underline flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/username"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* Portfolio URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" /> Portfolio URL
              </label>
              {portfolio && (
                <a
                  href={getValidUrl(portfolio)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-500 hover:underline flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="text"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="yourportfolio.dev"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
