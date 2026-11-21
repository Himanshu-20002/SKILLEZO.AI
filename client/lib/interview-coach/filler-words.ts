/**
 * Verbal Filler Word Analyzer
 * Module: SKILLEZO AI Mock Interview Coach
 *
 * Detects common verbal filler words and phrases in candidate transcripts:
 * e.g., "um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of".
 * Provides real-time metrics for verbal confidence assessment.
 */

export interface FillerWordCount {
  word: string;
  count: number;
}

export interface FillerWordAnalysis {
  totalCount: number;
  fillerRatePerHundredWords: number;
  breakdown: FillerWordCount[];
  hasHighFillerUsage: boolean;
}

export const TRACKED_FILLER_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: 'um', regex: /\bum+\b/gi },
  { label: 'uh', regex: /\buh+\b/gi },
  { label: 'er', regex: /\ber+\b/gi },
  { label: 'ah', regex: /\bah+\b/gi },
  { label: 'like', regex: /\blike\b/gi },
  { label: 'you know', regex: /\byou\s+know\b/gi },
  { label: 'basically', regex: /\bbasically\b/gi },
  { label: 'actually', regex: /\bactually\b/gi },
  { label: 'literally', regex: /\bliterally\b/gi },
  { label: 'sort of', regex: /\bsort\s+of\b/gi },
  { label: 'kind of', regex: /\bkind\s+of\b/gi },
  { label: 'i mean', regex: /\bi\s+mean\b/gi },
];

/**
 * Counts total words in a string, ignoring punctuation.
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Analyzes speech transcript for verbal filler words.
 */
export function analyzeFillerWords(text: string): FillerWordAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      totalCount: 0,
      fillerRatePerHundredWords: 0,
      breakdown: [],
      hasHighFillerUsage: false,
    };
  }

  const wordCount = countWords(text);
  const breakdown: FillerWordCount[] = [];
  let totalCount = 0;

  for (const item of TRACKED_FILLER_PATTERNS) {
    const matches = text.match(item.regex);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      breakdown.push({ word: item.label, count });
      totalCount += count;
    }
  }

  // Sort by highest frequency
  breakdown.sort((a, b) => b.count - a.count);

  const fillerRatePerHundredWords =
    wordCount > 0 ? Number(((totalCount / wordCount) * 100).toFixed(1)) : 0;

  // High filler usage threshold: > 5 fillers per 100 words or > 6 total fillers
  const hasHighFillerUsage = fillerRatePerHundredWords >= 5.0 || totalCount >= 6;

  return {
    totalCount,
    fillerRatePerHundredWords,
    breakdown,
    hasHighFillerUsage,
  };
}

