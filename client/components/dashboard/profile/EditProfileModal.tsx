'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  User,
  Briefcase,
  MapPin,
  Phone,
  Globe,
  FolderGit2,
  Link2,
  Target,
  ChevronDown,
  Check,
} from 'lucide-react';

import { CandidateProfile } from '@/services/profile.service';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CandidateProfile;
  onSave: (updatedData: Partial<CandidateProfile>) => Promise<void>;
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

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [headline, setHeadline] = useState(profile.headline || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [targetRole, setTargetRole] = useState(profile.targetRole || 'Senior Full Stack Engineer');
  const [city, setCity] = useState(profile.location?.city || 'San Francisco');
  const [state, setState] = useState(profile.location?.state || 'California');
  const [country, setCountry] = useState(profile.location?.country || 'United States');
  const [phone, setPhone] = useState(profile.phone || '+1 (555) 234-5678');
  const [github, setGithub] = useState(profile.links?.github || '');
  const [linkedin, setLinkedin] = useState(profile.links?.linkedin || '');
  const [portfolio, setPortfolio] = useState(profile.links?.portfolio || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleOpen(false);
      }
    };
    if (isRoleOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isRoleOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        headline: headline.trim(),
        bio: bio.trim(),
        targetRole: targetRole.trim(),
        phone: phone.trim(),
        location: {
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
        },
        links: {
          github: github.trim(),
          linkedin: linkedin.trim(),
          portfolio: portfolio.trim(),
        },
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Candidate Profile</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your public identity, headline and contact details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Headline */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Building AI-driven Enterprise Systems | Next.js, React & Node.js Specialist"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Biography / Executive Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Passionate engineer with experience designing scalable solutions..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50"
            />
          </div>

          {/* 2-Column Inputs: Target Role & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 relative" ref={roleDropdownRef}>
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#3D5AFE]" /> Target Role
              </label>
              
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsRoleOpen((prev) => !prev)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-left flex items-center justify-between transition-all ${
                  isRoleOpen
                    ? 'border-[#3D5AFE] ring-2 ring-[#3D5AFE]/20 bg-white dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span className="font-medium text-slate-900 dark:text-white truncate text-xs sm:text-sm">
                  {targetRole || 'Select target role...'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                    isRoleOpen ? 'rotate-180 text-[#3D5AFE]' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu with Clean Borders */}
              {isRoleOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 max-h-64 overflow-y-auto">
                  {TARGET_ROLE_GROUPS.map((group, idx) => (
                    <div
                      key={group.group}
                      className={`space-y-1 ${
                        idx !== TARGET_ROLE_GROUPS.length - 1 ? 'border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2.5' : ''
                      }`}
                    >
                      <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {group.group}
                      </div>
                      <div className="space-y-0.5">
                        {group.roles.map((role) => {
                          const isSelected = targetRole === role;
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => {
                                setTargetRole(role);
                                setIsRoleOpen(false);
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-[#3D5AFE]/10 text-[#3D5AFE] dark:bg-[#3D5AFE]/20 dark:text-[#00D9C0] font-semibold'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span>{role}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#3D5AFE] dark:text-[#00D9C0] shrink-0 ml-1.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50 font-medium text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Location 3-Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="California"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United States"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-slate-400" /> GitHub URL
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-slate-400" /> LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Portfolio URL
              </label>
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://portfolio.dev"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
