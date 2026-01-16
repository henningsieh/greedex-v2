# oRPC Implementation

This document describes the end-to-end type-safe API layer implementation using oRPC in this Next.js application.

## 🚀 Quick Start

**New to the codebase?** Start here:

- **[QUICKSTART.md](../../docs/orpc/QUICKSTART.md)** — 5-minute guide for AI agents
- **[DUAL-SETUP.md](../../docs/orpc/DUAL-SETUP.md)** — Full architecture explanation
- **[Interactive API Docs](http://localhost:3000/api/docs)** — Test endpoints live

## 📚 Documentation Structure

| Document                                                               | Purpose                            |
| ---------------------------------------------------------------------- | ---------------------------------- |
| [QUICKSTART.md](../../docs/orpc/QUICKSTART.md)                         | Quick mental model + decision tree |
| [DUAL-SETUP.md](../../docs/orpc/DUAL-SETUP.md)                         | Full architecture + best practices |
| [orpc.openapi-reference.md](../../docs/orpc/orpc.openapi-reference.md) | Plugin details + SRI security      |
| [orpc.openapi.scalar.md](../../docs/orpc/orpc.openapi.scalar.md)       | Scalar UI + alternatives           |
| [README.md](./README.md)                                               | This file — implementation guide   |

---

## Overview

oRPC (OpenAPI Remote Procedure Call) provides a type-safe way to define and call remote procedures between the client and server. This implementation integrates seamlessly with Better Auth for authentication and includes SSR optimization.

**The dual-endpoint approach:**

- **`/api/rpc`** — Binary RPC for internal app (fast, type-safe)
- **`/api/openapi`** — REST API for external tools (standard HTTP)

## Architecture

### Directory Structure

```
src/lib/orpc/
├── context.ts              # Base context definition with headers
├── middleware.ts           # Better Auth authentication middleware
├── procedures.ts           # Individual procedure definitions
├── router.ts              # Main router definition
├── orpc.ts                # Unified client (auto-switches server/client)
├── client.server.ts       # Server-side client initialization
├── openapi-handler.ts     # OpenAPI handler + Scalar UI config
└── README.md              # This file

src/app/api/
├── rpc/[[...rest]]/route.ts       # RPC endpoint (application use)
├── openapi/[[...rest]]/route.ts   # REST API endpoint (external use)
├── openapi-spec/route.ts          # OpenAPI spec JSON
└── docs/route.ts                  # Scalar UI endpoint
```

### Two Endpoints for Different Purposes

| Endpoint            | Protocol   | Use Case                                 | Client Type     |
| ------------------- | ---------- | ---------------------------------------- | --------------- |
| `/api/rpc`          | Binary RPC | Next.js app (React, Server Components)   | `orpc` client   |
| `/api/openapi`      | HTTP REST  | External tools (curl, Postman, webhooks) | Standard HTTP   |
| `/api/docs`         | HTML + JS  | Manual API testing                       | Browser         |
| `/api/openapi-spec` | JSON       | OpenAPI schema                           | Code generators |

**See [DUAL-SETUP.md](../../docs/orpc/DUAL-SETUP.md) for detailed architecture.**

### Key Components

#### 1. Context (`context.ts`)

Defines the base context for all oRPC procedures. Includes request headers needed for Better Auth integration.

```typescript
export const base = os.$context<{ headers: Headers }>();
```

#### 2. Middleware (`middleware.ts`)

- **authMiddleware**: Validates authentication using Better Auth and adds session/user to context
- **authorized**: Pre-configured base for creating authenticated procedures

#### 3. Procedures (`procedures.ts`)

Example procedures demonstrating:

- **helloWorld**: Public procedure with input validation
- **getHealth**: Public health check endpoint
- **getProfile**: Protected procedure requiring authentication

#### 4. Router (`router.ts`)

Main router organizing all procedures by namespace:

```typescript
export const router = {
  helloWorld,
  health: getHealth,
  user: {
    getProfile,
  },
};
```

#### 5. Client (`client.ts` + `client.server.ts`)

Unified client setup for optimal performance:

- **client.ts**: Single export that works on both client and server using `globalThis.$client`
- **client.server.ts**: Initializes server-side client for SSR optimization

This provides optimal performance:

- **SSR**: Direct function calls, no network latency
- **Client**: Type-safe HTTP requests with full type inference

## Usage

### Creating Public Procedures

```typescript
import { z } from "zod";
import { base } from "@/lib/orpc";

export const myProcedure = base
  .input(z.object({ name: z.string() }))
  .handler(async ({ input }) => {
    return { message: `Hello, ${input.name}` };
  });
```

### Creating Protected Procedures

```typescript
import { authorized } from "@/lib/orpc";

export const myProtectedProcedure = authorized.handler(async ({ context }) => {
  // context.user and context.session are guaranteed to exist
  return { userId: context.user.id };
});
```

### Using the Client

#### In Client Components

```typescript
"use client";
import { orpc } from "@/lib/orpc";

export function MyComponent() {
  const handleClick = async () => {
    const result = await orpc.helloWorld({ name: "World" });
    console.log(result);
  };

  return <button onClick={handleClick}>Call RPC</button>;
}
```

#### In Server Components

```typescript
import { orpc } from "@/lib/orpc";

export default async function MyPage() {
  // During SSR, this uses the server-side client (no HTTP request)
  const health = await orpc.health();

  return <div>{health.status}</div>;
}
```

#### In API Routes

```typescript
import { orpc } from "@/lib/orpc";

export async function GET() {
  const result = await orpc.health();
  return Response.json(result);
}
```

## Better Auth Integration

The implementation integrates with Better Auth through middleware:

1. **Context Headers**: Request headers are passed to procedures via context
2. **Auth Middleware**: Validates session and adds user data to context
3. **Protected Procedures**: Use the `authorized` base for authenticated routes

```typescript
// Authentication check happens automatically
export const getProfile = authorized.handler(async ({ context }) => {
  // context.user is guaranteed to exist here
  return context.user;
});
```

## SSR Optimization

The implementation uses a unified client approach following oRPC's recommended pattern:

### How it works

- Uses `globalThis.$client` to share the server client without bundling it into client code
- Falls back to creating a client-side client if the server client isn't available
- This allows the same import to work on both client and server

### Server-Side (during SSR)

- Uses `createRouterClient` from `@orpc/server`
- Executes procedures directly (no HTTP overhead)
- Attached to `globalThis.$client`
- Initialized via `instrumentation.ts` and imported in root layout

### Client-Side (in browser)

- Uses `RPCLink` with HTTP requests
- Falls back when server-side client is unavailable
- Automatically detects environment using `typeof window === 'undefined'`

This provides optimal performance:

- **SSR**: Direct function calls, no network latency
- **Client**: Type-safe HTTP requests with full type inference

## API Route

The oRPC server is exposed at `/api/rpc/*` via Next.js route handlers:

```
src/app/api/rpc/[[...rest]]/route.ts
```

All HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD) are supported.

## Type Safety

Full end-to-end type safety is provided:

```typescript
// TypeScript knows the exact shape of inputs and outputs
const result = await orpc.helloWorld({ name: "World" });
//    ^? { message: string; timestamp: string }

// TypeScript will error on invalid inputs
await orpc.helloWorld({ invalidProp: true }); // ❌ Type error
```

## Testing

A test page is available at `/orpc-test` that demonstrates:

- Public procedure calls (hello world, health)
- Protected procedure calls (profile)
- Error handling for unauthorized requests
- Console logging for debugging

## Adding New Procedures

1. Create the procedure in `procedures.ts` or a new file
2. Add it to the router in `router.ts`
3. Types are automatically inferred on the client

Example:

```typescript
// procedures.ts
export const newProcedure = base
  .input(z.object({ data: z.string() }))
  .handler(async ({ input }) => {
    return { result: input.data };
  });

// router.ts
export const router = {
  // ... existing procedures
  newProcedure,
};

// Now available on client automatically:
// await orpc.newProcedure({ data: "test" })
```

## Environment Requirements

- Node.js 18+ (20+ recommended)
- Next.js 16+ with App Router
- Better Auth configured
- TypeScript strict mode recommended

## Dependencies

- `@orpc/server`: Server-side oRPC functionality
- `@orpc/client`: Client-side oRPC functionality
- `zod`: Schema validation (optional, any Standard Schema works)
- `better-auth`: Authentication integration

## Next Steps

1. Add more procedures as needed for your application
2. Organize procedures into modules (e.g., `user.procedures.ts`, `organization.procedures.ts`)
3. Consider adding lazy-loaded routers for code splitting
4. Add input/output validation for all procedures
5. Implement proper error handling and logging

## Resources

- [oRPC Documentation](https://orpc.dev)
- [Better Auth Documentation](https://better-auth.com)
- [Zod Documentation](https://zod.dev)
