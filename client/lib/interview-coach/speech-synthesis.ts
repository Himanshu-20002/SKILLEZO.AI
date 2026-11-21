/**
 * Browser-Native Speech Synthesis (Text-to-Speech) Engine
 * Module: SKILLEZO AI Mock Interview Coach
 *
 * Utilizes standard W3C Web Speech API (window.speechSynthesis).
 * Features:
 * - Natural English voice heuristic (Google US English, Samantha, Microsoft Zira/David)
 * - Chrome 15-second utterance pause keep-alive mechanism
 * - Safe SSR runtime checks
 * - Promise-based utterance lifecycle management
 */

export type SpeechPlaybackStatus = 'idle' | 'speaking' | 'paused' | 'error';

export interface SpeechSynthesisOptions {
  rate?: number;         // 0.8 to 1.2, default: 1.0
  pitch?: number;        // 0.8 to 1.2, default: 1.0
  volume?: number;       // 0 to 1, default: 1.0
  voice?: SpeechSynthesisVoice | null;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errorMessage: string) => void;
  onPause?: () => void;
  onResume?: () => void;
}

let keepAliveTimer: NodeJS.Timeout | null = null;

function clearKeepAlive(): void {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

/**
 * Checks if the browser supports SpeechSynthesis safely across SSR and client.
 */
export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.speechSynthesis !== 'undefined' &&
    'SpeechSynthesisUtterance' in window
  );
}

/**
 * Fetches available voices asynchronously, handling browser voiceschanged event lifecycle.
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSynthesisSupported()) {
    return Promise.resolve([]);
  }

  return new Promise((resolve) => {
    const existingVoices = window.speechSynthesis.getVoices();
    if (existingVoices && existingVoices.length > 0) {
      return resolve(existingVoices);
    }

    let resolved = false;
    const onVoicesChanged = () => {
      if (!resolved) {
        resolved = true;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    // Timeout fallback for browsers that do not fire voiceschanged or have empty voices
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(window.speechSynthesis.getVoices() || []);
      }
    }, 1500);
  });
}

/**
 * Filters and prioritizes natural English voices suitable for professional interview questions.
 */
export function selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // Filter for English voices
  const englishVoices = voices.filter(
    (v) => v.lang && (v.lang.startsWith('en-') || v.lang.startsWith('en_') || v.lang === 'en')
  );

  const pool = englishVoices.length > 0 ? englishVoices : voices;

  // Tier 1: High quality / neural / Google / Apple natural English
  const priorityPatterns = [
    /Google US English/i,
    /Google UK English/i,
    /Samantha/i,
    /Daniel/i,
    /Jenny/i,
    /Guy/i,
    /Aria/i,
    /Zira/i,
    /David/i,
    /Natural/i,
    /Premium/i,
  ];

  for (const pattern of priorityPatterns) {
    const matched = pool.find((v) => pattern.test(v.name));
    if (matched) return matched;
  }

  // Tier 2: Default voice flag
  const defaultVoice = pool.find((v) => v.default);
  if (defaultVoice) return defaultVoice;

  // Tier 3: First available English voice
  return pool[0] || null;
}

/**
 * Speaks an interview question or statement aloud using SpeechSynthesis.
 * Implements a 10s keep-alive interval to prevent Chromium engine pauses on long utterances.
 */
export function speakUtterance(
  text: string,
  options: SpeechSynthesisOptions = {}
): Promise<void> {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.('Speech synthesis is not supported on this browser.');
    return Promise.resolve();
  }

  // Clean up any ongoing utterance or timers
  stopUtterance();

  if (!text || text.trim().length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.rate = Math.max(0.8, Math.min(1.2, options.rate ?? 1.0));
      utterance.pitch = Math.max(0.8, Math.min(1.2, options.pitch ?? 1.0));
      utterance.volume = Math.max(0, Math.min(1.0, options.volume ?? 1.0));

      if (options.voice) {
        utterance.voice = options.voice;
      }

      utterance.onstart = () => {
        // Start Chromium keep-alive interval: toggle pause/resume every 10s to prevent silent abort
        clearKeepAlive();
        keepAliveTimer = setInterval(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);

        options.onStart?.();
      };

      utterance.onend = () => {
        clearKeepAlive();
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        clearKeepAlive();
        // Ignore "canceled" or "interrupted" error codes triggered by intentional stopUtterance
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          options.onError?.(event.error || 'Speech synthesis error occurred.');
        }
        resolve();
      };

      utterance.onpause = () => {
        options.onPause?.();
      };

      utterance.onresume = () => {
        options.onResume?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: unknown) {
      clearKeepAlive();
      const message = err instanceof Error ? err.message : 'Failed to speak utterance';
      options.onError?.(message);
      resolve();
    }
  });
}

/**
 * Immediately cancels and halts any active audio playback.
 */
export function stopUtterance(): void {
  clearKeepAlive();
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignored
    }
  }
}

/**
 * Pauses active speech playback.
 */
export function pauseUtterance(): void {
  if (isSpeechSynthesisSupported() && window.speechSynthesis.speaking) {
    try {
      window.speechSynthesis.pause();
    } catch {
      // Ignored
    }
  }
}

/**
 * Resumes paused speech playback.
 */
export function resumeUtterance(): void {
  if (isSpeechSynthesisSupported() && window.speechSynthesis.paused) {
    try {
      window.speechSynthesis.resume();
    } catch {
      // Ignored
    }
  }
}

