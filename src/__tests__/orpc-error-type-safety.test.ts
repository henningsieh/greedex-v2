/**
 * Type Safety Test for oRPC Error Handling
 *
 * This test verifies that TypeScript enforces type-safe error codes
 * when using the isDefinedORPCError type guard.
 */

import { ORPCError } from "@orpc/client";
import { describe, expect, it } from "vitest";
import { ERROR_CODES, type ErrorCode } from "@/lib/orpc/router";

/**
 * Type guard to check if error is an ORPCError with defined error codes
 */
function isDefinedORPCError(
  error: unknown,
): error is ORPCError<ErrorCode, unknown> {
  return (
    error instanceof ORPCError && ERROR_CODES.includes(error.code as ErrorCode)
  );
}

describe("oRPC Error Type Safety", () => {
  it("should allow valid error codes", () => {
    const error = new ORPCError("NOT_FOUND", {
      message: "Resource not found",
    }) as ORPCError<ErrorCode, unknown>;

    if (isDefinedORPCError(error)) {
      // ✅ These should compile without errors
      expect(error.code).toBe("NOT_FOUND");

      // Use runtime list exported from router to avoid duplicating the allowed codes
      // and ensure tests stay in sync with the source-of-truth.
      const validCodes = ERROR_CODES;
      expect(validCodes.includes(error.code)).toBe(true);
    }
  });

  it("should reject invalid error codes at compile time", () => {
    const error = new ORPCError("NOT_FOUND", {
      message: "Resource not found",
    });

    if (isDefinedORPCError(error)) {
      // @ts-expect-error - "NOT_EXISTING_ERROR" is not a valid ErrorCode
      const invalidCheck1 = error.code === "NOT_EXISTING_ERROR";

      // @ts-expect-error - "INVALID_ERROR" is not a valid ErrorCode
      const invalidCheck2 = error.code === "INVALID_ERROR";

      // @ts-expect-error - "SOME_RANDOM_ERROR" is not a valid ErrorCode
      const invalidCheck3 = error.code === "SOME_RANDOM_ERROR";

      // Suppress unused variable warnings
      expect(invalidCheck1).toBeDefined();
      expect(invalidCheck2).toBeDefined();
      expect(invalidCheck3).toBeDefined();
    }
  });

  it("should correctly identify ORPCError instances", () => {
    const orpcError = new ORPCError("FORBIDDEN", { message: "Access denied" });
    const regularError = new Error("Regular error");

    expect(isDefinedORPCError(orpcError)).toBe(true);
    expect(isDefinedORPCError(regularError)).toBe(false);
    expect(isDefinedORPCError(null)).toBe(false);
    expect(isDefinedORPCError(undefined)).toBe(false);
    expect(isDefinedORPCError("string")).toBe(false);
    expect(isDefinedORPCError(123)).toBe(false);
  });

  it("should provide type-safe error code access", () => {
    const errors = [
      new ORPCError("NOT_FOUND", { message: "Not found" }),
      new ORPCError("FORBIDDEN", { message: "Forbidden" }),
      new ORPCError("BAD_REQUEST", { message: "Bad request" }),
      new ORPCError("UNAUTHORIZED", { message: "Unauthorized" }),
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Internal server error",
      }),
    ];

    for (const error of errors) {
      if (isDefinedORPCError(error)) {
        // All these should be type-safe
        const isNotFound = error.code === "NOT_FOUND";
        const isForbidden = error.code === "FORBIDDEN";
        const isBadRequest = error.code === "BAD_REQUEST";
        const isUnauthorized = error.code === "UNAUTHORIZED";
        const isInternalServerError = error.code === "INTERNAL_SERVER_ERROR";

        // At least one should be true
        expect(
          isNotFound ||
            isForbidden ||
            isBadRequest ||
            isUnauthorized ||
            isInternalServerError,
        ).toBe(true);
      }
    }
  });

  it("should narrow error type correctly in switch statements", () => {
    // Create error with explicit type to allow switch on all cases
    const createError = (code: ErrorCode) =>
      new ORPCError(code, { message: "Test error" }) as ORPCError<
        ErrorCode,
        unknown
      >;

    const testCases: ErrorCode[] = [
      "NOT_FOUND",
      "FORBIDDEN",
      "BAD_REQUEST",
      "UNAUTHORIZED",
    ];

    for (const code of testCases) {
      const error = createError(code);

      if (isDefinedORPCError(error)) {
        let result = "";

        switch (error.code) {
          case "NOT_FOUND":
            result = "not_found";
            break;
          case "FORBIDDEN":
            result = "forbidden";
            break;
          case "BAD_REQUEST":
            result = "bad_request";
            break;
          case "UNAUTHORIZED":
            result = "unauthorized";
            break;
          case "INTERNAL_SERVER_ERROR":
            result = "internal_server_error";
            break;
          default: {
            // TypeScript should know this is exhaustive
            const _exhaustive: never = error.code;
            result = _exhaustive;
          }
        }

        expect(result).toBeTruthy();
      }
    }
  });
});
