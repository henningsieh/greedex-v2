/**
 * API Contract: List Organization Members
 *
 * Endpoint: GET /api/organizations/:orgId/members (or via Better Auth API)
 * Purpose: List all members of a specific organization
 * Authentication: Required (must be member of the organization)
 */

import { MEMBER_ROLES, MemberRole } from "@/features/organizations";
import { z } from "zod";

// ============================================================================
// Request Schema
// ============================================================================

export const listMembersParamsSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
});

export const listMembersQuerySchema = z
  .object({
    // Future pagination support (not in MVP)
    limit: z.coerce.number().int().min(1).max(100).default(100).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
    // Future filtering
    role: z.enum(MEMBER_ROLES).optional(),
  })
  .optional();

export type ListMembersParams = z.infer<typeof listMembersParamsSchema>;
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;

// ============================================================================
// Response Schema
// ============================================================================

export const memberSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  role: z.enum(MEMBER_ROLES),
  createdAt: z.date(), // Join date
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.email(),
    image: z.url().nullable(),
  }),
});

export const listMembersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(memberSchema),
  pagination: z
    .object({
      total: z.number().int().min(0),
      limit: z.number().int(),
      offset: z.number().int(),
    })
    .optional(),
});

export type Member = z.infer<typeof memberSchema>;
export type ListMembersResponse = z.infer<typeof listMembersResponseSchema>;

// ============================================================================
// Error Responses
// ============================================================================

export const listMembersErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum(["UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "INTERNAL_ERROR"]),
    message: z.string(),
  }),
});

export type ListMembersError = z.infer<typeof listMembersErrorSchema>;

// ============================================================================
// Test Cases
// ============================================================================

export const listMembersTestCases = {
  // Valid scenarios
  valid: {
    singleMember: {
      setup: "User creates organization",
      expectedCount: 1,
      expectedRole: "owner",
    },
    multipleMembers: {
      setup: "Organization with owner + 4 members",
      expectedCount: 5,
      expectedOwnerCount: 1,
    },
  },

  // Access control
  accessControl: {
    nonMember: {
      setup: "User tries to list members of org they do not belong to",
      expectedStatus: 403,
      expectedError: "FORBIDDEN",
    },
    unauthenticated: {
      setup: "No auth session",
      expectedStatus: 401,
      expectedError: "UNAUTHORIZED",
    },
    invalidOrgId: {
      setup: "Non-existent organization ID",
      expectedStatus: 404,
      expectedError: "NOT_FOUND",
    },
  },

  // Edge cases
  edgeCases: {
    justCreated: {
      setup: "Organization created seconds ago",
      expectedCount: 1,
      expectedRole: "owner",
      checkJoinDate: (member: Member) => {
        const now = new Date();
        const joinDate = new Date(member.createdAt);
        return now.getTime() - joinDate.getTime() < 10000; // < 10 seconds
      },
    },
    displayOrder: {
      setup: "5 members added at different times",
      expectedOrder: "oldest first (owner first, then chronological)",
    },
  },
};

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const listMembersStatusCodes = {
  SUCCESS: 200, // OK
  UNAUTHORIZED: 401, // Not authenticated
  FORBIDDEN: 403, // Not a member of this organization
  NOT_FOUND: 404, // Organization doesn't exist
  INTERNAL_ERROR: 500, // Internal Server Error
} as const;

// ============================================================================
// Request/Response Examples
// ============================================================================

export const listMembersExamples = {
  request: {
    method: "GET",
    url: "/api/organizations/550e8400-e29b-41d4-a716-446655440000/members",
    headers: {
      Cookie: "auth-session=...", // Better Auth session cookie
    },
  },

  responses: {
    success: {
      status: 200,
      body: {
        success: true,
        data: [
          {
            id: "member-id-1",
            userId: "user-id-1",
            organizationId: "550e8400-e29b-41d4-a716-446655440000",
            role: "owner",
            createdAt: new Date("2025-11-07T10:00:00Z"),
            user: {
              id: "user-id-1",
              name: "John Doe",
              email: "john@example.com",
              image: "https://example.com/avatar.jpg",
            },
          },
          {
            id: "member-id-2",
            userId: "user-id-2",
            organizationId: "550e8400-e29b-41d4-a716-446655440000",
            role: "admin",
            createdAt: new Date("2025-11-07T11:30:00Z"),
            user: {
              id: "user-id-2",
              name: "Jane Smith",
              email: "jane@example.com",
              image: null,
            },
          },
        ],
      },
    },

    singleMember: {
      status: 200,
      body: {
        success: true,
        data: [
          {
            id: "member-id-1",
            userId: "user-id-1",
            organizationId: "550e8400-e29b-41d4-a716-446655440000",
            role: "owner",
            createdAt: new Date("2025-11-07T10:00:00Z"),
            user: {
              id: "user-id-1",
              name: "John Doe",
              email: "john@example.com",
              image: null,
            },
          },
        ],
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

    forbidden: {
      status: 403,
      body: {
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "You do not have permission to view members of this organization",
        },
      },
    },

    notFound: {
      status: 404,
      body: {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Organization not found",
        },
      },
    },
  },
};

// ============================================================================
// Contract Tests (SPEC ONLY — execution out-of-scope)
// ============================================================================

// NOTE: The following contract test cases are provided as specifications only.
// Test execution, harnesses, and automated implementation are out-of-scope
// per the current product policy. Use these cases as documentation for
// future manual or automated test work.
export const listMembersContractTests = [
  {
    name: "should return single owner for newly created organization",
    setup: async () => {
      // Create organization (user becomes owner)
    },
    expectedStatus: 200,
    expectedSchema: listMembersResponseSchema,
    expectedData: (data: Member[]) => {
      return data.length === 1 && data[0].role === "owner";
    },
  },
  {
    name: "should include user details (name, email) in response",
    setup: async () => {
      // Create org with owner
    },
    expectedStatus: 200,
    expectedData: (data: Member[]) => {
      const member = data[0];
      return member.user.name && member.user.email;
    },
  },
  {
    name: "should order members by join date (oldest first)",
    setup: async () => {
      // Add 3 members at different times
    },
    expectedStatus: 200,
    expectedData: (data: Member[]) => {
      return (
        data[0].createdAt <= data[1].createdAt &&
        data[1].createdAt <= data[2].createdAt
      );
    },
  },
  {
    name: "should reject non-member trying to list members",
    setup: async () => {
      // Create org as User A, authenticate as User B (not a member)
    },
    expectedStatus: 403,
  },
  {
    name: "should reject unauthenticated requests",
    setup: async () => {
      // Clear auth session
    },
    expectedStatus: 401,
  },
  {
    name: "should return 404 for non-existent organization",
    setup: async () => {
      // Use fake UUID that doesn't exist
    },
    expectedStatus: 404,
  },
  {
    name: "should show correct join date matching organization creation for owner",
    setup: async () => {
      // Create org and immediately query members
    },
    expectedStatus: 200,
    expectedData: (data: Member[], orgCreatedAt: Date) => {
      const owner = data.find((m) => m.role === "owner");
      return (
        owner &&
        Math.abs(owner.createdAt.getTime() - orgCreatedAt.getTime()) < 1000
      );
    },
  },
];

// ============================================================================
// Display Format (for Team Table)
// ============================================================================

export interface TeamTableRow {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinDate: string; // Formatted date string
  avatar: string | null;
}

export function transformMemberToTableRow(member: Member): TeamTableRow {
  return {
    id: member.id,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    joinDate: new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(member.createdAt)),
    avatar: member.user.image,
  };
}
