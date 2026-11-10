# SKILLEZO --- AI Mock Interview Coach

## Phase 1: Foundation & Architecture

**Document type:** Implementation specification for Antigravity\
**Phase:** 1 of 8\
**Priority:** Critical\
**Scope:** Foundation only --- do not implement the full interview
experience in this phase.

------------------------------------------------------------------------

## 1. Objective

Establish the technical foundation for the AI Mock Interview Coach
inside the existing SKILLEZO application.

The goal is to create a clean, secure, testable module foundation that
later phases can extend. This phase includes repository inspection,
architecture alignment, domain types, validation, initial database
models, repository/service boundaries, protected API scaffolding and
tests.

**Do not implement question generation, Gemini prompts, interview UI,
answer evaluation, voice features or reports in Phase 1.**

## 2. Existing SKILLEZO context

The project already has an established stack and career-intelligence
foundation. The implementation must inspect and reuse the actual
repository implementation rather than assume paths or rewrite existing
systems.

Known project context to verify against the codebase: - Frontend:
Next.js / React. - Backend: Node.js / Express. - Database: MongoDB with
Mongoose. - Authentication: Better Auth integration and existing
protected-route middleware. - Existing AI provider integration: Google
Gemini. - Existing intelligence: Resume Intelligence, ATS compatibility,
Skill Gap Analysis, Role Benchmarking and Career Plan. - Existing
deployment: frontend and backend have previously been deployed
separately.

The repository is the source of truth. If any item above differs from
the current code, follow the codebase and document the discrepancy.

## 3. Mandatory first step --- inspect before editing

Before writing code:

1.  Inspect the root repository structure and package manifests.
2.  Identify frontend and backend applications/packages.
3.  Inspect authentication setup, session verification and authorization
    middleware.
4.  Inspect the User model and how user IDs are represented. Do not
    assume ObjectId; the project has previously migrated identity
    references to strings.
5.  Inspect MongoDB connection lifecycle and Mongoose model registration
    patterns.
6.  Inspect existing route, controller, service, repository and
    validation conventions.
7.  Inspect existing API response/error formats.
8.  Inspect logging, configuration and environment-variable validation.
9.  Inspect existing AI provider abstraction, but do not call Gemini in
    this phase.
10. Inspect test framework, test utilities, lint and type-check scripts.
11. Inspect existing frontend navigation and component conventions, but
    do not build interview pages yet.

Create a short implementation note listing: - Existing conventions
reused. - Exact files/folders to be added. - Any conflicts or missing
infrastructure. - Risks and decisions.

Do not duplicate an existing shared utility or middleware.

## 4. Module boundaries

Create an `interview-coach` or repository-consistent equivalent module.

Keep responsibilities separated:

-   **Domain:** types, enums, invariants and domain-level errors.
-   **Validation:** request and persisted-data schemas.
-   **Models:** Mongoose schemas and indexes.
-   **Repositories:** database persistence and query operations.
-   **Services:** business rules and session lifecycle foundation.
-   **Controllers:** HTTP request/response mapping.
-   **Routes:** endpoint registration and middleware.
-   **Frontend:** no feature UI in this phase; only identify the future
    integration point if needed.
-   **Tests:** unit and integration tests following existing
    conventions.

Use the existing project naming conventions and avoid introducing a new
architectural framework.

## 5. Initial domain model

Define and validate these domain concepts.

### 5.1 InterviewSession

Suggested fields:

``` ts
type InterviewMode = "text" | "voice";

type InterviewType =
  | "technical"
  | "hr"
  | "behavioral"
  | "managerial";

type InterviewDifficulty = "easy" | "medium" | "hard";

type InterviewSessionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";

interface InterviewSession {
  _id: string;
  userId: string;
  role: string;
  experienceLevel: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  mode: InterviewMode;
  durationMinutes: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  status: InterviewSessionStatus;
  templateId?: string;
  resumeId?: string;
  jobId?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

Adapt ID types to existing SKILLEZO conventions. Do not add fields that
cannot be supported by existing domain references. If resume/job IDs are
not stable or available, leave these references out until integration is
designed.

### 5.2 InterviewTemplate

Purpose: reusable role/interview configuration.

Suggested fields: - name - role - interviewType - supported experience
levels - supported difficulties - default duration - default question
count - active flag - version - createdAt / updatedAt

Do not seed an exhaustive question bank in this phase. A small
configurable catalog can be introduced in Phase 2.

### 5.3 InterviewQuestion

Purpose: persist the question plan and question metadata.

Suggested fields: - sessionId - sequence - questionText - category -
difficulty - questionType - expectedConcepts (optional in Phase 1;
populated in Phase 2) - evaluationRubric reference/version (optional in
Phase 1) - parentQuestionId (for future follow-ups) - source
(`generated`, `template`, `follow_up`) - createdAt / updatedAt

Do not generate questions in Phase 1. The model is a foundation for
later phases.

### 5.4 InterviewAnswer

Purpose: persist a candidate response.

Suggested fields: - sessionId - questionId - userId - answerText -
transcriptText (optional, reserved for voice phase) -
responseDurationSeconds (optional) - submittedAt - createdAt / updatedAt

Do not store audio or recording URLs in Phase 1.

### 5.5 InterviewEvaluation

Purpose: store a future structured evaluation.

Suggested fields: - sessionId - questionId - answerId - userId -
rubricVersion - provider - model - promptVersion - scores (validated
object, optional until Phase 4) - evidence (optional) - strengths
(optional) - improvementAreas (optional) - evaluatedAt - createdAt /
updatedAt

Do not fabricate placeholder scores. Evaluation records should be
created only when a real evaluation exists in a later phase.

### 5.6 InterviewReport

Purpose: future aggregated candidate-facing result.

Suggested fields: - sessionId - userId - rubricVersion - overallScore
(optional) - dimensionScores (optional) - readinessLevel (optional) -
strengths - improvementAreas - recommendations - generatedAt - createdAt
/ updatedAt

Do not generate reports in Phase 1.

## 6. Data integrity and indexes

Use Mongoose schema validation and indexes appropriate to actual query
patterns.

At minimum, assess and implement: - Session lookup by
`{ userId, createdAt }`. - Session lookup by `{ userId, status }`. -
Question ordering by `{ sessionId, sequence }`. - Answer lookup by
`{ sessionId, questionId }`. - Evaluation lookup by
`{ sessionId, questionId }`. - Report lookup by `{ userId, sessionId }`.

Where the product permits only one answer per question, use a unique
compound index on `{ sessionId, questionId }`. If multiple attempts are
planned, model attempt number explicitly and use a suitable compound
unique index instead.

Avoid speculative indexes. Document index choices and ensure indexes do
not conflict with existing data.

## 7. Validation requirements

Use the validation library already adopted in the repository. If Zod is
already used, reuse it.

Validate: - Role is a non-empty bounded string. - Experience level is
from an agreed supported set or a safely bounded configured value. -
Interview type is an allowed enum. - Difficulty is an allowed enum. -
Mode is `text` or `voice`. - Duration and question count are bounded
positive integers. - IDs are syntactically valid according to the
project's ID strategy. - Session status transitions are controlled by
backend business logic, not client input.

Never trust client-provided `userId`, score, status, current question
index or ownership fields. Derive identity from authenticated server
context.

## 8. API foundation

Create only the minimal protected route foundation required to verify
module wiring.

Suggested base path:

`/api/v1/interviews`

Phase 1 may implement: - `GET /health` or module status route only if
consistent with existing API conventions. - A protected `GET /sessions`
returning the authenticated candidate's sessions, even if the collection
is empty. - A protected `GET /sessions/:sessionId` that returns a
session only if it belongs to the authenticated candidate.

Do not implement session creation/start, question generation, answer
submission, evaluation or report endpoints in Phase 1. Those belong to
later phases.

Use the project's existing response envelope, error handler,
authentication middleware and authorization patterns. Do not create
parallel auth middleware.

## 9. Authorization and privacy

Mandatory: - Require existing authentication middleware on candidate
routes. - Derive candidate ID from verified auth/session context. -
Enforce ownership in repository queries, not only in controller
conditionals. - Return the project's standard not-found/forbidden
response without leaking another user's data. - Do not log raw answers,
transcripts, secrets or tokens. - Do not store audio in this phase. - Do
not expose internal provider keys or environment variables. - Ensure all
database reads are scoped to the authenticated user where appropriate.

## 10. AI provider boundary

Do not make Gemini API calls in Phase 1.

If the repository has an AI provider abstraction, document how Phase 2
will reuse it. If no abstraction exists, propose the smallest interface
needed, but do not build unnecessary provider infrastructure.

Future interface concept (not necessarily to implement now):

``` ts
interface InterviewAIProvider {
  generateQuestions(input: GenerateQuestionsInput):
    Promise<GeneratedQuestionSet>;

  generateFollowUp(input: GenerateFollowUpInput):
    Promise<GeneratedFollowUp>;

  evaluateAnswer(input: EvaluateAnswerInput):
    Promise<AnswerEvaluation>;
}
```

Any future AI response must be schema-validated before it affects
interview state or is persisted.

## 11. Frontend scope

No complete UI is required in Phase 1.

Inspect and document: - Candidate dashboard navigation integration
point. - Existing page/layout and protected-route patterns. - Reusable
form, card, dialog, loading and error components. - Existing design
system and responsive conventions.

Do not add non-functional buttons, placeholder pages or mock interview
screens.

## 12. Testing requirements

Add tests using the existing test stack.

Minimum coverage: 1. Domain enum and schema validation. 2. Invalid
duration/question count rejected. 3. Invalid interview type, difficulty
and mode rejected. 4. Mongoose model validation. 5. Required indexes are
declared. 6. Repository session lookup scopes by user ID. 7. Candidate A
cannot retrieve Candidate B's session. 8. Unauthenticated requests are
rejected by existing middleware. 9. Empty session listing returns the
standard successful empty response. 10. Existing authentication and
relevant regression tests still pass.

Use mocks for external services. There should be no Gemini network calls
in this phase.

## 13. Configuration and environment

Do not add new secrets or paid services in Phase 1.

If a module feature flag is needed, follow existing configuration
patterns. Never hardcode credentials. Validate configuration at
application startup using the project's existing config system.

## 14. Explicit non-goals

Do not implement: - Gemini question generation. - Gemini answer
evaluation. - Adaptive follow-up logic. - Text interview workspace. -
Voice recognition or text-to-speech. - Audio recording or playback. -
Speaking speed or filler-word analytics. - Score calculation or
readiness levels. - Interview reports and charts. - Resume/Job
Description personalization. - Learning plan updates. - New
authentication system. - New database connection. - Broad refactoring of
existing SKILLEZO modules.

## 15. Acceptance criteria

Phase 1 is complete only when:

-   [ ] Repository inspection is documented.
-   [ ] Existing conventions and authentication are reused.
-   [ ] Module boundaries are established.
-   [ ] Domain types and enums are implemented.
-   [ ] Validation schemas are implemented.
-   [ ] Initial Mongoose models are implemented.
-   [ ] Appropriate indexes are declared.
-   [ ] Protected session-list and session-detail foundation is wired,
    if consistent with current architecture.
-   [ ] Ownership is enforced at query/repository level.
-   [ ] Tests cover validation, models and authorization.
-   [ ] Lint and type-check pass.
-   [ ] Existing relevant regression tests pass.
-   [ ] No Gemini calls or paid services are introduced.
-   [ ] No unrelated existing module is refactored.
-   [ ] Documentation and implementation summary are updated.

## 16. Required Antigravity execution instructions

Work only on Phase 1.

Before coding: 1. Inspect the repository and report the current
architecture. 2. Identify exact files to modify/create. 3. Explain how
the implementation will reuse existing auth, models, database and API
conventions. 4. Flag any ambiguity before making destructive or
cross-module changes.

During implementation: 1. Make small, reviewable changes. 2. Do not
overwrite existing files without understanding their purpose. 3. Do not
create duplicate utilities, middleware or database connections. 4. Do
not change existing user ID representation. 5. Do not modify unrelated
Resume Studio, Skill Gap Engine, ATS or Career Plan behavior. 6. Do not
proceed to Phase 2.

After implementation: 1. Run formatting, lint, type-check and relevant
tests. 2. Report exact files created and modified. 3. Report test
commands and actual results. 4. List incomplete items, risks and
assumptions. 5. Provide a concise Phase 1 completion report. 6. Wait for
approval before beginning Phase 2.

## 17. Final output expected from Antigravity

Provide: - Repository architecture findings. - Implementation summary. -
Files created/modified. - Database model and index summary. - API routes
added. - Authorization approach. - Tests executed and results. - Known
limitations and decisions deferred. - Confirmation that no Phase 2
functionality was implemented.

**End of Phase 1 specification.**
