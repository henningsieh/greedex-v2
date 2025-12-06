/**
 * API Contract: Create Organization
 *
 * Endpoint: POST /api/organizations
 * Purpose: Create a new organization with the current user as owner
 * Authentication: Required (verified email)
 */

import { z } from "zod";

// ============================================================================
// Request Schema
// ============================================================================

export const createOrganizationRequestSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim(),

  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must not exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .trim()
    .toLowerCase(),

  logo: z.string().url("Logo must be a valid URL").optional().nullable(),

  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type CreateOrganizationRequest = z.infer<
  typeof createOrganizationRequestSchema
>;

// ============================================================================
// Response Schema
// ============================================================================

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  logo: z.url().nullable(),
  createdAt: z.date(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export const createOrganizationResponseSchema = z.object({
  success: z.boolean(),
  data: organizationSchema,
});

export type CreateOrganizationResponse = z.infer<
  typeof createOrganizationResponseSchema
>;

// ============================================================================
// Error Responses
// ============================================================================

export const createOrganizationErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum([
      "VALIDATION_ERROR",
      "DUPLICATE_SLUG",
      "EMAIL_NOT_VERIFIED",
      "UNAUTHORIZED",
      "INTERNAL_ERROR",
    ]),
    message: z.string(),
    details: z.record(z.string(), z.array(z.string())).optional(), // Field-level errors
  }),
});

export type CreateOrganizationError = z.infer<
  typeof createOrganizationErrorSchema
>;

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const createOrganizationStatusCodes = {
  SUCCESS: 201, // Created
  VALIDATION_ERROR: 400, // Bad Request
  UNAUTHORIZED: 401, // Not authenticated
  EMAIL_NOT_VERIFIED: 403, // Forbidden
  DUPLICATE_SLUG: 409, // Conflict
  INTERNAL_ERROR: 500, // Internal Server Error
} as const;

// ============================================================================
// Request/Response Examples
// ============================================================================

export const createOrganizationExamples = {
  request: {
    headers: {
      "Content-Type": "application/json",
      Cookie: "auth-session=...", // Better Auth session cookie
    },
    body: {
      name: "My Organization",
      slug: "my-org",
    },
  },

  responses: {
    success: {
      status: 201,
      body: {
        success: true,
        data: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "My Organization",
          slug: "my-org",
          logo: null,
          createdAt: new Date("2025-11-07T10:00:00Z"),
          metadata: null,
        },
      },
    },

    validationError: {
      status: 400,
      body: {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: {
            name: ["Name must be at least 3 characters"],
            slug: [
              "Slug must contain only lowercase letters, numbers, and hyphens",
            ],
          },
        },
      },
    },

    duplicateSlug: {
      status: 409,
      body: {
        success: false,
        error: {
          code: "DUPLICATE_SLUG",
          message: "This slug is already taken. Please choose a different one.",
        },
      },
    },

    unauthorized: {
      status: 401,
      body: {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
    },

    emailNotVerified: {
      status: 403,
      body: {
        success: false,
        error: {
          code: "EMAIL_NOT_VERIFIED",
          message:
            "Email verification required before creating an organization",
        },
      },
    },
  },
};
