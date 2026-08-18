import { StatMetric, QuickAction, ActivityItem, DashboardSummaryData } from '@/types/dashboard';

export const mockDashboardSummary: DashboardSummaryData = {
  welcomeMessage: "Welcome back, Shweta",
  userRole: "Marketing Head ",
  completionRate: 88,
  activeVerificationsCount: 3,
  passedAssessmentsCount: 14,
  pendingActionsCount: 2,
};

export const mockStatMetrics: StatMetric[] = [
  {
    id: 'stat-1',
    title: 'Verified Skills',
    value: '18',
    change: 12.5,
    changeType: 'increase',
    timeframe: 'vs last month',
    iconName: 'Award',
    description: '3 new skills verified this week'
  },
  {
    id: 'stat-2',
    title: 'Assessments Passed',
    value: '24',
    change: 8.3,
    changeType: 'increase',
    timeframe: 'vs last month',
    iconName: 'CheckCircle2',
    description: 'Average percentile: 94%'
  },
  {
    id: 'stat-3',
    title: 'Profile Readiness',
    value: '92%',
    change: 5.0,
    changeType: 'increase',
    timeframe: 'vs last week',
    iconName: 'TrendingUp',
    description: 'Enterprise recruiter visible'
  },
  {
    id: 'stat-4',
    title: 'Certifications',
    value: '7',
    change: 0,
    changeType: 'neutral',
    timeframe: 'vs last month',
    iconName: 'ShieldCheck',
    description: 'All badges updated & active'
  }
];

export const mockQuickActions: QuickAction[] = [
  {
    id: 'qa-1',
    label: 'Request Verification',
    description: 'Submit your code or project for AI audit',
    href: '/dashboard/skill-verification',
    iconName: 'CheckSquare',
    variant: 'primary'
  },
  {
    id: 'qa-2',
    label: 'Take AI Assessment',
    description: 'Evaluate technical proficiency in real-time',
    href: '/dashboard',
    iconName: 'Cpu',
    badge: 'Popular',
    variant: 'accent'
  },
  {
    id: 'qa-3',
    label: 'Update Profile Skills',
    description: 'Add new tech stack capabilities',
    href: '/dashboard/profile',
    iconName: 'UserCheck',
    variant: 'outline'
  },
  {
    id: 'qa-4',
    label: 'Account Preferences',
    description: 'Manage security & notifications',
    href: '/dashboard/settings',
    iconName: 'Settings',
    variant: 'outline'
  }
];

export const mockActivityTimeline: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'React & Next.js Architecture Verified',
    description: 'Scored 96/100 on enterprise code evaluation',
    timestamp: '2 hours ago',
    type: 'verification',
    iconName: 'Award',
    status: 'success'
  },
  {
    id: 'act-2',
    title: 'Completed System Design Assessment',
    description: 'Passed distributed cache & microservices module',
    timestamp: 'Yesterday at 4:30 PM',
    type: 'assessment',
    iconName: 'CheckCircle2',
    status: 'success'
  },
  {
    id: 'act-3',
    title: 'Profile Updated',
    description: 'Added Cloud Architecture credentials',
    timestamp: '3 days ago',
    type: 'profile',
    iconName: 'User',
    status: 'info'
  },
  {
    id: 'act-4',
    title: 'Two-Factor Authentication Enabled',
    description: 'Enhanced account security parameters',
    timestamp: '5 days ago',
    type: 'security',
    iconName: 'ShieldCheck',
    status: 'warning'
  }
];
