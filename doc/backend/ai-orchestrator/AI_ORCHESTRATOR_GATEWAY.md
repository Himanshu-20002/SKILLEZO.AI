# SKILLEZO AI — Phase 4 Implementation Prompt
## AI Orchestrator — Intent, Evidence Planning, Tool Coordination & Structured Reasoning

**Project:** SKILLEZO AI  
**Phase:** 4  
**Scope:** AI Orchestrator only  
**Architecture Principle:** **SKILLEZO owns the truth; AI owns the reasoning.**

---

## 1. OBJECTIVE

Implement **Phase 4 — AI Orchestrator**.

The Orchestrator is the coordination layer between the future AI Career Coach experience and the existing SKILLEZO intelligence infrastructure.

It must:

- Understand and classify the user's request.
- Determine required candidate evidence.
- Select only registered Phase 3 tools.
- Execute tools through the Tool Registry.
- Collect verified deterministic information.
- Reuse Phase 2 Evidence/Context infrastructure.
- Compose minimal verified model context.
- Call the Phase 1 Model Gateway.
- Validate structured model output.
- Return a safe, strongly typed orchestration result.

The Orchestrator coordinates reasoning. It does not become the source of truth.

---

## 2. CORE ARCHITECTURE

```text
USER REQUEST
     ↓
AI ORCHESTRATOR
     ├── Intent Classification
     ├── Evidence Planning
     ├── Tool Selection
     ├── Tool Coordination
     ├── Context Composition
     └── Response Validation
     ↓
PHASE 3 TOOL REGISTRY
     ↓
Deterministic Services
     ↓
Phase 2 Evidence / Candidate Context
     ↓
Verified Context
     ↓
PHASE 1 MODEL GATEWAY
     ↓
Gemini / OpenAI
     ↓
Structured AI Reasoning
```

Responsibility split:

```text
Orchestrator          = WHAT information is needed
Tool Registry         = WHAT AI is allowed to access
Deterministic engines = WHAT the factual intelligence is
Evidence Layer        = WHAT is verified
Context Layer         = WHAT context is relevant
Model Gateway         = HOW the model is accessed
LLM                   = REASONING over verified information
```

---

## 3. STRICT PHASE BOUNDARY

Implement **ONLY Phase 4**.

Do NOT implement:

- Chat API
- HTTP controller/routes
- SSE streaming
- Career Coach frontend/UI
- Action execution
- User approval workflow
- Database mutations
- Auto-apply
- Autonomous agents
- Background workers
- New deterministic engines
- New database models unless strictly required for compatibility

Those belong to later phases.

**Phase 4 ends with an internal, tested AI Orchestrator.**

---

## 4. EXISTING FOUNDATION — MUST REUSE

### Phase 1

```text
Model Gateway
├── Provider abstraction
├── Gemini
├── OpenAI
├── Failover
├── Circuit breaker
└── Structured output validation
```

### Phase 2

```text
Evidence Layer
├── Evidence Collector
├── Evidence Validator
├── Evidence Normalizer
└── Candidate Evidence Bundle

Context Layer
├── Candidate Context Snapshot
├── Context Composer
├── Candidate Context Cache
└── Cache invalidation
```

### Phase 3

```text
Controlled Tool Registry
├── 7 allowlisted tools
├── Strict Zod validation
├── Authenticated context
├── Ownership checks
├── Output validation
└── Bounded telemetry
```

Do not recreate any of these systems.

---

## 5. DIRECTORY STRUCTURE

Create:

```text
server/src/core/ai/orchestrator/
├── types.ts
├── orchestrator-errors.ts
│
├── intent/
│   ├── intent-types.ts
│   ├── intent-classifier.ts
│   └── intent-rules.ts
│
├── planning/
│   ├── evidence-plan.ts
│   ├── evidence-planner.ts
│   └── tool-selection.ts
│
├── context/
│   ├── orchestration-context.ts
│   └── orchestration-context-composer.ts
│
├── reasoning/
│   ├── reasoning-prompt.ts
│   └── reasoning-service.ts
│
├── response/
│   ├── response-types.ts
│   └── response-validator.ts
│
├── ai-orchestrator.ts
└── index.ts
```

Adapt names to existing conventions where appropriate. Do not create unnecessary abstractions.

---

## 6. ORCHESTRATOR CONTRACT

Create a strongly typed contract.

Conceptually:

```ts
interface AIOrchestrator {
  orchestrate(
    request: AIOrchestrationRequest,
    context: AIOrchestrationContext
  ): Promise<AIOrchestrationResult>;
}
```

Request:

```ts
interface AIOrchestrationRequest {
  message: string;
  targetRole?: string;
  conversationContext?: unknown;
}
```

Authenticated context:

```ts
interface AIOrchestrationContext {
  userId: string;
  userRole?: string;
  requestId?: string;
  signal?: AbortSignal;
}
```

Candidate identity MUST come exclusively from:

```ts
context.userId
```

Never from request parameters, conversation text, tool arguments, or the model.

---

## 7. INTENT TAXONOMY

Start with intents supported by existing SKILLEZO capabilities:

```text
PROFILE_OVERVIEW
RESUME_ANALYSIS
RESUME_IMPROVEMENT
SKILL_GAP_ANALYSIS
EMPLOYABILITY_ANALYSIS
JOB_MATCHING
CAREER_PLAN
CAREER_READINESS
GENERAL_CAREER_GUIDANCE
UNKNOWN / OUT_OF_SCOPE
```

Keep the taxonomy extensible and avoid speculative intent explosion.

---

## 8. INTENT CLASSIFICATION

Map:

```text
User Request
     ↓
Intent
     ↓
Required Evidence
     ↓
Required Tools
```

Prefer deterministic/rule-based classification for obvious requests.

Examples:

```text
"Show my skill gaps for Senior React Developer"
→ SKILL_GAP_ANALYSIS

"How good is my resume?"
→ RESUME_ANALYSIS

"What jobs match my profile?"
→ JOB_MATCHING

"Create a roadmap to become a Senior React Developer"
→ CAREER_PLAN
```

An LLM may be used for genuinely ambiguous classification only if necessary, but do not create a second provider layer.

The classifier must never calculate candidate metrics or facts.

---

## 9. EVIDENCE PLANNING

Define explicit typed evidence plans.

Recommended baseline:

```text
PROFILE_OVERVIEW
    → getCandidateProfile

RESUME_ANALYSIS
    → getActiveResume
    → getResumeIntelligence

RESUME_IMPROVEMENT
    → getActiveResume
    → getResumeIntelligence

SKILL_GAP_ANALYSIS
    → getCandidateProfile
    → getSkillGaps

EMPLOYABILITY_ANALYSIS
    → getCandidateProfile
    → getEmployabilityMetrics

JOB_MATCHING
    → getCandidateProfile
    → getMatchingJobs

CAREER_READINESS
    → getCandidateProfile
    → getActiveResume
    → getResumeIntelligence
    → getSkillGaps
    → getEmployabilityMetrics

CAREER_PLAN
    → getCandidateProfile
    → getActiveResume
    → getSkillGaps
    → getEmployabilityMetrics
    → proposeCareerPlan
```

Adjust only when actual existing service/tool contracts require it.

Do not let the model freely select internal services.

---

## 10. TOOL SELECTION

The Orchestrator may execute tools ONLY through the Phase 3 registry.

```text
Intent
  ↓
Evidence Plan
  ↓
Allowlisted Tool Names
  ↓
Tool Registry
```

Never dynamically execute arbitrary application functions.

Conceptually:

```ts
const plan = evidencePlanner.createPlan(intent);

for (const toolRequest of plan.tools) {
  await toolRegistry.execute(
    toolRequest.name,
    toolRequest.params,
    authenticatedToolContext
  );
}
```

All identity comes from the authenticated context.

---

## 11. USER IDENTITY INVARIANT

This remains mandatory:

```text
LLM userId             → NEVER TRUST
Request userId         → NEVER TRUST
Tool parameter userId  → NEVER TRUST
context.userId         → ONLY TRUSTED IDENTITY
```

The Orchestrator constructs the Tool Registry context:

```ts
{
  userId: context.userId,
  userRole: context.userRole,
  requestId: context.requestId,
  signal: context.signal
}
```

Never place userId in model-generated tool arguments.

---

## 12. EVIDENCE EXECUTION

After tool execution:

```text
Intent
  ↓
Evidence Plan
  ↓
Tool Registry
  ↓
Validated Tool Results
  ↓
Verified Evidence Set
```

Do not treat model output as candidate evidence.

Do not allow the LLM to modify deterministic evidence.

Preserve tool provenance where available.

---

## 13. PHASE 2 CONTEXT REUSE

Reuse:

```text
CandidateContextService
CandidateContextSnapshot
CandidateContextCache
EvidenceBundleService
```

where appropriate.

Avoid duplicate database reads.

Prefer:

```text
Candidate Context Snapshot
+
Intent-specific verified tool evidence
```

Do not create a second candidate-context cache.

---

## 14. EVIDENCE AUTHORITY

Preserve:

```text
DETERMINISTIC + VERIFIED
        ↓
EXTRACTED + VERIFIED / REVIEW_REQUIRED
        ↓
AI-GENERATED
```

Deterministic evidence remains authoritative.

If evidence conflicts:

```text
Conflict
   ↓
Do not silently choose
   ↓
Mark uncertainty / review-required
   ↓
Prevent unsupported factual claims
```

---

## 15. ORCHESTRATION CONTEXT

Create a structured model context:

```ts
interface OrchestrationContext {
  intent: AIIntent;
  candidateContext?: CandidateContextSnapshot;
  evidence: VerifiedEvidenceItem[];
  toolResults: AIToolResult[];
  userRequest: string;
  targetRole?: string;
}
```

Use the actual Phase 2/3 types where possible rather than duplicating them.

Never include:

- secrets
- credentials
- database internals
- raw Mongoose documents
- stack traces
- unnecessary PII
- arbitrary application state

---

## 16. MINIMAL CONTEXT COMPOSITION

Compose model context as:

```text
USER REQUEST
----------------
...

INTENT
----------------
...

CANDIDATE CONTEXT
----------------
...

VERIFIED EVIDENCE
----------------
...

TOOL RESULTS
----------------
...

INSTRUCTIONS
----------------
Reason only from supplied verified information.
```

Do not dump the entire candidate database record into the prompt.

Use only information relevant to the current request.

---

## 17. MODEL REASONING BOUNDARY

The LLM may:

- explain verified metrics
- compare verified evidence with role requirements
- identify patterns
- generate recommendations
- explain skill gaps
- explain resume weaknesses
- suggest learning priorities
- synthesize evidence
- provide career guidance

The LLM may NOT:

- invent candidate facts
- invent scores
- invent skills or experience
- invent job matches
- claim a tool ran when it did not
- override deterministic evidence
- change candidate identity
- access arbitrary services
- execute mutations
- create applications
- send external communications

---

## 18. MODEL SYSTEM INSTRUCTION

Create an Orchestrator reasoning instruction similar to:

```text
You are SKILLEZO AI.

SKILLEZO owns the candidate's factual and deterministic career intelligence.

Reason only from the verified candidate context and evidence supplied to you.

Never invent:
- candidate facts
- scores
- skills
- experience
- job matches
- evidence
- tool results

When evidence is missing or uncertain, say so.

Do not claim an action was completed.

You provide reasoning, explanation, insights, and recommendations.
You do not directly mutate candidate data.

Return the required structured response only.
```

Keep provider-specific concerns inside the Model Gateway.

---

## 19. MODEL GATEWAY INTEGRATION

The Orchestrator MUST call:

```text
Model Gateway
```

Never call Gemini/OpenAI SDKs directly.

Correct:

```text
AI Orchestrator
      ↓
Model Gateway
      ↓
Gemini / OpenAI
```

Do not duplicate:

- provider selection
- failover
- circuit breaker
- provider configuration
- streaming infrastructure

These belong to Phase 1.

---

## 20. STRUCTURED RESPONSE

Create a strongly typed response contract.

Conceptually:

```ts
interface AIOrchestrationResult {
  intent: AIIntent;
  answer: string;

  evidence: {
    id: string;
    type: string;
    source: string;
    summary: string;
  }[];

  insights: {
    title: string;
    explanation: string;
    evidenceIds: string[];
  }[];

  recommendations: {
    title: string;
    explanation: string;
    priority?: "HIGH" | "MEDIUM" | "LOW";
    evidenceIds?: string[];
  }[];

  confidence?: "HIGH" | "MEDIUM" | "LOW";
  limitations?: string[];
}
```

Adapt to existing project types.

Validate every model response using Zod.

---

## 21. EVIDENCE-LINKED RESPONSE

Important factual insights should be traceable:

```text
Insight
  ↓
evidenceIds
  ↓
Verified Evidence
  ↓
Deterministic Source
```

This prepares the system for a future UI to show:

```text
Why SKILLEZO says this
```

Do not invent evidence IDs.

---

## 22. HALLUCINATION PROTECTION

Validate model responses for:

- unknown evidence IDs
- references to tools that were not executed
- malformed structured fields
- invalid enum values
- impossible score ranges
- unsupported deterministic metrics

If invalid:

```text
Model Output
     ↓
Schema + Semantic Validation
     ↓
Invalid
     ↓
Controlled retry or safe failure
```

Never silently pass invalid output.

---

## 23. SCORE INTEGRITY

Any deterministic score must originate from verified evidence/tool results:

```text
ATS score
Skill gap score
Employability score
Matching score
Career readiness metrics
```

The LLM may explain them but must not invent or independently recalculate them.

If the model returns a numeric score not supported by verified evidence, reject/strip/flag it according to the response validation design.

---

## 24. TOOL EXECUTION & CONCURRENCY

Independent tools may be executed in parallel:

```text
getCandidateProfile ─────┐
getActiveResume ─────────┤
getSkillGaps ────────────┼──→ Evidence Set
getEmployabilityMetrics ─┤
                         ┘
```

Use `Promise.all` only when calls are independent and cancellation/concurrency are safe.

Do not parallelize dependent operations.

---

## 25. FAILURE HANDLING

If a tool fails, determine whether the request can still be answered safely.

Example:

```text
Profile ✓
Resume ✓
ATS ✓
Skill Gap ✗
Employability ✓
```

Never fabricate missing skill-gap data.

For optional evidence:

```text
Partial evidence
      ↓
Safe degraded response
      ↓
Explicit limitation
```

For critical evidence:

```text
Required evidence unavailable
      ↓
Do not produce unsupported conclusion
```

---

## 26. UNKNOWN / OUT-OF-SCOPE

If a request cannot safely be answered using available SKILLEZO capabilities:

```text
intent: UNKNOWN / OUT_OF_SCOPE
```

Return a structured explanation of supported capabilities.

Do not invoke arbitrary tools.

Do not hallucinate unavailable candidate data.

---

## 27. CONVERSATION CONTEXT

Conversation history may help interpret the request but is NOT authoritative candidate evidence.

For example:

```text
User previously said:
"I have 5 years of React experience."
```

must not automatically become verified candidate evidence.

Use trusted SKILLEZO systems for candidate facts.

---

## 28. TARGET ROLE NORMALIZATION

Normalize role strings before tool execution.

Example:

```text
" senior react developer "
→
"Senior React Developer"
```

Do not invent a target role.

If a role is required but unavailable, return a structured missing-input state rather than guessing.

---

## 29. ORCHESTRATOR TELEMETRY

Add bounded, production-safe telemetry.

Track:

```text
requestId
intent
toolCount
toolsUsed
totalDurationMs
modelProvider
success
failureType
```

Do not log:

- complete candidate data
- secrets
- unnecessary PII
- complete prompts unless existing secure telemetry explicitly supports it
- raw model output unnecessarily

Reuse existing telemetry patterns where available.

---

## 30. SECURITY REQUIREMENTS

Preserve all Phase 3 guarantees:

```text
1. Authenticated context is the identity source.
2. Tool Registry is the only tool execution boundary.
3. No direct database access.
4. No arbitrary service execution.
5. No model-supplied userId.
6. No cross-candidate access.
7. No uncontrolled mutations.
8. No direct provider SDK calls.
9. No secret exposure to the model.
10. Tool outputs remain validated.
```

---

## 31. TESTING REQUIREMENTS

Create:

```text
server/tests/unit/core/ai-orchestrator.spec.ts
```

Test at minimum:

### Intent

- profile classification
- resume classification
- resume improvement classification
- skill-gap classification
- employability classification
- job matching classification
- career plan classification
- career readiness classification
- unknown/out-of-scope handling

### Evidence Planning

- correct tools selected
- no unnecessary tools selected
- required evidence is explicit
- invalid tools cannot enter execution

### Identity

- authenticated userId is propagated
- request userId cannot override context userId
- model cannot control candidate identity

### Tool Registry

- only registered tools execute
- authenticated context is passed
- tool failures are handled safely

### Evidence Integrity

- deterministic evidence is preserved
- missing evidence is not fabricated
- conflicting evidence is handled safely
- unknown evidence IDs are rejected

### Model Gateway

- Orchestrator calls Model Gateway
- no direct Gemini/OpenAI imports
- structured output is validated
- provider failure is handled safely

### Score Integrity

- unsupported scores are rejected/flagged
- deterministic scores remain unchanged

### Partial Failure

- optional tool failure produces safe degradation
- required evidence failure prevents unsupported conclusions

### Proposal Safety

- career-plan flow remains proposal-only
- no DB mutation
- no external side effect

### Security

- cross-candidate data cannot leak
- secrets are not included in model context
- raw database documents are not passed to model

### Cancellation

- aborted orchestration stops where possible
- cancellation propagates to tools

---

## 32. MOCKING STRATEGY

Test Orchestrator behavior by mocking boundaries where appropriate:

```text
Tool Registry
Model Gateway
Candidate Context Service
```

Do not reimplement the ATS/Skill Gap/Employability engines inside Orchestrator tests.

Phase 1–3 tests already own those lower-layer behaviors.

---

## 33. NO DUPLICATE BUSINESS LOGIC

The Orchestrator must NOT calculate:

```text
ATS
Skill gaps
Employability
Job matching
Resume quality
```

Correct:

```text
Orchestrator
→ Tool Registry
→ Existing deterministic service
→ Verified result
```

---

## 34. PERFORMANCE

Optimize only where measurements support it.

Potential optimizations:

```text
Candidate Context Cache
Parallel independent tools
Minimal context composition
Bounded response size
```

Do not introduce:

- queues
- workers
- distributed orchestration
- agent frameworks

for Phase 4.

---

## 35. DEPENDENCY DIRECTION

Maintain:

```text
Orchestrator
     ↓
Tool Registry
     ↓
Existing Services
     ↓
Deterministic Engines
```

and:

```text
Orchestrator
     ↓
Candidate Context Service
     ↓
Evidence / Context Layer
```

Never allow deterministic services to import the Orchestrator.

Tool Registry must not depend on Orchestrator.

Avoid circular dependencies.

---

## 36. IMPLEMENTATION ORDER

### Step 1 — Inspect

Inspect actual:

```text
Phase 1 Model Gateway
Phase 2 Evidence Layer
Phase 2 Context Layer
Phase 3 Tool Registry
Authentication
Existing deterministic services
Existing AI response schemas
Existing telemetry
```

Verify actual method signatures. Do not assume them.

### Step 2 — Define Types

Create the required Orchestrator types.

### Step 3 — Intent Classification

Implement deterministic rules first.

### Step 4 — Evidence Planning

Map intents to required tools/evidence.

### Step 5 — Tool Coordination

Execute exclusively through `toolRegistry`.

### Step 6 — Verified Context Composition

Combine Phase 2 context with intent-specific evidence.

### Step 7 — Model Gateway Reasoning

Call the existing Model Gateway.

### Step 8 — Structured Response Validation

Validate with Zod and semantic rules.

### Step 9 — Failure Handling

Implement safe partial/degraded responses.

### Step 10 — Telemetry

Add bounded orchestration telemetry.

### Step 11 — Focused Tests

Run Phase 4 tests.

### Step 12 — Full Regression

Run all existing tests.

### Step 13 — Typecheck

Run server and client typechecks.

---

## 37. REQUIRED VERIFICATION

Do not claim completion without actual execution.

Verify:

```text
Phase 4 Orchestrator tests → PASS
Phase 1 tests              → PASS
Phase 2 tests              → PASS
Phase 3 tests              → PASS
Full server test suite     → PASS
Server typecheck           → 0 errors
Client typecheck           → 0 errors
```

Phase 3 baseline:

```text
35 test files
272 tests
```

Phase 4 will increase the final count.

Report actual numbers.

---

## 38. REGRESSION SAFETY

Do not break:

```text
Model Gateway
Evidence Layer
Context Cache
Tool Registry
Resume Intelligence
Skill Gap Engine
Employability Engine
Job Matching
Authentication
```

Do not change deterministic scoring formulas.

Do not weaken Tool Registry security.

Do not introduce breaking public APIs.

---

## 39. EXPECTED END STATE

```text
                         USER REQUEST
                              │
                              ▼
                    ┌───────────────────┐
                    │  AI ORCHESTRATOR  │
                    │                   │
                    │ Intent            │
                    │ Evidence Planning │
                    │ Tool Coordination │
                    │ Context Assembly  │
                    │ Response Validate │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   TOOL REGISTRY   │
                    └─────────┬─────────┘
                              │
                              ▼
                    Deterministic Tools
                              │
                              ▼
                    Verified Evidence
                              │
                              ▼
                  Candidate Context Snapshot
                              │
                              ▼
                       MODEL GATEWAY
                              │
                     ┌────────┴────────┐
                     ▼                 ▼
                   Gemini            OpenAI
                     │                 │
                     └────────┬────────┘
                              ▼
                    Structured Reasoning
                              │
                              ▼
                 Validated AI Orchestration
                         Response
```

After Phase 4, SKILLEZO has its core backend AI reasoning pipeline.

The next phase will expose this pipeline through the Career Coach API, but **do not implement that now**.

---

## 40. FINAL SECURITY INVARIANTS

These must remain true:

```text
1. AI never directly accesses MongoDB.
2. AI never executes arbitrary server functions.
3. AI never controls candidate identity.
4. AI never bypasses Tool Registry.
5. AI never overrides deterministic evidence.
6. AI never invents deterministic scores.
7. AI never mutates candidate data.
8. AI never directly calls Gemini/OpenAI.
9. Model context contains only necessary verified information.
10. Structured model output is always validated before returning.
```

---

## 41. STOP CONDITION

When Phase 4 is complete:

**STOP.**

Do not implement Phase 5.

Do not create:

```text
❌ Chat API
❌ HTTP controller
❌ SSE endpoint
❌ Career Coach frontend
❌ frontend chat component
❌ Action execution
❌ Mutation approval
❌ Auto-apply
❌ Autonomous agent loop
```

Instead, provide a walkthrough containing:

1. Files created.
2. Files modified.
3. Final Orchestrator architecture.
4. Intent taxonomy.
5. Evidence plans.
6. Tool-selection logic.
7. Phase 2 integration.
8. Model Gateway integration.
9. Structured response schema.
10. Hallucination/score protection.
11. Partial failure handling.
12. Security guarantees.
13. Telemetry.
14. Test results.
15. Full regression results.
16. Server typecheck result.
17. Client typecheck result.
18. Any deviations or limitations.

Do not start Phase 5 automatically.

---

# PHASE 4 SUCCESS CRITERIA

Phase 4 is complete only when:

```text
✓ AI Orchestrator exists
✓ Intent classification exists
✓ Evidence planning exists
✓ Tool selection is controlled
✓ Only Phase 3 tools can be executed
✓ Authenticated identity flows from server context
✓ Phase 2 Evidence/Context systems are reused
✓ No direct database access exists
✓ No direct Gemini/OpenAI access exists
✓ Model Gateway is the only model boundary
✓ Deterministic evidence remains authoritative
✓ Model context is structured and minimal
✓ Structured AI output is Zod validated
✓ Evidence references are validated
✓ Unsupported scores/claims are rejected or flagged
✓ Partial failures are handled safely
✓ Proposal-only behavior remains mutation-free
✓ Cancellation is supported
✓ Orchestration telemetry is bounded
✓ Security tests pass
✓ Orchestrator tests pass
✓ Full regression suite passes
✓ Server typecheck has 0 errors
✓ Client typecheck has 0 errors
✓ No Phase 5+ work is implemented
```

**IMPLEMENT PHASE 4 ONLY.**
