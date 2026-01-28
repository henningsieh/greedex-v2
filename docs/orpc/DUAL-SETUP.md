---
applyTo: '**'
description: oRPC dual setup - RPC endpoint for app use and OpenAPI endpoint for external integrations
---

# oRPC Dual Setup: RPC Endpoint + OpenAPI REST API

This document explains the **dual endpoint architecture** that makes oRPC optimal for full-stack Next.js applications:

1. **`/api/rpc`** — Binary RPC protocol for the Next.js application (client & server)
2. **`/api/openapi`** — REST API for external integrations & third-party tools  
3. **`/api/docs`** — Interactive API documentation UI (Scalar)
4. **`/api/openapi-spec`** — OpenAPI 3.x JSON specification

This separation of concerns allows optimal performance internally while maintaining standard HTTP compatibility externally.

## Quick Architecture Diagram

```
Client Components / Server Components
        ↓
    orpc.ts (unified client)
        ↓ (during SSR: direct calls)  (in browser: HTTP to /api/rpc)
        ├──→ /api/rpc/* (RPCHandler) ← binary RPC protocol, type-safe, optimized
        │
External Tools / Third-party APIs
        ↓
    curl, Postman, SDKs, webhooks
        ↓ (standard HTTP REST)
        ├──→ /api/openapi/* (OpenAPIHandler) ← REST API, OpenAPI 3.x compatible
        │
API Documentation
        ↓
    Browser / IDE
        ↓
        ├──→ /api/docs (Scalar UI) ← interactive API explorer
        └──→ /api/openapi-spec (JSON) ← OpenAPI specification
```

### Why Two Endpoints?

| Aspect | RPC (`/api/rpc`) | REST (`/api/openapi`) |
|--------|------|-------|
| **Client** | Next.js app (React, Server Components) | External tools (curl, SDKs, Postman) |
| **Protocol** | Binary RPC | HTTP REST |
| **Overhead** | Minimal | Standard HTTP |
| **Type Safety** | ✅ End-to-end TypeScript | ⚠️ Relies on OpenAPI schema |
| **Performance** | ⚡ Optimized for Next.js | Standard |
| **Use Case** | Internal app logic | External integrations, webhooks |

## Endpoints

### Full Endpoint Reference

| Path | Handler | Type | Purpose | Use Case |
|------|---------|------|---------|----------|
| `/api/rpc/*` | `RPCHandler` | Binary RPC | Efficient calls for Next.js app | All internal app code |
| `/api/openapi/*` | `OpenAPIHandler` | REST (GET/POST/etc) | Standard HTTP REST API | External tools, third-parties |
| `/api/openapi-spec` | OpenAPI spec generator | JSON | OpenAPI 3.x specification | Schema documentation, code generation |
| `/api/docs` | `OpenAPIReferencePlugin` | HTML + JS | Interactive Scalar UI | Manual API testing, exploration |

### Interactive API Documentation

📖 **Access at**: `http://localhost:3000/api/docs`

This Scalar UI provides:
- 📡 **Interactive API explorer** — Test endpoints in real-time
- 🔐 **Authentication testing** — Include auth headers and session cookies
- 📝 **Request/response examples** — See full payloads
- 🌙 **Dark mode** — Comfortable for long sessions
- 💾 **Schema documentation** — Auto-generated from `@route()` metadata

**Powered by:** [Scalar](https://github.com/scalar/scalar) (modern replacement for Swagger UI)

## Implementation Details

### File Structure

```
src/lib/orpc/
├── router.ts                 ← All procedures registered here
├── procedures.ts             ← Individual procedure definitions
├── context.ts               ← Context type definition
├── middleware.ts            ← Auth middleware
├── openapi-handler.ts       ← OpenAPI handler + plugins (docs UI, spec)
├── client.server.ts         ← Server-side client initialization
└── orpc.ts                  ← Unified client (auto-switches client/server)

src/app/api/
├── rpc/[[...rest]]/route.ts        ← /api/rpc/* endpoint
├── openapi/[[...rest]]/route.ts    ← /api/openapi/* endpoint
├── openapi-spec/route.ts           ← /api/openapi-spec endpoint
└── docs/route.ts                   ← /api/docs endpoint
```

### RPC Endpoint (`/api/rpc/[[...rest]]/route.ts`)

```typescript
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "@/lib/orpc/router";

const handler = new RPCHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [onError((error) => console.error(error))],
});

export const POST = handler.handle;
export const GET = handler.handle; // etc.
```

**Why RPCHandler?**
- ✅ Binary protocol minimizes payload size
- ✅ Type-safe end-to-end with TypeScript
- ✅ Optimized for Next.js internal communication
- ✅ Lower latency than JSON REST

### OpenAPI Endpoint (`/api/openapi/[[...rest]]/route.ts`)

```typescript
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { router } from "@/lib/orpc/router";

const handler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin(), new OpenAPIReferencePlugin(...)],
  interceptors: [onError((error) => console.error(error))],
});

export const GET = handler.handle;
export const POST = handler.handle; // etc.
```

**Why OpenAPIHandler?**
- ✅ Standard HTTP REST for external tools
- ✅ Automatic OpenAPI specification generation
- ✅ Works with curl, Postman, SDKs, webhooks
- ✅ Serves interactive API docs (Scalar UI)

### OpenAPI Handler Configuration

**File**: `src/lib/orpc/openapi-handler.ts`

```typescript
export const openapiHandler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin({...}),
    new OpenAPIReferencePlugin({
      docsProvider: "scalar",     ← Uses Scalar for UI
      docsPath: "/api/docs",      ← Where Scalar UI loads
      specPath: "/api/openapi-spec", ← Where spec is served
      specGenerateOptions: {
        info: {
          title: "Greedex Calculator API",
          version: "1.0.0",
        },
      },
    }),
  ],
});
```

**Key Points:**
- Single handler instance used by both `/api/openapi/*` and `/api/docs`
- Centralized configuration for consistency
- SRI security for Scalar bundle (see next section)

### Scalar UI with Subresource Integrity (SRI)

**Problem**: Loading JS from CDN without integrity verification is a security risk.

**Solution**: We compute an SRI hash matching the exact Scalar version.

**How it works:**

1. **Source of truth**: `package.json` → `config.scalarVersion`
   ```json
   {
     "config": {
       "scalarVersion": "1.25.0"
     }
   }
   ```

2. **Build-time generation**: `scripts/generate-sri.js`
   ```bash
   # Runs automatically on `pnpm run build`
   $ pnpm run generate:sri
   # → Fetches exact Scalar version from CDN
   # → Computes SHA-384 hash
   # → Writes to src/lib/orpc/scalar-sri.ts
   ```

3. **Output file** (git-ignored):
   ```typescript
   // src/lib/orpc/scalar-sri.ts (auto-generated, do not edit)
   export const SCALAR_VERSION = "1.25.0";
   export const SCALAR_URL = "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.0/dist/browser/standalone.js";
   export const SCALAR_SRI = "sha384-xxxxx..."; // Content hash
   ```

4. **Used by**: `src/lib/orpc/openapi-handler.ts` when serving Scalar UI

**Benefits:**
- ✅ Ensures exact bundle integrity
- ✅ Prevents man-in-the-middle attacks
- ✅ Single source of truth (package.json)
- ✅ Automatic on every build

### Client Setup

The client automatically uses the RPC endpoint:

```typescript
// src/lib/orpc/orpc.ts
const link = new RPCLink({
  url: () => `${window.location.origin}/api/rpc`,
});

export const orpc: RouterClient<Router> =
  globalThis.$client ?? createORPCClient(link);
```

During SSR, it uses the server-side client (direct function calls), and on the client it uses RPCLink to call `/api/rpc`.

## Using the Endpoints

### For Application Code: Use `/api/rpc` via `orpc` client

All Next.js code (components, routes, server actions) imports from a single location:

```typescript
// Works in both Client and Server Components, API routes
import { orpc } from "@/lib/orpc/orpc";

// Type-safe call (TypeScript knows the exact shape)
const health = await orpc.health();
const user = await orpc.users.getProfile();

// Errors are properly typed
try {
  await orpc.projects.delete({ id: "123" });
} catch (err) {
  // err is properly typed with error details
}
```

**Details:**
- During SSR: Uses `globalThis.$client` for direct function calls (no HTTP overhead)
- In browser: Uses `RPCLink` to make HTTP requests to `/api/rpc`
- Fully type-safe in both contexts

### For External Integrations: Use `/api/openapi` as REST API

Third-party tools, webhooks, and SDKs access standard HTTP endpoints:

```bash
# Using curl
curl http://localhost:3000/api/openapi/health

# Using POST with body
curl -X POST http://localhost:3000/api/openapi/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My Project","startDate":"2025-01-01"}'

# Using Postman, Insomnia, etc.
# Just import from: http://localhost:3000/api/openapi-spec
```

### For API Documentation: Use `/api/docs` in Browser

```
http://localhost:3000/api/docs
```

Features:
- 🧪 **Test endpoints** directly without leaving the browser
- 📋 **See parameters** for each endpoint
- 🔑 **Test authentication** by sending real requests
- 💾 **Export spec** for code generation tools

## Testing & Validation

### Test Your RPC Endpoint

```bash
# Build and run locally
pnpm run build
pnpm run start

# RPC calls work from any JavaScript context
# (This is tested in src/__tests__/openapi-rest.test.ts)
```

### Test Your OpenAPI REST Endpoint

```bash
# Run test suite
pnpm run test:run

# Test specific REST endpoint with curl
curl http://localhost:3000/api/openapi/health

# Get OpenAPI specification
curl http://localhost:3000/api/openapi-spec | jq .

# Use Postman / Insomnia / etc.
# Import: http://localhost:3000/api/openapi-spec
```

### Documentation Tests

Tests in `src/__tests__/openapi-rest.test.ts` verify:
- ✅ Public endpoints accessible without auth
- ✅ Protected endpoints require valid session
- ✅ Request/response schemas match OpenAPI spec
- ✅ Error responses are properly formatted
- ✅ CORS headers are correct
- ✅ Authentication flow works

## Router Configuration

All procedures are:
1. **Defined** in `src/lib/orpc/procedures.ts` (and organized files)
2. **Registered** in `src/lib/orpc/router.ts`
3. **Automatically available** on both RPC and REST endpoints

### Example Procedure

```typescript
// src/lib/orpc/procedures.ts
export const createProject = authorized  // Protected (requires auth)
  .route({
    method: "POST",                      // HTTP method
    path: "/projects",                   // REST path
    summary: "Create a new project",     // OpenAPI description
    tags: ["projects"],                  // OpenAPI tag
  })
  .input(ProjectCreateSchema)            // Input validation
  .output(ProjectResponseSchema)         // Output validation
  .handler(async ({ input, context, errors }) => {
    // input: validated, typed input
    // context: { headers, user, session }
    // errors: ORPC error utilities
    
    const project = await db.projects.create({
      ...input,
      organizationId: context.session.activeOrganizationId,
    });
    
    return project;
  });
```

### Registration

```typescript
// src/lib/orpc/router.ts
export const router = {
  projects: {
    create: createProject,   // Available as POST /api/openapi/projects
  },
};
```

### Access Points

**RPC (internal):**
```typescript
const project = await orpc.projects.create({ name: "..." });
```

**REST (external):**
```bash
curl -X POST http://localhost:3000/api/openapi/projects \
  -d '{"name":"..."}'
```

**Docs:**
```
http://localhost:3000/api/docs → See POST /projects endpoint
```

## SSR Optimization

The application uses the recommended oRPC SSR pattern:

1. **Server-side** (`client.server.ts`): Direct router client for SSR
2. **Client-side** (`orpc.ts`): RPCLink for browser calls
3. **Unified export**: Single import works everywhere

```typescript
// Works in both server and client components
import { orpc } from "@/lib/orpc/orpc";
```

## Best Practices

### ✅ DO:

- **Use `/api/rpc` for all application code** — Faster, type-safe
  ```typescript
  import { orpc } from "@/lib/orpc/orpc";
  const data = await orpc.procedure.name();  // ✅ Recommended
  ```

- **Use `/api/openapi` for third-parties** — Standards-compliant
  ```bash
  curl https://api.example.com/api/openapi/procedure  # ✅ Recommended
  ```

- **Always add `.route()` metadata to procedures** — Enables documentation
  ```typescript
  .route({ method: "POST", path: "/items", summary: "Create item" })  // ✅ Required
  ```

- **Use `authorized` base for protected procedures** — Automatic auth checks
  ```typescript
  export const deleteSomething = authorized.handler(...)  // ✅ Recommended
  ```

- **Import from single location** — Provides consistency
  ```typescript
  import { orpc } from "@/lib/orpc/orpc";  // ✅ Single source of truth
  ```

### ❌ DON'T:

- **Don't call `/api/openapi` from React/server code** — Use RPC instead
  ```typescript
  // ❌ WRONG
  const res = await fetch("/api/openapi/procedure");
  
  // ✅ CORRECT
  import { orpc } from "@/lib/orpc/orpc";
  const data = await orpc.procedure();
  ```

- **Don't skip `.route()` metadata** — Breaks documentation
  ```typescript
  // ❌ WRONG: Won't appear in OpenAPI spec
  export const proc = base.handler(...)
  
  // ✅ CORRECT
  export const proc = base.route({...}).handler(...)
  ```

- **Don't use `/api/rpc` from external tools** — Only works with oRPC client
  ```bash
  # ❌ WRONG: Binary protocol won't parse as JSON
  curl http://localhost:3000/api/rpc/health
  
  # ✅ CORRECT
  curl http://localhost:3000/api/openapi/health
  ```

- **Don't mix RPC and REST in same component** — Causes confusion
  ```typescript
  // ❌ WRONG: Mixing approaches
  const a = await orpc.procedure1();  
  const b = await fetch("/api/rpc/procedure2");
  
  // ✅ CORRECT: Consistent approach
  const a = await orpc.procedure1();
  const b = await orpc.procedure2();
  ```

## Decision Flow: Which Endpoint Should I Use?

```
┌─ Are you calling from Next.js code?
│  (Client Component, Server Component, API route, middleware)
│
├─ YES → Use RPC via `orpc` client
│   import { orpc } from "@/lib/orpc/orpc";
│   const data = await orpc.procedure();
│   
└─ NO → Is this an external tool or third-party?
   (curl, Postman, webhook, SDK, another service)
   
   └─ YES → Use REST API `/api/openapi`
      curl http://localhost:3000/api/openapi/procedure
```

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "TypeError: Cannot read property X" in type checking | Importing from wrong location | Import from `@/lib/orpc/orpc`, not from router |
| REST endpoint returns 404 | Procedure missing `.route()` metadata | Add `.route({ method, path })` to procedure |
| Scalar UI shows as blank page | SRI mismatch or bundle not loading | Run `pnpm run generate:sri` and rebuild |
| Authentication fails on protected endpoint | Headers not passed | Ensure cookies are sent (fetch with credentials) |
| OpenAPI spec missing endpoints | Not registered in router | Add procedure to `src/lib/orpc/router.ts` |
| Binary data error in browser | Calling RPC from curl/Postman | Use `/api/openapi` endpoint instead for REST |
