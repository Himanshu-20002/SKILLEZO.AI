
# SKILLEZO Backend — Phase 2

## MongoDB Connection + Core Database Infrastructure

Continue from the existing **Phase 1 implementation inside `/server`**.

Do NOT rebuild Phase 1.

Do NOT migrate the backend into Next.js API routes.

The project has intentionally evolved into:

```text
Next.js Frontend
       ↓ HTTP
Express Backend (/server)
       ↓
Routes
       ↓
Controllers
       ↓
Services
       ↓
Repositories
       ↓
Mongoose Models
       ↓
MongoDB Atlas
```

All backend development from this point forward must remain inside:

```text
/server
```

---

# 1. Current Phase 1 Foundation

The existing backend already contains:

```text
server/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
│
└── src/
    ├── config/
    │   └── env.ts
    │
    ├── constants/
    │   └── index.ts
    │
    ├── lib/
    │   └── db.ts
    │
    ├── routes/
    │   └── health.routes.ts
    │
    ├── types/
    │   └── api.types.ts
    │
    ├── server.ts
    │
    ├── controllers/
    ├── dto/
    ├── middleware/
    ├── models/
    ├── repositories/
    ├── services/
    ├── utils/
    └── validators/
```

Installed packages include:

```text
mongoose
zod
bcryptjs
jsonwebtoken
express
cors
dotenv
typescript
ts-node-dev
tsconfig-paths
```

Reuse them.

Do NOT reinstall or replace packages unnecessarily.

---

# 2. Phase 2 Goal

The purpose of Phase 2 is:

> Establish a reliable, reusable, typed MongoDB Atlas connection infrastructure for the entire SKILLEZO backend.

At the end of this phase we must be able to prove:

```text
Express Server
      ↓
Database Connection Manager
      ↓
Mongoose
      ↓
MongoDB Atlas
      ↓
Connected
```

No application collections or models should exist yet.

---

# 3. Inspect Before Modifying

Before making changes inspect:

```text
server/src/server.ts

server/src/config/env.ts

server/src/lib/db.ts

server/src/routes/health.routes.ts

server/package.json

server/tsconfig.json

server/.env.example

server/.gitignore
```

Understand the existing implementation.

Do not overwrite working Phase 1 code unnecessarily.

Extend it.

---

# 4. Environment Variables

Ensure the environment schema contains:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000
```

`.env.example` contains placeholders only.

Real credentials stay in:

```text
server/.env
```

Ensure `.env` remains ignored by Git.

Never print:

```text
MONGODB_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
```

to logs.

---

# 5. Environment Validation

Review:

```text
src/config/env.ts
```

Use Zod to validate environment variables.

Export one centralized typed configuration object.

Desired usage:

```ts
env.PORT

env.MONGODB_URI

env.NODE_ENV

env.CLIENT_URL
```

Avoid scattered:

```ts
process.env.MONGODB_URI
```

throughout the backend.

The environment module should be the centralized configuration boundary.

Provide useful startup errors if required configuration is missing.

Never expose secrets in the error message.

---

# 6. Implement MongoDB Connection Manager

Complete:

```text
src/lib/db.ts
```

Create a reusable database connection function.

Suggested API:

```ts
connectDatabase()
```

Responsibilities:

```text
validate configuration
        ↓
check current Mongoose state
        ↓
connect when necessary
        ↓
register/handle connection events appropriately
        ↓
return connection
```

The function must avoid opening unnecessary duplicate connections.

---

# 7. Mongoose Connection States

Handle Mongoose connection state appropriately.

Understand:

```text
0 = disconnected
1 = connected
2 = connecting
3 = disconnecting
```

Do NOT blindly call:

```ts
mongoose.connect(...)
```

every time `connectDatabase()` is invoked.

The connection infrastructure should safely handle repeated calls.

Because this is a long-running Express process, prefer one application-level connection rather than opening a new connection per request.

---

# 8. Connection Logging

Add useful development logs such as:

```text
[DB] Connecting to MongoDB...

[DB] MongoDB connected

[DB] MongoDB disconnected

[DB] MongoDB connection error
```

Never log:

```text
username
password
connection URI
JWT secrets
```

If MongoDB errors occur, log sanitized error information.

---

# 9. Database Events

Register appropriate Mongoose connection event handling.

At minimum consider:

```text
connected

disconnected

error
```

Avoid registering duplicate event listeners every time `connectDatabase()` runs.

Listeners should be initialized once.

---

# 10. Startup Sequence

Update:

```text
src/server.ts
```

so that server startup follows:

```text
Load environment
        ↓
Connect MongoDB
        ↓
MongoDB connection succeeds
        ↓
Start Express server
```

NOT:

```text
Start Express
        ↓
MongoDB maybe connects later
```

The API should not advertise itself as ready if the required primary database connection failed during startup.

Conceptually:

```ts
async function bootstrap() {

    await connectDatabase();

    app.listen(...);
}

bootstrap();
```

Handle bootstrap failure cleanly.

---

# 11. Graceful Shutdown

Implement graceful shutdown for:

```text
SIGINT

SIGTERM
```

Shutdown sequence:

```text
Receive shutdown signal
        ↓
Stop accepting new HTTP requests
        ↓
Close HTTP server
        ↓
Close MongoDB connection
        ↓
Exit process
```

Use:

```ts
mongoose.connection.close()
```

or an appropriate centralized disconnect function.

Do not abruptly terminate normal shutdown if resources can be closed safely.

---

# 12. Separate Liveness and Database Readiness

The existing:

```text
GET /api/health
```

should remain a lightweight **liveness** endpoint.

It should answer whether the Express process is running.

Example:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

Do not make every `/api/health` request execute a MongoDB query.

---

# 13. Add Readiness Endpoint

Add:

```text
GET /api/health/ready
```

This endpoint verifies whether the application is ready to serve database-dependent traffic.

It may inspect:

```ts
mongoose.connection.readyState
```

Expected connected response:

```json
{
  "success": true,
  "data": {
    "status": "ready",
    "database": "connected"
  }
}
```

If MongoDB is unavailable:

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_NOT_READY",
    "message": "Database connection is not ready"
  }
}
```

Return an appropriate HTTP status such as:

```text
503 Service Unavailable
```

Do not expose MongoDB internals.

---

# 14. Optional Database Status Helper

If useful, create:

```text
src/lib/database-status.ts
```

or keep the logic cleanly inside `db.ts`.

Do NOT create unnecessary abstractions.

A simple helper such as:

```ts
isDatabaseConnected(): boolean
```

is acceptable.

---

# 15. Database Disconnect Function

Expose something conceptually like:

```ts
disconnectDatabase()
```

so graceful shutdown does not directly manipulate database internals from several locations.

Desired boundary:

```text
server.ts
   ↓
disconnectDatabase()
   ↓
db.ts
   ↓
Mongoose
```

---

# 16. Error Handling During Startup

If MongoDB cannot connect:

```text
MongoDB connection attempt
        ↓
fails
        ↓
sanitized error logged
        ↓
Express server DOES NOT start
        ↓
process exits with failure
```

Do NOT silently continue.

Do NOT endlessly retry MongoDB during Phase 2.

Retry/backoff infrastructure can be introduced later if required.

---

# 17. CORS Configuration

Since the backend is now a separate Express application, review the existing CORS setup.

Use:

```text
CLIENT_URL
```

from environment configuration.

Do not use unrestricted:

```ts
cors()
```

for the intended production configuration.

Configure the allowed frontend origin through environment configuration.

Development should support the configured local frontend URL.

Do not build a complicated multi-origin system yet unless the project already requires one.

---

# 18. Express JSON Configuration

Confirm:

```ts
app.use(express.json())
```

exists.

Use a reasonable request body limit.

For example:

```ts
express.json({
    limit: "1mb"
})
```

Do NOT configure extremely large payloads.

Resume file uploads will later use dedicated upload handling rather than huge JSON payloads.

---

# 19. Do NOT Create Models Yet

Phase 2 must NOT create:

```text
User.model.ts
Profile.model.ts
Resume.model.ts
Role.model.ts
Competency.model.ts
CareerPlan.model.ts
Company.model.ts
CompanyMember.model.ts
Job.model.ts
Application.model.ts
```

Do NOT create collections manually in MongoDB Atlas.

Mongoose models will define them in later phases.

---

# 20. Do NOT Create Repositories

Do not implement:

```text
BaseRepository

UserRepository

JobRepository

etc.
```

Repository infrastructure comes after models/shared infrastructure.

---

# 21. Do NOT Implement Authentication

Although JWT and bcrypt packages are installed, do NOT implement:

```text
register
login
refresh token
JWT middleware
password hashing services
authorization
```

yet.

Authentication depends on the User model and supporting infrastructure.

---

# 22. Do NOT Implement Business Features

Do NOT implement:

```text
profile APIs

resume APIs

role APIs

career plans

companies

jobs

applications
```

Phase 2 is infrastructure only.

---

# 23. Verification

Run the appropriate project commands.

At minimum:

```text
npm run type-check
```

if available.

Also run:

```text
npm run build
```

and/or:

```text
npm run dev
```

as appropriate.

Do not invent missing scripts without checking `package.json`.

Fix errors introduced by Phase 2.

---

# 24. Manual Verification

Verify:

### Liveness

```text
GET http://localhost:<PORT>/api/health
```

Expected:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### Readiness

```text
GET http://localhost:<PORT>/api/health/ready
```

Expected when MongoDB is connected:

```json
{
  "success": true,
  "data": {
    "status": "ready",
    "database": "connected"
  }
}
```

---

# 25. Failure Test

Where practical, temporarily test using an invalid MongoDB URI or unavailable database.

Verify:

```text
connection fails
        ↓
sanitized error
        ↓
server does not start
```

Restore the correct local configuration afterward.

Never include actual secrets in the walkthrough.

---

# 26. Expected Phase 2 Structure

Approximately:

```text
server/
│
└── src/
    │
    ├── config/
    │   └── env.ts
    │
    ├── lib/
    │   └── db.ts
    │
    ├── routes/
    │   └── health.routes.ts
    │
    ├── types/
    │   └── api.types.ts
    │
    └── server.ts
```

Do not add unnecessary files simply to increase abstraction.

---

# 27. Phase 2 Completion Report

After implementation return:

## Packages

Confirm whether additional packages were needed.

Ideally Phase 2 should require none.

## Files Modified

List exact files created/modified.

## MongoDB Architecture

Explain:

```text
server startup
      ↓
connectDatabase()
      ↓
Mongoose
      ↓
MongoDB Atlas
```

## Connection Management

Explain how duplicate connections and event listeners are prevented.

## Environment

List required variable names only.

Never values.

## Health Checks

Report:

```text
/api/health

/api/health/ready
```

## Graceful Shutdown

Explain SIGINT/SIGTERM handling.

## Verification

Report:

```text
TypeScript
build
MongoDB connection
health endpoint
readiness endpoint
```

## Problems

Report any existing project problems separately from Phase 2 problems.

## Next Phase

Stop after Phase 2.

The next phase will be:

```text
PHASE 3
Shared Domain Types
Enums
Application Errors
Error Middleware
Response Helpers
Async Request Handling
```

Do NOT implement Phase 3.
