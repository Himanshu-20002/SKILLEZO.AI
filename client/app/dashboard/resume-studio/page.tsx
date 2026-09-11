'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Award, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Code2, 
  UserCheck, 
  ArrowLeft,
  RefreshCw,
  Target,
  ChevronDown,
  UploadCloud,
  Check,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from '@/types/resume-document.fixture';
import { ResumeScoreResult, SectionScore, ScoreRatingTier } from '@/types/resume-scoring.types';
import { resumeService } from '@/services/resume.service';
import { ResumeRecord } from '@/types/resume';

interface SectionConfigItem {
  id: keyof ResumeScoreResult['sections'];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTION_CONFIGS: SectionConfigItem[] = [
  { id: 'contact', title: 'Contact Information', icon: UserCheck },
  { id: 'summary', title: 'Professional Summary', icon: FileText },
  { id: 'skills', title: 'Technical Skills', icon: Code2 },
  { id: 'experience', title: 'Work Experience', icon: Briefcase },
  { id: 'projects', title: 'Projects', icon: FolderGit2 },
  { id: 'education', title: 'Education', icon: GraduationCap },
  { id: 'achievements', title: 'Achievements & Certifications', icon: Award },
];

export default function ResumeStudioPage() {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<ResumeScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSampleMode, setIsSampleMode] = useState(false);
  
  // Navigation: overview vs section-detail
  const [activeView, setActiveView] = useState<'overview' | 'detail'>('overview');
  const [activeSectionKey, setActiveSectionKey] = useState<keyof ResumeScoreResult['sections']>('experience');
  const [showScoringDetails, setShowScoringDetails] = useState(false);

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
      setError("We couldn't load your resume analysis. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const loadSampleScores = () => {
    const sampleScore: ResumeScoreResult = {
      scoreId: "sample_score_01",
      resumeId: SAMPLE_RESUME_DOCUMENT_FIXTURE.id,
      engineVersion: "resume-score-v1",
      calculatedAt: new Date().toISOString(),
      overall: {
        overallScore: 63,
        maxScore: 100,
        tier: "Good",
        summaryReason: "You have a solid foundation. Work Experience is your biggest opportunity to improve.",
        totalStrengthsCount: 10,
        totalWeaknessesCount: 4,
        totalDeductionsCount: 2,
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
        contact: {
          sectionId: "contact",
          title: "Contact Information",
          score: 75,
          maxScore: 100,
          weight: 0.05,
          weightedScore: 3.75,
          status: "COMPLETE",
          tier: "Good",
          components: [
            { id: "contact.identity", label: "Full Name & Headline", score: 30, maxScore: 30, weight: 0.30, rule: "Candidate name present", reason: "Candidate name verified.", evidenceIds: ["ev_contact_01"] },
            { id: "contact.reachability", label: "Email & Phone", score: 30, maxScore: 30, weight: 0.30, rule: "Email & phone present", reason: "Email and phone verified.", evidenceIds: ["ev_contact_02"] },
            { id: "contact.presence", label: "LinkedIn / GitHub Presence", score: 15, maxScore: 25, weight: 0.25, rule: "Professional links present", reason: "LinkedIn link present, GitHub missing.", evidenceIds: ["ev_contact_03"] },
            { id: "contact.cleanliness", label: "Clean URLs", score: 0, maxScore: 15, weight: 0.15, rule: "No tracking parameters", reason: "Social links contain query parameters.", evidenceIds: ["ev_contact_04"] },
          ],
          strengths: ["Clear candidate name and reachability details."],
          weaknesses: ["Add a clean portfolio or GitHub link."],
          deductions: ["Clean URL hygiene (-15 pts)"],
          evidenceIds: ["ev_contact_01", "ev_contact_02"],
        },
        summary: {
          sectionId: "summary",
          title: "Professional Summary",
          score: 80,
          maxScore: 100,
          weight: 0.10,
          weightedScore: 8.0,
          status: "COMPLETE",
          tier: "Strong",
          components: [
            { id: "summary.presence", label: "Summary Content", score: 30, maxScore: 30, weight: 0.30, rule: "Summary present", reason: "Professional summary structured.", evidenceIds: ["ev_sum_01"] },
            { id: "summary.length", label: "Calibrated Word Count", score: 30, maxScore: 30, weight: 0.30, rule: "30-100 words", reason: "Summary has optimal word length (54 words).", evidenceIds: ["ev_sum_02"] },
            { id: "summary.tone", label: "Executive Tone", score: 20, maxScore: 20, weight: 0.20, rule: "First-person avoided", reason: "Neutral professional tone.", evidenceIds: ["ev_sum_03"] },
            { id: "summary.focus", label: "Target Role Focus", score: 0, maxScore: 20, weight: 0.20, rule: "Explicit role keyword", reason: "Specific job title keyword could be sharper.", evidenceIds: ["ev_sum_04"] },
          ],
          strengths: ["Concise, professional summary length."],
          weaknesses: ["Highlight target specializations more directly."],
          deductions: ["Target role keyword alignment (-20 pts)"],
          evidenceIds: ["ev_sum_01", "ev_sum_02"],
        },
        skills: {
          sectionId: "skills",
          title: "Technical Skills",
          score: 90,
          maxScore: 100,
          weight: 0.20,
          weightedScore: 18.0,
          status: "COMPLETE",
          tier: "Excellent",
          components: [
            { id: "skills.volume", label: "Skill Breadth", score: 30, maxScore: 30, weight: 0.30, rule: ">= 8 technical skills", reason: "14 verified skills present.", evidenceIds: ["ev_sk_01"] },
            { id: "skills.diversity", label: "Domain Diversity", score: 30, maxScore: 30, weight: 0.30, rule: ">= 3 skill categories", reason: "Frontend, Backend, and Database domains present.", evidenceIds: ["ev_sk_02"] },
            { id: "skills.categorization", label: "Structured Categorization", score: 20, maxScore: 25, weight: 0.25, rule: "Skills grouped logically", reason: "Skills grouped into distinct stacks.", evidenceIds: ["ev_sk_03"] },
            { id: "skills.cleanliness", label: "Clean Standardization", score: 10, maxScore: 15, weight: 0.15, rule: "No redundant duplicates", reason: "Clean skill naming standards.", evidenceIds: ["ev_sk_04"] },
          ],
          strengths: ["Rich coverage across frontend and backend technologies.", "Well-structured skill categorization."],
          weaknesses: ["Add proficiency levels where applicable."],
          deductions: [],
          evidenceIds: ["ev_sk_01", "ev_sk_02"],
        },
        experience: {
          sectionId: "experience",
          title: "Work Experience",
          score: 31,
          maxScore: 100,
          weight: 0.30,
          weightedScore: 9.3,
          status: "PARTIAL",
          tier: "Needs Work",
          components: [
            { id: "experience.completeness", label: "Role Structure & Dates", score: 20, maxScore: 25, weight: 0.25, rule: "Company, title, and dates", reason: "Basic role structure is present.", evidenceIds: ["ev_exp_01"] },
            { id: "experience.bullet_density", label: "Bullet Detail", score: 11, maxScore: 25, weight: 0.25, rule: "2-6 bullets per role", reason: "Only 1 bullet provided for latest role.", evidenceIds: ["ev_exp_02"] },
            { id: "experience.action_verbs", label: "Action-Oriented Writing", score: 0, maxScore: 25, weight: 0.25, rule: "Power verbs in >=75% bullets", reason: "Limited action-oriented language; uses passive responsibility phrasing.", evidenceIds: ["ev_exp_03"] },
            { id: "experience.quantitative_metrics", label: "Measurable Impact", score: 0, maxScore: 25, weight: 0.25, rule: "Quantifiable metrics in >=50% roles", reason: "No measurable metrics or quantifiable outcomes found.", evidenceIds: ["ev_exp_04"] },
          ],
          strengths: ["Your experience entry has basic role and company structure."],
          weaknesses: [
            "Bullets focus on routine duties rather than measurable achievements.",
            "Limited use of power action verbs."
          ],
          deductions: [
            "Missing action power verbs (-25 pts)",
            "Missing measurable metrics (-25 pts)",
            "Sparse bullet elaboration (-14 pts)"
          ],
          evidenceIds: ["ev_exp_01", "ev_exp_02"],
        },
        projects: {
          sectionId: "projects",
          title: "Projects",
          score: 75,
          maxScore: 100,
          weight: 0.15,
          weightedScore: 11.25,
          status: "COMPLETE",
          tier: "Good",
          components: [
            { id: "projects.structure", label: "Project Details", score: 30, maxScore: 30, weight: 0.30, rule: "Title, role, description", reason: "2 featured projects structured.", evidenceIds: ["ev_proj_01"] },
            { id: "projects.tech_stack", label: "Tech Stack Highlights", score: 30, maxScore: 30, weight: 0.30, rule: "Identified technologies", reason: "Clear tech stack list per project.", evidenceIds: ["ev_proj_02"] },
            { id: "projects.links", label: "Live / Repository Links", score: 15, maxScore: 25, weight: 0.25, rule: "Demo or GitHub links", reason: "GitHub repo provided, live demo link missing.", evidenceIds: ["ev_proj_03"] },
            { id: "projects.bullet_depth", label: "Impact Description", score: 0, maxScore: 15, weight: 0.15, rule: "Bullet depth per project", reason: "Project bullets could explain architecture in more detail.", evidenceIds: ["ev_proj_04"] },
          ],
          strengths: ["Clear technical stack listed for each project."],
          weaknesses: ["Add live preview or deployment URLs."],
          deductions: ["Missing live deployment link (-10 pts)"],
          evidenceIds: ["ev_proj_01", "ev_proj_02"],
        },
        education: {
          sectionId: "education",
          title: "Education",
          score: 60,
          maxScore: 100,
          weight: 0.15,
          weightedScore: 9.0,
          status: "COMPLETE",
          tier: "Developing",
          components: [
            { id: "education.degree_institution", label: "Degree & Institution", score: 40, maxScore: 40, weight: 0.40, rule: "Institution and degree", reason: "University and B.S. degree listed.", evidenceIds: ["ev_edu_01"] },
            { id: "education.timeline", label: "Graduation Date", score: 20, maxScore: 30, weight: 0.30, rule: "Graduation year or range", reason: "Graduation year listed.", evidenceIds: ["ev_edu_02"] },
            { id: "education.specialization", label: "Field & Academic Honors", score: 0, maxScore: 30, weight: 0.30, rule: "Field of study & GPA", reason: "Field of study or honors not specified.", evidenceIds: ["ev_edu_03"] },
          ],
          strengths: ["Recognized degree and university listed."],
          weaknesses: ["Specify exact major/field of study and relevant coursework."],
          deductions: ["Academic specialization missing (-30 pts)"],
          evidenceIds: ["ev_edu_01", "ev_edu_02"],
        },
        achievements: {
          sectionId: "achievements",
          title: "Achievements & Certifications",
          score: 70,
          maxScore: 100,
          weight: 0.05,
          weightedScore: 3.5,
          status: "COMPLETE",
          tier: "Good",
          components: [
            { id: "achievements.volume", label: "Certifications Count", score: 35, maxScore: 35, weight: 0.35, rule: ">= 1 credential", reason: "AWS Certified Solutions Architect listed.", evidenceIds: ["ev_ach_01"] },
            { id: "achievements.issuer", label: "Issuing Organization", score: 35, maxScore: 35, weight: 0.35, rule: "Issuer name", reason: "Issuer identified.", evidenceIds: ["ev_ach_02"] },
            { id: "achievements.credentials", label: "Verification URLs", score: 0, maxScore: 30, weight: 0.30, rule: "Verification link/ID", reason: "Credential URL or verification ID missing.", evidenceIds: ["ev_ach_03"] },
          ],
          strengths: ["Industry recognized certification present."],
          weaknesses: ["Add credential ID or verification URL."],
          deductions: ["Missing verification URL (-30 pts)"],
          evidenceIds: ["ev_ach_01", "ev_ach_02"],
        },
      },
    };

    setScoreResult(sampleScore);
  };

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setIsSampleMode(false);
    setActiveView('overview');
    fetchScore(resumeId);
  };

  // Derived Insights
  const overallScore = scoreResult?.overall.overallScore ?? 0;
  const overallTier: ScoreRatingTier = scoreResult?.overall.tier ?? 'Good';

  const { strongestSection, prioritySection } = useMemo(() => {
    if (!scoreResult) return { strongestSection: null, prioritySection: null };

    const sectionEntries = Object.entries(scoreResult.sections).map(([key, sec]) => ({
      id: key as keyof ResumeScoreResult['sections'],
      title: sec.title,
      score: sec.score,
      tier: sec.tier,
      weaknesses: sec.weaknesses,
      strengths: sec.strengths,
      components: sec.components,
    }));

    const sortedDesc = [...sectionEntries].sort((a, b) => b.score - a.score);
    const sortedAsc = [...sectionEntries].sort((a, b) => a.score - b.score);

    return {
      strongestSection: sortedDesc[0],
      prioritySection: sortedAsc[0],
    };
  }, [scoreResult]);

  // Selected Section for Detail View
  const selectedSectionData: SectionScore | undefined = scoreResult?.sections[activeSectionKey];
  const selectedConfig = SECTION_CONFIGS.find((s) => s.id === activeSectionKey);

  // Review areas derived deterministically
  const reviewAreas = useMemo(() => {
    if (!selectedSectionData) return [];

    const areas: { label: string; status: 'Needs attention' | 'Good' | 'Strong'; reason: string }[] = [];

    for (const comp of selectedSectionData.components) {
      const ratio = comp.score / comp.maxScore;
      let status: 'Needs attention' | 'Good' | 'Strong' = 'Good';
      if (ratio < 0.6) {
        status = 'Needs attention';
      } else if (ratio >= 0.9) {
        status = 'Strong';
      }

      areas.push({
        label: comp.label,
        status,
        reason: comp.reason,
      });
    }

    return areas;
  }, [selectedSectionData]);

  const getTierPill = (tier: ScoreRatingTier | 'Needs attention' | 'Good' | 'Strong') => {
    switch (tier) {
      case 'Excellent':
      case 'Strong':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40';
      case 'Good':
        return 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40';
      case 'Developing':
      case 'Needs Work':
      case 'Needs attention':
      default:
        return 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1130] p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-pulse font-sans">
        <div className="h-14 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800" />
        <div className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        <div className="h-40 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  // Error State
  if (error && !scoreResult) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Resume analysis unavailable</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={() => selectedResumeId && fetchScore(selectedResumeId)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Empty State: No Resumes
  if (!loading && resumes.length === 0 && !isSampleMode) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Build your resume analysis</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Upload a resume to see your real section scores, strengths, and improvement areas.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/resume-intelligence"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Resume</span>
            </Link>
            <button
              onClick={() => {
                setIsSampleMode(true);
                loadSampleScores();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>View Sample Preview</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1130] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto font-sans space-y-6 pb-20">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Resume Studio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Improve your resume section by section.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isSampleMode && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Sample Preview
            </span>
          )}

          {resumes.length > 0 && (
            <div className="relative">
              <select
                value={selectedResumeId || ''}
                onChange={(e) => handleSelectResume(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title || r.originalFileName || 'Resume'} {r.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {selectedResumeId && !isSampleMode && (
            <button
              onClick={() => fetchScore(selectedResumeId)}
              disabled={refreshing}
              title="Refresh analysis"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: OVERVIEW */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          
          {/* Section A: Resume Health */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your Resume
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getTierPill(overallTier)}`}>
                {overallTier}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-base font-semibold text-slate-400">
                / 100
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {scoreResult?.overall.summaryReason || "You have a solid foundation. Experience is your biggest opportunity to improve."}
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800/80">
              {strongestSection && (
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Strongest
                  </span>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span>{strongestSection.title}</span>
                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">{strongestSection.score} / 100</span>
                  </div>
                </div>
              )}

              {prioritySection && (
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Needs attention
                  </span>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span>{prioritySection.title}</span>
                    <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">{prioritySection.score} / 100</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Needs Attention (Main Actionable Priority) */}
          {prioritySection && prioritySection.score < 85 && (
            <div className="p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Needs Attention
                  </span>
                </div>
                <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                  {prioritySection.score} / 100
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {prioritySection.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Your {prioritySection.title.toLowerCase()} section has the biggest opportunity for improvement.
                </p>
              </div>

              {prioritySection.weaknesses && prioritySection.weaknesses.length > 0 && (
                <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {prioritySection.weaknesses.slice(0, 2).map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveSectionKey(prioritySection.id);
                    setActiveView('detail');
                    setShowScoringDetails(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  <span>Review {prioritySection.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Section C: Resume Sections (Compact List) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resume Sections
              </h2>
              <span className="text-xs text-slate-400">Select to review</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {SECTION_CONFIGS.map((sec) => {
                const Icon = sec.icon;
                const secScore = scoreResult?.sections[sec.id]?.score ?? 100;
                const isWeakest = prioritySection?.id === sec.id && secScore < 85;

                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSectionKey(sec.id);
                      setActiveView('detail');
                      setShowScoringDetails(false);
                    }}
                    className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {sec.title}
                        </span>
                        {isWeakest && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Attention
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-mono font-bold ${getScoreColor(secScore)}`}>
                        {secScore}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: SECTION DETAIL */}
      {activeView === 'detail' && selectedSectionData && selectedConfig && (
        <div className="space-y-6">
          
          {/* Back Action */}
          <button
            onClick={() => setActiveView('overview')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Resume</span>
          </button>

          {/* Section Summary Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {React.createElement(selectedConfig.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {selectedSectionData.title}
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">
                    Section Analysis
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-2xl font-extrabold ${getScoreColor(selectedSectionData.score)}`}>
                  {selectedSectionData.score} <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getTierPill(selectedSectionData.tier)}`}>
                  {selectedSectionData.tier}
                </span>
              </div>
            </div>

            {/* What needs attention */}
            {selectedSectionData.weaknesses && selectedSectionData.weaknesses.length > 0 && (
              <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  What needs attention
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedSectionData.weaknesses.join(' ')}
                </p>
              </div>
            )}
          </div>

          {/* Review Areas */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Review Areas
            </h3>

            <div className="space-y-3">
              {reviewAreas.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.reason}
                    </p>
                  </div>
                  <span className={`self-start sm:self-center px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 ${getTierPill(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What is working */}
          {selectedSectionData.strengths && selectedSectionData.strengths.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                What is working
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {selectedSectionData.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transparent Scoring Details (Optional Disclosure) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-xs">
            <button
              onClick={() => setShowScoringDetails(!showScoringDetails)}
              className="w-full flex items-center justify-between text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold cursor-pointer"
            >
              <span>{showScoringDetails ? 'Hide scoring details' : 'View scoring details'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showScoringDetails ? 'rotate-180' : ''}`} />
            </button>

            {showScoringDetails && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 font-mono">
                {selectedSectionData.components.map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                    <span>{comp.label}</span>
                    <span className="font-bold">{comp.score} / {comp.maxScore} pts ({comp.rule})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Interactive Section Editor arrives in Phase 5.
            </div>
            <button
              disabled
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            >
              Improve this section
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
