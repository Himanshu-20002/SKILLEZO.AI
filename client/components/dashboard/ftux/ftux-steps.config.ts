import { FileText, Compass, Sparkles, Target, Award, Wallet, Bot } from 'lucide-react';

export interface FtuxTourStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  badge: string;
  iconName: 'FileText' | 'Compass' | 'Sparkles' | 'Target' | 'Award' | 'Wallet' | 'Bot';
  actionHint?: string;
  actionUrl?: string;
}

export interface SuperpowerCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: 'FileText' | 'Bot' | 'Compass';
  accentColor: string;
  gradient: string;
  stats: { label: string; value: string };
  actionLabel: string;
  actionHref: string;
}

export const SUPERPOWER_CARDS: SuperpowerCard[] = [
  {
    id: 'resume-studio',
    title: 'AI Resume Studio',
    subtitle: 'Tailor in 30 Seconds',
    description: 'Upload your resume to get instant deterministic ATS parsing, keyword gap scoring, and one-click bullet improvements benchmarked against top tech roles.',
    iconName: 'FileText',
    accentColor: '#3D5AFE',
    gradient: 'from-[#3D5AFE]/20 via-[#3D5AFE]/5 to-transparent',
    stats: { label: 'Average ATS Boost', value: '+35 pts' },
    actionLabel: 'Upload Resume',
    actionHref: '/dashboard/resume-studio'
  },
  {
    id: 'interview-coach',
    title: 'AI Mock Interview Coach',
    subtitle: 'Real-Time Voice & Video',
    description: 'Practice role-specific technical and behavioral interviews with real-time speech cadence scoring, facial engagement feedback, and AI rubric diagnostics.',
    iconName: 'Bot',
    accentColor: '#00D9C0',
    gradient: 'from-[#00D9C0]/20 via-[#00D9C0]/5 to-transparent',
    stats: { label: 'Confidence Gain', value: '4.8 / 5.0' },
    actionLabel: 'Start Mock Interview',
    actionHref: '/dashboard/interview-coach'
  },
  {
    id: 'career-gps',
    title: 'Career GPS & Skill Badges',
    subtitle: 'Verified Market Roadmaps',
    description: 'Discover your skill gaps, verify proficiencies with tamper-proof blockchain-style badges, and follow a milestone-based GPS directly to your target salary.',
    iconName: 'Compass',
    accentColor: '#FFB800',
    gradient: 'from-[#FFB800]/20 via-[#FFB800]/5 to-transparent',
    stats: { label: 'Hiring Match Rate', value: '3.2x Faster' },
    actionLabel: 'View Career GPS',
    actionHref: '/dashboard/career-gps'
  }
];

export const FTUX_TOUR_STEPS: FtuxTourStep[] = [
  {
    id: 'welcome-hub',
    targetSelector: '#welcome-banner',
    title: 'Your Command Center',
    description: 'Here is your personalized launchpad showing your live Employability Score, current level, and 1,000 complimentary AI Tokens ready to use.',
    badge: 'Hub 1 of 4',
    iconName: 'Sparkles',
    actionHint: 'Check your current readiness index'
  },
  {
    id: 'profile-guide',
    targetSelector: '#profile-completion-guide',
    title: 'Profile Completion Guide',
    description: 'Complete these quick milestones — verifying skills, uploading a resume, and setting career goals — to unlock maximum employer visibility.',
    badge: 'Hub 2 of 4',
    iconName: 'Target',
    actionHint: 'Complete milestones to earn verified badges'
  },
  {
    id: 'metrics-overview',
    targetSelector: '#stats-grid-overview',
    title: 'Live Employability Metrics',
    description: 'Track your real-time benchmark scores across Resume Quality, Skill Gap Coverage, Interview Readiness, and Verified Credentials.',
    badge: 'Hub 3 of 4',
    iconName: 'Award',
    actionHint: 'Benchmark against 50,000+ candidates'
  },
  {
    id: 'quick-actions',
    targetSelector: '#quick-actions-panel',
    title: 'High-Impact AI Workspaces',
    description: 'Jump straight into the AI Resume Studio, practice with the Mock Interview Coach, or analyze your target role with Skill Gap Analysis.',
    badge: 'Hub 4 of 4',
    iconName: 'Compass',
    actionHint: 'Pick a workspace to get started'
  }
];
