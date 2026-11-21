'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
  RecognitionStatus,
  SpeechRecognitionController,
} from '@/lib/interview-coach/speech-recognition';
import { analyzeFillerWords, FillerWordAnalysis } from '@/lib/interview-coach/filler-words';

export interface UseSpeechRecognitionOptions {
  initialTranscript?: string;
  onTranscriptChange?: (text: string) => void;
  onError?: (errorMessage: string, errorCode?: string) => void;
}

export interface UseSpeechRecognitionReturn {
  status: RecognitionStatus;
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  finalTranscript: string;
  interimTranscript: string;
  fillerAnalysis: FillerWordAnalysis;
  errorMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
  setTranscript: (text: string) => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [finalTranscript, setFinalTranscript] = useState<string>(options.initialTranscript || '');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const controllerRef = useRef<SpeechRecognitionController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Combined transcript for candidate view and submission
  const transcript = useMemo(() => {
    if (!interimTranscript) return finalTranscript;
    return finalTranscript ? `${finalTranscript} ${interimTranscript}` : interimTranscript;
  }, [finalTranscript, interimTranscript]);

  // Real-time verbal filler analysis
  const fillerAnalysis = useMemo(() => {
    return analyzeFillerWords(transcript);
  }, [transcript]);

  // Check browser support on client mount
  useEffect(() => {
    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);
    if (!supported) {
      setStatus('unsupported');
    }
  }, []);

  // Initialize or re-create controller
  const getOrCreateController = useCallback(() => {
    if (controllerRef.current) return controllerRef.current;

    const controller = createSpeechRecognizer(
      {
        onTranscriptChange: (finalText, interimText) => {
          setFinalTranscript(finalText);
          setInterimTranscript(interimText);
          const fullText = interimText ? (finalText ? `${finalText} ${interimText}` : interimText) : finalText;
          optionsRef.current.onTranscriptChange?.(fullText);
        },
        onStatusChange: (nextStatus) => {
          setStatus(nextStatus);
        },
        onError: (errMessage, errCode) => {
          setErrorMessage(errMessage);
          optionsRef.current.onError?.(errMessage, errCode);
        },
        onEnd: () => {
          setStatus('idle');
        },
      },
      finalTranscript
    );

    controllerRef.current = controller;
    return controller;
  }, [finalTranscript]);

  // Clean up controller on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setStatus('unsupported');
      setErrorMessage('Speech recognition is not supported on this browser.');
      return;
    }

    setErrorMessage(null);
    const controller = getOrCreateController();
    controller.start();
  }, [isSupported, getOrCreateController]);

  const stopListening = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.stop();
    }
    setStatus('idle');
  }, []);

  const toggleListening = useCallback(() => {
    if (status === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    stopListening();
    setFinalTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  }, [stopListening]);

  const setTranscript = useCallback((text: string) => {
    setFinalTranscript(text);
    setInterimTranscript('');
    optionsRef.current.onTranscriptChange?.(text);
  }, []);

  return {
    status,
    isListening: status === 'listening',
    isSupported,
    transcript,
    finalTranscript,
    interimTranscript,
    fillerAnalysis,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    setTranscript,
  };
}

