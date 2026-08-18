# SKILLEZO Backend — Phase 9

# Repository Layer Foundation

Continue from the completed Phase 8 (Database Audit & Model Freeze).

The database contract is now frozen.

DO NOT modify any Mongoose models.

DO NOT modify DATABASE_SCHEMA.md.

DO NOT create controllers.

DO NOT create services.

DO NOT create business routes.

This phase is ONLY responsible for designing and implementing the Repository Layer.

---

# Objective

Implement a reusable Repository Layer that completely abstracts MongoDB/Mongoose from the rest of the application.

After this phase:

Controllers
        ↓
Services
        ↓
Repositories
        ↓
Models
        ↓
MongoDB

No Service or Controller should directly use a Mongoose Model.

---

# Repository Architecture

The repository layer must follow:

Controller
      ↓
Service
      ↓
Repository
      ↓
Model

Repository responsibilities:

• Read data
• Write data
• Build database queries
• Handle persistence errors

Repository MUST NOT:

• Implement business logic
• Validate business rules
• Generate JWT
• Hash passwords
• Send emails
• Calculate AI results
• Perform authorization

---

# Folder Structure

Implement:

src/

repositories/
│
├── base/
│   ├── BaseRepository.ts
│   ├── IRepository.ts
│   └── index.ts
│
├── user/
│   ├── UserRepository.ts
│   └── index.ts
│
├── profile/
│   ├── ProfileRepository.ts
│   └── index.ts
│
├── role/
│   ├── RoleRepository.ts
│   └── index.ts
│
├── company/
│   ├── CompanyRepository.ts
│   └── index.ts
│
├── errors/
│   ├── RepositoryError.ts
│   ├── EntityNotFoundError.ts
│   ├── DuplicateEntityError.ts
│   └── DatabaseOperationError.ts
│
├── types/
│   ├── repository.types.ts
│   ├── pagination.types.ts
│   ├── query.types.ts
│   └── index.ts
│
└── index.ts

---

# IRepository Interface

Design a generic repository contract.

Example responsibilities:

create()

findById()

findOne()

findMany()

updateById()

deleteById()

exists()

count()

paginate()

aggregate()

bulkInsert()

bulkUpdate()

No implementation here.

Only interface.

---

# BaseRepository

Implement a generic BaseRepository<TDocument>.

It should encapsulate common CRUD operations.

Methods should include:

create()

findById()

findOne()

findMany()

updateById()

deleteById()

exists()

count()

paginate()

aggregate()

findWithProjection()

findWithSorting()

findWithPopulation()

Support:

TypeScript Generics

Mongoose Query Options

Lean Queries where appropriate

Projection

Sorting

Pagination

Populate

Sessions

Transactions

Return strongly typed results.

Avoid duplicated CRUD code.

---

# Repository Types

Create reusable repository types.

Examples:

PaginationOptions

PaginationResult

FilterQuery

SortOptions

ProjectionOptions

PopulateOptions

FindOptions

UpdateOptions

DeleteOptions

RepositoryResult

Everything should be reusable by every repository.

---

# Repository Error System

Create repository-specific errors.

RepositoryError

↓

EntityNotFoundError

↓

DuplicateEntityError

↓

DatabaseOperationError

Repository errors should never expose raw MongoDB internals.

---

# Query Utilities

Implement reusable query helpers.

Examples:

Pagination Builder

Filter Builder

Projection Builder

Sort Builder

Populate Builder

Search Builder

These utilities should eliminate duplicated query construction across repositories.

---

# UserRepository

Extend BaseRepository.

Implement User-specific methods.

Examples:

findByEmail()

existsByEmail()

findActiveUser()

updatePassword()

verifyEmail()

updateLastLogin()

changeAccountStatus()

No JWT.

No password hashing.

No authentication.

Database access only.

---

# ProfileRepository

Extend BaseRepository.

Implement:

findByUserId()

updateSkills()

updateEducation()

updateExperience()

updateTargetRole()

updateLinks()

findProfilesByRole()

Persistence only.

---

# RoleRepository

Extend BaseRepository.

Implement:

findBySlug()

findByName()

findActiveRoles()

findInactiveRoles()

Persistence only.

---

# CompanyRepository

Extend BaseRepository.

Implement:

findBySlug()

findVerifiedCompanies()

findCompaniesByIndustry()

updateVerificationStatus()

findCreatedBy()

Persistence only.

---

# Barrel Exports

Export every repository cleanly.

No deep relative imports should be necessary.

---

# Repository Documentation

Create:

server/doc/phase9.md

Document:

Purpose

Repository Pattern

Layer Responsibilities

Repository Flow

BaseRepository Design

Repository Folder Structure

Generic Design

Error Architecture

Query Builder Architecture

Repository Responsibilities

Repository Limitations

Why Services should never access Models

Why Controllers should never access Models

Future Repository Expansion

---

# Architecture Diagram

Include:

HTTP Request

↓

Controller

↓

Service

↓

Repository

↓

Mongoose Model

↓

MongoDB

Explain each layer.

---

# CRUD Flow

Document:

Create

↓

Repository

↓

Model.create()

↓

MongoDB

Read

↓

Repository

↓

Model.find()

↓

MongoDB

Update

↓

Repository

↓

Model.findByIdAndUpdate()

↓

MongoDB

Delete

↓

Repository

↓

Model.findByIdAndDelete()

↓

MongoDB

---

# Verification

Run:

npm run type-check

Run:

npm run build

Verify:

Zero TypeScript errors.

Verify:

Repository imports resolve correctly.

Verify:

No circular dependencies.

Verify:

No repository imports controllers.

Verify:

No repository imports services.

Verify:

Models remain unchanged.

---

# Architecture Compliance

Confirm:

✅ Repository only performs persistence.

✅ No business logic.

✅ No authentication.

✅ No authorization.

✅ No AI.

✅ No calculations.

✅ No workflows.

✅ No controllers.

✅ No services.

---

# Completion Report

Return:

Files Created

Files Modified

Folder Structure

Repository Hierarchy

Implemented Generic Types

Implemented Query Helpers

Implemented Errors

Implemented Repositories

Verification Results

Architecture Verification

Build Status

TypeScript Status

Documentation Summary

---

# Final Result

The report must conclude with:

✅ Generic BaseRepository Implemented

✅ Repository Pattern Established

✅ UserRepository Complete

✅ ProfileRepository Complete

✅ RoleRepository Complete

✅ CompanyRepository Complete

✅ Query Builder Foundation Complete

✅ Repository Error System Complete

✅ TypeScript Passed

✅ Build Passed

Ready for:

PHASE 10 — Authentication Module