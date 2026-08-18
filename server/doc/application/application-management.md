# Phase 17 — Application Management & Workflow Architecture

## 1. Overview
The **Candidate Application Management & Application Workflow** module provides candidate application lifecycle capabilities in SKILLEZO.

```mermaid
flowchart TD
    A[Candidate Request] --> B[requireAuth Middleware]
    B --> C[Extract req.user.id]
    C --> D[Application Routes]
    D --> E[Application Controller]
    E --> F[Application Service]
    F --> G[Job Repository Check]
    F --> H[Resume Repository Check]
    F --> I[Application Repository]
    I --> J[(MongoDB Applications)]
```

---

## 2. Native vs External Job Handling

```mermaid
flowchart TD
    A[Apply Request] --> B{Job Source Type}
    B -->|External| C[Return sourceUrl Redirection]
    B -->|Platform| D{Job Status == ACTIVE?}
    D -->|No| E[Reject: APPLICATION_JOB_NOT_ACTIVE]
    D -->|Yes| F[Verify Resume Ownership]
    F --> G[Check Duplicate: userId + jobId]
    G --> H[Create Application: status = APPLIED]
```

---

## 3. Candidate Application State Machine

```mermaid
stateDiagram-v2
    [*] --> APPLIED: Candidate applies
    APPLIED --> WITHDRAWN: Candidate withdraws
    APPLIED --> SHORTLISTED: Recruiter shortlists
    SHORTLISTED --> WITHDRAWN: Candidate withdraws
    SHORTLISTED --> INTERVIEW: Recruiter schedules interview
    INTERVIEW --> WITHDRAWN: Candidate withdraws
    INTERVIEW --> OFFERED: Recruiter offers
    OFFERED --> HIRED: Candidate accepts
    APPLIED --> REJECTED: Recruiter rejects
    SHORTLISTED --> REJECTED: Recruiter rejects
    INTERVIEW --> REJECTED: Recruiter rejects
    WITHDRAWN --> [*]
```

---

## 4. Security & Ownership Model

- **Identity Isolation**: `userId` is strictly set from `req.user.id`. Requests supplying `userId` in parameters or body are rejected or ignored.
- **Resume Ownership**: Verified via `findUserResumeById(userId, resumeId)`. Candidates cannot use resumes owned by other candidates.
- **Duplicate Protection**: Unique index `{ userId: 1, jobId: 1 }` on `ApplicationModel` combined with service-level `findByUserAndJob` checks prevents double submissions under concurrent requests.
