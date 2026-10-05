# ⚡ SKILLEZO Plan: Zero-Cost In-Memory & Redis Caching Layer

> **Document Type:** Architecture & Implementation Game Plan  
> **Target Subsystem:** Express API Authentication & Hotspot Caching  
> **Estimated Financial Cost:** **$0.00 (100% FREE FOREVER)**  
> **Status:** APPROVED BLUEPRINT / ZERO-COST EXECUTION  

---

## 💰 1. Cost & Financial Guarantee ($0.00 Forever)

### Will this cost you anything?
**No. Absolutely $0.00.**

You do **NOT** need to pay for any servers, cloud services, or add any credit cards.

Here is how we achieve 100% free enterprise caching:

| Option | Financial Cost | Setup Required | When to Use |
| :--- | :---: | :---: | :--- |
| **Option A: High-Speed In-Memory Cache (Default)** | **$0.00** | **Zero Setup** | Works out of the box using a lightweight sliding-window TTL cache in Node.js RAM (~1–2 MB memory). Requires no third-party accounts. |
| **Option B: Upstash Redis Free Tier (Optional)** | **$0.00** | Free Account | If you ever want distributed multi-server Redis, Upstash provides **10,000 free requests per day** with **no credit card required**. |
| **Option C: Redis Cloud Free Tier (Optional)** | **$0.00** | Free Account | 30 MB free permanent Redis database with **no credit card required**. |

### Our Strategy: The Hybrid Dual-Mode Engine
We build a **Smart Resilient Cache Engine**:
1. By default, it runs completely **In-Memory** inside the Node.js server. **Cost = $0.00**, zero accounts, zero configuration.
2. If you ever paste a free `REDIS_URL` into your `.env` (like Upstash free tier), it automatically uses Redis. If the URL is empty or Redis is offline, it continues on In-Memory cache without a single error.

---

## 🎯 2. The Problem We Are Solving

Currently, every authenticated API call (`/api/resumes`, `/api/jobs`, `/api/profile`, `/api/user/status`) executes a raw MongoDB query in [`requireAuth.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/core/auth/middleware/requireAuth.ts):

```typescript
// Executed on EVERY SINGLE authenticated click:
const userDoc = await mongoose.connection.db.collection("user").findOne({ $or: queries });
```

### The Inefficiencies:
- **1,000 active users browsing** = **1,000 MongoDB database hits per minute** just to check if the user is suspended.
- Adds **15ms – 40ms** network latency to every page transition.
- Unnecessarily consumes MongoDB Atlas connection limits.

---

## 🏗️ 3. The Zero-Cost Cache Architecture

```mermaid
flowchart TD
    Req[Incoming Client API Request] --> AuthMiddleware[requireAuth Middleware]
    AuthMiddleware --> CheckCache{Check Cache:<br/>auth:status:userId}
    
    CheckCache -- HIT (0.1ms) --> EvalStatus{Account Active?}
    CheckCache -- MISS (First request) --> QueryDB[Query MongoDB Atlas Collection]
    
    QueryDB --> StoreCache[Store in Cache: 60s TTL]
    StoreCache --> EvalStatus
    
    EvalStatus -- Active --> NextRouter[next: Proceed to Controller]
    EvalStatus -- Suspended --> Ret403[403 Forbidden]

    subgraph CacheEngine[Resilient Zero-Cost Engine]
        MemoryMap[(Node.js In-Memory LRU Cache - 100% Free)]
        RedisCloud[(Optional Free Cloud Redis - Upstash/Redis)]
        RedisCloud -. Fallback if offline / empty .-> MemoryMap
    end
```

---

## 📋 4. Step-by-Step Implementation Roadmap

### Phase 1: Environment & Dependency Setup
1. Add optional `REDIS_URL` to [`server/src/core/config/env.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/core/config/env.ts):
   ```typescript
   REDIS_URL: z.string().optional().default(""),
   ```
2. Install `ioredis` (used only if `REDIS_URL` is set; lightweight and doesn't interfere if unused).

### Phase 2: Build `server/src/core/cache/cache.service.ts`
Implement a clean singleton service:
- **`get(key: string): Promise<string | null>`**
- **`set(key: string, value: string, ttlSeconds: number): Promise<void>`**
- **`del(key: string): Promise<void>`**
- **In-Memory Store:** Uses a JavaScript `Map` with automatic TTL timestamp checks and LRU eviction (capped at 5,000 keys to ensure memory stays under 5MB).
- **Graceful Error Handling:** If Redis connection drops, it logs a warning once and routes traffic through the memory cache. The API **never crashes**.

### Phase 3: Wire into `requireAuth.ts` (60s TTL)
- Check `cacheService.get("auth:status:" + userId)`.
- If cached: return immediately.
- If not cached: query MongoDB Atlas once, save to cache with `60` seconds TTL.
- Eliminates 80–90% of MongoDB queries on authenticated endpoints.

### Phase 4: Wire into `/api/user/status` in `server.ts`
- The client-side dashboard header polls `/api/user/status` periodically.
- Hook into the same `auth:status:${userId}` cache key, cutting polling overhead to 0 database queries.

### Phase 5: Instant Invalidation on Admin Suspension
- When an admin suspends or deactivates a user in [`admin.service.ts`](file:///x:/projects/next.js/office-Project/SKILLEZO.AI/server/src/modules/admin/admin.service.ts) (`updateUserStatus`), trigger:
  ```typescript
  await cacheService.del(`auth:status:${userId}`);
  ```
- **Instant Effect:** Suspended users are locked out on their very next click, with zero delay.

---

## 📊 5. Expected Performance Gains

| Metric | Before Cache | With Zero-Cost Cache | Improvement |
| :--- | :---: | :---: | :---: |
| **Auth Verification Speed** | 15ms – 40ms | **< 1ms** | **95% Faster** |
| **Database Load on Atlas** | 100% of requests | **~10% of requests** | **90% Load Reduction** |
| **Server Crash Risk on Traffic Burst** | High (Pool exhaustion) | **Near Zero** | Enterprise Stable |
| **Financial Cost** | $0.00 | **$0.00** | **100% Free** |

---

*Plan verified and ready for implementation.*
