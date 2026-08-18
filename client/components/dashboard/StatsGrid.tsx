'use client';

import React from 'react';
import { StatCard } from './StatCard';
import { mockStatMetrics } from '@/mock/dashboard';

export const StatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockStatMetrics.map((metric) => (
        <StatCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
};
