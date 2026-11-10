# SKILLEZO --- AI Mock Interview Coach

## Master Implementation Roadmap

**Document type:** Technical implementation plan\
**Product:** SKILLEZO AI Career Intelligence & Candidate Experience\
**Module:** AI Mock Interview Coach\
**Status:** Proposed implementation plan\
**Approach:** Incremental delivery using existing SKILLEZO
infrastructure

------------------------------------------------------------------------

## 1. Product objective

Build an AI-powered interview practice module that helps candidates
prepare for technical, HR, behavioral and managerial interviews. The
module should conduct structured interviews, ask relevant follow-up
questions, evaluate candidate answers, provide actionable feedback and
track improvement over time.

The module must integrate with SKILLEZO's existing candidate identity,
profile, resume intelligence, skill-gap analysis and job intelligence
capabilities. It must not duplicate existing services unnecessarily.

## 2. Architecture principles

1.  **Reuse before rebuild:** inspect the current repository and reuse
    established authentication, API conventions, database connection,
    logging, validation, AI provider abstraction and UI components.
2.  **Backend owns interview state:** the server controls session
    status, question sequence, allowed transitions, time limits, scoring
    persistence and completion.
3.  **AI is an advisor, not the workflow controller:** Gemini generates
    and evaluates content, while deterministic application logic
    validates and persists state.
4.  **Provider abstraction:** isolate Gemini-specific code behind an AI
    service/provider interface so models can be changed later.
5.  **Structured output:** validate AI responses against Zod schemas
    before using or persisting them.
6.  **Privacy by default:** do not record or retain raw audio by
    default. Recording must be optional, consent-based and governed by a
    retention policy.
7.  **Free-tier aware:** design for quotas, throttling, retries and
    graceful degradation. Do not promise unlimited free AI usage.
8.  **Evidence-based feedback:** scores must be accompanied by evidence
    from the candidate's answer and should not imply certainty beyond
    what the answer supports.

## 3. Phase-by-phase plan

### Phase 1 --- Foundation & Architecture

**Objective:** Establish a safe, maintainable backend and frontend
foundation for the Interview Coach without implementing the complete
interview experience.

**Work:** - Inspect the current SKILLEZO codebase and document existing
conventions. - Confirm current authentication and candidate user ID
strategy. - Define module boundaries and folder structure consistent
with the repository. - Define interview domain types, enums and Zod
validation schemas. - Design Mongoose models and indexes. - Add
repository/service/controller/route foundation following existing
patterns. - Add authorization and ownership checks using existing
middleware. - Add configuration validation and safe environment-variable
handling. - Add unit tests for schemas, model behavior and access
rules. - Document API contracts and decisions.

**Deliverables:** - Approved architecture note. - Interview domain types
and validation schemas. - Initial Mongoose models. - Repository and
service interfaces. - Protected route foundation. - Test coverage for
foundational behavior. - No unrequested changes to existing modules.

**Exit criteria:** - Existing authentication works unchanged. - New
models compile and validate. - A candidate cannot access another
candidate's session. - Tests pass. - No Gemini calls are required in
this phase.

### Phase 2 --- Interview Configuration & Question Engine

**Objective:** Let candidates configure an interview and generate a
validated question plan.

**Work:** - Build role, experience, interview type, difficulty, duration
and mode configuration. - Support initial role catalog: .NET, React,
MERN, Python, Java, Data Analyst, AI/ML, Cloud, DevOps and Business
Analyst. - Create interview template/configuration service. - Generate
questions using the existing Gemini integration through an isolated
provider. - Support optional resume and job-description context only
when available and authorized. - Store question metadata, category,
difficulty, expected concepts and evaluation rubric. - Validate
generated output and handle malformed or quota-limited responses. - Add
question regeneration limits and request throttling.

**Deliverables:** - Interview setup UI. - Role/template catalog. -
Question-generation service and prompt version. - Persisted interview
plan. - Tests for valid, invalid and failed AI responses.

**Exit criteria:** - Candidate can create a configured session. -
Generated question count and metadata match server constraints. -
Invalid AI output is rejected or safely retried. - AI usage is logged
and rate-limited.

### Phase 3 --- Text-Based Interview Engine

**Objective:** Deliver the first end-to-end interview experience using
text responses.

**Work:** - Build candidate interview workspace. - Implement session
start, current question retrieval and answer submission. - Implement
server-controlled question progression. - Store answers and
timestamps. - Add interview timer and autosave/draft behavior where
appropriate. - Generate adaptive follow-up questions based on answer
context. - Enforce question limits, session status and idempotency. -
Support pause/resume only if product rules allow it. - Handle refresh,
reconnect and expired sessions safely.

**Deliverables:** - Working text interview experience. - Answer
persistence. - Follow-up question flow. - Session lifecycle and error
states.

**Exit criteria:** - Candidate can complete a full text interview. -
Refreshing does not lose persisted progress. - Duplicate submissions do
not create duplicate answers. - Candidates cannot skip or modify
server-controlled question order.

### Phase 4 --- AI Evaluation & Scoring Engine

**Objective:** Evaluate individual answers using a transparent rubric
and produce consistent structured scores.

**Work:** - Define evaluation schemas and rubric versions. - Evaluate
technical accuracy, relevance, problem-solving, communication and answer
structure. - Make scoring weights configurable by interview type. -
Require concise evidence and improvement suggestions for each
dimension. - Distinguish unassessable dimensions from low scores. - Use
deterministic aggregation for final category and overall scores. - Add
safeguards against unsupported claims and score inflation. - Store
model/provider, prompt version, rubric version and evaluation
timestamp. - Add retry and re-evaluation policies.

**Deliverables:** - Evaluation service. - Versioned scoring rubric. -
Per-answer feedback. - Deterministic aggregation service. - Unit and
integration tests.

**Exit criteria:** - All scores conform to defined ranges. - Overall
score is calculated by application code. - Evaluation includes evidence
and actionable feedback. - Missing evidence is not silently converted
into a confident score.

### Phase 5 --- Interview Report & Analytics

**Objective:** Present a useful, understandable report and interview
history to candidates.

**Work:** - Build report page and summary cards. - Show overall score
and dimension scores. - Show answer-level feedback, strengths,
improvement areas and recommendations. - Add interview history and
report retrieval. - Add charts using the existing charting approach or
Recharts if not already installed. - Add readiness indicators with clear
definitions and disclaimers. - Add report access control and export only
if required.

**Deliverables:** - Interview report dashboard. - Interview history. -
Score breakdown and recommendations. - Responsive and accessible UI.

**Exit criteria:** - Candidate can view only their own reports. - Report
values match persisted evaluation records. - Readiness labels are based
on documented thresholds and are not presented as hiring guarantees.

### Phase 6 --- Voice Interview System

**Objective:** Add voice interaction while preserving text as a reliable
fallback.

**Work:** - Add browser speech recognition where supported. - Add
browser SpeechSynthesis for spoken questions. - Add permission,
microphone, unsupported-browser and recognition-error states. - Let
candidates review/edit transcript before submission. - Add speaking
duration and words-per-minute indicators when transcript and timing data
are available. - Count configured filler words from transcripts, with
language and recognition limitations clearly disclosed. - Add optional
recording only after consent, secure storage and deletion policy are
implemented. - Keep voice processing modular so a self-hosted
Whisper/Piper path can be added later.

**Deliverables:** - Voice interview mode. - Text fallback. - Speech
analytics with clear limitations. - Consent and recording controls if
recording is enabled.

**Exit criteria:** - Voice mode works in supported browsers. - Candidate
can recover from speech recognition failure. - Text mode remains fully
functional. - No recording occurs without explicit consent.

### Phase 7 --- Advanced Intelligence Integration

**Objective:** Make interview practice personalized using existing
SKILLEZO intelligence.

**Work:** - Read authorized resume/profile skill evidence. - Use
selected job-description requirements where available. - Prioritize
questions based on skill gaps and role benchmarks. - Compare interview
evidence with resume claims without treating either as definitive. -
Generate targeted learning recommendations. - Provide a
candidate-controlled path to update or refresh skill-gap insights. -
Track improvement across multiple interviews. - Avoid automatically
changing canonical profile or resume data based solely on AI inference.

**Deliverables:** - Personalized interview plans. - Skill-gap-aware
recommendations. - Job-description-aligned practice. - Interview
progress history.

**Exit criteria:** - Personalization uses only authorized candidate
data. - Existing Resume Studio and Skill Gap Engine behavior remains
unchanged. - Candidate can understand why a question or recommendation
was selected.

### Phase 8 --- Testing, Optimization & Deployment

**Objective:** Prepare the module for production use with reliability,
privacy and cost controls.

**Work:** - Unit, integration, API and end-to-end testing. -
Authorization and cross-user access tests. - Prompt injection and
untrusted-input handling. - Gemini quota/rate-limit handling and usage
monitoring. - Request throttling, timeouts, retry limits and
circuit-breaker behavior as appropriate. - Logging without unnecessary
sensitive answer/audio content. - Data retention and deletion
workflows. - Accessibility, responsive design and performance checks. -
Staging deployment, smoke tests and production rollout. - Feature flag
and rollback plan.

**Deliverables:** - Test report. - Security/privacy checklist. - Cost
and quota monitoring. - Deployment and rollback documentation. -
Production-ready module.

**Exit criteria:** - Critical user journeys pass. - No known
cross-candidate data access. - AI failures do not corrupt interview
state. - Quotas and service failures are handled gracefully. -
Deployment and rollback procedures are documented.

## 4. Recommended release milestones

  -----------------------------------------------------------------------
  Release                 Included phases         Outcome
  ----------------------- ----------------------- -----------------------
  Foundation              Phase 1                 Safe module foundation

  MVP Alpha               Phases 1--3             Candidate can complete
                                                  a text interview

  MVP Beta                Phases 1--5             Text interview with
                                                  evaluation and report

  Voice Beta              Phase 6                 Browser-based voice
                                                  interview

  Intelligence Release    Phase 7                 Resume/JD/skill-gap
                                                  personalization

  Production Release      Phase 8                 Tested and monitored
                                                  production module
  -----------------------------------------------------------------------

**Recommended first usable release:** complete Phases 1--5 before
investing in advanced voice capabilities.

## 5. Suggested initial role catalog

-   .NET Developer
-   React Developer
-   MERN Stack Developer
-   Python Developer
-   Java Developer
-   Data Analyst
-   AI/ML Engineer
-   Cloud Engineer
-   DevOps Engineer
-   Business Analyst

Treat this as configurable seed data, not hardcoded frontend-only logic.

## 6. Scoring design principles

A possible initial technical interview rubric:

  Dimension                    Example weight
  -------------------------- ----------------
  Technical accuracy                      30%
  Answer relevance                        20%
  Problem-solving                         20%
  Communication                           15%
  Conceptual understanding                10%
  Answer structure                         5%

These weights are an initial proposal, not universal truth. HR,
behavioral and managerial interviews should use different rubric
profiles. Voice-only traits such as pronunciation or vocal clarity must
not be inferred from text transcripts.

## 7. Cost and free-tier strategy

-   Reuse the existing Gemini integration and verify the currently
    available model's free-tier quotas and data-use terms.
-   Cache role templates and static question metadata where appropriate.
-   Generate a bounded question set rather than making a new model call
    for every UI interaction.
-   Use strict token/output limits and per-user request limits.
-   Use browser SpeechRecognition and SpeechSynthesis as an optional
    first voice implementation, noting browser support and possible
    remote processing.
-   Consider self-hosted Whisper/faster-whisper and Piper only if
    hosting compute is available.
-   Do not claim the system is unlimited or permanently free. API
    quotas, hosting, database, storage and compute may incur costs.

## 8. Non-goals for the initial MVP

-   Photorealistic AI interviewer avatars.
-   Emotion detection or personality inference.
-   Automated hiring decisions.
-   Guaranteed job-readiness or job-placement claims.
-   Always-on microphone access.
-   Mandatory interview recording.
-   Paid real-time speech/LLM services.

## 9. Engineering workflow for every phase

1.  Inspect the existing repository and relevant documentation.
2.  Identify reusable services and conventions.
3.  Propose a minimal implementation plan.
4.  Implement only the current phase.
5.  Run lint, type-check, unit and relevant integration tests.
6.  Inspect the diff for regressions and unrelated changes.
7.  Update documentation and report completed work, tests, known gaps
    and next phase.
8.  Do not start the next phase until its dependencies and exit criteria
    are satisfied.

## 10. Definition of done

A phase is complete only when: - Its stated deliverables exist. -
Acceptance criteria are met. - Tests pass and results are reported. -
Existing SKILLEZO functionality is not broken. - Authorization and data
ownership are verified where applicable. - Documentation is updated. -
No unimplemented feature is represented as complete.
