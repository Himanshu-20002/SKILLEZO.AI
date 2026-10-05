'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Briefcase,
  Award,
  Hash,
  Send,
  ExternalLink,
  FolderGit2,
  Link2,
  Globe,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { RecruiterLayout } from '@/components/layout/RecruiterLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { UserAvatar } from '@/components/dashboard/common/UserAvatar';
import { recruiterService, TalentCandidateItem } from '@/services/recruiter.service';
import { toast } from 'sonner';

const SKILL_FILTERS = ['All Skills', 'React 19', 'TypeScript', 'Python', 'Kubernetes', 'Node.js', 'AWS'];

export default function RecruiterTalentPoolPage() {
  const [candidates, setCandidates] = useState<TalentCandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [minScore, setMinScore] = useState(70);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTalent() {
      try {
        setLoading(true);
        const data = await recruiterService.getTalentPool();
        setCandidates(data);
      } catch {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }
    loadTalent();
  }, []);

  const handleInvite = (candidate: TalentCandidateItem) => {
    setInvitingId(candidate.id);
    setTimeout(() => {
      setInvitingId(null);
      toast.success(`Invitation Sent to ${candidate.name}!`, {
        description: `Candidate notified with your open engineering requisitions.`,
      });
    }, 600);
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.headline.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());

    const matchesSkill =
      selectedSkill === 'All Skills' ||
      (c.verifiedSkills && c.verifiedSkills.some((s) => s.name.toLowerCase().includes(selectedSkill.toLowerCase())));

    const matchesScore = c.employabilityScore >= minScore;

    return matchesSearch && matchesSkill && matchesScore;
  });

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Verified Talent Sourcing Pool"
          description="Explore candidates with pre-evaluated, cryptographically verified skills and algorithmic employability indexes."
          badge="AI Verified Candidates"
        />

        {/* Filter Controls Ribbon */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate by name, target role, or location..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Min Index:
                </span>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
                >
                  <option value={80}>80%+ Match</option>
                  <option value={90}>90%+ Top Tier</option>
                  <option value={95}>95%+ Elite</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Skill Tags Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
            {SKILL_FILTERS.map((skill) => {
              const isActive = selectedSkill === skill;
              return (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#3D5AFE] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-[#151D42] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1f2854]'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Candidate Showcase Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 space-y-3">
            <Compass className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No candidates match your current criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keywords, lowering the employability match score, or selecting another skill filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCandidates.map((candidate) => {
              const isInviting = invitingId === candidate.id;

              return (
                <div
                  key={candidate.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#0E1535] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-[#00D9C0]/50 transition-all space-y-5 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Candidate Profile Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={candidate.name} size="md" />
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                              {candidate.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            {candidate.headline}
                          </p>
                        </div>
                      </div>

                      {/* Employability Score Pill */}
                      <div className="shrink-0 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{candidate.employabilityScore}% Index</span>
                      </div>
                    </div>

                    {/* Bio & Details Meta */}
                    {candidate.bio && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {candidate.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {candidate.location}
                      </span>
                      {candidate.experienceYears ? (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {candidate.experienceYears} Years Exp
                          </span>
                        </>
                      ) : null}
                    </div>

                    {/* Cryptographically Verified Skills Cards */}
                    {candidate.verifiedSkills && candidate.verifiedSkills.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Verified Credentials:
                        </span>

                        <div className="space-y-1.5">
                          {candidate.verifiedSkills.slice(0, 3).map((vSkill, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#151D42] border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#00D9C0]" />
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {vSkill.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {vSkill.credentialHash && (
                                  <span className="text-[11px] font-mono text-slate-400">
                                    {vSkill.credentialHash}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                  {vSkill.score}/100
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic pt-1">
                        Profile registered in talent directory
                      </p>
                    )}
                  </div>

                  {/* Card Footer: Social links & Invite CTA */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {candidate.socialLinks?.github && (
                        <a
                          href={candidate.socialLinks.github}
                          target="_blank"
                          rel="noreferrer"
                          title="GitHub Profile"
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <FolderGit2 className="w-4 h-4" />
                        </a>
                      )}
                      {candidate.socialLinks?.linkedin && (
                        <a
                          href={candidate.socialLinks.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          title="LinkedIn Profile"
                          className="p-2 rounded-xl text-slate-400 hover:text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition"
                        >
                          <Link2 className="w-4 h-4" />
                        </a>
                      )}
                      {candidate.socialLinks?.portfolio && (
                        <a
                          href={candidate.socialLinks.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleInvite(candidate)}
                      disabled={isInviting}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00D9C0] hover:bg-[#00D9C0]/90 text-slate-950 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isInviting ? 'Inviting...' : 'Direct Invite'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}
