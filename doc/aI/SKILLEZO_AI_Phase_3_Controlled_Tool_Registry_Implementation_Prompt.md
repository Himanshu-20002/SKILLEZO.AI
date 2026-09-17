# SKILLEZO AI --- Phase 3 Implementation Prompt

## Controlled Tool Registry & Secure AI Tool Execution Layer

> **Project:** SKILLEZO AI\
> **Phase:** 3\
> **Scope:** Controlled Tool Registry only\
> **Architecture Principle:** **SKILLEZO owns the truth; AI owns the
> reasoning.**

------------------------------------------------------------------------


# 1. OBJECTIVE
 

Implement **Phase 3 --- Controlled Tool Registry** for the SKILLEZO AI
architecture.

Phase 3 creates a secure, typed, allowlisted tool execution layer
between the future AI Orchestrator and SKILLEZO's deterministic
intelligence systems.

The Tool Registry is responsible for:

-   Defining which tools AI is allowed to use.
-   Validating tool inputs.
-   Injecting authenticated user context server-side.
-   Preventing the model/client from controlling candidate identity.
-   Enforcing candidate/entity ownership.
-   Calling the correct deterministic services.
-   Returning typed, structured tool results.
-   Providing consistent errors and telemetry.
-   Preventing unauthorized or arbitrary service access.

The registry becomes the **single controlled entry point for
AI-accessible capabilities**.

------------------------------------------------------------------------

# 2. CORE ARCHITECTURE RULE

``` text
SKILLEZO owns the truth.
AI owns the reasoning.
```

Therefore:

``` text
AI Orchestrator
       ↓
   Tool Registry
       ↓
Controlled AI Tools
       ↓
Deterministic Services / Evidence Layer / Context Layer
       ↓
Verified SKILLEZO Data
```

The model must **never directly access MongoDB, Mongoose models,
repositories, internal services, or arbitrary application functions**.

The model can only request an explicitly registered and allowlisted
tool.

------------------------------------------------------------------------

# 3. PHASE BOUNDARY

Implement **ONLY Phase 3**.

Do NOT implement:

-   AI Orchestrator
-   AI Career Coach API
-   Streaming chat UI
-   Career Coach frontend
-   Action execution system
-   User-approved mutations
-   Background agents
-   Autonomous job applications
-   New AI reasoning pipelines
-   New deterministic intelligence engines
-   New database models unless absolutely required for type
    compatibility
-   Provider changes unrelated to tool execution

Those belong to later phases.

At the end of Phase 3, the system must have a production-ready
**Controlled Tool Registry** that future phases can consume.

------------------------------------------------------------------------

# 4. TARGET ARCHITECTURE

``` text
                         SKILLEZO AI
                              │
                              ▼
                     Future AI Orchestrator
                              │
                              ▼
                    ┌───────────────────┐
                    │   TOOL REGISTRY   │
                    └─────────┬─────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
             PROFILE        RESUME          JOB
              TOOLS          TOOLS          TOOLS
                │             │             │
                └─────────────┼─────────────┘
                              ▼
                  Deterministic Services
                              │
                              ▼
                       Evidence Layer
                              │
                              ▼
                  Verified Structured Data
```

Phase 3 ends at the Tool Registry and its controlled tool
implementations.

------------------------------------------------------------------------

# 5. DIRECTORY STRUCTURE

Create the Tool Registry under:

``` text
server/src/core/ai/tools/
```

Recommended structure:

``` text
server/src/core/ai/tools/
│
├── types.ts
├── tool-errors.ts
├── tool-context.ts
├── tool-registry.ts
├── tool-executor.ts
├── index.ts
│
├── schemas/
│   ├── profile-tool.schemas.ts
│   ├── resume-tool.schemas.ts
│   ├── skill-tool.schemas.ts
│   ├── job-tool.schemas.ts
│   └── career-plan-tool.schemas.ts
│
├── profile/
│   └── get-candidate-profile.tool.ts
│
├── resume/
│   ├── get-active-resume.tool.ts
│   └── get-resume-intelligence.tool.ts
│
├── skills/
│   └── get-skill-gaps.tool.ts
│
├── employability/
│   └── get-employability-metrics.tool.ts
│
├── jobs/
│   └── get-matching-jobs.tool.ts
│
└── career-plan/
    └── propose-career-plan.tool.ts
```

Adapt exact filenames to existing project conventions where necessary,
but preserve the architectural separation.

------------------------------------------------------------------------

# 6. TOOL CONTRACT

Create a strongly typed tool abstraction.

Conceptually:

``` ts
interface AITool<TInput, TOutput> {
  name: string;
  description: string;
  inputSchema: ZodSchema<TInput>;
  outputSchema: ZodSchema<TOutput>;

  execute(
    params: TInput,
    context: AIToolContext
  ): Promise<TOutput>;
}
```

The authenticated context should contain server-owned identity
information:

``` ts
interface AIToolContext {
  userId: string;
  userRole?: string;
  requestId?: string;
  signal?: AbortSignal;
}
```

Expand the context only if existing architecture requires it.

------------------------------------------------------------------------

# 7. CRITICAL IDENTITY RULE

## NEVER trust userId from model input.

Mandatory.

Bad:

``` ts
getCandidateProfile({
  userId: "123"
});
```

Correct:

``` ts
getCandidateProfile(
  {},
  {
    userId: authenticatedUserId
  }
);
```

The tool must obtain candidate identity from:

``` text
Authenticated Server Context
```

not from:

``` text
LLM
Client
Prompt
Tool Parameters
```

The model must not be able to:

-   choose another userId
-   override userId
-   impersonate another candidate
-   inject candidate ownership fields
-   access another candidate by changing an ID

------------------------------------------------------------------------

# 8. OWNERSHIP ENFORCEMENT

Every tool that accepts entity identifiers must verify ownership.

Examples:

``` text
resumeId
profileId
applicationId
careerPlanId
jobId
```

If an entity belongs to another candidate, reject execution.

Use a dedicated ownership error, such as:

``` ts
AIToolOwnershipError
```

Do not silently return another candidate's data.

Expected flow:

``` text
Authenticated User
       ↓
Tool Request
       ↓
Ownership Check
       ↓
Allowed → Execute
Denied  → Reject
```

------------------------------------------------------------------------

# 9. ALLOWLISTED TOOLS

Implement exactly these seven tools.

## 9.1 getCandidateProfile

Purpose: return the authenticated candidate's profile context.

Input:

``` ts
{}
```

Identity comes from:

``` ts
context.userId
```

Reuse existing profile services/models. Do not create duplicate business
logic.

------------------------------------------------------------------------

## 9.2 getActiveResume

Purpose: return the candidate's currently active resume.

Input may be:

``` ts
{}
```

or an existing resume selector if the project already supports one.

Do not allow arbitrary resume access without ownership validation.

------------------------------------------------------------------------

## 9.3 getResumeIntelligence

Purpose: return existing deterministic resume intelligence.

Reuse existing:

-   ATS intelligence
-   resume analysis
-   evidence
-   resume metrics
-   deterministic resume engines

Do not create a second resume scoring system.

Existing deterministic systems remain authoritative.

------------------------------------------------------------------------

## 9.4 getSkillGaps

Purpose: return deterministic skill-gap analysis.

Input:

``` ts
{
  targetRole: string;
}
```

Validation:

-   non-empty string
-   trim whitespace
-   reasonable length limit
-   reject malformed values

Use the existing Skill Gap Engine/Service.

Do not let the LLM calculate skill-gap scores.

------------------------------------------------------------------------

## 9.5 getEmployabilityMetrics

Purpose: return deterministic employability metrics.

Input:

``` ts
{}
```

Identity:

``` ts
context.userId
```

Reuse the existing Employability Service/Engine.

Do not recreate employability formulas inside the tool.

------------------------------------------------------------------------

## 9.6 getMatchingJobs

Purpose: return existing candidate/job matching intelligence.

Input may support existing matching parameters, for example:

``` ts
{
  targetRole?: string;
  location?: string;
  limit?: number;
}
```

Use strict Zod validation.

Do not allow unrestricted database queries.

Do not allow model-supplied candidate identity.

Do not expose arbitrary MongoDB filters.

------------------------------------------------------------------------

## 9.7 proposeCareerPlan

Purpose: create a **proposal only** for a future career-plan workflow.

This tool must NOT directly mutate persistent user state in Phase 3.

It may:

-   Gather verified candidate evidence.
-   Gather skill gaps.
-   Gather employability metrics.
-   Gather matching context.
-   Construct a structured career-plan proposal.

It must NOT:

-   Save a career plan automatically.
-   Modify the candidate profile.
-   Change resume data.
-   Create applications.
-   Send messages.
-   Trigger external side effects.

Final mutation belongs to the later **Action System / User Approval**
phase.

------------------------------------------------------------------------

# 10. PHASE 2 INTEGRATION

Phase 3 must reuse Phase 2 rather than bypass it.

Existing Phase 2 components:

``` text
Evidence Collector
Evidence Validator
Evidence Normalizer
Evidence Bundle
Candidate Context Snapshot
Context Composer
Candidate Context Cache
```

Where appropriate, tools should consume:

``` text
Verified Evidence Bundle
```

and/or:

``` text
Candidate Context Snapshot
```

rather than repeatedly querying raw database state.

Do not duplicate caching logic inside tools.

------------------------------------------------------------------------

# 11. DATA SOURCE RULE

Every tool must clearly identify its source of truth.

Example:

``` text
getSkillGaps
      ↓
SkillGapService
      ↓
Deterministic Skill Gap Engine
      ↓
Verified result
```

Not:

``` text
getSkillGaps
      ↓
LLM calculates skills
```

Not:

``` text
getSkillGaps
      ↓
MongoDB arbitrary query
```

The Tool Registry is an adapter/control boundary, not a replacement for
existing business logic.

------------------------------------------------------------------------

# 12. INPUT SCHEMAS

Every tool must have a Zod input schema.

Example:

``` ts
const GetCandidateProfileInput = z.object({});

const GetSkillGapsInput = z.object({
  targetRole: z
    .string()
    .trim()
    .min(1)
    .max(200)
});
```

Schemas must reject or safely handle:

-   invalid IDs
-   invalid types
-   excessive values
-   unsupported query parameters
-   arbitrary database filters
-   client/model identity overrides

Prefer strict schemas where compatible with the existing project.

------------------------------------------------------------------------

# 13. OUTPUT SCHEMAS

Every tool must have a defined output contract.

Do not return:

``` ts
any
```

Do not expose raw Mongoose documents unnecessarily.

Create serializable DTO-style outputs.

Example:

``` ts
{
  candidate: {
    id: string;
    headline?: string;
    experienceYears?: number;
  }
}
```

The exact shape must reflect existing project models/services.

Validate tool output using the declared Zod output schema.

Malformed internal-service output must fail safely rather than being
passed to the future model.

------------------------------------------------------------------------

# 14. TOOL DESCRIPTIONS

Every tool must expose a concise description intended for future AI
Orchestrator/tool-calling usage.

Example:

``` ts
{
  name: "getSkillGaps",
  description:
    "Retrieve deterministic skill-gap analysis for the authenticated candidate against a target role."
}
```

Descriptions should explain:

-   what the tool does
-   what it returns
-   required parameters
-   that candidate identity is automatically scoped to the authenticated
    candidate where relevant

Do not expose secrets or internal implementation details.

------------------------------------------------------------------------

# 15. TOOL EXECUTION PIPELINE

All tool executions should follow:

``` text
Tool Name
   ↓
Registry Lookup
   ↓
Allowlist Check
   ↓
Input Validation
   ↓
Authenticated Context Injection
   ↓
Ownership Validation
   ↓
Tool Execution
   ↓
Output Validation
   ↓
Telemetry
   ↓
Structured Tool Result
```

No tool should bypass this pipeline.

------------------------------------------------------------------------

# 16. TIMEOUTS & CANCELLATION

Where supported by existing infrastructure:

-   respect `AbortSignal`
-   avoid hanging executions
-   apply sensible execution timeouts
-   propagate cancellation
-   stop unnecessary work after request cancellation

Reuse existing project utilities where available.

Do not introduce large new infrastructure just for this phase.

------------------------------------------------------------------------

# 17. ERROR MODEL

Create consistent Tool Registry errors.

Recommended categories:

``` text
AIToolError
AIToolNotFoundError
AIToolValidationError
AIToolOwnershipError
AIToolExecutionError
AIToolOutputValidationError
AIToolTimeoutError
AIToolRegistryError
```

Errors must:

-   be typed
-   be safe to log
-   avoid leaking sensitive data
-   provide useful internal metadata where appropriate
-   avoid exposing stack traces to the model/client

------------------------------------------------------------------------

# 18. SECURITY REQUIREMENTS

The Tool Registry is a security boundary.

Verify all of the following:

### Identity

``` text
context.userId
```

is the only candidate identity source.

### Authorization

Authenticated user must be authorized for the requested operation.

### Ownership

Entity IDs must be checked against the authenticated candidate.

### Allowlist

Only registered tools can execute.

### Input Validation

Every input is validated.

### Output Validation

Every output is validated.

### No arbitrary database access

Never expose arbitrary model filters to AI.

### No arbitrary service execution

Never allow model input to dynamically choose an internal
service/function.

### No uncontrolled mutation

Phase 3 tools must not create uncontrolled side effects.

------------------------------------------------------------------------

# 19. TELEMETRY

Add lightweight tool telemetry.

Track at minimum:

``` text
toolName
requestId
userId (internal telemetry only, never model-visible)
startedAt
durationMs
success
failureType
```

Optionally:

``` text
inputValidationMs
executionMs
outputValidationMs
```

Do not log sensitive candidate data or complete tool payloads
unnecessarily.

Telemetry should help identify:

-   tool usage
-   tool failures
-   slow tools
-   validation failures
-   ownership violations
-   future optimization targets

------------------------------------------------------------------------

# 20. MODEL-FACING TOOL METADATA

The future AI Orchestrator will need to discover available tools.

Expose a safe registry representation such as:

``` ts
type AIToolDefinition = {
  name: string;
  description: string;
  inputSchema: unknown;
};
```

Do not expose:

-   internal database details
-   Mongo queries
-   private implementation paths
-   secrets
-   credentials
-   raw model objects

The registry should provide:

``` text
AI Orchestrator
      ↓
Tool Definitions
      ↓
Tool Name + Validated Parameters
      ↓
Tool Registry
```

------------------------------------------------------------------------

# 21. DETERMINISTIC SOURCE PRESERVATION

The registry must preserve deterministic authority.

For example:

``` text
getResumeIntelligence
        ↓
ResumeAtsEngine / existing intelligence
        ↓
Deterministic result
        ↓
AI Tool
        ↓
Future LLM reasoning
```

The LLM may later explain the score, but must not become its source.

The same applies to:

-   Skill gaps
-   Employability
-   Resume intelligence
-   Matching
-   Profile facts

------------------------------------------------------------------------

# 22. NO DUPLICATE BUSINESS LOGIC

Before implementing each tool:

1.  Search the existing server code.
2.  Find the existing service/engine/repository.
3.  Reuse it.
4.  Adapt its result to the tool output DTO.
5.  Add only missing adapter logic.

Do NOT create:

``` text
Second Skill Gap Engine
Second ATS Engine
Second Employability Engine
Second Matching Algorithm
```

The Tool Registry should connect existing intelligence systems.

------------------------------------------------------------------------

# 23. TESTING REQUIREMENTS

Create unit tests for the Tool Registry and individual tools.

At minimum test:

## Registry

-   registration works
-   duplicate tool names are rejected
-   unknown tool names are rejected
-   registered tools are discoverable
-   only allowlisted tools can execute

## Input Validation

-   valid input succeeds
-   invalid input fails
-   missing required fields fail
-   invalid IDs fail
-   oversized strings fail
-   unsupported/dangerous fields are rejected where appropriate

## Authentication

-   authenticated context is required
-   tools use `context.userId`
-   model/client cannot provide or override candidate identity

## Ownership

Test:

``` text
Candidate A → Candidate A resource → ALLOWED
Candidate A → Candidate B resource → REJECTED
```

This is mandatory.

## Output Validation

-   valid service output passes
-   malformed output fails
-   unexpected output types fail safely

## Deterministic Sources

Verify tools call the correct existing deterministic services.

## Mutation Safety

Verify:

``` text
proposeCareerPlan
```

does not persist changes in Phase 3.

## Error Handling

Test service failures, validation failures, ownership failures,
tool-not-found, output validation failures, and timeout/cancellation
where implemented.

## Cross-Candidate Isolation

Explicitly test that one candidate cannot obtain another candidate's:

-   Profile
-   Resume
-   Resume intelligence
-   Skill gaps
-   Employability metrics
-   Matching information
-   Career-plan proposal context

------------------------------------------------------------------------

# 24. USER ID INJECTION REGRESSION TEST

Add a dedicated regression test proving candidate identity cannot be
supplied through tool parameters.

For example:

``` ts
registry.execute(
  "getCandidateProfile",
  {
    userId: "another-user"
  },
  {
    userId: "authenticated-user"
  }
);
```

The tool must reject the unsupported field or safely handle it according
to the strict schema policy.

It must never execute as `"another-user"`.

------------------------------------------------------------------------

# 25. PHASE 2 CONTEXT CACHE INTEGRATION

Where a tool requires broad candidate context:

``` text
Tool
 ↓
CandidateContextService
 ↓
CandidateContextCache
 ↓
CandidateContextSnapshot
```

The tool should benefit from the existing Phase 2 cache where
architecturally appropriate.

There must be one clear owner for candidate-context caching.

------------------------------------------------------------------------

# 26. PERFORMANCE REQUIREMENTS

Avoid unnecessary repeated work.

Do not create patterns such as:

``` text
Tool A → DB
Tool B → DB
Tool C → DB
Tool D → DB
```

when the Phase 2 candidate context can satisfy the request.

Prefer:

``` text
Candidate Context Snapshot
          ↓
Multiple controlled tools
```

where appropriate.

Measure actual performance rather than claiming fixed latency
guarantees.

Do not add a new infrastructure layer solely for speculative
optimization.

------------------------------------------------------------------------

# 27. EXPORTS

Update:

``` text
server/src/core/ai/index.ts
```

to expose the Tool Registry cleanly using existing project export
conventions.

Conceptually:

``` ts
export {
  toolRegistry,
  AITool,
  AIToolContext
} from "./tools";
```

------------------------------------------------------------------------

# 28. SINGLE REGISTRY INITIALIZATION

Create one central initialization path.

Conceptually:

``` ts
const toolRegistry = new ToolRegistry();

toolRegistry.register(getCandidateProfileTool);
toolRegistry.register(getActiveResumeTool);
toolRegistry.register(getResumeIntelligenceTool);
toolRegistry.register(getSkillGapsTool);
toolRegistry.register(getEmployabilityMetricsTool);
toolRegistry.register(getMatchingJobsTool);
toolRegistry.register(proposeCareerPlanTool);
```

Avoid separate registries in different modules.

There must be one authoritative AI Tool Registry.

------------------------------------------------------------------------

# 29. FUTURE ORCHESTRATOR COMPATIBILITY

Phase 3 should allow Phase 4 to do something conceptually similar to:

``` ts
const tools = toolRegistry.getDefinitions();

const result = await toolRegistry.execute(
  toolCall.name,
  toolCall.arguments,
  authenticatedContext
);
```

Do not implement the orchestrator now.

Only make the registry ready for it.

------------------------------------------------------------------------

# 30. FILES TO REVIEW BEFORE IMPLEMENTATION

Before writing code, inspect the existing project for:

``` text
server/src/core/ai/
server/src/core/ai/evidence/
server/src/core/ai/context/
server/src/
```

Find existing implementations for:

``` text
ProfileService
ResumeService
ResumeAtsEngine
SkillGapService
SkillGapEngine
EmployabilityService
EmployabilityEngine
JobMatching / MatchingService
CareerPlan services
Authentication middleware
Better Auth session handling
Repository layer
```

Use actual project APIs and naming conventions.

Do not invent duplicate services when an existing implementation already
exists.

------------------------------------------------------------------------

# 31. IMPLEMENTATION STRATEGY

Follow this order:

### Step 1 --- Inspect existing architecture

Understand:

-   authentication
-   Phase 2 Evidence Layer
-   Phase 2 Context Layer
-   existing deterministic services
-   repository patterns
-   error patterns
-   telemetry patterns

### Step 2 --- Create Tool Types

Implement the typed tool contract, context, definitions, and execution
result types as appropriate.

### Step 3 --- Create Tool Errors

Implement consistent typed errors.

### Step 4 --- Create Tool Registry

Implement:

-   registration
-   lookup
-   discovery
-   execution
-   validation
-   telemetry

### Step 5 --- Implement Tools

Implement the seven allowlisted tools.

### Step 6 --- Integrate Phase 2

Reuse:

``` text
EvidenceBundleService
CandidateContextService
CandidateContextCache
```

where appropriate.

### Step 7 --- Add Security Tests

Especially:

``` text
authentication
ownership
cross-candidate isolation
userId injection prevention
```

### Step 8 --- Add Full Regression Tests

Run all existing server tests.

### Step 9 --- Typecheck

Run:

``` text
server typecheck
client typecheck
```

Fix all TypeScript errors.

------------------------------------------------------------------------

# 32. REQUIRED VERIFICATION

At completion, verify actual results for:

``` text
Tool Registry tests       → PASS
Individual tool tests     → PASS
Security tests            → PASS
Ownership tests           → PASS
Cross-candidate tests     → PASS
Mutation safety tests     → PASS
Full server test suite    → PASS
Server typecheck          → 0 errors
Client typecheck          → 0 errors
```

Do not claim success without actually running the relevant commands.

If a test fails:

1.  Investigate.
2.  Fix the implementation.
3.  Re-run the failed test.
4.  Re-run the full suite.
5.  Report the actual final result.

------------------------------------------------------------------------

# 33. REGRESSION SAFETY

Phase 1 and Phase 2 behavior must remain unchanged.

Existing:

``` text
Model Gateway
Evidence Layer
Candidate Context Snapshot
Candidate Context Cache
Resume Intelligence
Skill Gap Engine
Employability Engine
```

must continue to work.

Do not modify deterministic scoring formulas unless required for
compatibility.

Do not replace existing authentication behavior.

Do not introduce breaking API changes.

------------------------------------------------------------------------

# 34. EXPECTED END STATE

After Phase 3:

``` text
                    SKILLEZO AI
                         │
                         ▼
                ┌─────────────────┐
                │ FUTURE           │
                │ AI ORCHESTRATOR  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  TOOL REGISTRY  │
                └────────┬────────┘
                         │
       ┌─────────────────┼──────────────────┐
       ▼                 ▼                  ▼
    PROFILE            RESUME              JOB
     TOOLS              TOOLS              TOOLS
       │                 │                  │
       └─────────────────┼──────────────────┘
                         ▼
              Existing Deterministic
                    Intelligence
                         │
                         ▼
                 Evidence Layer
                         │
                         ▼
              Candidate Context Layer
                         │
                         ▼
               Verified Structured Data
```

The Tool Registry becomes the controlled bridge between future AI
reasoning and SKILLEZO's real intelligence.

------------------------------------------------------------------------

# 35. SECURITY INVARIANTS

The following must always remain true:

``` text
1. AI cannot directly access the database.

2. AI cannot execute arbitrary server functions.

3. AI cannot choose the authenticated userId.

4. AI cannot access another candidate's data.

5. Every tool has an explicit schema.

6. Every tool is explicitly registered.

7. Every tool output is structured and validated.

8. Deterministic engines remain authoritative.

9. Phase 3 tools do not perform uncontrolled mutations.

10. Tool execution is observable through telemetry.
```

------------------------------------------------------------------------

# 36. DO NOT OVERENGINEER

Do not introduce:

-   Agent frameworks
-   LangChain/LangGraph solely for this phase
-   Complex workflow engines
-   Vector databases
-   New message queues
-   New microservices
-   Autonomous agents
-   Browser automation
-   Job auto-apply
-   External action execution

unless the existing repository already requires them for compatibility.

The goal is a clean internal TypeScript Tool Registry.

------------------------------------------------------------------------

# 37. FINAL ARCHITECTURAL PRINCIPLE

Preserve:

``` text
                    USER
                     │
                     ▼
              Future AI Coach
                     │
                     ▼
             AI Orchestrator
                     │
                     ▼
              Tool Registry
                     │
                     ▼
          Controlled Tool Execution
                     │
                     ▼
       Existing Deterministic Intelligence
                     │
                     ▼
             Evidence Layer
                     │
                     ▼
        Verified Candidate Context
                     │
                     ▼
              Model Gateway
                     │
                     ▼
              AI Reasoning
```

The model reasons **over verified SKILLEZO data**.

It does not become the source of that data.

------------------------------------------------------------------------

# 38. STOP CONDITION

When Phase 3 is complete:

-   Do not start Phase 4.
-   Do not build the AI Orchestrator.
-   Do not build the Career Coach API.
-   Do not build the frontend.
-   Do not build actions/mutations.

Instead, provide a walkthrough containing:

1.  Files created.
2.  Files modified.
3.  Tool Registry architecture.
4.  All seven registered tools.
5.  Input/output schemas.
6.  Authentication and ownership enforcement.
7.  Phase 2 integration.
8.  Security protections.
9.  Telemetry.
10. Test results.
11. Server typecheck result.
12. Client typecheck result.
13. Any limitations or deviations from this specification.

End Phase 3 only after verification results are available.

------------------------------------------------------------------------

# PHASE 3 SUCCESS CRITERIA

Phase 3 is complete only when:

``` text
✓ Controlled Tool Registry exists
✓ Seven allowlisted tools are registered
✓ All tool inputs use strict validation
✓ All tool outputs are structured and validated
✓ Authenticated server context controls candidate identity
✓ userId injection is prevented
✓ Entity ownership is enforced
✓ Cross-candidate access is prevented
✓ Existing deterministic services are reused
✓ Phase 2 Evidence/Context systems are reused where appropriate
✓ proposeCareerPlan is proposal-only
✓ No uncontrolled mutations occur
✓ Tool telemetry exists
✓ Tool discovery metadata exists
✓ Registry has a single authoritative initialization path
✓ Unit/security tests pass
✓ Full server suite passes
✓ Server typecheck has 0 errors
✓ Client typecheck has 0 errors
✓ No Phase 4+ work is implemented
```

**Implement Phase 3 only.**
