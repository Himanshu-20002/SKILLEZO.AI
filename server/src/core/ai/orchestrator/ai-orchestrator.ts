import { performance } from "perf_hooks";
import {
  AIOrchestrationRequest,
  AIOrchestrationContext,
  AIOrchestratorTelemetry,
  IAIOrchestrator,
} from "./types";
import {
  AIOrchestratorError,
  AIOrchestratorTimeoutError,
} from "./orchestrator-errors";
import { IntentClassifier } from "./intent/intent-classifier";
import { EvidencePlanner } from "./planning/evidence-planner";
import { ToolExecutionDescriptor } from "./planning/evidence-plan";
import {
  OrchestrationContext,
  ExecutedToolResult,
  VerifiedEvidenceEntry,
} from "./context/orchestration-context";
import { ReasoningService } from "./reasoning/reasoning-service";
import { ResponseValidator } from "./response/response-validator";
import {
  AIOrchestrationResult,
} from "./response/response-types";
import { toolRegistry } from "../tools";
import { ToolRegistry } from "../tools/tool-registry";
import { CandidateContextService } from "../context/candidate-context.service";
import { CandidateContextSnapshot } from "../context/candidate-context.types";

export class AIOrchestrator implements IAIOrchestrator {
  private static instance: AIOrchestrator;
  private readonly registry: ToolRegistry;
  private readonly telemetryRingBuffer: AIOrchestratorTelemetry[] = [];
  private static readonly MAX_TELEMETRY = 100;

  constructor(customRegistry?: ToolRegistry) {
    this.registry = customRegistry || toolRegistry;
  }

  public static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  /**
   * Main orchestration pipeline:
   * 1. Authenticated Identity Guard
   * 2. Intent Classification
   * 3. Staged Evidence Planning
   * 4. Dependency-Aware Tool Execution (Stage 1 -> Stage 2 -> Stage 3 -> Stage 4)
   * 5. Phase 2 Context Snapshot Hydration (Cached)
   * 6. Structured Model Reasoning (Model Gateway)
   * 7. Score & Metric Integrity Validation
   * 8. Bounded Telemetry Recording
   */
  public async orchestrate(
    request: AIOrchestrationRequest,
    context: AIOrchestrationContext
  ): Promise<AIOrchestrationResult> {
    const startTime = performance.now();
    const requestId = context?.requestId || `orch_${Date.now()}`;
    const toolsUsed: string[] = [];
    let modelProvider = "none";
    let intentForTelemetry: import("./intent/intent-types").AIIntent = "UNKNOWN";

    try {
      // 1. Authenticated Identity Guard (Candidate identity MUST be present and trusted)
      if (!context?.userId || typeof context.userId !== "string" || context.userId.trim().length === 0) {
        throw new AIOrchestratorError(
          "Candidate identity must originate from authenticated context. Missing userId.",
          "UNAUTHENTICATED"
        );
      }

      // Check cancellation
      if (context.signal?.aborted) {
        throw new AIOrchestratorTimeoutError();
      }

      // 2. Intent Classification (Deterministic rules first)
      const intentResult = IntentClassifier.classify(request.message, request.targetRole);
      intentForTelemetry = intentResult.intent;

      // Handle UNKNOWN / Out of Scope queries immediately without burning tool/LLM budget
      if (intentResult.intent === "UNKNOWN") {
        const outOfScopeResult: AIOrchestrationResult = {
          intent: "UNKNOWN",
          answer:
            "I am your SKILLEZO AI Career Coach. I specialize in career readiness, resume diagnostics, skill gap breakdown, employability evaluation, job matches, and career roadmaps. How can I assist your career progression today?",
          metrics: [],
          evidence: [],
          insights: [],
          recommendations: [
            {
              title: "Explore Supported Career Areas",
              explanation: "You can ask for resume review, skill gap analysis against target roles, employability score, or recommended jobs.",
              priority: "MEDIUM",
            },
          ],
          confidence: "HIGH",
          limitations: ["Query is out of scope for career coaching."],
        };

        this.recordTelemetry({
          requestId,
          userId: context.userId,
          intent: intentResult.intent,
          targetRole: intentResult.detectedRole,
          toolCount: 0,
          toolsUsed: [],
          totalDurationMs: Math.round(performance.now() - startTime),
          modelProvider: "deterministic",
          success: true,
          timestamp: new Date().toISOString(),
        });

        return outOfScopeResult;
      }

      // 3. Staged Evidence Planning
      const plan = EvidencePlanner.createPlan(intentResult.intent, intentResult.detectedRole);

      const toolResults = new Map<string, ExecutedToolResult>();
      const limitations: string[] = [];

      // 4. Dependency-Aware Tool Execution:
      // Stage 1: Prerequisites (Profile & Resume)
      if (plan.stage1Tools.length > 0) {
        await this.executeToolBatch(plan.stage1Tools, context, toolResults, limitations, toolsUsed);
      }

      if (context.signal?.aborted) {
        throw new AIOrchestratorTimeoutError();
      }

      // Stage 2: Target Role Determination
      const profileResult = toolResults.get("getCandidateProfile")?.output as any;
      const effectiveTargetRole =
        request.targetRole ||
        intentResult.detectedRole ||
        profileResult?.targetRole;

      if (!effectiveTargetRole && (intentResult.intent === "SKILL_GAP_ANALYSIS" || intentResult.intent === "CAREER_PLAN")) {
        limitations.push(
          `Target role was not specified or found on profile. Evaluation used general software engineering defaults.`
        );
      }

      // Stage 3: Independent Analytics Tools (Concurrent)
      if (plan.stage3Tools.length > 0) {
        // Inject effective target role into tools that require it
        const parameterizedStage3 = plan.stage3Tools.map((t) => {
          if ((t.toolName === "getSkillGaps" || t.toolName === "getEmployabilityMetrics") && !t.params.targetRole && effectiveTargetRole) {
            return { ...t, params: { ...t.params, targetRole: effectiveTargetRole } };
          }
          if (t.toolName === "getMatchingJobs" && !t.params.query && effectiveTargetRole) {
            return { ...t, params: { ...t.params, query: effectiveTargetRole } };
          }
          return t;
        });

        await this.executeToolBatch(parameterizedStage3, context, toolResults, limitations, toolsUsed);
      }

      if (context.signal?.aborted) {
        throw new AIOrchestratorTimeoutError();
      }

      // Stage 4: Synthesis Tools (e.g. proposeCareerPlan)
      if (plan.stage4Tools.length > 0) {
        const parameterizedStage4 = plan.stage4Tools.map((t) => {
          if (t.toolName === "proposeCareerPlan" && !t.params.targetRole && effectiveTargetRole) {
            return { ...t, params: { ...t.params, targetRole: effectiveTargetRole } };
          }
          return t;
        });

        await this.executeToolBatch(parameterizedStage4, context, toolResults, limitations, toolsUsed);
      }

      // 5. Extract Verified Evidence Items from Tool Results
      const verifiedEvidence = this.extractVerifiedEvidence(toolResults);

      // Attempt Phase 2 Context Snapshot (non-fatal cache integration)
      let candidateSnapshot: CandidateContextSnapshot | undefined;
      try {
        candidateSnapshot = await CandidateContextService.getContextSnapshot({
          userId: context.userId,
          targetRole: effectiveTargetRole,
        });

        // Merge verified items from snapshot evidence bundle
        if (candidateSnapshot?.evidence?.items) {
          for (const item of candidateSnapshot.evidence.items) {
            if (!verifiedEvidence.some((e) => e.id === item.id)) {
              verifiedEvidence.push({
                id: item.id,
                type: item.evidenceType,
                source: item.sourceEngine,
                summary: item.description || `${item.metric}: ${JSON.stringify(item.value)}`,
                metricName: item.metric,
                numericValue: typeof item.value === "number" ? item.value : undefined,
              });
            }
          }
        }
      } catch (err: any) {
        // Non-fatal: if DB/cache is unavailable in unit testing or fresh setup, rely on toolResults
      }

      // 6. Assembled Orchestration Context
      const orchestrationContext: OrchestrationContext = {
        intent: intentResult.intent,
        userMessage: request.message,
        targetRole: effectiveTargetRole,
        candidateSnapshot,
        toolResults,
        limitations,
        verifiedEvidence,
      };

      if (context.signal?.aborted) {
        throw new AIOrchestratorTimeoutError();
      }

      // 7. Structured Reasoning via Model Gateway
      const reasoning = await ReasoningService.reason(orchestrationContext, {
        requestId,
        signal: context.signal,
      });

      modelProvider = reasoning.provider;

      // 8. Score & Metric Integrity Validation
      const finalResult = ResponseValidator.validate(
        reasoning.result,
        verifiedEvidence,
        limitations
      );

      // 9. Record Telemetry
      this.recordTelemetry({
        requestId,
        userId: context.userId,
        intent: intentResult.intent,
        targetRole: effectiveTargetRole,
        toolCount: toolsUsed.length,
        toolsUsed,
        totalDurationMs: Math.round(performance.now() - startTime),
        modelProvider,
        success: true,
        timestamp: new Date().toISOString(),
      });

      return finalResult;
    } catch (err: any) {
      this.recordTelemetry({
        requestId,
        userId: context?.userId || "unknown",
        intent: intentForTelemetry,
        targetRole: request?.targetRole,
        toolCount: toolsUsed.length,
        toolsUsed,
        totalDurationMs: Math.round(performance.now() - startTime),
        modelProvider,
        success: false,
        failureType: err?.name || "UnknownError",
        timestamp: new Date().toISOString(),
      });

      throw err;
    }
  }

  /**
   * Executes a batch of independent tools concurrently using Promise.allSettled.
   */
  private async executeToolBatch(
    tools: ToolExecutionDescriptor[],
    context: AIOrchestrationContext,
    toolResults: Map<string, ExecutedToolResult>,
    limitations: string[],
    toolsUsed: string[]
  ): Promise<void> {
    const promises = tools.map(async (desc) => {
      const toolStart = performance.now();
      try {
        const output = await this.registry.execute(
          desc.toolName,
          desc.params,
          {
            userId: context.userId,
            userRole: context.userRole,
            requestId: context.requestId,
            signal: context.signal,
          }
        );

        toolsUsed.push(desc.toolName);
        return {
          toolName: desc.toolName,
          params: desc.params,
          output,
          success: true,
          durationMs: Math.round(performance.now() - toolStart),
        };
      } catch (error: any) {
        if (desc.isCritical) {
          throw error;
        }

        limitations.push(
          `Optional signal "${desc.toolName}" was unavailable: ${error?.message || "Tool execution failed"}.`
        );

        return {
          toolName: desc.toolName,
          params: desc.params,
          success: false,
          error: error?.message || "Tool execution failed",
          durationMs: Math.round(performance.now() - toolStart),
        };
      }
    });

    const settled = await Promise.allSettled(promises);
    for (const res of settled) {
      if (res.status === "fulfilled") {
        toolResults.set(res.value.toolName, res.value);
      } else {
        // Re-throw critical failures
        throw res.reason;
      }
    }
  }

  /**
   * Extracts verified evidence items and deterministic metrics from executed tool outputs.
   */
  private extractVerifiedEvidence(toolResults: Map<string, ExecutedToolResult>): VerifiedEvidenceEntry[] {
    const evidence: VerifiedEvidenceEntry[] = [];

    // Profile evidence
    const profile = toolResults.get("getCandidateProfile")?.output as any;
    if (profile) {
      evidence.push({
        id: "ev_profile_status",
        type: "DETERMINISTIC",
        source: "ProfileService",
        summary: `Candidate profile headline: "${profile.headline || 'None'}"; target role: "${profile.targetRole || 'None'}".`,
      });
    }

    // Active resume evidence
    const resume = toolResults.get("getActiveResume")?.output as any;
    if (resume) {
      evidence.push({
        id: "ev_resume_active",
        type: "EXTRACTED",
        source: "ResumeService",
        summary: `Active resume "${resume.fileName}" parsed with status ${resume.status}.`,
      });
    }

    // ATS Intelligence evidence
    const ats = toolResults.get("getResumeIntelligence")?.output as any;
    if (ats?.atsScore !== undefined) {
      evidence.push({
        id: "ev_ats_score",
        type: "DETERMINISTIC",
        source: "ResumeAtsEngine",
        summary: `Deterministic ATS score evaluated at ${ats.atsScore}/100.`,
        metricName: "atsScore",
        numericValue: ats.atsScore,
      });
    }

    // Skill Gaps evidence
    const gaps = toolResults.get("getSkillGaps")?.output as any;
    if (gaps?.overallMatchPercentage !== undefined) {
      evidence.push({
        id: "ev_skill_gap_overall",
        type: "DETERMINISTIC",
        source: "SkillGapEngine",
        summary: `Skill gap overall match evaluated at ${gaps.overallMatchPercentage}% against ${gaps.targetRole}.`,
        metricName: "skillGapMatch",
        numericValue: gaps.overallMatchPercentage,
      });
    }

    // Employability Metrics evidence
    const emp = toolResults.get("getEmployabilityMetrics")?.output as any;
    if (emp?.overallEmployabilityScore !== undefined) {
      evidence.push({
        id: "ev_employability_score",
        type: "DETERMINISTIC",
        source: "EmployabilityEngine",
        summary: `Overall Employability Index evaluated at ${emp.overallEmployabilityScore}/100 (${emp.marketReadinessLevel || 'READINESS'}).`,
        metricName: "employabilityScore",
        numericValue: emp.overallEmployabilityScore,
      });
    }

    // Matching Jobs evidence
    const jobs = toolResults.get("getMatchingJobs")?.output as any;
    if (jobs?.totalFound !== undefined) {
      evidence.push({
        id: "ev_matching_jobs_count",
        type: "DETERMINISTIC",
        source: "JobsService",
        summary: `Found ${jobs.totalFound} matching job opportunities in the Smart Job Center.`,
        metricName: "matchingJobsCount",
        numericValue: jobs.totalFound,
      });
    }

    // Career Plan proposal evidence
    const plan = toolResults.get("proposeCareerPlan")?.output as any;
    if (plan?.targetRole) {
      evidence.push({
        id: "ev_career_plan_proposal",
        type: "DETERMINISTIC",
        source: "ProposeCareerPlanTool",
        summary: `Strategic career proposal generated for "${plan.targetRole}" covering ${plan.estimatedDurationMonths} months across ${plan.milestones?.length || 0} milestones.`,
      });
    }

    return evidence;
  }

  /**
   * Records telemetry in a bounded ring-buffer (max 100 entries).
   */
  private recordTelemetry(entry: AIOrchestratorTelemetry): void {
    if (this.telemetryRingBuffer.length >= AIOrchestrator.MAX_TELEMETRY) {
      this.telemetryRingBuffer.shift();
    }
    this.telemetryRingBuffer.push(entry);
  }

  /**
   * Returns copy of recent telemetry entries.
   */
  public getTelemetry(): AIOrchestratorTelemetry[] {
    return [...this.telemetryRingBuffer];
  }
}

export const aiOrchestrator = AIOrchestrator.getInstance();
