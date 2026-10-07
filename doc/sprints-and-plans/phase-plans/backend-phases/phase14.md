# PHASE 14 — External Job Ingestion Foundation + Jooble Integration

Continue from the completed SKILLEZO backend through Phase 13.

CURRENT STATUS:

Phase 1–8
Database + Mongoose Model Layer
✅ Complete

Phase 9
Repository Layer
✅ Complete

Phase 9.5
Better Auth Identity Migration
✅ Complete

Phase 10A–10C
Better Auth + Express Handler + Authentication Middleware
✅ Complete

Phase 11
Candidate Profile Module
✅ Complete

Phase 12
Company + Company Ownership Foundation
✅ Complete

Phase 13
Company Member Management + Recruiter Authorization
✅ Complete

CURRENT PHASE:

PHASE 14 — External Job Ingestion Foundation + Jooble Integration

============================================================
0. CRITICAL SECURITY RULE
============================================================

A Jooble API key has been obtained.

DO NOT hardcode the API key.

DO NOT place the API key in source code.

DO NOT place the API key in frontend code.

DO NOT print the API key.

DO NOT return the API key in any API response.

DO NOT commit the API key to Git.

The developer will place the rotated/active key locally in:

JOOBLE_API_KEY=<secret>

If a real API key is already present in the repository, remove it from source code and move it to environment configuration.

Update:

.env.example

with:

JOOBLE_API_KEY=
JOOBLE_API_BASE_URL=https://in.jooble.org/api

The actual secret must remain only in .env/local environment configuration.

============================================================
1. PRODUCT CONTEXT
============================================================

SKILLEZO is a new startup platform.

At launch, we cannot depend on companies registering and manually creating enough jobs.

Therefore SKILLEZO needs an external job acquisition pipeline.

Jooble is the FIRST external provider.

Future providers may include:

- Adzuna
- Greenhouse
- Lever
- Other legitimate job APIs/feeds

IMPORTANT:

Jooble must NOT become tightly coupled to the entire Job domain.

The architecture must be:

External Provider
      ↓
Provider Adapter
      ↓
Normalized Job
      ↓
Deduplication
      ↓
Job Repository
      ↓
MongoDB

Future:

Jooble
Adzuna
Greenhouse
Lever
Direct Company Feed
       ↓
Common Provider Interface
       ↓
Same normalization pipeline
       ↓
Same Job system

============================================================
2. JOOBLE API CONTRACT
============================================================

Use the official Jooble REST API contract.

Base URL:

https://in.jooble.org/api

Request:

POST /api/{API_KEY}

Request JSON may contain:

{
  "keywords": "software engineer",
  "location": "Delhi",
  "radius": "40",
  "salary": 0,
  "page": "1",
  "ResultOnPage": 20,
  "SearchMode": 0,
  "companysearch": false
}

Official response fields include:

totalCount

jobs[]

job:

title
location
snippet
salary
source
type
link
company
updated
id

Do NOT invent additional Jooble fields.

Do NOT assume fields are always populated.

Validate external responses before processing them.

============================================================
3. IMPORTANT EXISTING JOB MODEL AUDIT
============================================================

BEFORE MODIFYING ANY MODEL:

Inspect:

src/database/models/Job.model.ts

src/database/repositories/job/

DATABASE_SCHEMA.md

Existing Job interfaces/types

Existing Job indexes

Existing Job enums

Existing Company relationships

Determine whether the current Job model was designed only for native SKILLEZO jobs.

DO NOT blindly make fields optional.

DO NOT create fake:

companyId

createdBy

roleId

or Better Auth user IDs

for imported Jooble jobs.

This is a critical architectural requirement.

============================================================
4. TWO TYPES OF JOBS
============================================================

SKILLEZO will eventually support two job acquisition paths.

NATIVE JOB:

Better Auth User
      ↓
CompanyMember
      ↓
Company
      ↓
Job

EXTERNAL JOB:

Jooble
      ↓
External Job
      ↓
SKILLEZO Job

An external Jooble job may not have:

companyId
createdBy
roleId

Do NOT create fake SKILLEZO entities to satisfy these relationships.

The data model must explicitly distinguish:

sourceType:

platform

external

Possible sourceProvider:

jooble

adzuna

greenhouse

lever

etc.

Potential external fields:

externalId
sourceUrl
sourceUpdatedAt
importedAt

Audit the current schema and make only the minimum necessary changes.

============================================================
5. DATABASE SCHEMA
============================================================

If required, modify:

DATABASE_SCHEMA.md

Document:

Native Job:

sourceType = platform

Company:
required

createdBy:
Better Auth string

External Job:

sourceType = external

sourceProvider = jooble

externalId:
required for external jobs

sourceUrl:
required for external jobs

companyId:
optional for external jobs unless a real SKILLEZO Company has been linked

createdBy:
optional for external jobs

roleId:
optional for external jobs until role classification exists

DO NOT introduce fake relationships.

Clearly document why external jobs differ from native jobs.

============================================================
6. MONGOOSE JOB MODEL
============================================================

Modify Job.model.ts only after auditing the current implementation.

Potential fields:

sourceType

sourceProvider

externalId

sourceUrl

sourceUpdatedAt

importedAt

Use appropriate enums/types.

Do not duplicate string literals.

If sourceType is:

platform
external

create/reuse a centralized enum.

If sourceProvider is currently an open-ended provider identifier, use a strongly typed strategy that remains extensible.

============================================================
7. EXTERNAL JOB INDEX
============================================================

External jobs must be idempotent.

Use a uniqueness strategy based on:

sourceProvider + externalId

Conceptually:

{
  sourceProvider: 1,
  externalId: 1
}

unique where appropriate.

Example:

jooble + 123456

must identify one external job.

Running ingestion again must NOT create another document.

Preserve all existing Job indexes.

Do not create duplicate index definitions.

============================================================
8. PROVIDER ARCHITECTURE
============================================================

Create:

src/integrations/jobs/

Recommended:

src/integrations/jobs/
│
├── types/
│   ├── job-source.types.ts
│   └── normalized-job.types.ts
│
├── providers/
│   ├── jooble/
│   │   ├── jooble.client.ts
│   │   ├── jooble.mapper.ts
│   │   ├── jooble.schema.ts
│   │   ├── jooble.types.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── normalization/
│   ├── job.normalizer.ts
│   └── index.ts
│
├── deduplication/
│   ├── job.deduplicator.ts
│   └── index.ts
│
└── index.ts

Use the existing project folder conventions if they differ.

Do not unnecessarily restructure unrelated modules.

============================================================
9. PROVIDER INTERFACE
============================================================

Create a generic provider contract.

Conceptually:

interface JobSourceProvider {

  readonly provider: string;

  searchJobs(
    query: JobSourceQuery
  ): Promise<ExternalJobResult>;

}

Generic query should support:

keywords
location
radius
salary
page
limit
companySearch

Do NOT expose Jooble-specific implementation details in the generic interface.

============================================================
10. JOOBLE CLIENT
============================================================

Create:

jooble.client.ts

Responsibilities:

- Read API key from environment/config
- Build correct endpoint
- POST JSON body
- Set Content-Type: application/json
- Send request
- Handle HTTP status
- Parse JSON
- Return typed result

Use native fetch if the project does not already have an HTTP client.

Do not add unnecessary dependencies.

The client must never log the API key.

============================================================
11. JOOBLE RUNTIME VALIDATION
============================================================

Jooble is an external system.

Do not trust the response blindly.

Create a Zod schema for the response.

Validate:

totalCount

jobs

title

location

snippet

salary

source

type

link

company

updated

id

Handle nullable/missing fields appropriately.

Flow:

Jooble API
    ↓
Raw JSON
    ↓
Zod validation
    ↓
Typed Jooble response

If validation fails:

return a controlled application error.

Do not insert malformed jobs into MongoDB.

============================================================
12. NORMALIZED JOB CONTRACT
============================================================

Create a source-independent internal representation.

Example:

NormalizedExternalJob:

{
  externalId: string;

  sourceType: "external";

  sourceProvider: "jooble";

  title: string;

  companyName: string;

  description: string;

  location: {
    raw: string;
    city?: string;
    state?: string;
    country?: string;
  };

  employmentType?: string;

  salary?: {
    raw: string;
  };

  sourceUrl: string;

  sourceName: string;

  sourceUpdatedAt?: Date;
}

Do not invent structured salary numbers if Jooble only provides a salary string.

Do not use AI to infer missing information.

============================================================
13. NORMALIZATION
============================================================

Create:

job.normalizer.ts

Map Jooble:

id
→ externalId

title
→ title

company
→ companyName

location
→ location.raw

snippet
→ description

salary
→ salary.raw

type
→ employmentType

link
→ sourceUrl

source
→ sourceName

updated
→ sourceUpdatedAt

Apply safe normalization:

trim strings

normalize whitespace

normalize empty strings

parse dates safely

Do not alter the original source URL.

============================================================
14. LOCATION HANDLING
============================================================

Do not aggressively parse location into city/state/country if the Jooble response does not reliably provide structured components.

Always preserve:

location.raw

Example:

"Delhi"

or:

"Delhi, India"

Later we can build richer location normalization.

============================================================
15. DEDUPLICATION
============================================================

Primary deterministic identity:

sourceProvider + externalId

Example:

jooble:123456789

This MUST prevent duplicate imports.

Secondary similarity matching can be added later.

Do NOT implement aggressive fuzzy deduplication in Phase 14.

False-positive merging is worse than temporary duplicates.

============================================================
16. JOB REPOSITORY
============================================================

Inspect whether JobRepository already exists.

If it does not, create it according to existing repository architecture.

Add only necessary external-job methods.

Possible:

findByExternalIdentity()

upsertExternalJob()

findExternalJobs()

findJobsByProvider()

Repository must remain source-agnostic.

Correct:

Jooble
 ↓
Normalizer
 ↓
Job Service
 ↓
Job Repository

Incorrect:

JobRepository
 ↓
Jooble API

============================================================
17. UPSERT / IDEMPOTENCY
============================================================

Implement deterministic upsert.

First ingestion:

20 jobs

Expected:

created = 20

Second identical ingestion:

created = 0

updated = 20

or equivalent depending on actual changed fields.

Never create duplicate documents for:

same provider
+
same externalId

Use MongoDB atomic upsert where appropriate.

Avoid:

find
then
insert

race-condition patterns.

============================================================
18. INGESTION SERVICE
============================================================

Create a service responsible for the ingestion workflow.

Possible location:

src/modules/job-ingestion/

Responsibilities:

1. Validate ingestion request

2. Resolve provider

3. Call provider

4. Validate response

5. Normalize jobs

6. Deduplicate

7. Persist

8. Return ingestion summary

Flow:

Controller
    ↓
JobIngestionService
    ↓
ProviderRegistry
    ↓
JoobleProvider
    ↓
Jooble API
    ↓
Zod validation
    ↓
Normalizer
    ↓
Deduplicator
    ↓
JobRepository
    ↓
MongoDB

============================================================
19. PROVIDER REGISTRY
============================================================

Create a provider registry.

Conceptually:

joobleProvider

↓

registry.register("jooble", joobleProvider)

Future:

registry.register("adzuna", adzunaProvider)

registry.register("greenhouse", greenhouseProvider)

Do not scatter:

if provider === "jooble"

throughout the service.

============================================================
20. INGESTION API
============================================================

Create a protected internal ingestion endpoint.

Example:

POST /api/job-ingestion/search

Request:

{
  "provider": "jooble",
  "keywords": "software engineer",
  "location": "Delhi",
  "page": 1,
  "limit": 20
}

Use:

requireAuth

This endpoint is an internal/admin operation.

If the existing authorization layer supports ADMIN role checks, use them.

Do not expose ingestion to anonymous users.

Do not expose the API key.

============================================================
21. ROUTE ARCHITECTURE
============================================================

Maintain:

Route
 ↓
requireAuth
 ↓
Validation
 ↓
Controller
 ↓
Service
 ↓
Provider
 ↓
Repository
 ↓
MongoDB

Controller must NOT call Jooble directly.

Controller must NOT call MongoDB directly.

============================================================
22. INGESTION RESPONSE
============================================================

Return a summary rather than dumping the entire Jooble response.

Example:

{
  "success": true,
  "data": {
    "provider": "jooble",
    "requested": 20,
    "received": 20,
    "created": 14,
    "updated": 4,
    "skipped": 2,
    "failed": 0
  }
}

Do not return API credentials.

============================================================
23. ERROR HANDLING
============================================================

Handle at minimum:

403
→ JOOBLE_API_KEY_INVALID

404
→ JOOBLE_ENDPOINT_NOT_FOUND

network timeout/failure
→ JOB_SOURCE_UNAVAILABLE

invalid response
→ JOB_SOURCE_INVALID_RESPONSE

database failure
→ existing RepositoryError handling

duplicate
→ idempotent upsert

Use existing:

AppError

RepositoryError

error codes

standard response format

Do not expose raw provider errors unnecessarily.

============================================================
24. TIMEOUTS
============================================================

External APIs must not hang the Express request indefinitely.

Configure a reasonable request timeout using AbortController or the project's existing HTTP abstraction.

If timeout occurs:

return controlled:

JOB_SOURCE_TIMEOUT

Do not leave hanging connections.

============================================================
25. PAGINATION
============================================================

Support:

page

limit / ResultOnPage

Do not automatically ingest unlimited pages.

Add configuration:

JOOBLE_MAX_INGESTION_PAGES=5

or equivalent.

The ingestion service must have a hard upper bound.

============================================================
26. SEARCH PROFILE SUPPORT
============================================================

Do not hardcode only:

keywords = "it"

Create configurable search profiles.

Initial examples:

software engineer
frontend developer
backend developer
full stack developer
react developer
node.js developer
python developer
java developer
data analyst
data scientist
devops engineer
UI UX designer
product manager
business analyst
digital marketing
sales

Initial locations:

Delhi
Noida
Gurgaon
Bangalore
Mumbai
Pune
Hyderabad
Chennai
Kolkata
Ahmedabad
Jaipur

These should be configuration/data rather than scattered business logic.

============================================================
27. INDIA-FIRST INGESTION
============================================================

Jooble India endpoint:

https://in.jooble.org/api

Initial focus should be India.

Use locations such as:

Delhi
Noida
Gurgaon
Bangalore
Mumbai
Pune
Hyderabad
Chennai
Kolkata
Ahmedabad
Jaipur

Do not assume all locations return results.

The system must handle:

0 results

normally.

============================================================
28. DO NOT CALL JOOBLE ON USER SEARCH
============================================================

Very important.

Do NOT implement:

Frontend
 ↓
GET /api/jobs
 ↓
Jooble API

Instead:

INGESTION
Internal/Admin
 ↓
Jooble
 ↓
MongoDB

USER SEARCH

Frontend
 ↓
SKILLEZO Job API
 ↓
MongoDB

This keeps user-facing search fast and protects the API key.

============================================================
29. NO CRON YET
============================================================

Do not implement production cron scheduling in this phase.

Manual/admin ingestion is sufficient.

Future:

Scheduler
 ↓
JobIngestionService
 ↓
Jooble
 ↓
MongoDB

will be a later phase.

============================================================
30. SECURITY
============================================================

Never accept:

apiKey

from:

request body

query params

frontend

headers controlled by the user

Only server configuration may provide it.

Verify .gitignore includes:

.env

.env.local

and relevant secrets.

If the repository contains an accidentally committed key:

remove it and document the remediation.

============================================================
31. TESTING
============================================================

Implement tests or robust verification for:

1. API URL construction

2. API key loaded from environment

3. Request body

4. Content-Type

5. Jooble response validation

6. Normalization

7. externalId mapping

8. provider identity

9. upsert

10. duplicate prevention

11. repeated ingestion

12. invalid API key

13. unavailable provider

14. timeout

15. invalid response

16. pagination

17. zero results

18. missing environment variable

============================================================
32. REAL API VERIFICATION
============================================================

Use the developer's local JOOBLE_API_KEY.

Do not print the secret.

Test:

POST /api/job-ingestion/search

Example:

{
  "provider": "jooble",
  "keywords": "software engineer",
  "location": "Delhi",
  "page": 1,
  "limit": 10
}

Verify:

SKILLEZO
 ↓
Jooble
 ↓
Response
 ↓
Validation
 ↓
Normalization
 ↓
Deduplication
 ↓
MongoDB

Then run the same request again.

Verify:

No duplicate jobs.

============================================================
33. DATABASE VERIFICATION
============================================================

Inspect MongoDB after ingestion.

Verify imported jobs contain:

sourceType = external

sourceProvider = jooble

externalId

sourceUrl

importedAt

sourceUpdatedAt where available

companyName or equivalent external company representation

Do NOT create fake:

Company

User

CompanyMember

for external jobs.

============================================================
34. EXISTING COMPANY RELATIONSHIPS
============================================================

Do NOT break:

Company
 ↓
CompanyMember
 ↓
Native Job

This remains the native job architecture.

External jobs are:

Jooble
 ↓
External Job
 ↓
SKILLEZO

They should coexist cleanly.

============================================================
35. DO NOT IMPLEMENT
============================================================

DO NOT implement:

❌ Adzuna

❌ Greenhouse

❌ Lever

❌ Scraping

❌ AI job classification

❌ AI matching

❌ Resume parsing

❌ Candidate applications

❌ Job recommendation engine

❌ Production scheduler

❌ Email notifications

❌ Native recruiter Job CRUD

Those belong to later phases.

============================================================
36. DOCUMENTATION
============================================================

Create:

server/doc/phase14-external-job-ingestion.md

Document:

1. Why external ingestion exists

2. Cold-start problem

3. Jooble integration

4. API contract

5. Provider architecture

6. Jooble connector

7. External response validation

8. Normalization

9. Deduplication

10. Idempotency

11. Database model changes

12. Indexes

13. External vs native jobs

14. Security

15. Error handling

16. Pagination

17. Manual ingestion API

18. Example request

19. Example response

20. MongoDB document example

21. Future providers

22. Future scheduling

23. Phase 15 relationship

Include Mermaid diagrams.

============================================================
37. FRONTEND API DOCUMENTATION
============================================================

Create/update:

server/doc/03-api/job-ingestion/JOB_INGESTION_API.md

Document:

METHOD

URL

Authentication

Authorization

Request body

Validation

Success response

Error responses

Example request

Example response

Frontend/internal usage notes

IMPORTANT:

Clearly mark this endpoint:

INTERNAL / ADMIN INGESTION ENDPOINT

It is NOT a candidate-facing job-search endpoint.

============================================================
38. API SOURCE DOCUMENTATION
============================================================

Document the official Jooble API source.

Official documentation:

https://help.jooble.org/en/support/solutions/articles/60001448238-rest-api-documentation

Do not copy the API documentation verbatim.

Summarize the contract and link to the official source.

============================================================
39. BUILD VERIFICATION
============================================================

Run:

npm run type-check

npm run build

Both must pass.

============================================================
40. HEALTH VERIFICATION
============================================================

Verify:

GET /api/health

GET /api/health/ready

Both must continue working.

============================================================
41. REGRESSION VERIFICATION
============================================================

Verify:

Better Auth:

/api/auth/*

Profile:

/api/profile/*

Company:

/api/companies/*

Company Members:

/api/company-members/*

All must continue functioning.

============================================================
42. ARCHITECTURE VERIFICATION
============================================================

Verify:

No Jooble calls from controllers.

No Jooble calls from repositories.

No Jooble calls from frontend.

No API key in source code.

No fake Company records.

No fake User records.

No fake CompanyMember records.

No duplicated Job documents for same:

provider + externalId

============================================================
43. FINAL COMPLETION REPORT
============================================================

Return:

### Files Created

### Files Modified

### Environment Variables

### Jooble API Contract

### Provider Architecture

### Jooble Connector

### Runtime Validation

### Normalization

### Deduplication

### Idempotency

### Job Schema Changes

### Index Changes

### Ingestion Service

### API Endpoint

### Security

### Error Handling

### MongoDB Verification

### Test Results

### TypeScript Result

### Build Result

### Health Result

### Regression Result

### Known Limitations

### Future Improvements

Final report MUST conclude:

✅ Jooble Connector Implemented

✅ Source-Agnostic Provider Architecture

✅ External Response Validation

✅ Job Normalization

✅ Duplicate Prevention

✅ Idempotent Ingestion

✅ API Key Secured

✅ MongoDB Persistence

✅ External vs Native Jobs Separated

✅ TypeScript Passed

✅ Build Passed

✅ Authentication Working

✅ Profile Module Working

✅ Company Module Working

✅ Company Member Module Working

Ready for:

PHASE 15 — Job Discovery + Candidate-Facing Job Search