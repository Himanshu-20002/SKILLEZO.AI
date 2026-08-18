import { NotificationItem } from '@/types/notification';

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Skill Verification Completed',
    message: 'Your React 19 & Next.js 15 skill verification audit has passed with an score of 98/100.',
    timestamp: '10 minutes ago',
    category: 'verification',
    read: false,
    actionUrl: '/dashboard/skill-verification',
    actionLabel: 'View Certificate'
  },
  {
    id: 'notif-2',
    title: 'New AI Assessment Available',
    message: 'System Architecture & Vector DB optimization assessment is now open for your profile level.',
    timestamp: '2 hours ago',
    category: 'assessment',
    read: false,
    actionUrl: '/dashboard',
    actionLabel: 'Start Assessment'
  },
  {
    id: 'notif-3',
    title: 'Security Alert',
    message: 'A new login attempt was recorded from San Francisco, CA (Mac OS Chrome).',
    timestamp: 'Yesterday at 9:15 AM',
    category: 'security',
    read: true,
    actionUrl: '/dashboard/settings',
    actionLabel: 'Review Security'
  },
  {
    id: 'notif-4',
    title: 'Platform Maintenance Notice',
    message: 'Skillezo AI scheduled infrastructure update complete. All verification pipelines are running at peak speed.',
    timestamp: '2 days ago',
    category: 'system',
    read: true
  },
  {
    id: 'notif-5',
    title: 'Badge Issued: Enterprise Architect',
    message: 'You have unlocked the Enterprise Full-Stack Architect badge on your public profile.',
    timestamp: '4 days ago',
    category: 'verification',
    read: true,
    actionUrl: '/dashboard/profile',
    actionLabel: 'View Badge'
  }
];
