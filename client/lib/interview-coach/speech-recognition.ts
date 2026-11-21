/**
 * Browser-Native Speech Recognition (Speech-to-Text) Engine
 * Module: SKILLEZO AI Mock Interview Coach
 *
 * Utilizes standard Web Speech API (window.SpeechRecognition or window.webkitSpeechRecognition).
 * Features:
 * - Real-time continuous speech transcription with interim preview
 * - Automatic re-listen resilience during natural speech pauses
 * - Safe error mapping ('not-allowed', 'network', 'no-speech')
 * - Safe SSR runtime checks
 */

export type RecognitionStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'unsupported'
  | 'denied'
  | 'error';

export interface SpeechRecognitionCallbacks {
  onTranscriptChange?: (finalTranscript: string, interimTranscript: string) => void;
  onStatusChange?: (status: RecognitionStatus) => void;
  onError?: (errorMessage: string, errorCode?: string) => void;
  onEnd?: () => void;
}

export interface SpeechRecognitionController {
  start: () => void;
  stop: () => void;
  abort: () => void;
  isListening: () => boolean;
}

// Global browser SpeechRecognition constructor interface
type SpeechRecognitionConstructor = new () => ISpeechRecognition;

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionResultList {
  length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): ISpeechRecognitionAlternative;
  [index: number]: ISpeechRecognitionAlternative;
}

interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

/**
 * Returns whether SpeechRecognition is supported by the current browser environment.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition
  );
}

/**
 * Retrieves the available SpeechRecognition constructor safely.
 */
function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

/**
 * Creates an interactive continuous speech recognition controller.
 */
export function createSpeechRecognizer(
  callbacks: SpeechRecognitionCallbacks = {},
  initialTranscript = ''
): SpeechRecognitionController {
  const Constructor = getSpeechRecognitionConstructor();

  if (!Constructor) {
    callbacks.onStatusChange?.('unsupported');
    return {
      start: () => callbacks.onError?.('Speech recognition is not supported on this browser.', 'unsupported'),
      stop: () => {},
      abort: () => {},
      isListening: () => false,
    };
  }

  let recognition: ISpeechRecognition | null = null;
  let shouldBeListening = false;
  let isCurrentlyListening = false;
  let finalTranscript = initialTranscript;
  let interimTranscript = '';

  const initRecognition = () => {
    try {
      const rec = new Constructor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        isCurrentlyListening = true;
        callbacks.onStatusChange?.('listening');
      };

      rec.onresult = (event: ISpeechRecognitionEvent) => {
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcriptChunk = result[0]?.transcript || '';

          if (result.isFinal) {
            finalTranscript += (finalTranscript.length > 0 ? ' ' : '') + transcriptChunk.trim();
          } else {
            currentInterim += transcriptChunk;
          }
        }

        interimTranscript = currentInterim;
        callbacks.onTranscriptChange?.(finalTranscript, interimTranscript);
      };

      rec.onerror = (event: ISpeechRecognitionErrorEvent) => {
        const errorType = event.error;

        // Specific browser-level error conditions
        if (errorType === 'not-allowed' || errorType === 'service-not-allowed') {
          shouldBeListening = false;
          isCurrentlyListening = false;
          callbacks.onStatusChange?.('denied');
          callbacks.onError?.(
            'Microphone access was denied. Please allow microphone permissions in browser settings.',
            'denied'
          );
          return;
        }

        if (errorType === 'no-speech') {
          // Natural speech pause — keep listening if desired
          return;
        }

        if (errorType === 'aborted') {
          // Intentional stop or abort
          return;
        }

        callbacks.onStatusChange?.('error');
        callbacks.onError?.(event.message || `Speech recognition error: ${errorType}`, errorType);
      };

      rec.onend = () => {
        isCurrentlyListening = false;
        interimTranscript = '';

        if (shouldBeListening) {
          // Auto-reconnect if recognition paused due to silence or browser interval
          try {
            rec.start();
          } catch {
            callbacks.onStatusChange?.('idle');
            callbacks.onEnd?.();
          }
        } else {
          callbacks.onStatusChange?.('idle');
          callbacks.onEnd?.();
        }
      };

      return rec;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to instantiate speech recognizer';
      callbacks.onError?.(msg, 'instantiation_error');
      return null;
    }
  };

  recognition = initRecognition();

  return {
    start: () => {
      shouldBeListening = true;
      if (!recognition) {
        recognition = initRecognition();
      }

      if (recognition && !isCurrentlyListening) {
        try {
          recognition.start();
        } catch {
          // If already running or in invalid state, re-instantiate
          recognition = initRecognition();
          try {
            recognition?.start();
          } catch (retryErr: unknown) {
            const msg = retryErr instanceof Error ? retryErr.message : 'Unable to start speech recognition';
            callbacks.onError?.(msg, 'start_failed');
          }
        }
      }
    },

    stop: () => {
      shouldBeListening = false;
      if (recognition && isCurrentlyListening) {
        try {
          recognition.stop();
        } catch {
          // Ignored
        }
      }
      callbacks.onStatusChange?.('idle');
    },

    abort: () => {
      shouldBeListening = false;
      if (recognition) {
        try {
          recognition.abort();
        } catch {
          // Ignored
        }
      }
      callbacks.onStatusChange?.('idle');
    },

    isListening: () => isCurrentlyListening,
  };
}

