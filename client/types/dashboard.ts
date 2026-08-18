export interface StatMetric {
  id: string;
  title: string;
  value: string | number;
  change: number; // percentage change, e.g. +12.5 or -3.2
  changeType: 'increase' | 'decrease' | 'neutral';
  timeframe: string;
  iconName: string;
  description?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  iconName: string;
  badge?: string;
  variant?: 'primary' | 'accent' | 'outline';
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'verification' | 'assessment' | 'profile' | 'security' | 'system';
  iconName: string;
  status?: 'success' | 'pending' | 'warning' | 'info';
}

export interface DashboardSummaryData {
  welcomeMessage: string;
  userRole: string;
  completionRate: number;
  activeVerificationsCount: number;
  passedAssessmentsCount: number;
  pendingActionsCount: number;
}
