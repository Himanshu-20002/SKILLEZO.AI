# SKILLEZO AI --- Phase 0: Current Architecture Audit & Architecture Lock

## Role

You are working as the lead software architect and senior full-stack
engineer on the existing SKILLEZO AI codebase.

Your task is **Phase 0 only**.

Do **not** implement the Career Profile / Resume Intelligence redesign
yet.

The purpose of this phase is to inspect the existing codebase,
understand what is already implemented, identify what can be reused,
identify gaps, and produce a safe implementation plan for the following
phases.

------------------------------------------------------------------------

# 1. Primary Objective

Perform a complete **read-only architecture and implementation audit**
of the current SKILLEZO AI codebase.

The audit must answer:

1.  What already exists?
2.  What is partially implemented?
3.  What can be reused as-is?
4.  What needs modification?
5.  What needs to be newly created?
6.  What is duplicated or conflicting?
7.  What should eventually be deprecated?
8.  What assumptions does the existing system currently make?
9.  Where are the risks of breaking existing functionality?
10. What exact implementation order should be followed after Phase 0?

The core principle is:

> INSPECT → REUSE → EXTEND → TEST → ONLY THEN REMOVE OLD CODE.

Do not rewrite working systems simply because a cleaner architecture is
possible.

------------------------------------------------------------------------

# 2. Source Architecture to Audit Against

The intended product architecture is:

``` text
USER
  |
  v
RESUME UPLOAD
  |
  v
RESUME INGESTION + PARSING
  |
  v
CAREER PROFILE
SOURCE OF TRUTH
  |
  +-------------------+-------------------+
  |                   |                   |
  v                   v                   v
RESUME ENGINE      CAREER GPS          JOB ENGINE
  |                   |                   |
  v                   v                   v
MASTER RESUME      SKILL GAP          JOB MATCHING
  |
  v
TAILORING ENGINE
  |
  v
TAILORED RESUME
  |
  v
APPLICATION
  |
  v
IMMUTABLE APPLICATION SNAPSHOT
```

The intended domain abstraction is:

``` text
Career Profile
    ↓
Master Resume
    ↓
Tailored Resume
    ↓
Application Snapshot
```

Definitions:

### Career Profile

The canonical career repository and source of truth.

Contains verified career information such as:

-   Personal/contact information
-   Professional summary
-   Experience
-   Skills
-   Projects
-   Education
-   Certifications
-   Achievements
-   Links
-   Career preferences
-   Target roles
-   Career evidence
-   Verification state

### Master Resume

A presentation generated from the Career Profile.

It should represent the user's complete professional story and should
not become a separate competing source of truth.

### Tailored Resume

A derived resume created for a specific job/opportunity.

It may contain a subset or modified presentation of Career Profile
evidence, but it must not silently mutate the Career Profile.

### Application Snapshot

An immutable historical representation of what was actually submitted.

Later changes to:

-   Career Profile
-   Master Resume
-   Tailored Resume

must not modify an already-submitted application.

------------------------------------------------------------------------

# 3. Existing Architecture Must Be Discovered, Not Assumed

Before making any changes:

## Inspect the repository structure

Identify:

-   Client application
-   Server application
-   Shared packages/types
-   Database/model layer
-   Services
-   Repositories
-   Controllers
-   Routes
-   Middleware
-   AI services
-   Resume processing
-   File storage
-   PDF generation
-   Career GPS
-   Job engine
-   Application engine
-   Authentication
-   Background jobs/queues
-   Tests
-   Configuration
-   Environment handling

Do not assume filenames or folders.

Search the actual repository.

------------------------------------------------------------------------

# 4. Backend Audit

Audit all existing backend functionality related to:

## 4.1 Profile

Inspect:

-   Profile model/schema
-   Profile service
-   Profile repository
-   Profile controllers
-   Profile routes
-   Profile validation
-   Profile completion logic
-   Profile editing APIs
-   Resume → Profile hydration

Determine whether the current Profile model can evolve into the
canonical Career Profile.

Document:

-   Existing fields
-   Missing fields
-   Existing verification/source fields
-   Merge behavior
-   Update behavior
-   Conflict behavior
-   Data ownership

Do not create a new Career Profile model if the existing Profile model
can safely evolve into it.

------------------------------------------------------------------------

# 5. Resume Architecture Audit

Inspect all resume-related implementation.

Find and document:

-   Resume model
-   Resume service
-   Resume repository
-   Resume routes/controllers
-   Resume upload
-   PDF parsing
-   DOCX parsing
-   Resume extraction
-   Resume hydration
-   Resume generation
-   Resume rendering
-   Resume editing
-   Resume scoring
-   ATS diagnostics
-   Resume AI
-   Resume versions
-   Resume variants
-   Resume storage
-   Resume PDF export

Determine whether a canonical ResumeDocument / AST already exists.

If it exists, document its exact role.

Determine:

-   Who owns the AST?
-   Where is it stored?
-   How is it generated?
-   How is it modified?
-   How is it rendered?
-   How is it persisted?
-   Whether multiple systems generate competing resume representations.

------------------------------------------------------------------------

# 6. Resume → Profile Flow Audit

Trace the complete flow:

``` text
Upload Resume
    ↓
File Storage
    ↓
Parsing
    ↓
Extraction
    ↓
Profile Hydration
    ↓
Resume Creation
    ↓
Resume Rendering
```

Document the actual implementation.

Answer:

-   What happens after upload?
-   Is extraction synchronous or asynchronous?
-   What AI/model is used?
-   What data is extracted?
-   What data is persisted?
-   Does profile hydration merge or overwrite?
-   Are duplicates handled?
-   Are source references preserved?
-   Can the user review extracted information?
-   Can extracted information be verified?
-   Are errors/warnings surfaced?
-   What happens when parsing fails?

------------------------------------------------------------------------

# 7. Career Evidence Audit

Search the codebase for concepts related to:

-   Evidence
-   SourceReference
-   Verification
-   Imported data
-   User verified data
-   User edited data
-   Resume source
-   AI provenance
-   Confidence
-   Evidence IDs

Determine whether a Career Evidence layer already exists.

If it does not exist, do NOT implement it in Phase 0.

Instead document exactly what would be required later.

The desired conceptual structure is:

``` text
Career Profile
    |
    +-- Evidence
         |
         +-- Experience Evidence
         +-- Project Evidence
         +-- Skill Evidence
         +-- Achievement Evidence
         +-- Certification Evidence
```

Potential verification states:

``` text
IMPORTED
USER_VERIFIED
USER_EDITED
NEEDS_REVIEW
```

Do not add these states yet unless they already exist.

------------------------------------------------------------------------

# 8. AI Intelligence Audit

Inspect every AI-related service involved in:

-   Resume parsing
-   Resume extraction
-   Skill extraction
-   Resume scoring
-   ATS analysis
-   Role matching
-   Job matching
-   Career planning
-   Career GPS
-   Resume optimization
-   AI recommendations
-   Section AI
-   JD analysis

For every AI system document:

``` text
Service
Purpose
Input
Output
Provider
Prompt location
Schema validation
Persistence
Caller
Dependencies
Tests
```

Identify:

-   duplicated AI logic
-   duplicated prompts
-   competing schemas
-   unsafe unstructured AI output
-   AI systems that can invent unsupported information
-   AI systems that are not grounded in existing evidence

Do not redesign the AI layer in Phase 0.

Only document the current state and risks.

------------------------------------------------------------------------

# 9. Career GPS Audit

Inspect Career GPS / CareerPlan implementation.

Determine:

-   What data Career GPS currently consumes
-   Whether it reads from Profile
-   Whether it reads from Resume
-   Whether it reads from Job data
-   Whether it maintains separate career data
-   Skill-gap calculation
-   Role readiness
-   Missing skills
-   Improvement areas
-   Progress tracking
-   Career recommendations

Identify whether Career GPS can eventually consume Career Profile as the
canonical source.

Do not rewrite Career GPS in Phase 0.

------------------------------------------------------------------------

# 10. Job Engine Audit

Inspect:

-   Job model
-   Job ingestion
-   Job parsing
-   JD extraction
-   Job matching
-   Skill matching
-   Role matching
-   Application linkage
-   Saved jobs
-   Job recommendations

Document dependencies on:

-   Profile
-   Resume
-   Skills
-   CareerPlan
-   AI services

Determine what would later be needed for:

``` text
Target Job
    ↓
Evidence Matching
    ↓
Tailored Resume
```

------------------------------------------------------------------------

# 11. Application Audit

Inspect the Application model and all related services.

Determine:

-   How applications are created
-   How resumes are linked
-   Whether a resume snapshot exists
-   Whether only a resume ID is stored
-   Whether the actual ResumeDocument AST is frozen
-   Whether resume files are immutable
-   Whether application history can change when a resume changes

Pay special attention to historical integrity.

The intended future rule is:

``` text
Application Created
        ↓
Freeze Submitted Resume
        ↓
Freeze ResumeDocument AST
        ↓
Freeze Relevant Metadata
```

Do not implement this yet.

Document the current behavior and the required future change.

------------------------------------------------------------------------

# 12. Frontend Audit

Inspect the existing dashboard architecture.

Audit:

-   Dashboard shell
-   Profile page
-   Resume Studio
-   Resume Gallery
-   Career GPS
-   Jobs
-   Applications
-   Navigation
-   Shared UI components
-   Modal system
-   State management
-   API clients
-   Loading states
-   Error states

Document current routes.

------------------------------------------------------------------------

# 13. Resume Studio Audit

This is a high-priority area.

Inspect the entire existing Resume Studio.

Do not rewrite it.

Identify:

-   Page/component size
-   View modes
-   State ownership
-   Canvas
-   Builder
-   Sidebar
-   Inspector
-   AI drawers
-   Upload/dropzone
-   Scoring
-   ATS diagnostics
-   Resume editing
-   PDF generation
-   Export
-   Preview
-   Persistence
-   Undo/redo
-   Variant handling

Identify all responsibilities currently combined inside the Studio.

The desired future structure is:

``` text
Resume Studio
│
├── StudioHeader
│
├── ResumePortfolioSidebar
│
├── ResumeCanvasWorkspace
│
└── StudioInspectorPanel
```

Inspector:

``` text
AI Insights
Design & Layout
```

Do not implement this decomposition in Phase 0.

Only map the current architecture and recommend the safest extraction
order.

------------------------------------------------------------------------

# 14. Existing Studio Components

Find whether equivalent components already exist for:

``` text
StudioHeader
ResumePortfolioSidebar
ResumeCanvasWorkspace
StudioInspectorPanel
ResumeGalleryView
TailorResumeModal
```

If equivalent components exist under different names, identify them.

For each component document:

``` text
Existing component
Location
Responsibility
Reusable?
Needs refactor?
Replacement target
Dependencies
```

------------------------------------------------------------------------

# 15. Data Ownership Audit

Create a clear ownership map.

For each important piece of information identify:

``` text
Data
Current Owner
Future Canonical Owner
Consumers
Write Sources
Read Sources
Risk
```

At minimum audit:

-   Name
-   Email
-   Phone
-   Summary
-   Experience
-   Skills
-   Projects
-   Education
-   Certifications
-   Achievements
-   Links
-   Target role
-   Career preferences
-   Resume AST
-   ATS score
-   Role match score
-   Impact score
-   Job match
-   Career readiness
-   Application history

Pay special attention to duplicate sources of truth.

------------------------------------------------------------------------

# 16. Database Audit

Inspect all relevant MongoDB/Mongoose models.

Document:

-   Relationships
-   ObjectId references
-   String references
-   Embedded documents
-   Snapshots
-   Indexes
-   Unique constraints
-   Validation
-   Timestamps
-   Soft deletion if present
-   Migration requirements

Do not modify schemas in Phase 0.

------------------------------------------------------------------------

# 17. API Audit

Inventory relevant endpoints.

For each endpoint document:

``` text
Method
Route
Controller
Service
Authentication
Input
Output
Database effects
Consumers
Status
Future action
```

Classify each:

``` text
KEEP
EXTEND
REFACTOR
DEPRECATE
NEW LATER
```

Do not remove endpoints.

------------------------------------------------------------------------

# 18. State Management Audit

Inspect frontend state.

Determine:

-   Server state
-   Local component state
-   Global state
-   Context
-   Query/cache libraries
-   Resume editor state
-   Profile state
-   Career GPS state
-   Job state
-   Application state

Identify potential synchronization problems.

Especially investigate:

``` text
Career Profile
        ↕
Master Resume
        ↕
Tailored Resume
```

The future architecture must avoid accidental bi-directional
synchronization.

------------------------------------------------------------------------

# 19. Testing Audit

Inventory:

-   Unit tests
-   Integration tests
-   API tests
-   Model tests
-   AI tests
-   Resume tests
-   Profile tests
-   Frontend tests
-   E2E tests

Document:

``` text
Existing test
Coverage
Missing coverage
Critical future tests
```

Pay particular attention to these future invariants:

### Test A --- Master isolation

``` text
Create Master Resume
Create Tailored Resume
Modify Tailored Resume

Expected:
Master Resume unchanged
Career Profile unchanged
```

### Test B --- Application immutability

``` text
Create Application
Freeze submitted resume
Modify Career Profile
Modify Master Resume
Modify Tailored Resume

Expected:
Application snapshot unchanged
```

### Test C --- Evidence grounding

``` text
AI suggestion
    ↓
Must reference valid Career Evidence
```

Do not implement these tests in Phase 0 unless equivalent tests already
exist.

------------------------------------------------------------------------

# 20. Existing vs Required Architecture Matrix

Create a detailed matrix:

  Area                 Existing   Reusable   Needs Modification   New Later   Risk
  -------------------- ---------- ---------- -------------------- ----------- ------
  Profile                                                                     
  Career Evidence                                                             
  Resume                                                                      
  ResumeDocument AST                                                          
  Resume ingestion                                                            
  Resume Studio                                                               
  Resume Gallery                                                              
  Tailoring                                                                   
  Applications                                                                
  Career GPS                                                                  
  Job Engine                                                                  
  AI Layer                                                                    
  Testing                                                                     

Use actual findings from the repository.

Do not fill cells with assumptions.

------------------------------------------------------------------------

# 21. Architecture Conflicts

Identify all conflicts between the current implementation and the
intended architecture.

Examples:

``` text
Multiple sources of truth
Resume directly owning career information
Application storing only resumeId
AI-generated data without provenance
Master and Tailored resume not clearly separated
Career GPS maintaining duplicate career information
Studio responsible for too many domains
```

Only report conflicts that actually exist.

For every confirmed conflict provide:

``` text
Conflict
Evidence in code
Impact
Recommended future resolution
Phase
Risk
```

------------------------------------------------------------------------

# 22. Reuse Map

Create a concrete reuse map.

Example:

``` text
Existing ProfileModel
    → evolve into Career Profile

Existing ResumeDocument AST
    → retain as canonical presentation model

Existing ResumeParser
    → retain

Existing ProfileService.hydrateFromParsedResume()
    → extend

Existing ATS diagnostics
    → retain

Existing ResumeRenderer
    → retain

Existing CareerPlan
    → integrate with Career Profile

Existing Application model
    → extend with immutable snapshot
```

Only include mappings supported by actual code inspection.

------------------------------------------------------------------------

# 23. Deprecation Candidates

Identify code that may eventually be deprecated.

Do NOT delete anything.

For each candidate:

``` text
Component
Reason
Replacement
Dependencies
Safe removal phase
Migration requirement
```

------------------------------------------------------------------------

# 24. Migration Risks

Identify technical risks such as:

-   Existing production data
-   Schema migrations
-   Breaking API contracts
-   Resume AST compatibility
-   Existing frontend assumptions
-   Existing application history
-   AI output changes
-   Profile merge conflicts
-   Duplicate data
-   Existing users without Career Profile data
-   Existing resumes without variant metadata
-   Existing applications without snapshots

Assign:

``` text
LOW
MEDIUM
HIGH
CRITICAL
```

Do not invent risk levels without explaining the basis.

------------------------------------------------------------------------

# 25. Phase 0 Output

Create:

``` text
SKILLEZO_CURRENT_ARCHITECTURE_AUDIT.md
```

The document must contain:

1.  Executive Summary
2.  Repository Structure
3.  Backend Architecture
4.  Frontend Architecture
5.  Profile Architecture
6.  Resume Architecture
7.  Resume Ingestion Flow
8.  Career Evidence Status
9.  AI Architecture
10. Career GPS Architecture
11. Job Engine Architecture
12. Application Architecture
13. Resume Studio Architecture
14. Database Model Map
15. API Inventory
16. State Management
17. Testing Status
18. Data Ownership Matrix
19. Existing vs Required Architecture Matrix
20. Architecture Conflicts
21. Reuse Map
22. Deprecation Candidates
23. Migration Risks
24. Recommended Implementation Order
25. Phase 1 Prerequisites
26. Open Questions / Unknowns

------------------------------------------------------------------------

# 26. Recommended Implementation Order

Based on the audit, recommend the actual safest implementation sequence.

Use this baseline only as a starting point:

``` text
PHASE 0
Current Architecture Audit

PHASE 1
Career Profile Foundation

PHASE 2
Career Profile → ResumeDocument / Master Resume

PHASE 3
Resume Ingestion + Onboarding

PHASE 4
Resume Studio Refactor

PHASE 5
Resume Gallery + Master/Variant Architecture

PHASE 6
Tailoring + Evidence Approval

PHASE 7
Application Snapshot + Career GPS Integration

PHASE 8
Integration + Testing + Production Hardening
```

If repository evidence suggests a different order, explain why.

Do not blindly follow the baseline.

------------------------------------------------------------------------

# 27. Important Constraints

## DO

-   Inspect first.
-   Reuse existing implementations.
-   Preserve working functionality.
-   Trace real data flow.
-   Identify actual dependencies.
-   Identify production risks.
-   Produce concrete file/module references.
-   Recommend incremental changes.
-   Preserve backward compatibility where practical.
-   Treat existing application history as valuable.
-   Treat ResumeDocument AST as important if already implemented.

## DO NOT

-   Do not implement Phase 1.
-   Do not modify database schemas.
-   Do not modify production APIs.
-   Do not refactor Resume Studio.
-   Do not create Career Evidence models.
-   Do not create TailorResumeModal.
-   Do not create Resume Gallery.
-   Do not change application snapshots.
-   Do not rewrite Career GPS.
-   Do not rewrite the AI layer.
-   Do not delete existing code.
-   Do not rename large sets of files.
-   Do not perform speculative cleanup.
-   Do not replace working architecture just for aesthetics.
-   Do not invent missing functionality.
-   Do not assume that something exists without locating it.

------------------------------------------------------------------------

# 28. Required Working Method

Follow this exact process:

``` text
STEP 1
Map repository

STEP 2
Map backend

STEP 3
Map frontend

STEP 4
Trace Profile flow

STEP 5
Trace Resume flow

STEP 6
Trace Resume → Profile flow

STEP 7
Trace AI flow

STEP 8
Trace Career GPS flow

STEP 9
Trace Job flow

STEP 10
Trace Application flow

STEP 11
Audit Resume Studio

STEP 12
Audit database

STEP 13
Audit APIs

STEP 14
Audit state management

STEP 15
Audit tests

STEP 16
Identify ownership conflicts

STEP 17
Create reuse/deprecation map

STEP 18
Identify migration risks

STEP 19
Create recommended implementation sequence

STEP 20
Write SKILLEZO_CURRENT_ARCHITECTURE_AUDIT.md
```

------------------------------------------------------------------------

# 29. Final Report Quality Requirements

The final audit must be specific enough that another developer can start
Phase 1 without redoing the entire discovery process.

Avoid vague statements such as:

> "Profile needs improvement."

Instead write:

> `server/src/models/Profile.ts` currently stores X, Y, Z. It is
> consumed by A, B, C. It can be extended with X without introducing a
> second model. The main migration risk is Y because Z currently
> assumes...

Use exact:

-   File paths
-   Model names
-   Service names
-   Route names
-   Component names
-   Functions/methods
-   Relationships
-   Data flow
-   Existing tests

when available.

If something cannot be determined from the repository, explicitly mark
it:

``` text
UNKNOWN — requires confirmation
```

Do not guess.

------------------------------------------------------------------------

# 30. Completion Criteria

Phase 0 is complete only when:

-   Repository structure is mapped.
-   Existing Profile implementation is understood.
-   Existing Resume implementation is understood.
-   Resume ingestion flow is traced.
-   ResumeDocument AST is located and understood.
-   Resume Studio architecture is mapped.
-   Career GPS dependencies are mapped.
-   Job engine dependencies are mapped.
-   Application snapshot behavior is understood.
-   Database relationships are documented.
-   Relevant APIs are inventoried.
-   Existing tests are inventoried.
-   Data ownership conflicts are identified.
-   Reusable components are identified.
-   Deprecation candidates are identified.
-   Migration risks are documented.
-   Phase 1 prerequisites are explicit.
-   `SKILLEZO_CURRENT_ARCHITECTURE_AUDIT.md` is produced.
-   No production behavior is changed.

------------------------------------------------------------------------

# FINAL INSTRUCTION

**DO NOT START IMPLEMENTATION.**

This is an architecture-discovery phase only.

Inspect the existing SKILLEZO AI repository thoroughly and produce:

``` text
SKILLEZO_CURRENT_ARCHITECTURE_AUDIT.md
```

At the end, provide a concise terminal summary containing:

``` text
PHASE 0 STATUS: COMPLETE

Existing foundation:
- ...

Reusable:
- ...

Needs modification:
- ...

Needs to be created later:
- ...

Highest risks:
- ...

Recommended Phase 1:
- ...

Phase 1 prerequisites:
- ...
```

Do not proceed into Phase 1 automatically.
