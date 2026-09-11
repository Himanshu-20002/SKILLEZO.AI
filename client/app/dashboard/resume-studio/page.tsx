'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  Layers, 
  Award, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Code2, 
  UserCheck, 
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Info,
  ArrowRight,
  Target,
  Flame,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from '@/types/resume-document.fixture';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeScoreResult, SectionScore, ScoreRatingTier } from '@/types/resume-scoring.types';
import { resumeService } from '@/services/resume.service';
import { ResumeRecord } from '@/types/resume';

interface SectionConfigItem {
  id: keyof ResumeScoreResult['sections'];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  weight: string;
  weightRatio: number;
}

const SECTION_CONFIGS: SectionConfigItem[] = [
  { id: 'experience', title: 'Work Experience', icon: Briefcase, weight: '30%', weightRatio: 0.30 },
  { id: 'skills', title: 'Technical Skills', icon: Code2, weight: '20%', weightRatio: 0.20 },
  { id: 'projects', title: 'Featured Projects', icon: FolderGit2, weight: '15%', weightRatio: 0.15 },
  { id: 'education', title: 'Education & Academics', icon: GraduationCap, weight: '15%', weightRatio: 0.15 },
  { id: 'summary', title: 'Professional Summary', icon: FileText, weight: '10%', weightRatio: 0.10 },
  { id: 'contact', title: 'Contact Information', icon: UserCheck, weight: '5%', weightRatio: 0.05 },
  { id: 'achievements', title: 'Achievements & Certifications', icon: Award, weight: '5%', weightRatio: 0.05 },
];

export default function ResumeStudioPage() {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<ResumeScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSampleMode, setIsSampleMode] = useState(false);
  const [selectedSectionKey, setSelectedSectionKey] = useState<keyof ResumeScoreResult['sections']>('experience');

  // Load candidate resumes on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userResumes = await resumeService.getUserResumes();
      setResumes(userResumes || []);

      if (userResumes && userResumes.length > 0) {
        const defaultResume = userResumes.find((r) => r.isDefault) || userResumes[0];
        setSelectedResumeId(defaultResume._id);
        setIsSampleMode(false);
        await fetchScore(defaultResume._id);
      } else {
        setIsSampleMode(true);
        loadSampleScores();
      }
    } catch (err: any) {
      console.warn("Could not load candidate resumes, falling back to sample fixture", err);
      setIsSampleMode(true);
      loadSampleScores();
    } finally {
      setLoading(false);
    }
  };

  const fetchScore = async (resumeId: string) => {
    try {
      setRefreshing(true);
      setError(null);
      const score = await resumeService.getResumeScore(resumeId);
      setScoreResult(score);
    } catch (err: any) {
      setError("Failed to fetch live resume score. Please try again.");
      loadSampleScores();
    } finally {
      setRefreshing(false);
    }
  };

  const loadSampleScores = () => {
    // Generate derived score structure from sample fixture
    const sampleScore: ResumeScoreResult = {
      scoreId: "sample_score_01",
      resumeId: SAMPLE_RESUME_DOCUMENT_FIXTURE.id,
      engineVersion: "resume-score-v1",
      calculatedAt: new Date().toISOString(),
      overall: {
        overallScore: 94,
        maxScore: 100,
        tier: "Excellent",
        summaryReason: "Exceptional resume quality with strong structural completeness, verified evidence, and power verb calibration.",
        totalStrengthsCount: 14,
        totalWeaknessesCount: 2,
        totalDeductionsCount: 1,
        sectionWeights: {
          experience: 0.30,
          skills: 0.20,
          projects: 0.15,
          education: 0.15,
          summary: 0.10,
          contact: 0.05,
          achievements: 0.05,
        },
      },
      sections: {
        experience: {
          sectionId: "experience",
          title: "Work Experience",
          score: 95,
          maxScore: 100,
          weight: 0.30,
          weightedScore: 28.5,
          status: "COMPLETE",
          tier: "Excellent",
          components: [
            { id: "experience.completeness", label: "Role Completeness & Structure", score: 25, maxScore: 25, weight: 0.25, rule: "Verified company, title, and dates", reason: "2 work positions structured with verified dates and titles.", evidenceIds: ["ev_exp_01_1"] },
            { id: "experience.bullet_density", label: "Bullet Density & Elaboration", score: 25, maxScore: 25, weight: 0.25, rule: "Avg 2-6 bullets per role", reason: "5 total bullets across 2 roles (avg 2.5/role).", evidenceIds: ["ev_exp_01_2"] },
            { id: "experience.action_verbs", label: "Power Action Verbs", score: 25, maxScore: 25, weight: 0.25, rule: "Power verbs in >=75% bullets", reason: "5 power action verbs identified across bullets.", evidenceIds: ["ev_exp_01_3"] },
            { id: "experience.quantitative_metrics", label: "Measurable Impact & Metrics", score: 20, maxScore: 25, weight: 0.25, rule: "Quantifiable metrics in >=50% roles", reason: "Metrics present in 1 of 2 positions.", evidenceIds: ["ev_exp_02_2"] },
          ],
          strengths: ["Strong action-oriented phrasing across experience bullets.", "Clear employment timeline with verifiable companies."],
          weaknesses: ["Second position would benefit from an additional measurable outcome."],
          deductions: ["Metrics missing in one experience entry (-5 pts)"],
          evidenceIds: ["ev_exp_01_1", "ev_exp_02_1"],
        },
        skills: {
          sectionId: "skills",
          title: "Technical Skills",
          score: 95,
          maxScore: 100,
          weight: 0.20,
          weightedScore: 19.0,
          status: "COMPLETE",
          tier: "Excellent",
          components: [
            { id: "skills.presence_volume", label: "Skill Volume & Breadth", score: 30, maxScore: 30, weight: 0.30, rule: ">=8 skills", reason: "14 skills listed across domains.", evidenceIds: [] },
            { id: "skills.domain_diversity", label: "Technical Domain Diversity", score: 30, maxScore: 30, weight: 0.30, rule: ">=3 canonical domains", reason: "Skills span 5 distinct technical domains.", evidenceIds: [] },
            { id: "skills.categorization_depth", label: "Taxonomy & Categorization Depth", score: 25, maxScore: 25, weight: 0.25, rule: "Categorized ratio >=80%", reason: "100% of skills classified into canonical categories.", evidenceIds: [] },
            { id: "skills.cleanliness", label: "Skill Cleanliness & Deduplication", score: 10, maxScore: 15, weight: 0.15, rule: "Zero duplicates", reason: "Unique skills maintained.", evidenceIds: [] },
          ],
          strengths: ["Broad coverage across Frontend, Backend, Database, Cloud, and Languages."],
          weaknesses: [],
          deductions: [],
          evidenceIds: [],
        },
        projects: {
          sectionId: "projects",
          title: "Featured Projects",
          score: 100,
          maxScore: 100,
          weight: 0.15,
          weightedScore: 15.0,
          status: "COMPLETE",
          tier: "Excellent",
          components: [
            { id: "projects.presence_structure", label: "Project Volume & Structure", score: 30, maxScore: 30, weight: 0.30, rule: ">=2 projects", reason: "2 technical projects documented.", evidenceIds: [] },
            { id: "projects.tech_stack_clarity", label: "Technology Stack Clarity", score: 30, maxScore: 30, weight: 0.30, rule: "Tech stack defined for >=75%", reason: "8 distinct technologies specified.", evidenceIds: [] },
            { id: "projects.live_repo_links", label: "Repository & Live Links", score: 25, maxScore: 25, weight: 0.25, rule: "Repo and live demo links present", reason: "GitHub repository and live deployment URLs present.", evidenceIds: [] },
            { id: "projects.bullet_depth", label: "Project Description & Bullet Depth", score: 15, maxScore: 15, weight: 0.15, rule: "Detailed bullet descriptions", reason: "3 bullet points across 2 projects.", evidenceIds: [] },
          ],
          strengths: ["Live deployment and GitHub links confirmed for both projects."],
          weaknesses: [],
          deductions: [],
          evidenceIds: [],
        },
        education: {
          sectionId: "education",
          title: "Education & Academics",
          score: 100,
          maxScore: 100,
          weight: 0.15,
          weightedScore: 15.0,
          status: "COMPLETE",
          tier: "Excellent",
          components: [
            { id: "education.degree_institution", label: "Degree & Institution", score: 40, maxScore: 40, weight: 0.40, rule: "Degree and Institution present", reason: "B.Tech from DTU documented.", evidenceIds: [] },
            { id: "education.timeline_clarity", label: "Graduation Timeline", score: 30, maxScore: 30, weight: 0.30, rule: "Graduation dates verified", reason: "Graduation year verified (2021).", evidenceIds: [] },
            { id: "education.academic_detail", label: "Field of Study & GPA/Honors", score: 30, maxScore: 30, weight: 0.30, rule: "Field of study and honors", reason: "Computer Science with 8.8 CGPA.", evidenceIds: [] },
          ],
          strengths: ["Degree, institution, CGPA, and honors all verified."],
          weaknesses: [],
          deductions: [],
          evidenceIds: [],
        },
        summary: {
          sectionId: "summary",
          title: "Professional Summary",
          score: 90,
          maxScore: 100,
          weight: 0.10,
          weightedScore: 9.0,
          status: "COMPLETE",
          tier: "Excellent",
          components: [
            { id: "summary.presence", label: "Summary Presence", score: 30, maxScore: 30, weight: 0.30, rule: "Summary text present", reason: "Summary statement is present.", evidenceIds: [] },
            { id: "summary.length_calibration", label: "Length Calibration", score: 30, maxScore: 30, weight: 0.30, rule: "18-100 words", reason: "Summary contains 22 words.", evidenceIds: [] },
            { id: "summary.tone_executive", label: "Executive Tone & Voice", score: 20, maxScore: 20, weight: 0.20, rule: "Zero first-person pronouns", reason: "Executive tone maintained without first-person language.", evidenceIds: [] },
            { id: "summary.role_focus", label: "Target Role & Experience Focus", score: 10, maxScore: 20, weight: 0.20, rule: "Target role and years stated", reason: "Target role specified, experience years implicit.", evidenceIds: [] },
          ],
          strengths: ["Concise executive phrasing without first-person pronouns."],
          weaknesses: ["Consider explicitly mentioning total years of experience in summary."],
          deductions: ["Years of experience omitted (-10 pts)"],
          evidenceIds: [],
        },
        contact: {
          sectionId: "contact",
          title: "Contact Information",
          score: 100,
          maxScore: 100,
          weight: 0.05,
          weightedScore: 5.0,
          status: "COMPLETE",
          tier: "Excellent",
          components: [
            { id: "contact.identity", label: "Candidate Identity", score: 30, maxScore: 30, weight: 0.30, rule: "Full Name & Valid Email", reason: "Full name and valid RFC email confirmed.", evidenceIds: [] },
            { id: "contact.reachability", label: "Reachability & Location", score: 30, maxScore: 30, weight: 0.30, rule: "Phone & Location present", reason: "Phone and location specified.", evidenceIds: [] },
            { id: "contact.professional_presence", label: "Professional Presence", score: 25, maxScore: 25, weight: 0.25, rule: "LinkedIn/GitHub/Portfolio >=2 links", reason: "LinkedIn, GitHub, and Portfolio present.", evidenceIds: [] },
            { id: "contact.link_cleanliness", label: "Link Cleanliness", score: 15, maxScore: 15, weight: 0.15, rule: "Zero duplicate links", reason: "All links clean and unique.", evidenceIds: [] },
          ],
          strengths: ["Complete contact info with verified professional links."],
          weaknesses: [],
          deductions: [],
          evidenceIds: [],
        },
        achievements: {
          sectionId: "achievements",
          title: "Achievements & Certifications",
          score: 85,
          maxScore: 100,
          weight: 0.05,
          weightedScore: 4.25,
          status: "COMPLETE",
          tier: "Strong",
          components: [
            { id: "achievements.presence", label: "Achievement Volume", score: 35, maxScore: 35, weight: 0.35, rule: ">=2 items", reason: "2 honors/certifications listed.", evidenceIds: [] },
            { id: "achievements.issuer_clarity", label: "Issuing Authority", score: 35, maxScore: 35, weight: 0.35, rule: "Issuing authority specified", reason: "Issuing bodies specified.", evidenceIds: [] },
            { id: "achievements.dates_credentials", label: "Dates & Credentials", score: 15, maxScore: 30, weight: 0.30, rule: "Dates (+15) and URL (+15)", reason: "Issue dates present, verification URL missing.", evidenceIds: [] },
          ],
          strengths: ["National Hackathon and AWS certification included."],
          weaknesses: ["Adding verification credential links will maximize verification score."],
          deductions: ["Credential verification link missing (-15 pts)"],
          evidenceIds: [],
        },
      },
    };

    setScoreResult(sampleScore);
  };

  const handleSelectResume = async (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setIsSampleMode(false);
    await fetchScore(resumeId);
  };

  // Deterministic Analysis Derivations
  const overallScore = scoreResult?.overall.overallScore ?? 100;
  const overallTier: ScoreRatingTier = scoreResult?.overall.tier ?? "Excellent";
  const summaryReason = scoreResult?.overall.summaryReason ?? 
    "Exceptional resume quality with strong structural completeness, verified evidence, and power verb calibration.";

  // Derive Strongest and Highest Priority Sections deterministically
  const { strongestSection, prioritySection } = useMemo(() => {
    if (!scoreResult) {
      return { strongestSection: null, prioritySection: null };
    }

    const sectionEntries = SECTION_CONFIGS.map((cfg) => ({
      ...cfg,
      score: scoreResult.sections[cfg.id]?.score ?? 0,
      tier: scoreResult.sections[cfg.id]?.tier ?? 'Needs Work',
    }));

    // Sort descending by score for strongest
    const sortedDesc = [...sectionEntries].sort((a, b) => b.score - a.score);
    // Sort ascending by score for priority (lowest score = highest review priority)
    const sortedAsc = [...sectionEntries].sort((a, b) => a.score - b.score);

    return {
      strongestSection: sortedDesc[0],
      prioritySection: sortedAsc[0],
    };
  }, [scoreResult]);

  const getTierBadgeClass = (tier: ScoreRatingTier) => {
    switch (tier) {
      case "Excellent":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Strong":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Good":
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
      case "Developing":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Needs Work":
      default:
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    }
  };

  const selectedScoreData: SectionScore | undefined = scoreResult?.sections[selectedSectionKey];
  const selectedConfig = SECTION_CONFIGS.find((s) => s.id === selectedSectionKey);

  // Deterministic "What to Improve" Guidance Generator based on actual missing/deduction signals
  const actionableGuidance = useMemo(() => {
    if (!selectedScoreData) return [];

    const guidance: { title: string; detail: string; icon: React.ComponentType<{ className?: string }> }[] = [];

    // Check lowest scoring components
    const lowComponents = selectedScoreData.components
      .filter((c) => c.score < c.maxScore)
      .sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore));

    for (const comp of lowComponents) {
      if (comp.id.includes("metrics") || comp.id.includes("quantitative")) {
        guidance.push({
          title: "Quantify Measurable Outcomes",
          detail: "Strengthen experience bullets with clear metrics (e.g. percentages, scale numbers, latency reductions) where supported by factual evidence.",
          icon: Target,
        });
      } else if (comp.id.includes("action_verbs") || comp.id.includes("verbs")) {
        guidance.push({
          title: "Employ Active Power Verbs",
          detail: "Lead bullet points with high-impact action verbs (e.g., Architected, Spearheaded, Optimized) rather than passive responsibility phrasing.",
          icon: Flame,
        });
      } else if (comp.id.includes("links") || comp.id.includes("credentials")) {
        guidance.push({
          title: "Add Verification & Portfolio Links",
          detail: "Include active GitHub repositories, live demo URLs, or credential verification links to establish provenance.",
          icon: Lightbulb,
        });
      } else if (comp.id.includes("length") || comp.id.includes("density")) {
        guidance.push({
          title: "Calibrate Section Depth & Brevity",
          detail: comp.reason || "Ensure descriptions maintain optimal length without being excessively brief or rambling.",
          icon: Info,
        });
      } else {
        guidance.push({
          title: `Enhance ${comp.label}`,
          detail: comp.reason || `Review and complete all required fields for ${comp.label}.`,
          icon: AlertCircle,
        });
      }
    }

    if (guidance.length === 0) {
      guidance.push({
        title: "Section Fully Optimized",
        detail: "This section meets all canonical completeness, structure, and evidence standards.",
        icon: CheckCircle2,
      });
    }

    return guidance;
  }, [selectedScoreData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1130] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-pulse font-sans">
        <div className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        <div className="h-40 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
          <div className="lg:col-span-7 h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1130] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Resume Studio
            </span>
            {isSampleMode ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Sample Preview Mode
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Live Candidate Analysis
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Actionable Section Analysis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Deterministic diagnostic evaluation based on verified resume evidence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {resumes.length > 1 && (
            <select
              value={selectedResumeId || ''}
              onChange={(e) => handleSelectResume(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title || r.originalFileName} {r.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          )}

          {selectedResumeId && !isSampleMode && (
            <button
              onClick={() => fetchScore(selectedResumeId)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Re-scoring...' : 'Re-score'}</span>
            </button>
          )}

          <Link
            href="/dashboard/resume-studio/dev"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Developer View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => selectedResumeId && fetchScore(selectedResumeId)}
            className="font-bold underline cursor-pointer ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Resume Health Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Resume Health Rating
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {overallScore} <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${getTierBadgeClass(overallTier)}`}>
                {overallTier}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl pt-1">
              {summaryReason}
            </p>
          </div>

          {/* Quick Insights Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {strongestSection && (
              <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 block">
                    Strongest Section
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {strongestSection.title} ({strongestSection.score}/100)
                  </span>
                </div>
              </div>
            )}

            {prioritySection && prioritySection.score < 100 && (
              <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400 block">
                    Highest Priority
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {prioritySection.title} ({prioritySection.score}/100)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Master-Detail Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 7 Section Overview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Canonical 7 Sections</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Click to inspect</span>
          </div>

          <div className="space-y-2.5">
            {SECTION_CONFIGS.map((sec) => {
              const Icon = sec.icon;
              const isSelected = selectedSectionKey === sec.id;
              const secScoreData = scoreResult?.sections[sec.id];
              const score = secScoreData?.score ?? 100;
              const tier: ScoreRatingTier = secScoreData?.tier ?? 'Excellent';
              const isPriority = prioritySection?.id === sec.id && score < 90;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionKey(sec.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-[#3D5AFE] ring-2 ring-[#3D5AFE]/20 shadow-sm'
                      : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      isSelected 
                        ? 'bg-[#3D5AFE] text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {sec.title}
                        </h3>
                        {isPriority && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Priority
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Weight: {sec.weight} of general score
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block">
                        {score} / 100
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getTierBadgeClass(tier)}`}>
                        {tier}
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'translate-x-0.5 text-[#3D5AFE]' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Section Detailed Breakdown & Actionable Guidance */}
        <div className="lg:col-span-7 space-y-4">
          {selectedScoreData && selectedConfig ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              
              {/* Selected Section Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#3D5AFE]/10 text-[#3D5AFE]">
                      {React.createElement(selectedConfig.icon, { className: 'w-4 h-4' })}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Section Deep-Dive
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedScoreData.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Weighted Contribution: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedScoreData.weightedScore.toFixed(1)} / {(100 * selectedConfig.weightRatio).toFixed(1)} pts</span> to overall score.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {selectedScoreData.score} <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  </span>
                  <span className={`block mt-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getTierBadgeClass(selectedScoreData.tier)}`}>
                    {selectedScoreData.tier}
                  </span>
                </div>
              </div>

              {/* 1. Component Rules Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Scoring Rules Breakdown</span>
                  <span className="text-[10px] font-normal lowercase">{selectedScoreData.components.length} rules evaluated</span>
                </h3>

                <div className="space-y-2">
                  {selectedScoreData.components.map((comp) => {
                    const isPerfect = comp.score === comp.maxScore;
                    const percent = Math.round((comp.score / comp.maxScore) * 100);

                    return (
                      <div
                        key={comp.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isPerfect ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {comp.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {comp.score} / {comp.maxScore} pts
                            </span>
                            <span className="text-[10px] text-slate-400">({percent}%)</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {comp.reason}
                        </p>

                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-white dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                          Rule: {comp.rule}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Actionable Guidance: "What to Improve" */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Actionable Guidance (Deterministic)</span>
                </h3>

                <div className="space-y-2">
                  {actionableGuidance.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3"
                      >
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Strengths & Deductions summary */}
              {(selectedScoreData.strengths.length > 0 || selectedScoreData.deductions.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {selectedScoreData.strengths.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Verified Strengths
                      </span>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                        {selectedScoreData.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedScoreData.deductions.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                        Deduction Factors
                      </span>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                        {selectedScoreData.deductions.map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">Select a section from the left pane to view its detailed breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
