import { OrchestrationContext } from "./orchestration-context";

export class OrchestrationContextComposer {
  /**
   * Composes a minimal, verified context prompt for the Model Gateway.
   * Excludes database internals, credentials, or arbitrary unbounded documents.
   */
  public static compose(context: OrchestrationContext): string {
    const sections: string[] = [];

    // 1. User Query & Intent
    sections.push(`## CANDIDATE INQUIRY
- User Message: "${context.userMessage}"
- Classified Intent: ${context.intent}
${context.targetRole ? `- Target Role: ${context.targetRole}` : "- Target Role: Not specified / inferred from profile"}`);

    // 2. Candidate Overview from Snapshot (if available)
    if (context.candidateSnapshot) {
      const snap = context.candidateSnapshot;
      sections.push(`## VERIFIED CANDIDATE SUMMARY
- Headline: ${snap.profile?.headline || "Not provided"}
- Target Role: ${snap.targetRole || "None"}
- Top Skills: ${(snap.profile?.skills || []).join(", ") || "None recorded"}
- Snapshot Verification Hash: ${snap.metadata?.snapshotHash || "N/A"}`);
    }

    // 3. Verified Evidence Items (with strict IDs)
    if (context.verifiedEvidence.length > 0) {
      const evidenceLines = context.verifiedEvidence.map(
        (ev) => `- [ID: ${ev.id}] (${ev.type} from ${ev.source}): ${ev.summary}${ev.numericValue !== undefined ? ` [Verified Value: ${ev.numericValue}]` : ""}`
      );
      sections.push(`## VERIFIED DETERMINISTIC EVIDENCE ITEMS
${evidenceLines.join("\n")}`);
    }

    // 4. Executed Tool Results (Sanitized)
    const successfulTools = Array.from(context.toolResults.values()).filter((r) => r.success);
    if (successfulTools.length > 0) {
      const toolSummaries = successfulTools.map((t) => {
        const sanitized = this.sanitizeToolOutput(t.output);
        return `### Tool: ${t.toolName}
${JSON.stringify(sanitized, null, 2)}`;
      });
      sections.push(`## TOOL INTELLIGENCE RESULTS
${toolSummaries.join("\n\n")}`);
    }

    // 5. Limitations & Missing Data
    if (context.limitations.length > 0) {
      sections.push(`## DATA LIMITATIONS & UNAVAILABLE SIGNALS
${context.limitations.map((l) => `- ${l}`).join("\n")}`);
    }

    return sections.join("\n\n");
  }

  /**
   * Sanitizes tool output to prevent prompt bloat and remove internal metadata.
   */
  private static sanitizeToolOutput(output: unknown): unknown {
    if (!output || typeof output !== "object") return output;

    const cleaned = JSON.parse(JSON.stringify(output));
    const removeSensitiveKeys = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj)) {
        obj.forEach(removeSensitiveKeys);
        return;
      }
      for (const key of Object.keys(obj)) {
        if (
          key.startsWith("_") ||
          key === "password" ||
          key === "hash" ||
          key === "salt" ||
          key === "token" ||
          key === "sessionToken"
        ) {
          delete obj[key];
        } else if (typeof obj[key] === "object") {
          removeSensitiveKeys(obj[key]);
        }
      }
    };

    removeSensitiveKeys(cleaned);
    return cleaned;
  }
}
