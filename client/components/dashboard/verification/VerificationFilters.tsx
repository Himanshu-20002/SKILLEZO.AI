'use client';

import React from 'react';
import { FilterDropdown, FilterOption } from '@/components/dashboard/common/FilterDropdown';

interface VerificationFiltersProps {
  statusFilter: string;
  onStatusChange: (val: string) => void;
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
}

const statusOptions: FilterOption[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Failed', value: 'failed' }
];

const categoryOptions: FilterOption[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Frontend Development', value: 'Frontend Development' },
  { label: 'Software Engineering', value: 'Software Engineering' },
  { label: 'System Architecture', value: 'System Architecture' },
  { label: 'Backend Development', value: 'Backend Development' },
  { label: 'DevOps & Infrastructure', value: 'DevOps & Infrastructure' }
];

export const VerificationFilters: React.FC<VerificationFiltersProps> = ({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterDropdown
        options={statusOptions}
        value={statusFilter}
        onChange={onStatusChange}
        label="Status"
      />
      <FilterDropdown
        options={categoryOptions}
        value={categoryFilter}
        onChange={onCategoryChange}
        label="Category"
      />
    </div>
  );
};
