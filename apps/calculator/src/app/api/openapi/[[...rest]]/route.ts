import { openapiHandler } from "@/lib/orpc/openapi-handler";

/**
 * oRPC OpenAPI handler for Next.js route handlers
 * Handles REST API requests following OpenAPI specification
 * This is separate from the RPC endpoint and used for:
 * - REST API access
 * - OpenAPI documentation generation
 * - Third-party integrations
 */

/**
 * Universal request handler for all HTTP methods
 * Handles REST requests following OpenAPI specification
 */
async function handleRequest(request: Request) {
  try {
    const { matched, response } = await openapiHandler.handle(request, {
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
  } catch (error) {
    // Catch parsing errors (invalid JSON, etc.) and return 400
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({
          error: "Invalid request format",
          message: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    // Re-throw unexpected errors
    throw error;
  }
}

// Export all HTTP method handlers required by Next.js
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const HEAD = handleRequest;
export const OPTIONS = handleRequest;
