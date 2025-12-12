import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";
import { router } from "@/lib/orpc/router";

/**
 * oRPC RPC handler for standard RPC requests (used by RPCLink client)
 */
const rpcHandler = new RPCHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [
    onError((error) => {
      console.error("[oRPC Error]", error);
    }),
  ],
});

/**
 * oRPC OpenAPI handler for REST API requests
 */
const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [
    onError((error) => {
      console.error("[oRPC Error]", error);
    }),
  ],
});

/**
 * Universal request handler for all HTTP methods
 * Tries RPC handler first (for standard RPC calls), then OpenAPI handler
 */
async function handleRequest(request: Request) {
  const context = {
    headers: request.headers,
  };

  // Try RPC handler first (for RPCLink client requests)
  const rpcResult = await rpcHandler.handle(request, {
    prefix: "/api/rpc",
    context,
  });

  if (rpcResult.matched) {
    return rpcResult.response;
  }

  // Fall back to OpenAPI handler (for REST API requests)
  const openAPIResult = await openAPIHandler.handle(request, {
    prefix: "/api/rpc",
    context,
  });

  if (openAPIResult.matched) {
    return openAPIResult.response;
  }

  return new Response("Not found", {
    status: 404,
  });
}

// Export all HTTP method handlers required by Next.js
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const HEAD = handleRequest;
