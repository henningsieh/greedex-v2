import { OpenAPIGenerator } from "@orpc/openapi";
import { NextResponse } from "next/server";

import { router } from "@/lib/orpc/router";

/**
 * OpenAPI specification endpoint
 * Generates the OpenAPI 3.0 specification from the oRPC router
 * Used by Scalar UI and other API documentation tools
 */
export async function GET() {
  const generator = new OpenAPIGenerator();

  const spec = await generator.generate(router, {
    info: {
      title: "Greedex Calculator API",
      version: "1.0.0",
      description:
        "API for the Greedex Calculator application. This API provides endpoints for project management, organization management, and user authentication.",
    },
    servers: [
      {
        url: "/api/openapi",
        description: "OpenAPI REST endpoint",
      },
    ],
  });

  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
