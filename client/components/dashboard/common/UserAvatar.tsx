'use client';

import React from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatusBadge?: boolean;
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  showStatusBadge = false,
  status = 'online',
  className = ''
}) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const badgeSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  const statusColors = {
    online: 'bg-emerald-500 border-white dark:border-[#0B1130]',
    offline: 'bg-slate-400 border-white dark:border-[#0B1130]',
    busy: 'bg-rose-500 border-white dark:border-[#0B1130]'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-semibold bg-gradient-to-tr from-[#3D5AFE] to-[#00D9C0] text-white shadow-md border border-white/20`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full object-cover rounded-full"
            unoptimized
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {showStatusBadge && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 ${badgeSizeClasses[size]} ${statusColors[status]}`}
        />
      )}
    </div>
  );
};
