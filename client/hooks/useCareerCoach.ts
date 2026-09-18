'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  coachService,
  AIOrchestrationResult,
  LifecycleStatus,
  ConversationMessage,
} from '@/services/coach.service';
import { ApiError } from '@/lib/api';
import { toast } from 'sonner';

export type CoachStatus =
  | 'idle'
  | 'thinking'
  | 'executing_tools'
  | 'synthesizing'
  | 'success'
  | 'error'
  | 'cancelled';

export interface CoachChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  result?: AIOrchestrationResult;
  status?: LifecycleStatus;
  isStreaming?: boolean;
  error?: string;
  timestamp: Date;
}

export interface UseCareerCoachOptions {
  initialTargetRole?: string;
}

export function useCareerCoach(options?: UseCareerCoachOptions) {
  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  const [status, setStatus] = useState<CoachStatus>('idle');
  const [targetRole, setTargetRoleState] = useState<string | undefined>(
    options?.initialTargetRole
  );
  const [activeIntelligence, setActiveIntelligence] =
    useState<AIOrchestrationResult | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    null
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const isGenerating =
    status === 'thinking' ||
    status === 'executing_tools' ||
    status === 'synthesizing';

  // Cleanup active request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('cancelled');
    // Remove incomplete streaming message if cancelled before any result
    setMessages((prev) =>
      prev.filter((m) => !(m.role === 'assistant' && m.isStreaming))
    );
    toast.info('AI Career Coach request cancelled.');
  }, []);

  const clearConversation = useCallback(() => {
    cancelRequest();
    setMessages([]);
    setActiveIntelligence(null);
    setSelectedEvidenceId(null);
    setStatus('idle');
  }, [cancelRequest]);

  const setTargetRole = useCallback((role: string | undefined) => {
    setTargetRoleState(role?.trim() || undefined);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isGenerating) return;

      // Abort any existing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const userMsgId = `usr_${Date.now()}`;
      const assistantMsgId = `asst_${Date.now() + 1}`;

      const userMessage: CoachChatMessage = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      const initialAssistantMessage: CoachChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        status: 'thinking',
        isStreaming: true,
        timestamp: new Date(),
      };

      // Prepare bounded conversation context (max 20 messages)
      const contextMessages: ConversationMessage[] = messages
        .slice(-20)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
      setStatus('thinking');

      try {
        await coachService.streamChatMessage(
          {
            message: trimmed,
            targetRole,
            conversationContext: contextMessages,
            stream: true,
          },
          {
            onStatus: (lifecycleStatus) => {
              setStatus(lifecycleStatus);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, status: lifecycleStatus }
                    : msg
                )
              );
            },
            onResult: (result) => {
              setActiveIntelligence(result);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        content: result.answer,
                        result,
                        isStreaming: false,
                      }
                    : msg
                )
              );
            },
            onCompleted: () => {
              setStatus('success');
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              );
              abortControllerRef.current = null;
            },
            onError: (err) => {
              if (abortController.signal.aborted) return;

              const errorMessage =
                err instanceof ApiError
                  ? err.message
                  : err instanceof Error
                  ? err.message
                  : 'An error occurred while connecting to AI Career Coach.';

              setStatus('error');
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        isStreaming: false,
                        error: errorMessage,
                        content:
                          'Sorry, I encountered an issue retrieving verified career guidance. Please try again.',
                      }
                    : msg
                )
              );

              if (err instanceof ApiError && err.status === 429) {
                toast.error('Career Coach rate limit reached. Please wait a moment before sending another message.');
              } else {
                toast.error(errorMessage);
              }
              abortControllerRef.current = null;
            },
          },
          abortController.signal
        );
      } catch (err: unknown) {
        if (abortController.signal.aborted) return;
        setStatus('error');
        abortControllerRef.current = null;
      }
    },
    [isGenerating, messages, targetRole]
  );

  const retryLastMessage = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    status,
    isGenerating,
    targetRole,
    activeIntelligence,
    selectedEvidenceId,
    setSelectedEvidenceId,
    setTargetRole,
    sendMessage,
    cancelRequest,
    retryLastMessage,
    clearConversation,
  };
}
