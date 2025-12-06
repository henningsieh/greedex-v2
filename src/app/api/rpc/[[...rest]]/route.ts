import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "@/lib/orpc/router";

/**
 * oRPC handler for Next.js route handlers
 * Handles all RPC requests with error logging
 */
const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error("[oRPC Error]", error);
    }),
  ],
});

/**
 * Universal request handler for all HTTP methods
 * Converts Next.js Request to oRPC format and handles the request
 */
async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {
      headers: request.headers,
    },
  });

  return (
    response ??
    new Response("Not found", {
      status: 404,
    })
  );
}

// Export all HTTP method handlers required by Next.js
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const HEAD = handleRequest;

