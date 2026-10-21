'use client';

import { useState, useEffect, useCallback } from 'react';
import { messageService } from '@/services/message.service';
import { useSession } from '@/lib/auth-client';

export function useUnreadMessages() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!session?.user) return;
    try {
      const data = await messageService.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Ignore background fetch error
    }
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) {
      setUnreadCount(0);
      return;
    }

    refreshUnreadCount();

    // Poll periodically when visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        refreshUnreadCount();
      }
    }, 45000);

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        refreshUnreadCount();
      }
    };

    const handleMessagesRead = () => {
      setUnreadCount(0);
    };

    const handleMessagesUpdated = () => {
      refreshUnreadCount();
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('messages-read', handleMessagesRead);
    window.addEventListener('messages-updated', handleMessagesUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('messages-read', handleMessagesRead);
      window.removeEventListener('messages-updated', handleMessagesUpdated);
    };
  }, [session?.user, refreshUnreadCount]);

  return { unreadCount, refresh: refreshUnreadCount };
}
