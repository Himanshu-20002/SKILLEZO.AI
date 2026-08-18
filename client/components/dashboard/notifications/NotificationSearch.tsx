'use client';

import React from 'react';
import { SearchInput } from '@/components/dashboard/common/SearchInput';

interface NotificationSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export const NotificationSearch: React.FC<NotificationSearchProps> = ({ value, onChange }) => {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder="Search notifications, alerts, or audit notices..."
    />
  );
};
