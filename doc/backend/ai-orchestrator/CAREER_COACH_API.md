# SKILLEZO AI — Phase 5 Implementation Prompt
## AI Career Coach API: HTTP Boundary, Streaming, Session Context & Production-Safe Integration

**Project:** SKILLEZO AI  
**Phase:** 5  
**Scope:** AI Career Coach API / HTTP Integration Layer Only  
**Core Principle:** **SKILLEZO owns the truth; AI owns the reasoning.**

---

# 0. EXECUTION MODE

You are implementing **Phase 5 ONLY** of the SKILLEZO AI architecture.

Phase 1–4 are COMPLETE and verified.

Do NOT redesign or rewrite completed phases.

Phase 5 must consume the existing Phase 4 `AIOrchestrator` as the single internal AI coordination entry point.

Before changing code:

1. Inspect the actual existing Phase 1–4 implementation.
2. Verify all real method signatures, exports, middleware, auth context, schemas, and error classes.
3. Reuse existing infrastructure wherever possible.
4. Do not assume names/signatures from this prompt if the repository differs.
5. Do not create duplicate AI abstractions.

---

# 1. PHASE 5 OBJECTIVE

Expose the completed AI Orchestrator through a secure production-ready Career Coach API.

Target capability:

```text
Client / Career Coach UI
        │
        ▼
   HTTP API Layer
        │
        ▼
 Authentication / Authorization
        │
        ▼
 Request Validation
        │
        ▼
 Conversation / Request Context
        │
        ▼
    AI ORCHESTRATOR
        │
        ├── Intent Classification
        ├── Evidence Planning
        ├── Tool Registry
        ├── Candidate Context
        ├── Model Gateway
        └── Structured Response Validation
        │
        ▼
 API Response / Streaming Response
```

Phase 5 is an **integration boundary**, not a new intelligence layer.

The API must not independently reason about careers, scores, skills, jobs, or candidate state.

---

# 2. EXISTING ARCHITECTURE TO PRESERVE

The completed architecture is:

```text
Phase 1
Model Gateway
      ↓
Phase 2
Evidence Layer + Candidate Context
      ↓
Phase 3
Controlled Tool Registry
      ↓
Phase 4
AI Orchestrator
      ↓
Phase 5
Career Coach API
```

Phase 5 must preserve:

```text
SKILLEZO owns the truth
AI owns the reasoning
API owns transport
```

The API is responsible for:

- authentication
- authorization
- request validation
- request IDs
- conversation context boundaries
- cancellation/disconnect handling
- response transport
- error mapping
- rate limiting if existing infrastructure supports it
- observability

The API is NOT responsible for:

- selecting deterministic metrics
- querying MongoDB directly
- calling Gemini/OpenAI directly
- deciding candidate identity from request body
- modifying candidate data
- calculating career scores
- implementing agent loops

---

# 3. STRICT PHASE 5 BOUNDARIES

## Allowed

- HTTP route/controller
- request/response DTOs
- Zod request validation
- authentication middleware integration
- authorization checks
- request ID / correlation ID
- AI Orchestrator invocation
- conversation context passing
- streaming transport if supported by the existing stack
- cancellation using AbortSignal
- API error mapping
- rate-limit integration if already available
- API telemetry / request logging
- integration/unit tests

## Forbidden

- ❌ Direct Mongoose model access from API/controller
- ❌ Direct database queries
- ❌ Direct Gemini SDK imports
- ❌ Direct OpenAI SDK imports
- ❌ Bypassing Tool Registry
- ❌ Calling deterministic engines directly from the controller
- ❌ Candidate `userId` supplied by client
- ❌ LLM-controlled identity
- ❌ Database mutations
- ❌ Auto-apply
- ❌ Career-plan execution
- ❌ Autonomous agent loops
- ❌ New AI reasoning engine
- ❌ New evidence engine
- ❌ New model provider abstraction
- ❌ Reimplementation of Phase 4 orchestration
- ❌ Frontend/UI implementation
- ❌ Phase 6 work
- ❌ Git push

---

# 4. AUTHENTICATION & IDENTITY SECURITY

Candidate identity MUST come exclusively from authenticated server context.

Never trust:

```json
{
  "userId": "..."
}
```

from the request body.

Correct flow:

```text
HTTP Request
    ↓
Better Auth / Existing Auth Middleware
    ↓
Authenticated User
    ↓
context.userId
    ↓
AIOrchestrator
```

The controller must construct:

```ts
const orchestrationContext = {
  userId: req.user.id,
  userRole: req.user.role,
  requestId,
  signal,
};
```

If the existing authentication implementation uses a different request property, inspect and reuse it.

Client-provided identity fields must either:

- be rejected by strict Zod validation, or
- be ignored before orchestration.

Prefer rejecting unauthorized fields where practical.

Add tests proving:

1. authenticated user can invoke the API;
2. unauthenticated request is rejected;
3. client cannot override `userId`;
4. client cannot invoke another candidate's context;
5. authenticated identity reaches the Orchestrator unchanged.

---

# 5. API ENDPOINT

Implement the Career Coach endpoint using the repository's existing route/controller conventions.

Target conceptual endpoint:

```text
POST /api/ai/coach/chat
```

Do not assume this exact mount path if the existing server routing architecture uses a prefix.

Inspect existing routes and follow the established convention.

Request:

```ts
{
  message: string;
  targetRole?: string;
  conversationContext?: ConversationMessage[];
}
```

Do NOT accept:

```ts
userId
candidateId
roleId
companyId
evidence
metrics
scores
toolResults
systemPrompt
```

from the client as authoritative orchestration inputs.

---

# 6. REQUEST VALIDATION

Create a strict Zod request schema.

Example shape:

```ts
const CareerCoachRequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  targetRole: z.string().trim().min(1).max(200).optional(),
  conversationContext: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().trim().min(1).max(4000),
    }).strict()
  ).max(20).default([]),
}).strict();
```

Adjust limits only after inspecting existing project conventions.

Security requirements:

- reject unknown fields where appropriate;
- bound message length;
- bound conversation history;
- prevent arbitrary system messages;
- prevent client-controlled tool calls;
- prevent client-controlled evidence;
- prevent client-controlled metrics.

Conversation history is contextual input, not verified evidence.

---

# 7. CONVERSATION CONTEXT

Phase 5 may pass recent conversation context to Phase 4.

However:

```text
Conversation Context ≠ Deterministic Evidence
```

The model must never treat previous assistant text as verified candidate truth.

Use clear separation:

```text
User Message
+
Conversation Context
+
Verified Candidate Evidence
```

The Orchestrator remains responsible for constructing the verified reasoning context.

Do not let raw conversation history overwrite:

- scores
- skills
- resume data
- employability metrics
- job matches
- evidence IDs
- candidate identity

Limit conversation history to a bounded number of messages.

If the project already has a conversation abstraction, inspect and reuse it.

Do not introduce a persistent chat database in Phase 5 unless one already exists and is required by the current architecture.

---

# 8. AI ORCHESTRATOR INTEGRATION

The API must call the existing Phase 4 orchestrator.

Conceptually:

```ts
const result = await aiOrchestrator.orchestrate({
  message: validated.message,
  targetRole: validated.targetRole,
  conversationContext: validated.conversationContext,
}, {
  userId: req.user.id,
  userRole: req.user.role,
  requestId,
  signal: abortController.signal,
});
```

Use the actual Phase 4 interface discovered in the repository.

Do NOT create:

```text
CareerCoachService
AIChatService
NewAIOrchestrator
GeminiCareerService
```

if they duplicate Phase 4 responsibilities.

A thin controller/service adapter is acceptable only when needed by the existing architecture.

---

# 9. REQUEST ID / CORRELATION

Every API request must have a request ID.

Preferred order:

```text
Existing trusted request ID
        ↓
otherwise generate server-side ID
```

Never trust arbitrary client-provided correlation IDs for identity/security.

The same request ID must flow into:

```text
HTTP API
→ AI Orchestrator
→ Tool Registry
→ Model Gateway telemetry
```

if the existing implementations support it.

Do not leak secrets or sensitive candidate data into request logs.

---

# 10. CANCELLATION / CLIENT DISCONNECT

The API must connect request cancellation to the Orchestrator's existing `AbortSignal`.

Conceptually:

```text
Client disconnect
      ↓
AbortController.abort()
      ↓
AIOrchestrator
      ↓
Tool execution / Model Gateway
      ↓
Graceful cancellation
```

Inspect the existing Express/server framework behavior and implement cancellation according to the actual runtime.

Requirements:

- do not leave abandoned model requests running unnecessarily;
- do not write candidate data after cancellation;
- do not convert cancellation into a misleading successful response;
- avoid noisy error logging for expected client disconnects.

Add tests where practical.

---

# 11. RESPONSE CONTRACT

The non-streaming endpoint should return the validated Phase 4 orchestration result through a stable API envelope.

Preferred conceptual shape:

```ts
{
  requestId: string;
  data: AIOrchestrationResult;
}
```

Do not mutate the semantic contents of the Phase 4 result.

The API should not:

- invent metrics;
- modify scores;
- add evidence;
- fabricate recommendations;
- rewrite AI reasoning.

If the existing API convention already uses another response envelope, follow that convention.

---

# 12. HTTP ERROR MAPPING

Create a deterministic mapping from internal errors to safe HTTP responses.

Conceptual mapping:

```text
Validation error
→ 400

Authentication failure
→ 401

Authorization failure
→ 403

Missing required career input
→ 400

Unsupported/out-of-scope request
→ 200/400 according to existing API semantics

AI provider temporary failure
→ 502/503

Request cancelled
→ appropriate disconnect/cancellation handling

Unexpected internal error
→ 500
```

Do not expose:

- stack traces
- API keys
- provider internals
- database details
- raw exception messages containing secrets
- internal tool parameters

Log internal diagnostics server-side using the existing logging system.

Use the repository's established error-handling conventions where available.

---

# 13. UNKNOWN / OUT-OF-SCOPE REQUESTS

Do not turn unsupported requests into arbitrary AI conversations.

Phase 4 already contains:

```text
UNKNOWN
```

The API should simply return the Orchestrator's validated result.

Do not create a second scope classifier at the HTTP layer.

---

# 14. STREAMING

If the existing Phase 1 Model Gateway and Phase 4 contracts support a safe streaming path, implement streaming transport in Phase 5.

Preferred conceptual flow:

```text
POST /api/ai/coach/chat
        ↓
Auth
        ↓
Validation
        ↓
Orchestrator
        ↓
Model Gateway
        ↓
Streaming Transport
        ↓
Client
```

However:

**Do not invent a streaming architecture that bypasses Phase 4.**

Before implementing streaming:

1. inspect the actual Phase 4 result contract;
2. inspect ModelGateway streaming capabilities;
3. determine whether the current Orchestrator can safely expose incremental output;
4. preserve structured response validation;
5. preserve evidence/metric integrity.

If streaming would require redesigning Phase 4, do NOT silently redesign it.

Implement the safest API integration supported by the current architecture and document the limitation.

If streaming is implemented, use the project's existing preferred transport (for example SSE) rather than introducing a second transport style.

---

# 15. RATE LIMITING / ABUSE PROTECTION

Inspect whether the server already has:

- rate limiter
- request throttling
- API quotas
- IP protection
- user-level throttling

Reuse existing infrastructure.

If no infrastructure exists, Phase 5 may add a minimal AI endpoint-specific rate-limit boundary only if it fits the project's existing architecture.

Do not build a large quota/billing system in Phase 5.

Rate limiting should protect:

```text
AI provider cost
API abuse
accidental request loops
```

Do not use candidate data as a rate-limit key unless already supported by the authenticated user identity.

---

# 16. SECURITY AGAINST PROMPT INJECTION

The API must treat all user-controlled text as untrusted:

```text
message
conversationContext
targetRole
```

Never allow client content to become:

- system prompt;
- tool definition;
- tool execution instruction;
- evidence;
- deterministic metric;
- identity context.

The Phase 4 reasoning prompt remains authoritative.

The HTTP layer must not provide a mechanism for the user to override:

```text
system instructions
tool allowlist
evidence authority
identity
metric validation
```

---

# 17. FILE STRUCTURE

Inspect the existing project conventions first.

A possible structure is:

```text
server/src/
├── routes/
│   └── ai/
│       └── career-coach.routes.ts
│
├── controllers/
│   └── ai/
│       └── career-coach.controller.ts
│
└── core/
    └── ai/
        ├── orchestrator/        # Phase 4 — EXISTING
        ├── api/                 # Phase 5
        │   ├── career-coach.schemas.ts
        │   ├── career-coach.service.ts   # only if actually needed
        │   ├── career-coach.errors.ts
        │   └── index.ts
        └── ...
```

Do not blindly create all directories above.

Follow the existing server architecture.

---

# 18. TESTING REQUIREMENTS

Create a dedicated Phase 5 API test suite.

At minimum cover:

### Authentication

- authenticated request succeeds;
- unauthenticated request rejected;
- identity comes from authenticated context.

### Request Validation

- empty message rejected;
- oversized message rejected;
- oversized conversation context rejected;
- unknown request fields rejected;
- `userId` injection rejected;
- `candidateId` injection rejected;
- fake evidence injection rejected;
- fake metrics injection rejected;
- system-prompt injection field rejected.

### Orchestrator Integration

- API invokes Phase 4 Orchestrator;
- correct `message` passed;
- correct `targetRole` passed;
- conversation context passed;
- authenticated `userId` passed;
- request ID passed;
- AbortSignal passed.

### Response

- valid Orchestrator result returned unchanged;
- request ID included;
- deterministic metrics preserved;
- evidence IDs preserved.

### Error Mapping

- validation → correct HTTP error;
- auth → correct HTTP error;
- missing required input → correct error;
- provider failure → safe error;
- unexpected error → safe 500;
- no internal stack trace leakage.

### Cancellation

- aborted request propagates cancellation;
- no misleading success after cancellation.

### Security

- client cannot override identity;
- client cannot bypass Orchestrator;
- client cannot invoke tools directly;
- client cannot inject evidence;
- client cannot inject deterministic metrics.

### Streaming (only if implemented)

- stream starts correctly;
- cancellation works;
- malformed/invalid final structured output is rejected;
- no fabricated metrics/evidence are streamed as trusted facts.

Target: meaningful Phase 5 coverage, not an arbitrary test count.

---

# 19. INTEGRATION TEST BOUNDARIES

Mock these boundaries where appropriate:

```text
Better Auth / auth middleware
AIOrchestrator
Model Gateway
```

Do NOT mock away the actual API validation/security behavior being tested.

Tests should prove:

```text
HTTP
→ Auth
→ Validation
→ Orchestrator
→ Response
```

without invoking real external LLM providers.

No real Gemini/OpenAI API calls in unit/integration tests unless the repository already has a clearly isolated opt-in integration-test system.

---

# 20. OBSERVABILITY

API telemetry should include safe metadata such as:

```text
requestId
endpoint
authenticated user context identifier where already permitted by logging policy
intent (if available after orchestration)
durationMs
statusCode
success/failure
cancellation
```

Never log:

```text
API keys
authorization headers
raw tokens
full candidate resume
full conversation history
private profile fields
provider secrets
raw database documents
```

Respect existing logging/redaction infrastructure.

---

# 21. PERFORMANCE

Avoid unnecessary work in the API layer.

Do not:

- duplicate Candidate Context loading;
- duplicate evidence collection;
- duplicate deterministic calculations;
- perform direct DB lookups;
- call the Orchestrator more than once per request;
- serialize huge conversation histories.

The Orchestrator remains responsible for evidence/context efficiency.

The API should remain a thin transport boundary.

---

# 22. IDEMPOTENCY / REQUEST DUPLICATION

Phase 5 currently performs no candidate mutations.

Therefore the API does not need a complex mutation idempotency system.

However:

- avoid accidental double orchestration;
- ensure a request is not automatically retried at the controller level in a way that doubles provider cost;
- do not retry LLM calls outside the existing Model Gateway retry/failover behavior.

---

# 23. PROPOSED CAREER PLAN SAFETY

`CAREER_PLAN` remains proposal-only.

The API must NOT:

```text
save career plan
apply career plan
create application
modify resume
modify profile
submit job application
```

The Phase 4 result may contain a proposal, but Phase 5 only transports it.

Future user approval/action workflows belong to later phases.

---

# 24. PHASE 4 INTEGRATION INVARIANTS

After Phase 5:

```text
HTTP API
    ↓
AIOrchestrator
    ↓
ToolRegistry
    ↓
Deterministic Engines
    ↓
Verified Evidence
    ↓
ModelGateway
```

must remain intact.

Never create:

```text
HTTP API
    ↓
Gemini
```

or:

```text
HTTP API
    ↓
MongoDB
```

or:

```text
HTTP API
    ↓
Deterministic Engine
```

as alternative paths.

---

# 25. VERIFICATION COMMANDS

After implementation run actual commands appropriate to the repository:

```bash
cd server
npm run type-check
npm test
npm run build

cd ../client
npx tsc --noEmit
npm run build
```

If the project uses different scripts, inspect `package.json` and use the actual project commands.

Report:

- Phase 5 test count
- full server test count
- passed/failed suites
- server typecheck
- client typecheck
- server build
- client build
- any warnings
- any known limitations

Do not invent expected test counts.

Do not claim success without running the commands.

---

# 26. REGRESSION REQUIREMENT

Phase 1–4 behavior must remain intact.

The final regression suite must demonstrate that:

```text
Phase 1
Model Gateway
→ PASS

Phase 2
Evidence + Context
→ PASS

Phase 3
Tool Registry
→ PASS

Phase 4
AI Orchestrator
→ PASS

Phase 5
Career Coach API
→ PASS
```

No previously passing tests should be silently removed or weakened.

Do not modify existing tests merely to make failures disappear.

---

# 27. DOCUMENTATION / TRACKER

After implementation:

Update only the relevant tracker documentation:

```text
tracker/STATUS_DASHBOARD.md
tracker/COMPLETED_LOG.md
tracker/DELIVERABLES_ROADMAP_MVP.md
```

Record:

- Phase 5 completion
- actual test results
- build/typecheck results
- API endpoint
- security boundaries
- streaming status
- known limitations

Do not claim Phase 6 completion.

---

# 28. FINAL SUCCESS CRITERIA

Phase 5 is complete only when:

- [ ] Career Coach API endpoint exists according to project routing conventions.
- [ ] Authentication is enforced.
- [ ] Candidate identity comes exclusively from authenticated context.
- [ ] Request validation is strict and bounded.
- [ ] Client cannot inject userId/candidateId/evidence/metrics/tools.
- [ ] Phase 4 AIOrchestrator is the sole intelligence entry point.
- [ ] No direct DB access exists in API/controller.
- [ ] No direct Gemini/OpenAI SDK access exists in API/controller.
- [ ] Conversation context is bounded and treated as unverified context.
- [ ] Request cancellation reaches the Orchestrator.
- [ ] Response contract is stable.
- [ ] Errors are mapped safely.
- [ ] No sensitive information leaks through API errors/logs.
- [ ] Rate limiting is reused/implemented appropriately if required.
- [ ] Streaming is implemented only if compatible with the existing architecture.
- [ ] Career plan remains proposal-only.
- [ ] Phase 1–4 regression tests remain green.
- [ ] Phase 5 tests pass.
- [ ] Server typecheck passes.
- [ ] Client typecheck passes.
- [ ] Server build passes.
- [ ] Client build passes.
- [ ] Actual empirical results are reported.
- [ ] No git push.

---

# 29. STOP CONDITION

When Phase 5 is implemented and fully verified:

**STOP.**

Do not automatically start:

```text
Phase 6 — Career Coach UI / AI Workbench
```

Do not implement:

- frontend chat UI
- widgets
- AI workbench
- resume editor integration
- job application UI
- auto-apply
- action approval UI

Those belong to later phases.

Do not run:

```bash
git push
```

without explicit user confirmation.

---

# 30. FINAL ARCHITECTURAL TARGET

After Phase 5 the production architecture should be:

```text
                         SKILLEZO AI
                              │
                              ▼
                    ┌──────────────────┐
                    │  CAREER COACH API│
                    │   PHASE 5       │
                    └────────┬─────────┘
                             │
                       Authenticated
                           Context
                             │
                             ▼
                    ┌──────────────────┐
                    │ AI ORCHESTRATOR  │
                    │    PHASE 4       │
                    └────────┬─────────┘
                             │
                    ┌────────▼────────┐
                    │  TOOL REGISTRY  │
                    │    PHASE 3      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ VERIFIED        │
                    │ EVIDENCE        │
                    │ + CONTEXT       │
                    │    PHASE 2      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ MODEL GATEWAY   │
                    │    PHASE 1      │
                    └────────┬────────┘
                             │
                       Gemini / OpenAI
                             │
                             ▼
                  Validated Career Coach
                         Response
```

**Implement Phase 5 only.**

**Inspect the existing code first.**

**Reuse Phases 1–4.**

**Do not redesign completed architecture.**

**Do not start Phase 6.**

**Do not git push.**
