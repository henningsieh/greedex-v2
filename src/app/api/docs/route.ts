import { NextResponse } from "next/server";

/**
 * API Documentation endpoint using Scalar
 * Provides an interactive Swagger-like UI for the OpenAPI specification
 *
 * Access this page at /api/docs to explore and test the API
 *
 * Note: Uses CDN version of Scalar with SRI for security. For production:
 * - SRI hash is set for version 1.25.0 - update when upgrading
 * - To generate new SRI hash: curl -s "https://cdn.jsdelivr.net/npm/@scalar/api-reference@VERSION/dist/browser/standalone.js" | openssl dgst -sha384 -binary | openssl base64 -A
 * - Consider hosting the script locally for better performance
 * - Keep the version pinned to avoid unexpected updates
 *
 * SECURITY NOTE: The SRI hash is intentionally hardcoded (not in env vars) because:
 * - It's a public cryptographic checksum, not a secret
 * - It must exactly match the specific version of the script
 * - It doesn't vary between environments (same script = same hash)
 * - Hardcoding ensures version/hash consistency
 */

// SRI hash for @scalar/api-reference@1.25.0 - update when upgrading the package
// Generated with: curl -s "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.0/dist/browser/standalone.js" | openssl dgst -sha384 -binary | openssl base64 -A
const SCALAR_SRI_HASH =
  "sha384-aYYa3Qxeo6+Z48D3AmUywxDcZRSrJHutGAgpJiBtkiofix52Px1F0p8tFptEbnNX";

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
      })
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")}'
    ></script>
    <script 
      src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.0"
      integrity="${SCALAR_SRI_HASH}"
      crossorigin="anonymous"
    ></script>
  </body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
