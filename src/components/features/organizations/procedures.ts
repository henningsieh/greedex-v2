import { z } from "zod";
import {
  memberRoles,
  type SortField,
  validSortFields,
} from "@/components/features/organizations/types";
import { MemberWithUserSchema } from "@/components/features/organizations/validation-schemas";
import { auth } from "@/lib/better-auth";
import { base } from "@/lib/orpc/context";
import { authorized } from "@/lib/orpc/middleware";

function getSortKey(
  member: z.infer<typeof MemberWithUserSchema>,
  sortBy: SortField,
): string | number {
  if (sortBy === "createdAt") {
    const time = new Date(member.createdAt).getTime();
    return Number.isNaN(time) ? 0 : time;
  }
  if (sortBy === "user.name") {
    return (member.user?.name || "").toLowerCase();
  }
  if (sortBy === "email") {
    return (member.user?.email || "").toLowerCase();
  }
  // This should never happen due to the enum constraint, but TypeScript requires it
  throw new Error(`Invalid sortBy field: ${sortBy}`);
}

/**
 * List user's organizations using Better Auth
 * Uses Better Auth's implicit organization.list endpoint
 */
export const listOrganizations = base
  .route({
    method: "GET",
    path: "/organizations",
    summary: "List user's organizations",
  })
  .handler(async ({ context }) => {
    const organizations = await auth.api.listOrganizations({
      headers: context.headers,
    });
    return organizations || [];
  });

export const searchMembers = authorized
  .route({
    method: "POST",
    path: "/organizations/members/search",
    description: "Search members with flexible filters",
    tags: ["Organizations"],
  })
  .input(
    z.object({
      organizationId: z.string(),
      filters: z
        .object({
          roles: z.array(z.enum(Object.values(memberRoles))).optional(),
          // Simple search string to match against user name or email
          search: z.string().optional(),
          // Sorting: a field name (e.g. "createdAt" | "user.name" | "email")
          sortBy: z.enum(validSortFields).optional(),
          sortDirection: z.enum(["asc", "desc"]).optional(),
          // limit/offset for pagination
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
        .optional(),
    }),
  )
  .output(
    z.object({
      members: z.array(MemberWithUserSchema),
      total: z.number(),
    }),
  )
  .handler(async ({ context, input }) => {
    const { organizationId, filters } = input;

    const allMembers: Array<z.infer<typeof MemberWithUserSchema>> = [];
    // Ensure filters exist and default values
    const roles = filters?.roles || [];
    const search = filters?.search || undefined;
    const sortBy = filters?.sortBy || undefined;
    const sortDirection = filters?.sortDirection || undefined;
    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;

    for (const role of roles) {
      const result = await auth.api.listMembers({
        query: {
          organizationId,
          filterField: "role",
          filterOperator: "contains",
          filterValue: role,
        },
        headers: context.headers,
      });
      allMembers.push(...(result?.members || []));
    }

    // Deduplicate members by id in case of overlapping roles
    // Apply search filtering on returned users (server-side if API supports it)
    const filteredMembers = search
      ? allMembers.filter((member) => {
          const lower = search.toLowerCase();
          return (
            (member.user?.name || "").toLowerCase().includes(lower) ||
            (member.user?.email || "").toLowerCase().includes(lower)
          );
        })
      : allMembers;

    // Deduplicate members by id first
    const seen = new Set<string>();
    const uniqueFiltered = filteredMembers.filter((member) => {
      if (seen.has(member.id)) {
        return false;
      }
      seen.add(member.id);
      return true;
    });

    // Sorting
    const sortedMembers = sortBy
      ? [...uniqueFiltered].sort((a, b) => {
          const dir = sortDirection === "asc" ? 1 : -1;
          const aKey = getSortKey(a, sortBy);
          const bKey = getSortKey(b, sortBy);
          if (aKey < bKey) {
            return -1 * dir;
          }
          if (aKey > bKey) {
            return 1 * dir;
          }
          return 0;
        })
      : [...uniqueFiltered].sort((a, b) => {
          const aVal = getSortKey(a, "createdAt") as number;
          const bVal = getSortKey(b, "createdAt") as number;
          return bVal - aVal; // desc
        });

    // Apply pagination
    const paged = sortedMembers.slice(offset, offset + limit);
    return {
      members: paged,
      total: sortedMembers.length,
    };
  });
