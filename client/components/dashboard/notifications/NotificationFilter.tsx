'use client';

import React from 'react';
import { FilterDropdown, FilterOption } from '@/components/dashboard/common/FilterDropdown';

interface NotificationFilterProps {
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
}

const categoryOptions: FilterOption[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Skill Verification', value: 'verification' },
  { label: 'Assessments', value: 'assessment' },
  { label: 'Security Alerts', value: 'security' },
  { label: 'System Updates', value: 'system' }
];

const statusOptions: FilterOption[] = [
  { label: 'All Read States', value: 'all' },
  { label: 'Unread Only', value: 'unread' },
  { label: 'Read Only', value: 'read' }
];

export const NotificationFilter: React.FC<NotificationFilterProps> = ({
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterDropdown
        options={categoryOptions}
        value={categoryFilter}
        onChange={onCategoryChange}
        label="Category"
      />
      <FilterDropdown
        options={statusOptions}
        value={statusFilter}
        onChange={onStatusChange}
        label="Read Status"
      />
    </div>
  );
};
