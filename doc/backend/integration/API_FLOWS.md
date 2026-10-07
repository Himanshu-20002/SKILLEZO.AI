# SKILLEZO Backend — API Sequence Flows

This document contains visual Mermaid sequence diagrams illustrating end-to-end data flows across completed backend modules.

---

## 1. Authentication & Session Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client App
    participant BA as Better Auth
    participant Exp as Express Router
    participant AuthMW as requireAuth Middleware
    participant Ctrl as ProfileController
    participant Svc as ProfileService
    participant DB as MongoDB

    Client->>BA: POST /api/auth/sign-in
    BA->>DB: Verify credentials & create session
    DB-->>BA: User Session Data
    BA-->>Client: 200 OK (Set-Cookie: session)

    Client->>Exp: GET /api/profile/me (Cookie Attached)
    Exp->>AuthMW: Execute requireAuth
    AuthMW->>BA: Validate Session Cookie
    BA-->>AuthMW: Valid Session (req.user populated)
    AuthMW->>Ctrl: getMyProfile(req, res)
    Ctrl->>Svc: getMyProfile(userId)
    Svc->>DB: findByUserId(userId)
    DB-->>Svc: Candidate Profile Document
    Svc-->>Ctrl: IProfile
    Ctrl-->>Client: 200 OK (successResponse)
```

---

## 2. Candidate Profile Creation & Partial Updates Flow

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate User
    participant Router as profile.routes.ts
    participant Val as Zod Validator
    participant Ctrl as ProfileController
    participant Svc as ProfileService
    participant Repo as ProfileRepository
    participant DB as MongoDB

    Candidate->>Router: POST /api/profile (CreateProfileDTO)
    Router->>Val: Validate request body
    Val-->>Router: Body Validated
    Router->>Ctrl: createProfile(req, res)
    Ctrl->>Svc: createProfile(userId, body)
    Svc->>Repo: existsByUserId(userId)
    Repo->>DB: findOne({ userId })
    DB-->>Repo: null (Not Exists)
    Svc->>Repo: create(profileData)
    Repo->>DB: insertOne(profileData)
    DB-->>Repo: Created Profile Document
    Repo-->>Svc: IProfile
    Svc-->>Ctrl: IProfile
    Ctrl-->>Candidate: 201 Created (successResponse)

    Candidate->>Router: PATCH /api/profile/me/skills (UpdateSkillsDTO)
    Router->>Val: Validate skills body
    Val-->>Router: Body Validated
    Router->>Ctrl: updateSkills(req, res)
    Ctrl->>Svc: updateSkills(userId, body)
    Svc->>Repo: updateSkills(userId, skills)
    Repo->>DB: findOneAndUpdate({ userId }, set skills)
    DB-->>Repo: Updated Profile Document
    Repo-->>Svc: IProfile
    Svc-->>Ctrl: IProfile
    Ctrl-->>Candidate: 200 OK (successResponse)
```

---

## 3. Company Creation & Automatic Owner Membership Flow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Employer User
    participant Router as company.routes.ts
    participant Ctrl as CompanyController
    participant Svc as CompanyService
    participant CoRepo as CompanyRepository
    participant MemRepo as CompanyMemberRepository
    participant DB as MongoDB

    Owner->>Router: POST /api/companies (CreateCompanyDTO)
    Router->>Ctrl: createCompany(req, res)
    Ctrl->>Svc: createCompany(userId, body)
    Svc->>CoRepo: findBySlug(slug)
    CoRepo->>DB: findOne({ slug })
    DB-->>CoRepo: null (Slug Available)
    Svc->>CoRepo: create(companyData)
    CoRepo->>DB: insertOne(companyData)
    DB-->>CoRepo: Created Company Document
    Svc->>MemRepo: createMembership(userId, companyId, role=OWNER)
    MemRepo->>DB: insertOne(membershipData)
    DB-->>MemRepo: Created Member Document
    Svc-->>Ctrl: ICompany
    Ctrl-->>Owner: 201 Created (successResponse)
```

---

## 4. Company Update Authorization Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client User
    participant Router as company.routes.ts
    participant Ctrl as CompanyController
    participant Svc as CompanyService
    participant MemRepo as CompanyMemberRepository
    participant CoRepo as CompanyRepository
    participant DB as MongoDB

    User->>Router: PATCH /api/companies/:companyId (UpdateCompanyDTO)
    Router->>Ctrl: updateCompany(req, res)
    Ctrl->>Svc: updateCompany(userId, companyId, body)
    Svc->>MemRepo: findActiveMembership(userId, companyId)
    MemRepo->>DB: findOne({ userId, companyId, status: active })
    DB-->>MemRepo: Membership Document or null
    
    alt Membership Missing or Role is VIEWER / RECRUITER
        Svc-->>Ctrl: Throw AppError 403 Forbidden
        Ctrl-->>User: 403 Forbidden Error Response
    else Membership Active AND Role is OWNER or ADMIN
        Svc->>CoRepo: updateById(companyId, updatePayload)
        CoRepo->>DB: findOneAndUpdate({ _id: companyId }, set updatePayload)
        DB-->>CoRepo: Updated Company Document
        CoRepo-->>Svc: ICompany
        Svc-->>Ctrl: ICompany
        Ctrl-->>User: 200 OK (successResponse)
    end
```
