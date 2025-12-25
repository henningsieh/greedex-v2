# oRPC Dual Setup: RPC and OpenAPI

This document describes the dual oRPC setup in this Next.js application, providing both efficient RPC calls for the application and REST/OpenAPI for external integrations and documentation.

## Architecture Overview

The application uses **two separate endpoints** for different purposes:

### 1. `/api/rpc` - RPC Protocol (Application Use)
- **Handler**: `RPCHandler` from `@orpc/server/fetch`
- **Client**: `RPCLink` from `@orpc/client/fetch`
- **Purpose**: Efficient, type-safe procedure calls used by the Next.js application
- **Protocol**: Binary RPC protocol optimized for performance
- **Usage**: All client-side components and server components use this endpoint

### 2. `/api/openapi` - REST/OpenAPI Protocol (External Use)
- **Handler**: `OpenAPIHandler` from `@orpc/openapi/fetch`
- **Purpose**: Standard REST API for external integrations and third-party tools
- **Protocol**: Standard HTTP REST following OpenAPI 3.x specification
- **Usage**: External API consumers, testing, and API documentation tools

## Endpoints

### Application Endpoints

| Endpoint | Handler | Purpose |
|----------|---------|---------|
| `/api/rpc/*` | RPCHandler | Efficient RPC calls for Next.js app |
| `/api/openapi/*` | OpenAPIHandler | REST API for external integrations |
| `/api/openapi-spec` | OpenAPI Spec Generator | OpenAPI 3.x specification in JSON |
| `/api/docs` | Scalar UI | Interactive API documentation (Swagger-like) |

### Documentation UI

Access the interactive API documentation at:

```text
http://localhost:3000/api/docs
```

This provides a Swagger-like interface powered by [Scalar](https://github.com/scalar/scalar) with:
- Interactive API explorer
- Request/response examples
- Authentication testing
- Dark mode support
- Modern, user-friendly interface

## Implementation Details

### RPC Endpoint (`/api/rpc/[[...rest]]/route.ts`)

```typescript
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "@/lib/orpc/router";

const handler = new RPCHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [onError((error) => console.error(error))],
});
```

**Why RPCHandler?**
- Matches the `RPCLink` used on the client
- Optimized binary protocol for better performance
- Type-safe end-to-end communication
- Smaller payload sizes compared to JSON REST

### OpenAPI Endpoint (`/api/openapi/[[...rest]]/route.ts`)

```typescript
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { router } from "@/lib/orpc/router";

const handler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [onError((error) => console.error(error))],
});
```

**Why OpenAPIHandler?**
- Standard REST API for external integrations
- Automatic OpenAPI specification generation
- Compatible with standard HTTP tools
- Easy to test with curl, Postman, etc.

### OpenAPI Specification (`/api/openapi-spec/route.ts`)

```typescript
import { OpenAPIGenerator } from "@orpc/openapi";
import { router } from "@/lib/orpc/router";

const generator = new OpenAPIGenerator();
const spec = await generator.generate(router, {
  info: {
    title: "Greedex Calculator API",
    version: "1.0.0",
  },
  servers: [{ url: "/api/openapi" }],
});
```

Generates a complete OpenAPI 3.x specification from the oRPC router.

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

## Usage Examples

### RPC Usage (Application Code)

```typescript
"use client";
import { orpc } from "@/lib/orpc/orpc";

// Type-safe RPC call
const health = await orpc.health();
const profile = await orpc.users.getProfile();
```

### REST API Usage (External Tools)

```bash
# Using curl
curl http://localhost:3000/api/openapi/health

# Using POST
curl -X POST http://localhost:3000/api/openapi/helloWorld \
  -H "Content-Type: application/json" \
  -d '{"name": "World"}'
```

### OpenAPI Specification

```bash
# Get the specification
curl http://localhost:3000/api/openapi-spec
```

## Testing

### RPC Tests
Regular unit tests and integration tests use the oRPC client directly.

### REST API Tests
Dedicated test file at `src/test/openapi-rest.test.ts`:

```bash
npm run test:run
```

The REST API tests will:
- ✅ Skip gracefully if server is not running
- ✅ Test public endpoints (health, helloWorld)
- ✅ Test protected endpoints (authentication)
- ✅ Test error handling
- ✅ Test CORS headers
- ✅ Validate OpenAPI specification

## Router Configuration

All procedures in the router can be accessed via both endpoints:

```typescript
// src/lib/orpc/procedures.ts
export const getHealth = base
  .route({ method: "GET", path: "/health" })
  .handler(async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));
```

The `.route()` metadata enables:
- HTTP method specification (GET, POST, etc.)
- Custom path routing
- OpenAPI documentation generation
- REST API compatibility

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
- Use RPC endpoint (`/api/rpc`) for all application code
- Use OpenAPI endpoint (`/api/openapi`) for external integrations
- Add `.route()` metadata to all procedures for documentation
- Test both RPC and REST endpoints
- Keep router definitions simple (plain objects)

### ❌ DON'T:
- Don't use OpenAPI endpoint for internal application calls (use RPC instead)
- Don't overcomplicate router definitions
- Don't skip `.route()` metadata on public procedures
- Don't mix RPC and REST in the same component

## Advantages of Dual Setup

1. **Performance**: RPC protocol is optimized for Next.js app
2. **Compatibility**: REST API for external tools and integrations
3. **Documentation**: Automatic OpenAPI spec generation
4. **Testing**: Easy to test REST endpoints with standard tools
5. **Flexibility**: Choose the right protocol for each use case

## References

- [oRPC Documentation](https://orpc.dev)
- [RPCHandler Docs](https://orpc.dev/docs/rpc-handler)
- [OpenAPIHandler Docs](https://orpc.dev/docs/openapi/openapi-handler)
- [SSR Optimization](https://orpc.dev/docs/best-practices/optimize-ssr)
- [Scalar Documentation](https://github.com/scalar/scalar)

## Troubleshooting

### Issue: Type errors in client components
**Solution**: Ensure you're importing from `@/lib/orpc/orpc`, not from the router directly.

### Issue: 404 on API calls
**Solution**: Check that the route is registered in the router and uses `.route()` metadata.

### Issue: SSR not working
**Solution**: Verify `instrumentation.ts` imports `@/lib/orpc/client.server` and it's running in Node.js runtime.

### Issue: OpenAPI spec not showing procedures
**Solution**: Add `.route({ method, path })` metadata to your procedures.
