'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Target,
  Compass,
  GraduationCap,
  FolderGit2,
  CheckSquare,
  Briefcase,
  LineChart,
  Wallet,
  UserCheck,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Layers,
} from 'lucide-react';

type CategoryType = 'all' | 'core' | 'learning' | 'career';

interface StudentPortalFeatureCardProps {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  accentColor: string;
  metric?: string;
  metricLabel?: string;
  progress?: number;
  statusText?: string;
}

const StudentPortalFeatureCard: React.FC<StudentPortalFeatureCardProps> = ({
  title,
  subtitle,
  href,
  icon: Icon,
  badge,
  accentColor,
  metric,
  metricLabel,
  progress,
  statusText,
}) => {
  return (
    <Link
      href={href}
      className="group relative bg-white dark:bg-[#111736] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Card Top Row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              {badge}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
          {title}
          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-indigo-500" />
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {subtitle}
        </p>

        {/* Dynamic Metric / Progress */}
        {(metric || progress !== undefined || statusText) && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
            {metric && (
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{metric}</span>
                {metricLabel && <span className="text-[11px] text-slate-400 font-medium">{metricLabel}</span>}
              </div>
            )}

            {progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Roadmap Progress</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {statusText && (
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {statusText}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Link */}
      <div className="mt-4 pt-2.5 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        <span>View Details</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-indigo-500" />
      </div>
    </Link>
  );
};

export const StudentPortalGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'core', label: 'Core AI & Analytics' },
    { id: 'learning', label: 'Skills & Learning' },
    { id: 'career', label: 'Jobs & Mentoring' },
  ];

  const studentFeatures = [
    {
      id: 'career-profile',
      category: 'core',
      title: 'Career Profile',
      subtitle: 'Manage target tech roles, preferences, and background info.',
      href: '/dashboard/profile',
      icon: UserCheck,
      badge: 'Profile',
      accentColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      statusText: '90% Complete',
    },
    {
      id: 'resume-intelligence',
      category: 'core',
      title: 'Resume Intelligence',
      subtitle: 'AI resume audit, skill extraction, and ATS scoring.',
      href: '/dashboard/resume-intelligence',
      icon: FileText,
      badge: 'AI Audited',
      accentColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      metric: '84/100',
      metricLabel: 'ATS Score',
    },
    {
      id: 'skill-gap-analysis',
      category: 'core',
      title: 'Skill Gap Analysis',
      subtitle: 'Identify missing technical competencies for target roles.',
      href: '/dashboard/skill-gap-analysis',
      icon: Target,
      badge: 'High Impact',
      accentColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      metric: '3 Gaps',
      metricLabel: 'Docker, GraphQL, Redis',
    },
    {
      id: 'employability-index',
      category: 'core',
      title: 'Employability Index',
      subtitle: 'Dynamic job-readiness metric evaluating skills & projects.',
      href: '/dashboard/employability-index',
      icon: BarChart3,
      badge: 'Core Metric',
      accentColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      metric: '78 / 100',
      metricLabel: 'Job-Ready',
    },
    {
      id: 'career-gps',
      category: 'career',
      title: 'Career GPS',
      subtitle: 'Step-by-step personalized career roadmap and milestones.',
      href: '/dashboard/career-gps',
      icon: Compass,
      badge: 'Roadmap',
      accentColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      progress: 65,
    },
    {
      id: 'learning-hub',
      category: 'learning',
      title: 'Learning Hub',
      subtitle: 'AI-curated learning paths tailored to your skill gaps.',
      href: '/dashboard/learning-hub',
      icon: GraduationCap,
      badge: 'Curated',
      accentColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
      metric: '4 Active Courses',
    },
    {
      id: 'projects',
      category: 'learning',
      title: 'Projects & Portfolio',
      subtitle: 'Hands-on projects guided by AI code mentoring.',
      href: '/dashboard/projects',
      icon: FolderGit2,
      badge: 'Hands-on',
      accentColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
      metric: '2 Verified',
      metricLabel: '1 In Review',
    },
    {
      id: 'assessments',
      category: 'learning',
      title: 'Skill Assessments',
      subtitle: 'Technical skill evaluations and verified badges.',
      href: '/dashboard/assessments',
      icon: CheckSquare,
      badge: 'Verified',
      accentColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
      statusText: '92% Pass Rate',
    },
    {
      id: 'ai-career-coach',
      category: 'career',
      title: 'AI Career Coach',
      subtitle: 'Interactive 24/7 AI mentor for mock interviews.',
      href: '/dashboard/ai-career-coach',
      icon: Sparkles,
      badge: 'AI Live',
      accentColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
      statusText: 'Ready to assist',
    },
    {
      id: 'job-center',
      category: 'career',
      title: 'Job Center',
      subtitle: 'Smart job matching based on your skill score.',
      href: '/dashboard/job-center',
      icon: Briefcase,
      badge: 'Matches',
      accentColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
      metric: '12 Matches',
      metricLabel: '>85% Match Rate',
    },
    {
      id: 'progress-analytics',
      category: 'core',
      title: 'Progress & Analytics',
      subtitle: 'Detailed charts tracking your learning curve and growth.',
      href: '/dashboard/progress-analytics',
      icon: LineChart,
      badge: 'Analytics',
      accentColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      metric: '+18% Growth',
      metricLabel: 'This Month',
    },
    {
      id: 'wallet',
      category: 'career',
      title: 'Wallet & Tokens',
      subtitle: 'AI token credits for resume scans and assessments.',
      href: '/dashboard/wallet',
      icon: Wallet,
      badge: 'Credits',
      accentColor: 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20',
      metric: '450 Tokens',
      metricLabel: 'Pro Tier',
    },
  ];

  const filteredFeatures =
    activeCategory === 'all'
      ? studentFeatures
      : studentFeatures.filter((item) => item.category === activeCategory);

  return (
    <div className="space-y-5">
      {/* Category Tabs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            Student Feature Modules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Explore tools, roadmaps, AI guidance, and career intelligence.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#111736] rounded-xl border border-slate-200/60 dark:border-slate-800/80 self-start sm:self-auto overflow-x-auto max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as CategoryType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFeatures.map((feature) => (
          <StudentPortalFeatureCard key={feature.id} {...feature} />
        ))}
      </div>
    </div>
  );
};
