import { router } from "@/lib/orpc/router";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { CORSPlugin } from "@orpc/server/plugins";

/**
 * Centralized OpenAPI handler used by both `/api/openapi` and `/api/docs`.
 *
 * - Serves the OpenAPI REST endpoints under `/api/openapi/*`
 * - Serves the interactive API reference UI at `/api/docs` (Scalar)
 */
export const openapiHandler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin({
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Disposition"],
      credentials: true,
    }),
    new OpenAPIReferencePlugin({
      docsProvider: "scalar",
      docsPath: "/api/docs",
      specPath: "/api/openapi-spec",
      specGenerateOptions: {
        info: {
          title: "Greedex Calculator API",
          version: "1.0.0",
        },
      },
    }),
  ],
  interceptors: [
    onError((error) => {
      const isParsingError = error instanceof SyntaxError;
      const isClientError =
        error && typeof error === "object" && "status" in error
          ? (error.status as number) >= 400 && (error.status as number) < 500
          : false;

      if (isParsingError || isClientError) {
        return;
      }

      console.error("[OpenAPI Error]", error);
    }),
  ],
});
