import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";
import { router } from "@/lib/orpc/router";

/**
 * oRPC OpenAPI handler for Next.js route handlers
 * Handles REST API requests following OpenAPI specification
 * This is separate from the RPC endpoint and used for:
 * - REST API access
 * - OpenAPI documentation generation
 * - Third-party integrations
 */
const handler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin({
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Disposition'], // Required for OpenAPILink file detection
    credentials: true,
  })],
  interceptors: [
    onError((error) => {
      console.error("[OpenAPI Error]", error);
    }),
  ],
});

/**
 * Universal request handler for all HTTP methods
 * Handles REST requests following OpenAPI specification
 */
async function handleRequest(request: Request) {
  const { matched, response } = await handler.handle(request, {
    prefix: "/api/openapi",
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
export const OPTIONS = handleRequest;
