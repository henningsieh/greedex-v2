import { beforeAll, describe, expect, it } from "vitest";

/**
 * REST API Integration Tests for OpenAPI Endpoint
 *
 * This test suite verifies that the OpenAPI REST endpoint works correctly
 * and follows the OpenAPI specification standard.
 *
 * These tests are separate from the RPC tests and ensure the REST API layer
 * can be used by third-party integrations or tools that expect standard HTTP REST APIs.
 *
 * Note: These tests require a running server and are skipped in CI if the server is not available.
 */
const baseUrl = "http://localhost:3000/api/openapi";
let serverAvailable = false;

// Check if server is available before running tests
beforeAll(async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1000);

  try {
    console.log(`Checking server availability at: ${baseUrl}/health`);
    const response = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    console.log(`Server response status: ${response.status}`);
    if (response.ok) {
      serverAvailable = true;
      console.log("✅ Server is available");
    } else {
      serverAvailable = false;
      console.log("❌ Server responded but not OK");
    }
  } catch (error) {
    serverAvailable = false;
    console.warn("⚠️  OpenAPI server not running, skipping integration tests", error);
  } finally {
    clearTimeout(timeout);
  }
});

describe("OpenAPI REST Endpoint", () => {
  describe("SSR oRPC client", () => {
    it("uses server-side client during SSR and doesn't call /api/rpc", async () => {
      // Programmatically attach a server-side router client to globalThis
      const { createRouterClient } = await import("@orpc/server");
      const { router } = await import("@/lib/orpc/router");

      // Snap-in a server client for SSR (no network)
      globalThis.$client = createRouterClient(router, {
        context: async () => ({ headers: new Headers() }),
      });

      // Patch global fetch to fail if /api/rpc is called
      const g = globalThis as unknown as {
        fetch?: (...args: unknown[]) => Promise<unknown>;
        $client?: unknown;
      };
      const originalFetch = g.fetch;
      g.fetch = (...args: unknown[]) => {
        const resource = args[0] as string | { url?: string } | undefined;
        const url = typeof resource === "string" ? resource : resource?.url;
        if (typeof url === "string" && url.includes("/api/rpc")) {
          throw new Error("RPCLink network call detected during SSR");
        }
        if (typeof originalFetch === "function") {
          return (originalFetch as (...a: unknown[]) => Promise<unknown>)(
            ...args,
          );
        }
        return Promise.reject(new Error("No fetch available"));
      };

      try {
        const { orpc } = await import("@/lib/orpc/orpc");
        const result = await orpc.health();
        expect(result).toBeDefined();
        // If the server client was not used, network fetch would have thrown
      } finally {
        // cleanup
        const g2 = globalThis as unknown as {
          fetch?: (...args: unknown[]) => Promise<unknown>;
          $client?: unknown;
        };
        g2.fetch = originalFetch;
        delete g2.$client;
      }
    });
  });

  describe("Public Endpoints", () => {
    it("should return health status via GET /health", async () => {
      if (!serverAvailable) throw new Error("Server not available");
      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty("status", "ok");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("uptime");
      expect(data).toHaveProperty("environment");
    });

    it("should handle hello world via POST /helloWorld", async () => {
      if (!serverAvailable) throw new Error("Server not available");
      const response = await fetch(`${baseUrl}/helloWorld`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Test User" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty("message");
      expect(data.message).toContain("Test User");
      expect(data).toHaveProperty("timestamp");
    });

    it("should use default name when name not provided", async () => {
      if (!serverAvailable) throw new Error("Server not available");
      const response = await fetch(`${baseUrl}/helloWorld`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.message).toContain("World");
    });
  });

  describe("Protected Endpoints", () => {
    it("should return 401 for protected endpoints without auth", async () => {
      if (!serverAvailable) throw new Error("Server not available");
      const response = await fetch(`${baseUrl}/users/profile`, {
        method: "GET",
      });

      // Should be unauthorized
      expect(response.status).toBe(401);
    });

    it("should return session info when requesting /auth/session", async () => {
      if (!serverAvailable) throw new Error("Server not available");
      const response = await fetch(`${baseUrl}/auth/session`, {
        method: "GET",
      });

      // May return 200 with null session or session data depending on auth state
      expect(response.status).toBe(200);
      const data = await response.json();

      // Session endpoint should return a response (even if session is null)
      expect(data).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent endpoints", async () => {
      if (!serverAvailable) throw new Error("Server not available");
      const response = await fetch(`${baseUrl}/non-existent-endpoint`, {
        method: "GET",
      });

      expect(response.status).toBe(404);

      const text = await response.text();
      expect(text).toBe("Not found");
    });

    it("should handle invalid JSON input gracefully", async () => {
      if (!serverAvailable) throw new Error("Server not available");
      const response = await fetch(`${baseUrl}/helloWorld`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      });

      // Should return an error response (400 or 500 depending on implementation)
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("CORS Headers", () => {
    it("should include proper CORS headers", async () => {
      if (!serverAvailable) throw new Error("Server not available");
      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
        headers: {
          Origin: "http://localhost:3000",
        },
      });

      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
      expect(response.headers.get("Access-Control-Allow-Methods")).toBeDefined();
      expect(response.headers.get("Access-Control-Allow-Headers")).toBeDefined();
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
      // Required for OpenAPILink file detection
      expect(response.headers.get("Access-Control-Expose-Headers")).toContain("Content-Disposition");
    });

    it("should handle CORS preflight requests", async () => {
      if (!serverAvailable) throw new Error("Server not available");
      const response = await fetch(`${baseUrl}/health`, {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "GET",
        },
      });

      expect(response.status).toBe(204); // or 200
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
      expect(response.headers.get("Access-Control-Allow-Headers")).toBeDefined();
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
      // Required for OpenAPILink file detection
      expect(response.headers.get("Access-Control-Expose-Headers")).toContain("Content-Disposition");
    });
  });
});

describe("OpenAPI Specification", () => {
  const specUrl = "http://localhost:3000/api/openapi-spec";

  it("should serve OpenAPI specification", async () => {
    if (!serverAvailable) throw new Error("Server not available");
    const response = await fetch(specUrl);
    expect(response.status).toBe(200);

    const spec = await response.json();

    // Verify it's a valid OpenAPI spec
    expect(spec).toHaveProperty("openapi");
    expect(spec.openapi).toMatch(/^3\.\d+\.\d+$/); // Should be OpenAPI 3.x.x

    expect(spec).toHaveProperty("info");
    expect(spec.info).toHaveProperty("title");
    expect(spec.info).toHaveProperty("version");

    expect(spec).toHaveProperty("paths");
    expect(typeof spec.paths).toBe("object");

    // Check that some of our endpoints are documented
    expect(spec.paths).toHaveProperty("/health");
    expect(spec.paths).toHaveProperty("/helloWorld");
  });
});
