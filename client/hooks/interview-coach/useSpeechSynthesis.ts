'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isSpeechSynthesisSupported,
  getAvailableVoices,
  selectBestVoice,
  speakUtterance,
  stopUtterance,
  pauseUtterance,
  resumeUtterance,
  SpeechPlaybackStatus,
  SpeechSynthesisOptions,
} from '@/lib/interview-coach/speech-synthesis';

export interface UseSpeechSynthesisReturn {
  status: SpeechPlaybackStatus;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  activeVoice: SpeechSynthesisVoice | null;
  errorMessage: string | null;
  speak: (text: string, overrideOptions?: SpeechSynthesisOptions) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setActiveVoice: (voice: SpeechSynthesisVoice) => void;
}

export function useSpeechSynthesis(defaultOptions: SpeechSynthesisOptions = {}): UseSpeechSynthesisReturn {
  const [status, setStatus] = useState<SpeechPlaybackStatus>('idle');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeVoice, setActiveVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const optionsRef = useRef(defaultOptions);
  optionsRef.current = defaultOptions;

  // Initialize browser support and fetch voices on mount
  useEffect(() => {
    const supported = isSpeechSynthesisSupported();
    setIsSupported(supported);

    if (supported) {
      let isMounted = true;
      getAvailableVoices().then((voices) => {
        if (!isMounted) return;
        setAvailableVoices(voices);
        const best = selectBestVoice(voices);
        setActiveVoice(best);
      });

      return () => {
        isMounted = false;
        stopUtterance();
      };
    }
  }, []);

  const speak = useCallback(
    async (text: string, overrideOptions?: SpeechSynthesisOptions): Promise<void> => {
      if (!isSupported) {
        setErrorMessage('Speech synthesis is not supported in this browser.');
        setStatus('error');
        return;
      }

      setErrorMessage(null);
      setStatus('speaking');

      const mergedOptions: SpeechSynthesisOptions = {
        ...optionsRef.current,
        ...overrideOptions,
        voice: overrideOptions?.voice ?? activeVoice,
        onStart: () => {
          setStatus('speaking');
          overrideOptions?.onStart?.();
          optionsRef.current.onStart?.();
        },
        onEnd: () => {
          setStatus('idle');
          overrideOptions?.onEnd?.();
          optionsRef.current.onEnd?.();
        },
        onError: (err) => {
          setStatus('error');
          setErrorMessage(err);
          overrideOptions?.onError?.(err);
          optionsRef.current.onError?.(err);
        },
        onPause: () => {
          setStatus('paused');
          overrideOptions?.onPause?.();
          optionsRef.current.onPause?.();
        },
        onResume: () => {
          setStatus('speaking');
          overrideOptions?.onResume?.();
          optionsRef.current.onResume?.();
        },
      };

      await speakUtterance(text, mergedOptions);
    },
    [isSupported, activeVoice]
  );

  const stop = useCallback(() => {
    stopUtterance();
    setStatus('idle');
  }, []);

  const pause = useCallback(() => {
    pauseUtterance();
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    resumeUtterance();
    setStatus('speaking');
  }, []);

  return {
    status,
    isSpeaking: status === 'speaking',
    isPaused: status === 'paused',
    isSupported,
    availableVoices,
    activeVoice,
    errorMessage,
    speak,
    stop,
    pause,
    resume,
    setActiveVoice,
  };
}

