# SKILLEZO AI — PHASE 6 FINAL AUDIT & HARDENING

You have already implemented Phase 6: AI Recommendation Orchestrator.

DO NOT START PHASE 7.

Your task now is to perform a complete engineering audit of the existing Phase 6 implementation against:

SKILLEZO_AI_Phase_6_AI_Recommendation_Orchestrator_Implementation_Plan.md

The goal is to verify that Phase 6 is production-safe, deterministic, evidence-traceable, and fully respects the architecture established in Phases 1–5.

IMPORTANT:

Do NOT rewrite the architecture unnecessarily.
Do NOT introduce duplicate intelligence engines.
Do NOT implement resume rewriting or optimization.
Do NOT modify the scope into Phase 7.
Only fix issues that are genuinely required for Phase 6 correctness, safety, determinism, or integration.

---

# 1. FIRST — INSPECT THE EXISTING IMPLEMENTATION

Before changing anything, inspect:

server/src/modules/recommendation-intelligence/

including:

- recommendation.types.ts
- recommendation.constants.ts
- recommendation.signals.ts
- recommendation.grouping.ts
- recommendation.priority.ts
- recommendation.validator.ts
- recommendation.service.ts
- index.ts

Also inspect:

server/src/core/ai/ai.types.ts
server/src/core/ai/ai.context.ts
server/src/core/ai/ai.service.ts

Inspect the existing implementations from:

- Phase 2 Skill Intelligence
- Phase 3 Role Intelligence
- Phase 3 Job Intelligence
- Phase 4 Matching Intelligence
- Phase 5 Content Intelligence
- ATS engine
- Resume parser
- Existing frontend AIRecommendations component
- Existing tests

Understand the current architecture before making changes.

---

# 2. CORE ARCHITECTURE — MUST REMAIN INTACT

The architecture must remain:

Resume
↓
ATS
↓
Skill Intelligence
↓
Role / JD Intelligence
↓
Matching Intelligence
↓
Content Intelligence
↓
Recommendation Intelligence
↓
AI Explanation
↓
Frontend

The following engines remain authoritative:

ATS Score
→ ATS engine

Skill detection
→ Skill Intelligence

Role benchmark
→ Role Intelligence

JD requirements
→ Job Intelligence

Match Score
→ Matching Intelligence

Content Score
→ Content Intelligence

Recommendation Priority
→ Recommendation Intelligence

AI
→ explanation and phrasing only

AI MUST NOT become authoritative for:

- scores
- skill detection
- matching
- evidence
- priority
- candidate facts
- metrics
- experience years
- recommendation ranking

---

# 3. AUDIT PRIORITY NORMALIZATION

Inspect recommendation.priority.ts.

Verify that every value entering the weighted priority calculation is normalized to:

0.0 → 1.0

The formula should conceptually remain:

priorityScore =
  impact * 0.30 +
  relevance * 0.25 +
  actionability * 0.20 +
  confidence * 0.15 +
  evidence * 0.10

Do NOT introduce mixed 0–100 and 0–1 values.

Verify:

- no accidental double weighting
- no enum values accidentally used numerically
- no NaN
- no Infinity
- score always remains deterministic
- score remains within expected bounds

If necessary, add explicit normalization helpers.

Keep all constants centralized in recommendation.constants.ts.

---

# 4. AUDIT PRIORITY LEVEL THRESHOLDS

Inspect how:

CRITICAL
HIGH
MEDIUM
LOW

are assigned.

Verify that CRITICAL is genuinely rare.

Test at minimum:

A. Required JD skill NOT_DETECTED
B. Required JD skill PARTIAL
C. Matched skill with weak evidence
D. Major content weakness
E. Minor style issue

Expected general hierarchy:

Required requirement gap
>
High-impact evidence/match issue
>
Content improvement
>
Style/repetition improvement

Do not hard-code an arbitrary hierarchy if the current weighted scoring system already provides the correct behavior.

Fix only if the current implementation produces clearly incorrect ordering.

---

# 5. AUDIT REQUIRED VS PREFERRED SKILLS

Test:

Required skill NOT_DETECTED
Preferred skill NOT_DETECTED

The required skill must receive higher relevance/priority than the preferred skill when all other factors are comparable.

Verify that Phase 6 uses the existing Phase 3/4 requirement source.

DO NOT create a new JD requirement taxonomy.

---

# 6. AUDIT GROUPING / DEDUPLICATION

This is mandatory.

Create a test scenario where the same skill produces:

- weak evidence
- low technical depth
- low specificity
- mentioned only once
- related content weakness

Expected:

EXACTLY ONE consolidated recommendation.

The recommendation should merge:

- sourceIds
- evidenceIds
- skillIds
- requirementIds where applicable

Do not lose traceability while grouping.

Also verify that two unrelated skills do NOT get incorrectly grouped.

---

# 7. AUDIT REPETITION HANDLING

This is especially important.

Create a strong resume scenario:

Bullet 1:
"Built reusable React components..."

Bullet 2:
"Built scalable API services..."

Bullet 3:
"Built automated deployment workflows..."

Bullet 4:
"Built monitoring dashboards..."

These bullets should otherwise contain:

- ownership
- technical details
- specificity
- outcomes
- metrics where genuinely available

Expected:

- Content Score remains strong
- repetition is treated as a style signal
- repetition does NOT create a HIGH or CRITICAL recommendation
- repetition does NOT disproportionately reduce Content Score

If the current implementation violates this, fix the weighting/eligibility.

Do not remove repetition detection entirely.

---

# 8. AUDIT EXPERIENCE-YEAR SAFETY

This must remain correct from Phase 4.

Test overlapping employment:

Job 1:
2020–2023

Job 2:
2022–2025

Expected:
approximately 5 years of total elapsed experience, NOT 6.

Also test:

"Experienced backend developer"

Expected:
NO numeric experience generated.

Phase 6 must never independently calculate experience years.

It must consume the authoritative Phase 4 experience result.

If Phase 4 currently has a bug, fix the owning experience logic rather than duplicating it in Phase 6.

---

# 9. AUDIT NOT_DETECTED SAFETY

Test:

Docker = NOT_DETECTED

Allowed language:

"Docker is not currently detected in the resume."

"If you have genuine Docker experience, consider adding a concrete example."

Forbidden:

"You don't know Docker."

"You cannot use Docker."

"You lack Docker skills."

"The candidate does not know Docker."

The distinction must remain:

NOT_DETECTED
≠
DOES_NOT_KNOW

Check both deterministic fallback language and AI-generated language.

---

# 10. AUDIT METRIC FABRICATION

Create candidate evidence:

"Improved application performance."

There is NO metric.

Force the AI explanation layer to attempt output such as:

"Improved performance by 30%."

Expected:

AI output must be rejected or safely replaced by deterministic fallback.

Repeat with:

"Reduced API response time."

"Helped increase sales."

"Optimized database queries."

"Scaled the platform."

"Managed a large team."

AI must never invent:

- percentages
- revenue
- user counts
- team sizes
- latency numbers
- scale numbers
- cost savings
- performance improvements

unless those values exist in candidate evidence.

---

# 11. AUDIT EXPERIENCE FABRICATION

Input:

"Experienced backend developer."

AI must NOT produce:

"5 years of backend experience."

or:

"Several years of backend experience."

unless supported by deterministic experience data.

AI must only use authoritative experience information supplied in context.

---

# 12. AUDIT AI PRIORITY IMMUTABILITY

This is mandatory.

Create a test where deterministic recommendation metadata says:

priority:
LOW

priorityScore:
0.42

Then simulate/mock AI output saying:

"This is a HIGH priority issue."

Expected final recommendation:

priority:
LOW

priorityScore:
0.42

AI text may explain the issue, but AI cannot alter:

- priority
- priorityScore
- impact
- actionability
- confidence
- sourceIds
- evidenceIds
- requirementIds
- skillIds

Deterministic metadata remains authoritative.

---

# 13. AUDIT SCORE IMMUTABILITY

Capture before/after values:

ATS Score
Match Score
Content Score

Run recommendation generation.

Verify:

ATS before === ATS after

Match before === Match after

Content before === Content after

Recommendation generation must NEVER mutate or recalculate those scores.

Add regression tests if necessary.

---

# 14. AUDIT AI FAILURE FALLBACK

Simulate:

Gemini unavailable
OpenAI unavailable

Expected:

Recommendation generation still succeeds.

The system must return deterministic:

- title
- summary
- priority
- suggestedAction

AI is optional for explanation quality.

AI failure must not break the recommendation experience.

Test provider exceptions and invalid AI output.

---

# 15. AUDIT AI SCHEMA VALIDATION

Verify Zod validation protects:

- explanation
- suggestedAction
- confidence

Test invalid AI responses:

- missing explanation
- empty explanation
- confidence > 1
- confidence < 0
- unexpected fields if strict validation is intended
- malformed JSON
- non-JSON output

Expected:

safe deterministic fallback.

---

# 16. AUDIT RECOMMENDATION DETERMINISM

Run the same:

Resume
+
Role
+
JD

multiple times.

Expected deterministic values:

- same signals
- same grouping
- same recommendation IDs where IDs are intended to be deterministic
- same priority scores
- same priorities
- same ordering
- same source/evidence relationships

Sorting must remain:

priorityScore DESC
impact DESC
relevance DESC
confidence DESC
id ASC

or the exact equivalent already defined by the implementation plan.

Do not introduce random ordering.

---

# 17. AUDIT TOP-5 LIMIT

Verify:

Default recommendation limit = 5

If there are 20 eligible recommendations:

Only the highest-priority 5 should be returned to the frontend.

The backend determines the ranking.

The frontend must NOT independently rank recommendations.

---

# 18. AUDIT LOW-VALUE RECOMMENDATION SUPPRESSION

A strong resume should NOT produce a large number of low-value recommendations.

Test a high-quality resume.

Expected:

Few meaningful recommendations.

Avoid recommendations such as:

- "Improve your resume"
- "Add more keywords"
- "Make it better"
- "Use stronger language"

unless tied to a deterministic signal and specific evidence.

Every actionable recommendation should answer:

WHAT?
WHY?
WHAT NEXT?

---

# 19. AUDIT EVIDENCE TRACEABILITY

Every recommendation involving candidate evidence must preserve:

sourceIds
evidenceIds

Skill recommendations should preserve:

skillIds

JD recommendations should preserve:

requirementIds

Do not lose these references during grouping.

Verify that a recommendation can internally answer:

"Why was this recommendation generated?"

---

# 20. AUDIT CANDIDATE / REQUIREMENT SEPARATION

Verify the following remain separate:

Candidate Evidence
Role Benchmark
JD Requirement
Match Result
Recommendation

Example:

Candidate:
React detected

JD:
React required

Match:
MATCHED

Recommendation:
Strengthen React evidence

This is correct.

Do NOT turn it into:

"Candidate must know React."

---

# 21. AUDIT SINGLE SOURCE OF TRUTH

Phase 6 must NOT contain duplicate:

- skill lists
- role lists
- JD requirement lists
- ATS scoring logic
- match scoring logic
- content scoring logic
- experience calculation

If duplicate logic exists, refactor it to consume the owning engine's result.

Do not create another canonical taxonomy.

---

# 22. AUDIT RECOMMENDATION SIGNALS

Review recommendation.signals.ts.

Ensure signals are derived from existing authoritative outputs.

Phase 6 should answer:

"What problems already detected by previous engines deserve a recommendation?"

It should NOT independently answer:

"Does this candidate really have React?"

"Does Kubernetes equal Docker?"

"How many years of backend experience does this person have?"

Those decisions belong to previous engines.

---

# 23. AUDIT ACTIONABILITY

Verify:

FIX_NOW
STRENGTHEN_EVIDENCE
REQUIRES_NEW_EVIDENCE
INFORMATIONAL

are used correctly.

Examples:

Existing weak bullet:
→ FIX_NOW / STRENGTHEN_EVIDENCE

Skill exists but evidence is weak:
→ STRENGTHEN_EVIDENCE

Skill not detected:
→ REQUIRES_NEW_EVIDENCE

Minor style observation:
→ INFORMATIONAL / FIX_NOW

For missing skills, NEVER tell the user to falsely add the skill.

---

# 24. AUDIT RECOMMENDATION LANGUAGE

Recommendations must be constructive.

Avoid:

"Your resume is bad."

"Your experience is weak."

"You failed this requirement."

"You don't know X."

Prefer:

"Your existing evidence could communicate this more clearly."

"X is not currently detected in the resume."

"If you have genuine X experience, consider adding a concrete example."

"Several bullets could communicate measurable impact more clearly."

---

# 25. AUDIT VERSIONING / CACHE

Verify:

RECOMMENDATION_ENGINE_VERSION = "1.0.0"

is included in the relevant cache/input hash.

Verify the recommendation result cannot incorrectly be reused across:

- different resume
- different role
- different JD
- different engine versions

Do not remove previous engine versions from the hash.

---

# 26. AUDIT FRONTEND

Inspect AIRecommendations.tsx and its parent integration.

Verify frontend:

- displays backend recommendation order
- does not calculate priority
- does not calculate recommendation scores
- does not duplicate recommendation logic
- displays priority
- displays why
- displays suggested action
- does not expose internal IDs/hashes

Keep the UI consistent with the existing Skillezo design.

Do NOT start building the Phase 7 editor.

---

# 27. TEST COVERAGE

Add or improve tests for all issues found.

At minimum ensure coverage for:

1. priority normalization
2. required vs preferred
3. recommendation grouping
4. unrelated-signal separation
5. repetition handling
6. experience overlap
7. vague experience safety
8. NOT_DETECTED safety
9. metric fabrication protection
10. AI priority immutability
11. ATS score immutability
12. Match score immutability
13. Content score immutability
14. AI provider failure
15. invalid AI response fallback
16. deterministic ordering
17. top-5 limit
18. evidence traceability
19. skill traceability
20. requirement traceability

---

# 28. FULL REGRESSION

After all necessary fixes, run:

Backend:

npm test

or the project's equivalent Vitest command.

Frontend:

npx tsc --noEmit

Also run:

- lint
- production build

if those scripts exist.

Do not stop at recommendation-specific tests.

ALL existing Phase 1–5 tests must continue passing.

---

# 29. EXPECTED RESULT

Target:

Backend:
ALL TESTS PASS

Frontend:
0 TypeScript errors

Build:
PASS

No regressions.

---

# 30. FINAL REPORT FORMAT

After completing the audit, report exactly:

## Phase 6 Final Audit

### Files Inspected
List relevant files.

### Issues Found
List only real issues.

### Fixes Applied
List every change.

### Safety Verification
- metric fabrication: PASS/FAIL
- experience fabrication: PASS/FAIL
- NOT_DETECTED phrasing: PASS/FAIL
- AI priority immutability: PASS/FAIL
- score immutability: PASS/FAIL

### Determinism
PASS/FAIL

### Evidence Traceability
PASS/FAIL

### Recommendation Deduplication
PASS/FAIL

### Repetition Handling
PASS/FAIL

### Experience Overlap
PASS/FAIL

### AI Fallback
PASS/FAIL

### Backend Tests
X/X PASS

### Frontend TypeScript
PASS / FAIL

### Production Build
PASS / FAIL

### Phase 6 Status

Only mark:

PHASE 6 COMPLETE

if every required audit passes.

Otherwise mark:

PHASE 6 NEEDS FIXES

and clearly list what remains.

---

# IMPORTANT FINAL INSTRUCTION

DO NOT IMPLEMENT PHASE 7.

Do not build:

- resume editor
- bullet rewrite engine
- automatic optimization
- before/after optimization
- automatic keyword insertion
- resume regeneration

Stop after Phase 6 is fully audited and hardened.