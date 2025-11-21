/**
 * API Contract: List Organizations
 *
 * Endpoint: GET /api/organizations (or via Better Auth API)
 * Purpose: List all organizations the current user is a member of
 * Authentication: Required
 */

import { z } from "zod";
import { organizationRoles } from "@/components/features/organizations/types";

// ============================================================================
// Request Schema
// ============================================================================

// No request body (GET request)
// Optional query parameters for future filtering/pagination

export const listOrganizationsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(100).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  })
  .optional();

export type ListOrganizationsQuery = z.infer<
  typeof listOrganizationsQuerySchema
>;

// ============================================================================
// Response Schema
// ============================================================================

export const organizationSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().url().nullable(),
  createdAt: z.date(),
  role: z.enum(organizationRoles), // User's role in this org
  memberCount: z.number().int().min(1), // For future display
});

export const listOrganizationsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(organizationSummarySchema),
  pagination: z
    .object({
      total: z.number().int().min(0),
      limit: z.number().int(),
      offset: z.number().int(),
    })
    .optional(),
});

export type ListOrganizationsResponse = z.infer<
  typeof listOrganizationsResponseSchema
>;

// ============================================================================
// Error Responses
// ============================================================================

export const listOrganizationsErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum(["UNAUTHORIZED", "INTERNAL_ERROR"]),
    message: z.string(),
  }),
});

export type ListOrganizationsError = z.infer<
  typeof listOrganizationsErrorSchema
>;

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const listOrganizationsStatusCodes = {
  SUCCESS: 200, // OK
  UNAUTHORIZED: 401, // Not authenticated
  INTERNAL_ERROR: 500, // Internal Server Error
} as const;

// ============================================================================
// Request/Response Examples
// ============================================================================

export const listOrganizationsExamples = {
  request: {
    method: "GET",
    url: "/api/organizations",
    headers: {
      Cookie: "auth-session=...", // Better Auth session cookie
    },
    query: {}, // Optional: ?limit=10&offset=0
  },

  responses: {
    success: {
      status: 200,
      body: {
        success: true,
        data: [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "My First Organization",
            slug: "my-first-org",
            logo: null,
            createdAt: new Date("2025-11-07T10:00:00Z"),
            role: "owner",
            memberCount: 1,
          },
          {
            id: "660e8400-e29b-41d4-a716-446655440001",
            name: "Another Organization",
            slug: "another-org",
            logo: "https://example.com/logo.png",
            createdAt: new Date("2025-11-06T14:30:00Z"),
            role: "admin",
            memberCount: 5,
          },
        ],
      },
    },

    emptyList: {
      status: 200,
      body: {
        success: true,
        data: [],
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
  },
};

// ============================================================================
// Contract Tests (SPEC ONLY — execution out-of-scope)
// NOTE: No automated test harness is included in this repository for these
// contracts. The contract definitions are specification artifacts; execution
// and implementation of test harnesses are out-of-scope per product policy.
