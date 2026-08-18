'use client';

import React from 'react';
import { SearchInput } from '@/components/dashboard/common/SearchInput';

interface VerificationSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export const VerificationSearch: React.FC<VerificationSearchProps> = ({ value, onChange }) => {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder="Search verified skills, hashes, or categories..."
    />
  );
};
