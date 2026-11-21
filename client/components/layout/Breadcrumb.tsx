'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const SEGMENT_NAME_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  'interview-coach': 'AI Mock Interview',
  'resume-studio': 'Resume Studio',
  'career-planner': 'Career Planner',
  'job-center': 'Job Center',
  analytics: 'Analytics',
  settings: 'Settings',
  profile: 'Profile',
  plan: 'Plan & Billing',
  billing: 'Plan & Billing',
  admin: 'Admin Center',
};

interface CrumbItem {
  label: string;
  url: string;
  isLast: boolean;
}

export const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const rawSegments = pathname.split('/').filter(Boolean);

  // Build clean, human-friendly breadcrumbs
  const crumbs: CrumbItem[] = [];

  for (let i = 0; i < rawSegments.length; i++) {
    const seg = rawSegments[i];
    const prevSeg = i > 0 ? rawSegments[i - 1] : '';
    const nextSeg = i + 1 < rawSegments.length ? rawSegments[i + 1] : '';
    const url = `/${rawSegments.slice(0, i + 1).join('/')}`;

    // Skip intermediate 'report' or 'session' segments if immediately followed by an ID
    if ((seg === 'report' || seg === 'session') && nextSeg && /^[0-9a-fA-F]{24}$/.test(nextSeg)) {
      continue;
    }

    // Handle MongoDB 24-hex ObjectId dynamic segments
    if (/^[0-9a-fA-F]{24}$/.test(seg)) {
      let label = 'Details';
      if (prevSeg === 'report') {
        label = 'Readiness Report';
      } else if (prevSeg === 'session') {
        label = 'Interview Arena';
      }

      crumbs.push({
        label,
        url,
        isLast: i === rawSegments.length - 1,
      });
      continue;
    }

    const label =
      SEGMENT_NAME_MAP[seg] ||
      seg.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

    crumbs.push({
      label,
      url,
      isLast: i === rawSegments.length - 1,
    });
  }

  // Ensure only the final crumb in the resolved list is marked isLast
  if (crumbs.length > 0) {
    crumbs.forEach((c, idx) => {
      c.isLast = idx === crumbs.length - 1;
    });
  }

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {crumbs.map((crumb) => {
        return (
          <React.Fragment key={crumb.url}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            {crumb.isLast ? (
              <span className="font-semibold text-slate-900 dark:text-slate-200">{crumb.label}</span>
            ) : (
              <Link href={crumb.url} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
