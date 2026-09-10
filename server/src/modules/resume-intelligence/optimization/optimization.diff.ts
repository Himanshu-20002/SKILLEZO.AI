export interface WordDiff {
  value: string;
  type: "UNCHANGED" | "ADDED" | "REMOVED";
}

export class OptimizationDiff {
  /**
   * Generates a clean token-level diff between original text and optimized text.
   */
  public static computeDiff(
    originalText: string,
    optimizedText: string
  ): WordDiff[] {
    const origWords = (originalText || "").trim().split(/\s+/).filter(Boolean);
    const optWords = (optimizedText || "").trim().split(/\s+/).filter(Boolean);

    const origSet = new Set(origWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, "")));
    const optSet = new Set(optWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, "")));

    const diff: WordDiff[] = [];

    // Check removed words
    origWords.forEach((word) => {
      const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!optSet.has(clean)) {
        diff.push({ value: clean, type: "REMOVED" });
      }
    });

    // Check added and unchanged words
    optWords.forEach((word) => {
      const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!origSet.has(clean)) {
        diff.push({ value: clean, type: "ADDED" });
      } else {
        diff.push({ value: clean, type: "UNCHANGED" });
      }
    });

    return diff;
  }
}
