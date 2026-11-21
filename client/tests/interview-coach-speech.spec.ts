// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isSpeechSynthesisSupported,
  selectBestVoice,
  speakUtterance,
  stopUtterance,
} from '../lib/interview-coach/speech-synthesis';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
} from '../lib/interview-coach/speech-recognition';
import {
  countWords,
  analyzeFillerWords,
} from '../lib/interview-coach/filler-words';

describe('Voice & Speech Engine Foundation — Phase A', () => {
  describe('1. Filler Word Analysis Engine (filler-words.ts)', () => {
    it('accurately counts words in normal and spaced sentences', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
      expect(countWords('Hello world')).toBe(2);
      expect(countWords('  In modern React applications, managing state transitions is critical.  ')).toBe(9);
    });

    it('returns empty analysis for empty text', () => {
      const result = analyzeFillerWords('');
      expect(result.totalCount).toBe(0);
      expect(result.fillerRatePerHundredWords).toBe(0);
      expect(result.breakdown).toEqual([]);
      expect(result.hasHighFillerUsage).toBe(false);
    });

    it('identifies single and multi-word verbal fillers correctly', () => {
      const candidateSpeech =
        'Um, so basically, like, React 19 introduces useActionState and, you know, it actually simplifies things.';
      const result = analyzeFillerWords(candidateSpeech);

      expect(result.totalCount).toBe(5); // um, basically, like, you know, actually
      const foundWords = result.breakdown.map((b) => b.word);
      expect(foundWords).toContain('um');
      expect(foundWords).toContain('basically');
      expect(foundWords).toContain('like');
      expect(foundWords).toContain('you know');
      expect(foundWords).toContain('actually');
    });

    it('calculates filler rate and flags high filler frequency', () => {
      // 10 words, 3 fillers -> 30% filler rate -> hasHighFillerUsage should be true
      const heavyFillerText = 'Um uh like we just wrote code for the client';
      const result = analyzeFillerWords(heavyFillerText);
      expect(result.totalCount).toBe(3);
      expect(result.fillerRatePerHundredWords).toBeGreaterThanOrEqual(5.0);
      expect(result.hasHighFillerUsage).toBe(true);
    });

    it('does not flag clean and articulate candidate speech', () => {
      const cleanAnswer =
        'In React 19, useActionState manages asynchronous form mutations by tracking the pending state and returned action payloads deterministically.';
      const result = analyzeFillerWords(cleanAnswer);
      expect(result.totalCount).toBe(0);
      expect(result.hasHighFillerUsage).toBe(false);
    });
  });

  describe('2. Speech Synthesis Engine (speech-synthesis.ts)', () => {
    const mockVoices = [
      { name: 'Microsoft David', lang: 'en-US', default: false },
      { name: 'Google US English', lang: 'en-US', default: true },
      { name: 'Alex', lang: 'en-US', default: false },
      { name: 'French Voice', lang: 'fr-FR', default: false },
    ] as SpeechSynthesisVoice[];

    it('prioritizes high-tier natural English voices', () => {
      const best = selectBestVoice(mockVoices);
      expect(best).not.toBeNull();
      expect(best?.name).toBe('Google US English');
    });

    it('falls back to default voice when priority names are absent', () => {
      const fallbackVoices = [
        { name: 'Generic EN 1', lang: 'en-GB', default: false },
        { name: 'Generic EN 2', lang: 'en-US', default: true },
      ] as SpeechSynthesisVoice[];

      const best = selectBestVoice(fallbackVoices);
      expect(best?.name).toBe('Generic EN 2');
    });

    it('returns null when voice list is empty', () => {
      expect(selectBestVoice([])).toBeNull();
    });

    it('reports synthesis support based on window globals', () => {
      // Vitest jsdom default may or may not have speechSynthesis
      const supported = isSpeechSynthesisSupported();
      expect(typeof supported).toBe('boolean');
    });
  });

  describe('3. Speech Recognition Engine (speech-recognition.ts)', () => {
    it('returns false for isSpeechRecognitionSupported when API is absent', () => {
      const originalSR = (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
      const originalWSR = (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

      delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
      delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

      expect(isSpeechRecognitionSupported()).toBe(false);

      if (originalSR) (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = originalSR;
      if (originalWSR) (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition = originalWSR;
    });

    it('gracefully handles missing SpeechRecognition in createSpeechRecognizer', () => {
      const originalSR = (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
      const originalWSR = (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

      delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
      delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

      const onStatusChange = vi.fn();
      const onError = vi.fn();

      const controller = createSpeechRecognizer({
        onStatusChange,
        onError,
      });

      expect(controller.isListening()).toBe(false);
      expect(onStatusChange).toHaveBeenCalledWith('unsupported');

      controller.start();
      expect(onError).toHaveBeenCalledWith(
        'Speech recognition is not supported on this browser.',
        'unsupported'
      );

      if (originalSR) (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = originalSR;
      if (originalWSR) (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition = originalWSR;
    });

    it('instantiates and triggers callbacks when mock SpeechRecognition is present', () => {
      class MockSpeechRecognition {
        continuous = false;
        interimResults = false;
        lang = '';
        onstart: (() => void) | null = null;
        onresult: ((ev: unknown) => void) | null = null;
        onerror: ((ev: unknown) => void) | null = null;
        onend: (() => void) | null = null;

        start = vi.fn(() => {
          this.onstart?.();
        });
        stop = vi.fn(() => {
          this.onend?.();
        });
        abort = vi.fn(() => {
          this.onend?.();
        });
      }

      (window as unknown as { SpeechRecognition: typeof MockSpeechRecognition }).SpeechRecognition =
        MockSpeechRecognition;

      expect(isSpeechRecognitionSupported()).toBe(true);

      const onStatusChange = vi.fn();
      const onTranscriptChange = vi.fn();

      const controller = createSpeechRecognizer(
        {
          onStatusChange,
          onTranscriptChange,
        },
        'Initial test'
      );

      controller.start();
      expect(controller.isListening()).toBe(true);
      expect(onStatusChange).toHaveBeenCalledWith('listening');

      controller.stop();
      expect(onStatusChange).toHaveBeenCalledWith('idle');

      delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    });
  });
});
