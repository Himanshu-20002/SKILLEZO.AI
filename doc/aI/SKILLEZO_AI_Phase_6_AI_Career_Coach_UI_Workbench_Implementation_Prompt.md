# SKILLEZO AI — Phase 6
# AI Career Coach UI / Intelligence Workbench
## Implementation Prompt for Antigravity IDE

## 1. Role

Implement **Phase 6 of the SKILLEZO AI architecture** inside the existing codebase.

Phase 6 is a **frontend integration and UX phase**. Build the production-quality AI Career Coach / Career Intelligence Workbench that consumes the completed Phase 5 API.

Core architecture:

> **SKILLEZO owns the truth. AI owns the reasoning. API owns the transport. UI owns presentation and user interaction.**

Do not redesign Phases 1–5.

Do not create new AI providers, deterministic engines, tools, database access, or mutation systems.

---

## 2. Current Architecture

Treat these phases as complete and stable:

```text
Phase 1 → Model Gateway & Provider Abstraction        ✅
Phase 2 → Evidence Layer & Candidate Context         ✅
Phase 3 → Controlled Tool Registry                   ✅
Phase 4 → AI Orchestrator                            ✅
Phase 5 → Career Coach API                           ✅
Phase 6 → AI Career Coach UI / Workbench              🚧 CURRENT
Phase 7 → Action System                              ⏳ FUTURE
Phase 8 → Scale & Production Hardening               ⏳ FUTURE
```

The frontend must consume:

```text
POST /api/ai/coach/chat
```

Do not create an alternate AI endpoint.

---

## 3. Phase 6 Objective

Build a Career Coach experience that feels like a **career intelligence workbench**, not a generic ChatGPT clone.

It should combine:

```text
Conversation
+
Career Intelligence
+
Verified Evidence
+
Insights
+
Recommendations
```

Conceptual flow:

```text
User
 ↓
Career Coach UI
 ↓
Frontend API Client
 ↓
POST /api/ai/coach/chat
 ↓
Phase 5 API
 ↓
Phase 4 Orchestrator
 ↓
Validated Structured Response
 ↓
Career Coach UI
```

The UI should make the distinction between deterministic evidence and AI reasoning obvious.

---

## 4. First Step — Inspect Before Implementing

Before writing code, inspect the existing frontend thoroughly.

Identify:

1. Application shell/layout.
2. Dashboard layout and navigation.
3. Existing design system.
4. Existing buttons, inputs, cards, dialogs, tabs, drawers, accordions.
5. Typography, spacing, colors, themes and dark mode.
6. Responsive breakpoints.
7. Authentication/session handling.
8. Existing API/fetch client.
9. Error/toast system.
10. Loading/skeleton components.
11. State management.
12. Existing Resume Studio UI.
13. Job/Matching UI.
14. Career Plan UI.
15. Existing score/metric components.
16. Existing markdown/rich-text renderer.
17. Existing route conventions.
18. Existing testing conventions.

Reuse existing infrastructure. Do not create duplicate primitives or introduce a new UI framework/state library without a genuine architectural reason.

---

## 5. Strict Phase Boundary

Phase 6 owns:

```text
Frontend UI
UX
Chat experience
API integration
SSE lifecycle rendering
Conversation state
Structured response rendering
Evidence presentation
Metrics presentation
Insights
Recommendations
Loading/error/retry/cancel
Responsive behavior
Accessibility
```

Phase 6 does NOT own:

```text
Database
Mongoose models
Deterministic engines
Tool Registry
AI Orchestrator
Model Gateway
Provider SDKs
LLM calls
AI mutations
Career-plan writes
Resume writes
Profile writes
Job-application writes
Autonomous actions
```

If something requires those capabilities, use the Phase 5 API or mark it for Phase 7.

---

## 6. Career Coach Workbench

Create a dedicated Career Coach route following existing application conventions. Do not blindly invent a route if one already exists.

Conceptual desktop structure:

```text
┌─────────────────────────────────────────────────────────────┐
│ SKILLEZO                         AI Career Coach             │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│     CONVERSATION         │       CAREER INTELLIGENCE        │
│                          │                                  │
│  User message            │  Metrics                         │
│  AI response             │  ATS / Match / Skills            │
│                          │                                  │
│                          │  Insights                        │
│                          │                                  │
│                          │  Evidence                        │
│                          │                                  │
│                          │  Recommendations                 │
├──────────────────────────┴──────────────────────────────────┤
│ Ask SKILLEZO...                                  [Send]     │
└─────────────────────────────────────────────────────────────┘
```

Follow the existing SKILLEZO visual language rather than reproducing this literally.

---

## 7. Chat Experience

Implement:

### User messages
- message content
- timestamp only if consistent with existing UI
- accessible user styling

### AI messages
Render only fields actually returned by the validated backend response:

```text
answer
metrics
insights
recommendations
evidence
limitations
```

Do not guess or fabricate response fields.

---

## 8. Message Composer

Implement:

- textarea/input
- send
- Enter to send
- Shift+Enter for newline
- empty-message prevention
- max length according to Phase 5 contract
- loading state
- cancel while active
- accessible labels
- keyboard navigation

Never send client-authoritative identity.

Do not send arbitrary:

```text
userId
candidateId
provider
model
tool permissions
internal evidence
```

unless explicitly required by the actual Phase 5 contract. Identity remains server-side.

---

## 9. Target Role

If Phase 5 supports `targetRole`, expose an appropriate UI.

Requirements:

- reuse existing role selector where available
- trim/sanitize input
- respect backend validation
- do not create conflicting frontend role normalization
- clearly show active target role
- changing it affects the next request
- do not persist target-role changes in Phase 6

---

## 10. Phase 5 API Integration

Inspect the actual Phase 5 schema before implementation.

Use:

```text
POST /api/ai/coach/chat
```

Do not call:

```text
Gemini
OpenAI
Model Gateway
Orchestrator
Tool Registry
```

directly from the browser.

No provider API keys or server secrets may be exposed to client code.

Reuse the existing frontend API client if one exists.

---

## 11. Request Contract

The conceptual request is:

```ts
{
  messages: [
    {
      role: "user" | "assistant",
      content: string
    }
  ],
  targetRole?: string,
  stream?: boolean
}
```

Use the **actual Phase 5 contract in the repository** if it differs.

Keep conversation history bounded according to the backend contract.

Do not send internal implementation data.

---

## 12. Response Contract

Inspect the actual Phase 5 response schema/type before writing renderers.

Do not guess.

Create or reuse strongly typed frontend DTOs.

Avoid:

```ts
any
```

and avoid unsafe casts merely to silence TypeScript.

If runtime validation is already used in the project, validate API data before rendering.

---

## 13. SSE Lifecycle

Phase 5 intentionally uses **lifecycle SSE**, not token streaming.

Support the lifecycle:

```text
thinking
    ↓
executing_tools
    ↓
synthesizing
    ↓
result
    ↓
completed
```

Display meaningful progress such as:

```text
Thinking
Analyzing your career context...

Executing analysis
Checking your skills and resume...

Synthesizing
Building your career recommendation...

Complete
```

Do NOT implement fake token streaming.

Do NOT display intermediate unvalidated facts as the final answer.

The trusted result appears only after the validated `result` event.

---

## 14. SSE Client

Use browser-compatible APIs appropriate to the existing project.

Support:

- connection start
- event parsing
- lifecycle state
- final result
- completion
- malformed events
- network failure
- auth failure
- server failure
- cancellation

Use `AbortController`.

On cancellation:

```text
AbortController.abort()
```

Then:

1. mark request cancelled
2. remove incomplete assistant state
3. keep the user's message
4. allow another request

Do not treat cancellation as a successful response.

---

## 15. JSON Transport

If Phase 5 supports:

```text
stream: false
```

support JSON mode through the same API abstraction.

Use it for fallback/retry/testing where appropriate.

Do not duplicate the entire request pipeline.

---

## 16. Request State Machine

Use an explicit state model, for example:

```ts
type CoachRequestState =
  | "idle"
  | "thinking"
  | "executing_tools"
  | "synthesizing"
  | "success"
  | "error"
  | "cancelled";
```

Keep state transitions predictable.

Avoid contradictory independent flags unless truly necessary.

---

## 17. Error Handling

Handle at minimum:

```text
400 → invalid request
401 → authentication required
403 → access denied
429 → rate limit
503 → AI service unavailable
504 → AI timeout
network failure
SSE parse failure
unknown server error
```

Use the actual Phase 5 error contract.

Never expose:

```text
stack traces
provider errors
API keys
internal prompts
tool internals
database details
server paths
```

Use existing error/toast components.

User-facing examples:

```text
Your request could not be processed.
Please try again.

SKILLEZO is temporarily busy.
Please try again in a moment.

Your session may have expired.
Please sign in again.
```

---

## 18. Retry

Provide retry for recoverable failures.

Retry must:

- preserve the original user message
- avoid duplicate assistant responses
- use a fresh request
- respect rate limits
- preserve target role
- preserve valid conversation state

Do not retry indefinitely.

One explicit user-triggered retry is sufficient unless existing architecture specifies otherwise.

---

## 19. Metrics

Create/reuse metric presentation components.

Possible metrics:

```text
ATS Compatibility
Role & JD Match
Skill Coverage
Employability
Career Readiness
```

Only display metrics supplied by the API.

Do not calculate new scores in the frontend.

Do not reinterpret deterministic metrics.

Where evidence IDs/status are supplied, make supporting evidence inspectable.

Example:

```text
ATS Compatibility
82 / 100
Verified
```

---

## 20. Evidence

Evidence is a major SKILLEZO differentiator.

Create a reusable evidence presentation component.

Conceptual:

```text
Verified Evidence

ATS Compatibility: 82

Source:
Resume Intelligence

Evidence ID:
ev_resumeAts_...

Status:
Verified
```

Use the actual fields from the response.

Clearly distinguish:

```text
Verified deterministic evidence
```

from:

```text
AI reasoning / interpretation
```

Never imply that AI-generated reasoning itself is deterministic evidence.

---

## 21. Insights

Insights represent AI reasoning over verified evidence.

Visually distinguish:

```text
FACT / EVIDENCE
```

from:

```text
AI INSIGHT
```

Use only backend-provided semantics such as:

- title
- explanation
- severity/priority if actually supplied
- supporting evidence IDs if supplied

Do not invent severity/priority systems.

---

## 22. Recommendations

Render structured recommendations.

Conceptual:

```text
Recommendation

Improve TypeScript evidence

Explanation...

Based on:
• Skill Gap Engine
• Resume Intelligence
```

Phase 6 recommendations are presentation-only.

Do not implement mutation execution.

Buttons may navigate to existing pages only, for example:

```text
View Resume
Explore Jobs
View Career Plan
```

If an action-like object is returned, treat it as a proposal.

Phase 7 owns action execution.

---

## 23. Limitations

If limitations are returned, display them clearly.

Example:

```text
Limitations

Some recommendations may be limited because
your active resume does not contain enough evidence.
```

Do not hide limitations.

They are part of the SKILLEZO trust model.

---

## 24. Empty State

Create a useful first-use experience.

Suggested prompts:

```text
Improve my resume
What skills am I missing?
Am I ready for this role?
Why is my ATS score low?
What should I learn next?
How can I improve my employability?
```

These are only UI shortcuts. They must use the normal API request path.

---

## 25. Conversation State

Maintain conversation state according to existing project architecture.

Respect the Phase 5 maximum conversation size.

Do not persist sensitive conversation data into arbitrary browser storage unless existing architecture already does so.

Prefer feature-local in-memory state if no existing persistence exists.

If existing persistence exists, integrate without redesigning its backend.

---

## 26. Responsive Design

Desktop:

```text
Conversation + Intelligence panel
```

Tablet:

```text
Adaptive two-column layout
```

Mobile:

```text
Conversation-first
Intelligence via tabs/drawer/accordion
```

Use existing responsive patterns.

No horizontal overflow.

Composer must remain usable on small screens.

---

## 27. Accessibility

Implement:

- semantic buttons
- labels
- keyboard navigation
- visible focus
- accessible status updates
- `aria-live` where appropriate
- screen-reader-friendly loading state
- accessible errors
- sufficient contrast
- no information conveyed by color alone

SSE progress should be announced without excessive repeated announcements.

---

## 28. Performance

Do not degrade the existing dashboard.

Consider:

- lazy-loading heavy workbench components
- avoiding unnecessary global state
- preventing full conversation rerenders on every lifecycle event
- memoizing expensive renderers where justified
- avoiding unnecessary dependencies
- keeping server-only packages out of the browser
- cleaning up SSE/fetch/event listeners/timers on unmount

Respect `prefers-reduced-motion`.

Do not add heavy animations unnecessarily.

---

## 29. Security

Never expose:

```text
GEMINI_API_KEY
OPENAI_API_KEY
provider configuration
database credentials
internal prompts
tool internals
server secrets
```

Never treat client-supplied identity as authoritative.

Never allow the frontend to choose arbitrary tools.

Never invoke deterministic engines directly from the browser.

---

## 30. Component Architecture

Use the existing architecture. Conceptually:

```text
CareerCoachPage
│
├── CareerCoachHeader
├── CareerCoachWorkbench
│   ├── ConversationPanel
│   │   ├── ConversationHeader
│   │   ├── EmptyState
│   │   ├── MessageList
│   │   │   ├── UserMessage
│   │   │   └── AssistantMessage
│   │   │       ├── Answer
│   │   │       ├── Metrics
│   │   │       ├── Insights
│   │   │       ├── Recommendations
│   │   │       ├── Evidence
│   │   │       └── Limitations
│   │   └── MessageComposer
│   └── IntelligencePanel
│       ├── TargetRole
│       ├── MetricsSummary
│       ├── InsightsSummary
│       └── EvidenceSummary
└── RequestStatus
```

This is conceptual. Adapt it to the actual repository.

---

## 31. Data Flow Invariant

The final flow must remain:

```text
USER
 ↓
CAREER COACH UI
 ↓
FRONTEND API CLIENT
 ↓
POST /api/ai/coach/chat
 ↓
PHASE 5 API
 ↓
PHASE 4 ORCHESTRATOR
 ↓
CONTROLLED TOOL REGISTRY
 ↓
DETERMINISTIC ENGINES
 ↓
EVIDENCE LAYER
 ↓
MODEL GATEWAY
 ↓
VALIDATED STRUCTURED RESPONSE
 ↓
PHASE 5 API
 ↓
CAREER COACH UI
 ↓
USER
```

The frontend must never bypass the API boundary.

---

## 32. Phase 7 Boundary

Do NOT implement:

```text
resume mutation
profile mutation
career-plan creation
job application submission
auto-apply
autonomous actions
database writes triggered by AI
```

The intended future flow is:

```text
AI Recommendation
 ↓
Proposal
 ↓
User Approval
 ↓
Phase 7 Action System
 ↓
Safe Mutation
```

Phase 6 stops before the mutation boundary.

---

## 33. Analytics

Only integrate analytics if an established analytics system already exists.

Potential events:

```text
career_coach_opened
career_coach_message_sent
career_coach_response_received
career_coach_request_cancelled
career_coach_error
career_coach_recommendation_viewed
career_coach_evidence_expanded
```

Do not introduce a new analytics vendor solely for Phase 6.

Do not log full messages, AI responses, resume contents, or sensitive career information unless existing privacy architecture explicitly permits it.

---

## 34. Testing

Use the existing frontend testing framework.

Cover:

### Rendering
- empty state
- user message
- assistant response
- metrics
- insights
- evidence
- recommendations
- limitations

### Composer
- empty submission blocked
- valid submission
- Enter behavior
- Shift+Enter newline
- loading state
- cancel state

### API
- correct endpoint
- correct payload
- no userId injection
- authentication handling
- error handling

### SSE
- thinking
- executing_tools
- synthesizing
- result
- completed
- malformed event
- network failure
- cancellation

### Retry
- retry works
- no duplicate assistant messages

### Security
- no provider SDK imports
- no DB/model imports
- no Tool Registry imports
- no Model Gateway imports
- no client API keys

### Accessibility
- accessible composer
- accessible buttons
- lifecycle announcements

---

## 35. Static Architecture Checks

After implementation search frontend code for:

```text
GEMINI_API_KEY
OPENAI_API_KEY
process.env.*KEY
mongoose
@google/generative-ai
openai
ToolRegistry
ModelGateway
AIProvider
```

Inspect any matches and ensure Phase 6 did not introduce prohibited direct access.

---

## 36. Backend Protection

Do not modify Phases 1–5 unless a genuine integration incompatibility is discovered.

Before changing backend code:

1. inspect the existing Phase 5 contract
2. determine whether frontend adaptation is sufficient
3. only change backend if objectively necessary
4. keep any change minimal
5. do not redesign Phase 5

---

## 37. Implementation Order

Follow this sequence:

```text
STEP 1
Inspect frontend architecture

↓

STEP 2
Inspect Phase 5 API request/response contract

↓

STEP 3
Identify reusable UI/API/state primitives

↓

STEP 4
Create frontend API types/client integration

↓

STEP 5
Create request state machine

↓

STEP 6
Create Career Coach page/workbench shell

↓

STEP 7
Create conversation/message UI

↓

STEP 8
Implement SSE lifecycle handling

↓

STEP 9
Implement structured AI response renderer

↓

STEP 10
Implement metrics

↓

STEP 11
Implement evidence

↓

STEP 12
Implement insights/recommendations/limitations

↓

STEP 13
Implement target-role UX

↓

STEP 14
Implement loading/error/retry/cancel

↓

STEP 15
Responsive/mobile behavior

↓

STEP 16
Accessibility

↓

STEP 17
Tests

↓

STEP 18
Typecheck/build/static security audit
```

---

## 38. Acceptance Criteria

### UI

- [ ] Career Coach accessible through existing routing/navigation.
- [ ] Existing SKILLEZO design language followed.
- [ ] Desktop works.
- [ ] Tablet works.
- [ ] Mobile works.
- [ ] Empty state works.
- [ ] Conversation works.
- [ ] Composer works.

### API

- [ ] Uses `/api/ai/coach/chat`.
- [ ] Uses actual Phase 5 contract.
- [ ] No direct provider calls.
- [ ] No secrets exposed.
- [ ] No client-authoritative identity.

### SSE

- [ ] Lifecycle events render correctly.
- [ ] No fake token streaming.
- [ ] Final answer appears only after validated result.
- [ ] Cancellation works.
- [ ] Malformed events handled.
- [ ] Network failures handled.

### Intelligence

- [ ] Metrics render from API.
- [ ] Evidence renders from API.
- [ ] Insights render from API.
- [ ] Recommendations render from API.
- [ ] Limitations render from API.
- [ ] Evidence is visually distinct from AI reasoning.

### Safety

- [ ] No frontend DB access.
- [ ] No provider SDK.
- [ ] No direct orchestrator/tool access.
- [ ] No mutations.
- [ ] No autonomous actions.
- [ ] Phase 7 boundary preserved.

### Quality

- [ ] TypeScript passes.
- [ ] Existing tests pass.
- [ ] New Phase 6 tests pass.
- [ ] Production build passes.
- [ ] No unnecessary dependencies.
- [ ] No existing functionality regressed.

---

## 39. Verification

Use actual project scripts. Inspect `package.json` first.

Run the relevant frontend commands, typically:

```bash
npm test
npm run type-check
npm run build
```

Also run server regression because Phase 5 integration must remain intact:

```bash
cd server
npm test
npm run type-check
npm run build
```

Then frontend:

```bash
cd client
npm test
npm run type-check
npm run build
```

Adapt commands to the actual repository structure.

Record actual results. Never fabricate test numbers.

---

## 40. Regression

Confirm Phase 6 does not break:

```text
Authentication
Dashboard
Resume Studio
ATS
Skill Gap
Employability
Job Matching
Career Plan
Existing API integrations
Navigation
Responsive layout
```

---

## 41. Performance Audit

Before completion inspect:

- bundle impact
- client component boundaries
- unnecessary dependencies
- unnecessary rerenders
- API request duplication
- SSE cleanup
- event listener cleanup
- AbortController cleanup
- timers
- unmounted state updates
- memory leaks

A cancelled/unmounted Career Coach must not leave an open connection or dangling listeners.

---

## 42. Final Architectural Validation

Confirm:

```text
SKILLEZO CAREER COACH UI
        ↓
FRONTEND API CLIENT
        ↓
POST /api/ai/coach/chat
        ↓
PHASE 5 API
        ↓
AI ORCHESTRATOR
        ↓
TOOL REGISTRY
        ↓
DETERMINISTIC ENGINES
        ↓
EVIDENCE LAYER
        ↓
MODEL GATEWAY
        ↓
VALIDATED RESPONSE
        ↓
CAREER COACH UI
        ↓
USER DECISION
        ↓
PHASE 7 — FUTURE
```

---

## 43. Documentation

Add/update documentation for:

1. Career Coach route.
2. Frontend API integration.
3. SSE lifecycle handling.
4. Component architecture.
5. Response rendering.
6. Error handling.
7. Phase 6 boundary.

Do not unnecessarily rewrite the master architecture.

---

## 44. Final Walkthrough

At completion provide:

### 1. Files created
Actual files only.

### 2. Files modified
Actual files only.

### 3. Architecture
Final frontend flow.

### 4. API integration
Exact endpoint and transport.

### 5. SSE
Lifecycle handling and cancellation.

### 6. UI
Workbench/component structure.

### 7. Evidence
How verified evidence is presented.

### 8. Security
Confirm no client secrets/direct provider access.

### 9. Phase boundary
Confirm no Phase 7 mutation/action system was implemented.

### 10. Tests
Actual results:

```text
Phase 6 tests: X/X
Frontend full suite: X/X
Server regression: X/X
Frontend typecheck: PASS/FAIL
Server typecheck: PASS/FAIL
Frontend build: PASS/FAIL
Server build: PASS/FAIL
```

Never fabricate numbers.

---

## 45. Stop Conditions

Stop and report the issue if:

- Phase 5 API contract is missing/inconsistent.
- Authentication integration cannot be safely determined.
- Existing frontend architecture conflicts with the requirements.
- A backend change appears necessary for a core requirement.
- A security boundary would need to be weakened.
- A mutation would be required.
- Response schema cannot be verified.

Do not guess.

---

# FINAL RULES

1. Inspect before implementing.
2. Reuse existing SKILLEZO frontend architecture.
3. Treat Phases 1–5 as stable.
4. Use Phase 5 API as the only AI frontend boundary.
5. Never call Gemini/OpenAI directly from the browser.
6. Never expose API keys.
7. Never trust client-provided identity.
8. Never access the database from the frontend.
9. Never access deterministic engines directly from the frontend.
10. Never access Tool Registry directly from the frontend.
11. Never implement AI mutations in Phase 6.
12. Never implement autonomous actions.
13. Do not fake token streaming.
14. Display SSE lifecycle events honestly.
15. Display final AI results only after backend validation.
16. Distinguish verified evidence from AI reasoning.
17. Render only data actually returned by the backend.
18. Do not invent metrics, scores, evidence, or response fields.
19. Use strict TypeScript.
20. Avoid `any`.
21. Reuse existing UI primitives.
22. Avoid unnecessary dependencies.
23. Preserve responsive behavior.
24. Preserve accessibility.
25. Handle cancellation correctly.
26. Clean up SSE/fetch resources.
27. Handle rate limits and server failures.
28. Run actual tests.
29. Run actual typechecks.
30. Run actual builds.
31. Do not claim success without verification.
32. Do not modify Phases 1–5 unnecessarily.
33. Do not implement Phase 7.
34. Do not implement Phase 8.
35. Do not push to git.

---

# PHASE 6 END STATE

After successful completion:

```text
                    SKILLEZO AI
                         │
                         ▼
                ┌─────────────────┐
                │ CAREER COACH UI │
                └────────┬────────┘
                         │
                         ▼
                Frontend API Client
                         │
                         ▼
             POST /api/ai/coach/chat
                         │
                         ▼
                 Phase 5 API
                         │
                         ▼
                AI Orchestrator
                         │
                         ▼
                  Tool Registry
                         │
                         ▼
             Deterministic Engines
                         │
                         ▼
                  Evidence Layer
                         │
                         ▼
                  Model Gateway
                         │
                         ▼
              Validated AI Response
                         │
                         ▼
                Career Coach UI
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
          Metrics     Insights    Evidence
             │           │           │
             └───────────┼───────────┘
                         ▼
                  Recommendations
                         │
                         ▼
                    USER DECISION
                         │
                         ▼
                 Phase 7 — FUTURE
```

**End Phase 6 here.**
