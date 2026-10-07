# SKILLEZO AI — AI Career Intelligence Architecture Implementation Prompt

## Role

You are working inside the existing SKILLEZO codebase.

Your job is to evolve the current AI/Career Coach implementation into a production-ready **AI Career Intelligence Platform**, not merely a chatbot.

Before changing code, inspect the entire existing implementation, architecture, models, services, routes, AI providers, Resume Intelligence, Skill Gap Engine, Career Plan, Job/Job Matching, authentication, and frontend dashboard. Reuse existing functionality wherever possible.

**Do not rewrite working systems unnecessarily.**
**Do not invent duplicate models or services when an existing implementation can be extended.**
**Do not break existing APIs or UI flows.**

---

# 1. Core Architectural Principle

Implement this separation:

> **LLM = reasoning layer**
>
> **SKILLEZO data + deterministic engines = source of truth**
>
> **Tools = controlled access to capabilities**
>
> **AI Orchestrator = decision/routing layer**

The AI must never blindly invent candidate information that already exists in SKILLEZO.

The architecture should evolve toward:

```text
                         SKILLEZO
                  Career Intelligence Platform
                              │
                              ▼
                     ┌─────────────────┐
                     │ AI ORCHESTRATOR │
                     │     / Brain     │
                     └────────┬────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
       Resume Intelligence  Career Agent   Job Intelligence
              │               │                │
              ▼               ▼                ▼
        ATS / Impact       Career Coach      JD Analyzer
        Optimization       Roadmaps          Job Matching
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                    Candidate Context Layer
                              │
                    ┌─────────▼─────────┐
                    │   TOOL REGISTRY   │
                    └─────────┬─────────┘
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
            MongoDB       AI Services    External APIs
                              │
                              ▼
                       MODEL GATEWAY
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                 Gemini     OpenAI   Future Models
                              │
                              ▼
                    Structured AI Response
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
            Chat       Recommendations       Actions
```

---

# 2. First Task — Audit Existing Codebase

Before implementation:

1. Inspect the complete repository structure.
2. Identify:
   - backend architecture
   - frontend architecture
   - AI provider abstraction
   - Gemini integration
   - OpenAI integration, if present
   - Resume Intelligence
   - ATS engine
   - Skill Gap Engine
   - Career Plan
   - Job model
   - Job Matching
   - Application model
   - User/Profile models
   - existing Career Coach
   - existing AI routes/controllers/services
   - authentication middleware
   - database/repository layer
   - existing caching
   - existing queue/background jobs
3. Read relevant documentation already present in the repository.
4. Produce an internal architecture map before coding.
5. Identify what can be reused and what needs to be introduced.

Do not duplicate existing business logic.

---

# 3. Target AI Architecture

Create or evolve the following logical layers.

## Layer A — AI Gateway / Model Gateway

Create a provider-independent abstraction.

Example:

```ts
interface AIProvider {
  generateText(input: AIRequest): Promise<AIResponse>;
  streamText(input: AIRequest): AsyncIterable<AIChunk>;
}
```

Implement provider adapters such as:

```text
GeminiProvider
OpenAIProvider
```

Do not allow business services to directly depend on Gemini SDK calls.

Business code should use:

```text
ModelGateway
```

instead of:

```text
Gemini SDK
```

The Model Gateway should support:

- model selection
- provider fallback
- timeout handling
- retry policy
- rate-limit handling
- circuit breaker
- token/cost telemetry
- request correlation ID
- structured output
- streaming

Use the currently configured models/environment variables already present in the repository. Do not hard-code API keys or secrets.

---

# 4. AI Orchestrator

Create/evolve:

```text
AI Orchestrator
```

This becomes the central brain.

Responsibilities:

1. Receive user intent.
2. Determine what type of request it is.
3. Determine which candidate data is required.
4. Fetch information through controlled tools/services.
5. Call deterministic SKILLEZO intelligence engines when appropriate.
6. Compose context.
7. Select the appropriate AI model.
8. Ask the model to reason over verified context.
9. Validate the output.
10. Return a structured response.
11. Optionally expose an approved action for the user.

Example flow:

```text
User:
"Why am I not getting shortlisted?"

        ↓

Intent Detection

        ↓

Candidate Context Required

        ↓

Tools:
getResume()
getSkillGaps()
getApplications()
getJobMatches()

        ↓

Verified Evidence

        ↓

LLM Reasoning

        ↓

Structured Response

        ↓

Explanation
Evidence
Issues
Recommendations
Next Actions
```

The orchestrator should not contain every business rule itself. Keep domain logic inside domain services.

---

# 5. Tool Registry

Introduce a controlled AI Tool Registry.

Tools should be strongly typed and permission-aware.

Start with tools like:

```text
getCandidateProfile()
getResume()
getResumeIntelligence()
getSkillGaps()
getCareerPlan()
getTargetRole()
getJobDetails()
getJobMatch()
getRecommendedSkills()
getApplicationHistory()
getEmployabilityData()
analyzeJobMatch()
analyzeResume()
generateCareerPlan()
generateSkillLearningPlan()
```

Where appropriate, add mutation/action tools:

```text
createCareerPlan()
updateCareerPlan()
updateResume()
createApplication()
```

IMPORTANT:

Mutation tools must require explicit user confirmation unless the existing product architecture already defines a safe approval mechanism.

The AI must never silently modify important user data.

Use:

```text
READ → REASON → PROPOSE → USER APPROVES → WRITE
```

for consequential actions.

---

# 6. Candidate Context Intelligence Layer

Build/evolve the existing Candidate Context Snapshot.

It should become the AI's compact, verified context layer.

Use existing SKILLEZO models and engines as the source.

Possible structure:

```ts
interface CandidateContextSnapshot {
  candidateId: string;

  targetRole?: string;

  profile?: {
    experienceLevel?: string;
    location?: string;
    education?: string[];
  };

  skills?: {
    name: string;
    proficiency?: string;
    evidence?: string[];
  }[];

  skillGaps?: {
    skill: string;
    severity?: string;
    importance?: number;
  }[];

  employabilityScore?: number;

  resume?: {
    id: string;
    atsScore?: number;
    roleMatchScore?: number;
    impactScore?: number;
  };

  careerPlan?: {
    id: string;
    goals?: string[];
    activeTasks?: string[];
  };

  recentApplications?: unknown[];

  cachedAt: number;
  version?: string;
}
```

Do not blindly use this exact schema if equivalent existing models already exist.

Adapt to the actual codebase.

Important requirements:

- avoid repeated database queries
- cache candidate context
- invalidate/update cache when relevant candidate data changes
- keep source-of-truth data in MongoDB
- never let cached AI context become authoritative over actual records

Use Redis if already available/appropriate.

If Redis is not present, implement an abstraction that can begin with an in-process cache without coupling the architecture to it.

---

# 7. Resume Intelligence Integration

Do not rebuild Resume Intelligence.

Integrate the existing SKILLEZO Resume Intelligence pipeline.

The AI should be able to reason over:

```text
Resume
 ↓
Evidence
 ↓
Skills
 ↓
Experience
 ↓
Achievements
 ↓
Impact
 ↓
ATS Compatibility
 ↓
Role/JD Match
 ↓
Content Quality
```

The Career Coach should be able to answer questions such as:

- Why is my ATS score low?
- What is weak in my resume?
- Which bullets should I improve?
- What evidence is missing?
- Why does this job match poorly?
- How can I improve my resume for this role?

The deterministic Resume Intelligence system remains the source of scoring/evidence.

The LLM explains, prioritizes, and generates suggestions.

---

# 8. Job Intelligence

Integrate the existing Job and Job Matching systems.

Create a Job Intelligence layer capable of:

```text
Job Description
       ↓
JD Intelligence
       ↓
Required Skills
Preferred Skills
Responsibilities
Keywords
Seniority
Experience
       ↓
Candidate ↔ Job Matching
       ↓
Match Evidence
       ↓
Missing Skills
       ↓
Application Recommendations
```

The AI must distinguish:

```text
Verified candidate evidence
vs
AI-generated suggestion
```

Example response structure:

```json
{
  "summary": "...",
  "match": {
    "score": 78,
    "strengths": [],
    "gaps": []
  },
  "evidence": [],
  "recommendations": [],
  "actions": []
}
```

Adapt to existing response conventions.

---

# 9. Career Intelligence Engine

Create/evolve the Career Agent.

It should combine:

```text
Candidate
+
Target Role
+
Current Skills
+
Skill Gaps
+
Resume Intelligence
+
Job Market/JD Requirements
+
Career Goals
```

Capabilities:

### Career guidance

- target role clarification
- skill prioritization
- career roadmap
- learning recommendations
- project recommendations
- interview preparation
- application strategy

### Career planning

Generate plans such as:

```text
Target Role: Full Stack Developer

Current State
├── React       ✓
├── Node.js     ✓
├── MongoDB     ✓
├── TypeScript  ✓
├── AWS         △
├── Docker      ✗
└── System Design ✗

        ↓

Career Plan

Week 1 → Docker
Week 2 → AWS
Week 3 → System Design
Week 4 → Production Project
```

Plans should be grounded in actual candidate gaps and target-role requirements.

---

# 10. Career Coach

The Career Coach is the conversational interface over the intelligence system.

It must support at least:

```text
general
career
resume
job
skill-gap
mock-interview
career-plan
```

Use the existing modes if already implemented.

Do not create unnecessary duplicate chat modes.

The assistant should understand context.

Example:

User:
"Why is my score low?"

The AI should know whether the user is referring to:

- ATS
- Role Match
- Impact & Content
- Employability
- Job Match

Use current page/context when available.

---

# 11. Structured AI Responses

Do not rely on free-form LLM output for core UI rendering.

Define structured response types.

Example:

```ts
interface AIResponse {
  message: string;

  intent?: string;

  evidence?: Evidence[];

  insights?: Insight[];

  recommendations?: Recommendation[];

  actions?: AIAction[];

  citations?: SourceReference[];

  metadata?: {
    model?: string;
    provider?: string;
    latencyMs?: number;
  };
}
```

The exact interface should follow existing project conventions.

The UI should be able to render:

```text
Message
↓
Insight
↓
Evidence
↓
Recommendation
↓
Action
```

---

# 12. AI Action System

Create an extensible action abstraction.

Example:

```ts
type AIAction =
  | {
      type: "VIEW_RESUME";
      payload: { resumeId: string };
    }
  | {
      type: "ANALYZE_JOB";
      payload: { jobId: string };
    }
  | {
      type: "CREATE_CAREER_PLAN";
      payload: {...};
    }
  | {
      type: "OPTIMIZE_RESUME";
      payload: {...};
    };
```

The frontend should render these as contextual CTA buttons.

Examples:

```text
[Analyze My Resume]

[Create Career Plan]

[Improve This Resume]

[Analyze This Job]

[Start Mock Interview]
```

Do not make the AI execute arbitrary frontend/backend commands.

Actions must come from a strict allowlist.

---

# 13. Context Composer

Create a dedicated context composition layer.

Responsibilities:

- system instructions
- candidate snapshot
- current page context
- active job context
- active resume context
- conversation summary
- recent messages
- tool results
- deterministic intelligence results

Example:

```text
System Instructions
+
Candidate Snapshot
+
Current Page Context
+
Relevant Domain Data
+
Rolling Conversation Summary
+
Last N Messages
+
Tool Results
```

Do not send unnecessary data to the model.

---

# 14. Conversation Memory

Use the existing CoachMessage persistence if already implemented.

Maintain:

```text
Full History → MongoDB

AI Context → Short Window + Rolling Summary
```

Implement:

- recent message window
- rolling summary
- context pruning
- token budget
- message pagination

Do not load an entire conversation into every model request.

Preserve complete history for the user.

---

# 15. Streaming

Keep SSE streaming for Career Coach responses.

Desired flow:

```text
Next.js
   ↓
POST/stream request
   ↓
Express
   ↓
AI Orchestrator
   ↓
Model Gateway
   ↓
Gemini/OpenAI
   ↓
SSE chunks
   ↓
Frontend incremental rendering
```

Use AbortController/cancellation where possible.

If the user closes/cancels the request:

```text
Frontend Abort
↓
Backend cancellation
↓
Provider cancellation
```

Avoid continuing expensive generation unnecessarily.

Do not claim specific TTFT numbers unless they are measured in the actual implementation.

---

# 16. Model Routing

Implement a provider/model routing abstraction.

Initial routing can be simple:

```text
Simple conversational request
→ fast model

Resume/JD analysis
→ stronger model when needed

Complex career reasoning
→ stronger model

Provider failure
→ fallback provider/model
```

Do not over-engineer model routing before the basic architecture is stable.

Use configuration rather than hard-coded provider choices.

---

# 17. Reliability

Implement:

- timeout
- retries only where safe
- exponential backoff
- provider fallback
- circuit breaker
- per-user rate limiting
- request cancellation
- structured error responses
- correlation IDs
- logging
- AI latency metrics
- token usage metrics when available

Avoid retrying non-idempotent mutations automatically.

---

# 18. Cost Protection

Every AI request should have a bounded budget.

Implement:

```text
max input tokens
max output tokens
context pruning
tool result limits
message length limits
per-user rate limits
```

Do not send unnecessary resume/JD/database content.

Track:

```text
provider
model
input tokens
output tokens
latency
success/failure
fallback used
estimated cost if available
```

Do not expose provider secrets to the frontend.

---

# 19. Frontend Architecture

Preserve the existing dual presentation model if it already exists:

```text
Floating Career Coach
        +
Full AI Career Coach Workbench
```

Use one shared state/store/hook.

For example:

```ts
useCareerCoach()
```

State may include:

```text
messages
isOpen
isStreaming
activeMode
activeJob
activeResume
pendingAction
```

Do not duplicate ChatBox logic between the floating widget and full page.

The shared component should be reused.

---

# 20. AI Career Coach Workbench

The full page should evolve into an AI career command center.

Suggested structure:

```text
┌────────────────────────────────────────────────────────────┐
│ AI Career Coach                                            │
├──────────────────────────────┬─────────────────────────────┤
│                              │ Candidate Intelligence      │
│       Conversation           │                             │
│                              │ Target Role                │
│                              │ Employability              │
│                              │ Critical Skill Gaps         │
│                              │ Resume Scores              │
│                              │ Career Plan Progress        │
│                              │                             │
│                              │ Quick Actions               │
│                              │ [Analyze Resume]            │
│                              │ [Career Plan]               │
│                              │ [Find Jobs]                 │
│                              │ [Mock Interview]            │
└──────────────────────────────┴─────────────────────────────┘
```

The telemetry panel should use real SKILLEZO data.

Do not hard-code fake metrics.

---

# 21. Security

AI tools must respect:

- authenticated user
- ownership of candidate resources
- role permissions
- company/recruiter permissions
- existing authorization middleware

Never allow:

```text
User A → AI Tool → User B data
```

Tool execution must derive user identity from authenticated server context, not from arbitrary model-generated IDs.

Never trust IDs generated by the LLM without validating ownership.

---

# 22. Observability

Add structured AI telemetry.

At minimum:

```text
requestId
userId
intent
tool calls
provider
model
latency
tokens
fallback
error
success
```

Never log:

- API keys
- passwords
- authentication secrets
- sensitive raw credentials

Avoid logging full private candidate content unless necessary for debugging and compliant with the existing application's privacy model.

---

# 23. Testing

Create tests for:

### Orchestrator

- intent routing
- context selection
- tool selection
- invalid tool handling
- fallback behavior

### Tools

- authorization
- ownership
- correct data retrieval
- missing data

### AI Provider

- success
- timeout
- 429
- 5xx
- fallback

### Context

- pruning
- summary
- token limits
- cache hit/miss
- invalidation

### Actions

- allowlisted actions
- confirmation requirement
- invalid payloads

### Streaming

- partial response
- cancellation
- provider failure

Do not remove existing tests.

Run the existing test suite before and after implementation.

---

# 24. Implementation Strategy

Implement incrementally.

## Phase 1 — Architecture Audit

Do not modify code unnecessarily.

Deliver:

- existing architecture map
- reuse map
- duplicate-risk list
- implementation plan

## Phase 2 — AI Foundation

Implement:

- AIProvider interface
- ModelGateway
- provider adapters
- structured response types
- AI configuration
- telemetry foundation

## Phase 3 — Candidate Context

Implement/evolve:

- CandidateContextSnapshot
- hydrator
- cache abstraction
- invalidation strategy

## Phase 4 — Tool Registry

Implement:

- typed tool definitions
- authorization
- tool executor
- read-only candidate tools
- Resume/Job/Career tools

## Phase 5 — Orchestrator

Implement:

- intent routing
- context selection
- tool orchestration
- model routing
- structured responses

## Phase 6 — Career Coach

Connect:

```text
Career Coach UI
→ Orchestrator
→ Tools
→ Candidate Context
→ Model Gateway
→ Streaming
```

## Phase 7 — Resume Intelligence

Connect existing:

- ATS
- Role/JD Match
- Impact & Content
- evidence intelligence

## Phase 8 — Job Intelligence

Connect:

- JD analysis
- job matching
- missing skills
- application recommendations

## Phase 9 — Career Planning

Connect:

- Skill Gap Engine
- target role
- career plans
- learning recommendations

## Phase 10 — Action System

Implement:

- structured AI actions
- approval flow
- safe mutations

## Phase 11 — Scale & Reliability

Add/evolve:

- rate limiting
- cache
- context pruning
- streaming cancellation
- fallback
- circuit breaker
- observability

## Phase 12 — UX Polish

Finish:

- floating coach
- full workbench
- telemetry
- quick actions
- evidence cards
- recommendation cards
- action CTAs

---

# 25. Important Engineering Rules

### Rule 1
Do not build a generic ChatGPT clone.

### Rule 2
The AI must use SKILLEZO intelligence.

### Rule 3
Deterministic engines remain the source of truth for scores and structured analysis.

### Rule 4
The LLM explains and reasons over verified data.

### Rule 5
Never hallucinate candidate facts.

### Rule 6
Never duplicate existing business logic.

### Rule 7
Never expose provider credentials.

### Rule 8
Never allow unrestricted AI tool execution.

### Rule 9
Never silently mutate important user data.

### Rule 10
Keep provider abstraction independent from business logic.

### Rule 11
Keep full conversation history in the database but send only relevant context to the model.

### Rule 12
Use measured performance data instead of architecture-document assumptions.

---

# 26. Definition of Done

The implementation is complete only when:

- [ ] Existing codebase has been audited.
- [ ] Existing AI functionality has been reused.
- [ ] AIProvider abstraction exists.
- [ ] ModelGateway exists.
- [ ] Gemini is accessed through the provider abstraction.
- [ ] Fallback provider architecture exists.
- [ ] Candidate Context Snapshot exists or has been properly evolved.
- [ ] Candidate context caching works.
- [ ] Tool Registry exists.
- [ ] Tools enforce authentication and ownership.
- [ ] AI Orchestrator exists.
- [ ] Orchestrator can route career/resume/job requests.
- [ ] Resume Intelligence is integrated.
- [ ] Skill Gap Engine is integrated.
- [ ] Career Plan is integrated.
- [ ] Job Intelligence is integrated.
- [ ] Structured AI responses exist.
- [ ] AI Actions are allowlisted.
- [ ] Mutating actions have explicit approval.
- [ ] Conversation memory uses pruning/summary.
- [ ] SSE streaming works.
- [ ] Request cancellation works where supported.
- [ ] Rate limiting exists.
- [ ] AI telemetry exists.
- [ ] Error/fallback handling exists.
- [ ] Existing tests remain passing.
- [ ] New tests cover critical AI infrastructure.
- [ ] No duplicate business logic was introduced.
- [ ] No fake/hard-coded candidate intelligence is used.
- [ ] Production build succeeds.
- [ ] TypeScript checks succeed.
- [ ] Existing application functionality remains intact.

---

# 27. Final Deliverables

After implementation, create/update a clear technical document in the repository:

```text
docs/ai/
  architecture.md
  orchestrator.md
  tools.md
  model-gateway.md
  candidate-context.md
  ai-actions.md
  testing.md
```

The documentation must explain the actual implemented architecture, not an idealized architecture that does not exist.

Also provide a final implementation report containing:

1. What already existed.
2. What was reused.
3. What was added.
4. What was modified.
5. New files.
6. New APIs.
7. New models/interfaces.
8. AI tools.
9. Provider/model routing.
10. Caching.
11. Streaming.
12. Security.
13. Tests executed and results.
14. Build/type-check results.
15. Remaining work.

---

# CRITICAL INSTRUCTION

Do NOT blindly implement the entire architecture in one huge rewrite.

First inspect the existing SKILLEZO implementation.

Then build on top of it incrementally.

Preserve existing working functionality.

Prefer small, composable services.

Prefer strong TypeScript types.

Prefer deterministic business logic over LLM-generated calculations.

Prefer structured AI outputs over uncontrolled text.

Prefer verified SKILLEZO data over model knowledge.

The final result should make SKILLEZO feel like:

> **A personal AI Career Intelligence system that understands the candidate, understands their resume, understands jobs, understands their skill gaps, builds career plans, and helps execute career actions — with the conversational AI acting as the interface to that intelligence.**
