import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";
import { router } from "@/lib/orpc/router";

/**
 * oRPC OpenAPI handler for Next.js route handlers
 * Handles OpenAPI REST requests as per oRPC documentation
 */
const handler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [
    onError((error) => {
      console.error("[oRPC Error]", error);
    }),
  ],
});

/**
 * Universal request handler for all HTTP methods
 * Handles requests using OpenAPI handler as per oRPC documentation
 */
async function handleRequest(request: Request) {
  const { matched, response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {
      headers: request.headers,
    },
  });

  if (matched) {
    return response;
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
