'use client';

import React from 'react';
import { StatusBadge, StatusType } from '@/components/dashboard/common/StatusBadge';

interface VerificationStatusBadgeProps {
  status: StatusType;
}

export const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({ status }) => {
  return <StatusBadge status={status} />;
};
