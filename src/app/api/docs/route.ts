import { NextResponse } from "next/server";

/**
 * API Documentation endpoint using Scalar
 * Provides an interactive Swagger-like UI for the OpenAPI specification
 *
 * Access this page at /api/docs to explore and test the API
 *
 * Note: Uses CDN version of Scalar for simplicity. For production, consider:
 * - Adding SRI (Subresource Integrity) hash
 * - Hosting the script locally
 * - Using a specific version instead of latest
 */
export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Greedex Calculator API Documentation</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      type="application/json"
      data-configuration='${JSON.stringify({
        spec: {
          url: "/api/openapi-spec",
        },
        darkMode: true,
        layout: "modern",
        theme: "purple",
        showSidebar: true,
        searchHotKey: "k",
      })}'
    ></script>
    <!-- TODO: Consider adding SRI hash or hosting locally for production -->
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
