import { z } from "zod";
import { memberRoles } from "@/components/features/organizations/types";
import { MemberWithUserSchema } from "@/components/features/organizations/validation-schemas";
import { auth } from "@/lib/better-auth";
import { base } from "@/lib/orpc/context";
import { authorized } from "@/lib/orpc/middleware";

/**
 * List user's organizations using Better Auth
 * Uses Better Auth's implicit organization.list endpoint
 */
export const listOrganizations = base.handler(async ({ context }) => {
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
          sortBy: z.string().optional(),
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

    const allMembers = [];
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

    // Sorting
    const sortedMembers = sortBy
      ? filteredMembers.sort((a, b) => {
          const dir = sortDirection === "asc" ? 1 : -1;
          const aVal = sortBy === "createdAt" ? a.createdAt : a.user?.name || "";
          const bVal = sortBy === "createdAt" ? b.createdAt : b.user?.name || "";
          if (aVal < bVal) return -1 * dir;
          if (aVal > bVal) return 1 * dir;
          return 0;
        })
      : filteredMembers.sort((a, b) =>
          new Date(b.createdAt) > new Date(a.createdAt) ? 1 : -1,
        );
    const uniqueMembers = sortedMembers.filter(
      (member, index, self) =>
        index === self.findIndex((m) => m.id === member.id),
    );

    // Apply pagination
    const paged = uniqueMembers.slice(offset, offset + limit);
    return {
      members: paged,
      total: uniqueMembers.length,
    };
  });
