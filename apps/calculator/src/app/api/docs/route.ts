import { openapiHandler } from "@/lib/orpc/openapi-handler";

/**
 * Delegates /api/docs requests to the OpenAPIHandler which is configured
 * with the OpenAPIReferencePlugin and will serve the interactive UI.
 */
export async function GET(request: Request) {
  const { matched, response } = await openapiHandler.handle(request, {
    // Leave prefix empty so the plugin can match absolute docsPath (/api/docs)
    context: { headers: request.headers },
  });

  if (matched) {
    return response;
  }

  return new Response("Not found", { status: 404 });
}
