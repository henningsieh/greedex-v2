import { z } from "zod";
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

export const listOrganizationMembers = authorized
  // .route()
  .input(
    z.object({
      organizationId: z.string(),
      roles: z.array(z.string()),
    }),
  )
  .output(
    z.object({
      members: z.array(z.any()), // TODO: Define proper member schema
    }),
  )
  .handler(async ({ context, input }) => {
    const { organizationId, roles } = input;

    const allMembers = [];
    for (const role of roles) {
      const result = await auth.api.listMembers({
        query: {
          organizationId,
          filterField: "role",
          filterOperator: "eq",
          filterValue: role,
        },
        headers: context.headers,
      });
      allMembers.push(...(result?.members || []));
    }

    // Deduplicate members by id in case of overlapping roles
    const uniqueMembers = allMembers.filter(
      (member, index, self) =>
        index === self.findIndex((m) => m.id === member.id),
    );

    return { members: uniqueMembers };
  });
