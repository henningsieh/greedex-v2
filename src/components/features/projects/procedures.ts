// src/components/features/projects/procedures.ts:

import { randomUUID } from "node:crypto";
import { ORPCError } from "@orpc/server";
import { and, asc, eq, inArray, type SQL, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { memberRoles } from "@/components/features/organizations/types";
import { ProjectParticipantWithUserSchema } from "@/components/features/projects/participant-types";
import {
  DEFAULT_PROJECT_SORT,
  ProjectActivityFormSchema,
  ProjectActivityWithRelationsSchema,
  ProjectFormSchema,
  ProjectWithRelationsSchema,
  SORT_OPTIONS,
} from "@/components/features/projects/types";
import { auth } from "@/lib/better-auth";
import { db } from "@/lib/drizzle/db";
import {
  projectActivity,
  projectParticipant,
  projectTable,
  session as sessionTable,
  user,
} from "@/lib/drizzle/schema";
import { authorized, requireProjectPermissions } from "@/lib/orpc/middleware";

/**
 * Create a new project
 *
 * Requires:
 * - Authentication
 * - Active organization
 * - "create" permission on project resource (owner/admin only)
 */
export const createProject = authorized
  .use(requireProjectPermissions(["create"]))
  .route({
    method: "POST",
    path: "/projects",
    summary: "Create a new project",
    tags: ["project"],
  })
  .input(ProjectFormSchema)
  .output(
    z.object({
      success: z.boolean(),
      project: ProjectWithRelationsSchema,
    }),
  )
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    const newProject = await db
      .insert(projectTable)
      .values({
        id: randomUUID(),
        ...input,
        responsibleUserId: context.user.id,
        organizationId: context.session.activeOrganizationId,
      })
      .returning();

    // Fetch the created project with responsible user
    const project = await db.query.projectTable.findFirst({
      where: eq(projectTable.id, newProject[0].id),
      with: {
        responsibleUser: true,
        organization: true,
      },
    });

    if (!project) {
      throw new ORPCError("INTERNAL_ERROR", {
        message: "Failed to fetch created project",
      });
    }

    return {
      success: true,
      project,
    };
  });

/**
 * List projects based on user's organization membership
 *
 * Behavior:
 * - Members (role: "member"): See all projects in their organization (read-only)
 * - Admins/Owners: See all projects in their organization (full access)
 *
 * This respects Better Auth's organization-based permissions:
 * - Users can only see projects from organizations they are members of
 * - Projects are isolated by organization
 */
export const listProjects = authorized
  .use(requireProjectPermissions(["read"]))
  .route({
    method: "GET",
    path: "/projects",
    summary: "List all projects in the active organization",
    tags: ["project"],
  })
  .input(
    z
      .object({
        sort_by: z
          .enum(Object.values(SORT_OPTIONS))
          .default(DEFAULT_PROJECT_SORT)
          .optional(),
      })
      .optional(),
  )
  .output(z.array(ProjectWithRelationsSchema))
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Determine sort order
    let orderByClause: SQL<unknown>;
    switch (input?.sort_by) {
      case SORT_OPTIONS.name:
        orderByClause = asc(sql`lower(${projectTable.name})`);
        break;
      case SORT_OPTIONS.startDate:
        orderByClause = asc(projectTable.startDate);
        break;
      case SORT_OPTIONS.createdAt:
        orderByClause = asc(projectTable.createdAt);
        break;
      case SORT_OPTIONS.updatedAt:
        orderByClause = asc(projectTable.updatedAt);
        break;
      default:
        orderByClause = asc(projectTable.createdAt);
    }

    // Get all projects that belong to the user's active organization
    // Permission check ensures user is a member of the organization
    const projects = await db.query.projectTable.findMany({
      where: eq(
        projectTable.organizationId,
        context.session.activeOrganizationId,
      ),
      orderBy: [orderByClause],
      with: {
        responsibleUser: true,
        organization: true,
      },
    });

    return projects;
  });

/**
 * Get project details by ID
 *
 * Requires:
 * - Authentication
 * - "read" permission on project resource
 * - Project must belong to user's active organization
 */
export const getProjectById = authorized
  .use(requireProjectPermissions(["read"]))
  .route({
    method: "GET",
    path: "/projects/:id",
    summary: "Get project details by ID",
    tags: ["project"],
  })
  .input(
    z.object({
      id: z.string().describe("Project ID"),
    }),
  )
  .output(ProjectWithRelationsSchema)
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Fetch project and verify it belongs to user's organization
    const project = await db.query.projectTable.findFirst({
      where: and(
        eq(projectTable.id, input.id),
        eq(projectTable.organizationId, context.session.activeOrganizationId),
      ),
      with: {
        responsibleUser: true,
        organization: true,
      },
    });

    if (!project) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found or you don't have access to it",
      });
    }

    return project;
  });

/**
 * Update project details
 *
 * Requires:
 * - Authentication
 * - "update" permission on project resource (admin/owner only)
 * - Project must belong to user's active organization
 */
export const updateProject = authorized
  .use(requireProjectPermissions(["update"]))
  .route({
    method: "PATCH",
    path: "/projects/:id",
    summary: "Update project details",
    tags: ["project"],
  })
  .input(
    z.object({
      id: z.string().describe("Project ID"),
      data: ProjectFormSchema.partial(),
    }),
  )
  .output(
    z.object({
      success: z.boolean(),
      project: ProjectWithRelationsSchema,
    }),
  )
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Verify project belongs to user's organization before updating
    const [existingProject] = await db
      .select()
      .from(projectTable)
      .where(
        and(
          eq(projectTable.id, input.id),
          eq(projectTable.organizationId, context.session.activeOrganizationId),
        ),
      )
      .limit(1);

    if (!existingProject) {
      throw new ORPCError("NOT_FOUND", {
        message: "This Project was not found",
      });
    }

    if (existingProject.organizationId !== context.session.activeOrganizationId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You don't have permission to update this project",
      });
    }

    await db
      .update(projectTable)
      .set(input.data)
      .where(eq(projectTable.id, input.id));

    // Fetch the updated project with responsible user
    const project = await db.query.projectTable.findFirst({
      where: eq(projectTable.id, input.id),
      with: {
        responsibleUser: true,
        organization: true,
      },
    });

    if (!project) {
      throw new ORPCError("INTERNAL_ERROR", {
        message: "Failed to fetch updated project",
      });
    }

    return {
      success: true,
      project,
    };
  });

/**
 * Delete a project
 *
 * Requires:
 * - Authentication
 * - "delete" permission on project resource (owner only)
 * - Project must belong to user's active organization
 */
export const deleteProject = authorized
  .use(requireProjectPermissions(["delete"]))
  .route({
    method: "DELETE",
    path: "/projects/:id",
    summary: "Delete a project",
    tags: ["project"],
  })
  .input(
    z.object({
      id: z.string().describe("Project ID"),
    }),
  )
  .output(
    z.object({
      success: z.boolean(),
    }),
  )
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Verify project exists and belongs to organization
    const [existingProject] = await db
      .select()
      .from(projectTable)
      .where(
        and(
          eq(projectTable.id, input.id),
          eq(projectTable.organizationId, context.session.activeOrganizationId),
        ),
      )
      .limit(1);

    if (!existingProject) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found or you don't have access to it",
      });
    }

    // Delete the project
    await db.delete(projectTable).where(eq(projectTable.id, input.id));

    return {
      success: true,
    };
  });

/**
 * Set active project for the session
 *
 * Requires:
 * - Authentication
 * - "read" permission on project resource
 * - Project must belong to user's active organization (if projectId is provided)
 */
export const setActiveProject = authorized
  .input(
    z.object({
      projectId: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    // If projectId is provided, verify user has access to it
    if (input.projectId) {
      if (!context.session.activeOrganizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No active organization. Please select an organization first.",
        });
      }

      const { role } = await auth.api.getActiveMemberRole({
        headers: await headers(),
      });

      if (role !== memberRoles.Employee && role !== memberRoles.Owner) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have permission to set an active project",
        });
      }

      // Verify project belongs to user's organization
      const [existingProject] = await db
        .select()
        .from(projectTable)
        .where(
          and(
            eq(projectTable.id, input.projectId),
            eq(projectTable.organizationId, context.session.activeOrganizationId),
          ),
        )
        .limit(1);

      if (!existingProject) {
        throw new ORPCError("NOT_FOUND", {
          message: "This Project was not found",
        });
      }

      if (
        existingProject.organizationId !== context.session.activeOrganizationId
      ) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have permission to set this project as active",
        });
      }
    }

    await db
      .update(sessionTable)
      .set({
        activeProjectId: input.projectId,
      })
      .where(eq(sessionTable.id, context.session.id));

    return {
      success: true,
    };
  });

/**
 * Get project participants with details
 *
 * Requires:
 * - Authentication
 * - "read" permission on project resource
 * - Project must belong to user's active organization
 */
export const getProjectParticipants = authorized
  .use(requireProjectPermissions(["read"]))
  .route({
    method: "GET",
    path: "/projects/:id/participants",
    summary: "Get project participants with user details",
    tags: ["project"],
  })
  .input(
    z.object({
      projectId: z.string().describe("Project ID"),
    }),
  )
  .output(z.array(ProjectParticipantWithUserSchema))
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Verify project belongs to user's organization
    const [project] = await db
      .select()
      .from(projectTable)
      .where(
        and(
          eq(projectTable.id, input.projectId),
          eq(projectTable.organizationId, context.session.activeOrganizationId),
        ),
      )
      .limit(1);

    if (!project) {
      throw new ORPCError("FORBIDDEN", {
        message: "You don't have access to this project",
      });
    }

    // Get all participants for this project with user details
    const participants = await db
      .select({
        id: projectParticipant.id,
        projectId: projectParticipant.projectId,
        memberId: projectParticipant.memberId,
        userId: projectParticipant.userId,
        createdAt: projectParticipant.createdAt,
        updatedAt: projectParticipant.updatedAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(projectParticipant)
      .innerJoin(user, eq(projectParticipant.userId, user.id))
      .where(eq(projectParticipant.projectId, input.projectId));

    return participants;
  });

/**
 * Batch delete projects
 *
 * Requires:
 * - Authentication
 * - "delete" permission on project resource (owner only)
 * - All projects must belong to user's active organization
 */
export const batchDeleteProjects = authorized
  .use(requireProjectPermissions(["delete"]))
  .route({
    method: "DELETE",
    path: "/projects/batch",
    summary: "Batch delete multiple projects",
    tags: ["project"],
  })
  .input(
    z.object({
      projectIds: z.array(z.string()).min(1),
    }),
  )
  .output(
    z.object({
      success: z.boolean(),
      deletedCount: z.number(),
    }),
  )
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Verify all projects belong to user's organization
    const projectsToDelete = await db
      .select({
        id: projectTable.id,
      })
      .from(projectTable)
      .where(
        and(
          inArray(projectTable.id, input.projectIds),
          eq(projectTable.organizationId, context.session.activeOrganizationId),
        ),
      );

    if (projectsToDelete.length !== input.projectIds.length) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "Some projects don't exist or you don't have permission to delete them",
      });
    }

    // Delete the projects
    const result = await db
      .delete(projectTable)
      .where(
        and(
          inArray(projectTable.id, input.projectIds),
          eq(projectTable.organizationId, context.session.activeOrganizationId),
        ),
      );

    return {
      success: true,
      deletedCount: result.rowCount || 0,
    };
  });

// ============================================================================
// PROJECT ACTIVITY PROCEDURES
// ============================================================================

/**
 * Helper to verify project belongs to user's organization
 */
async function verifyProjectAccess(
  projectId: string,
  organizationId: string,
): Promise<boolean> {
  const [project] = await db
    .select()
    .from(projectTable)
    .where(
      and(
        eq(projectTable.id, projectId),
        eq(projectTable.organizationId, organizationId),
      ),
    )
    .limit(1);

  return !!project;
}

/**
 * Get project activities
 *
 * Requires:
 * - Authentication
 * - "read" permission on project resource
 * - Project must belong to user's active organization
 */
export const getProjectActivities = authorized
  .use(requireProjectPermissions(["read"]))
  .route({
    method: "GET",
    path: "/projects/:id/activities",
    summary: "Get project activities",
    tags: ["project", "activity"],
  })
  .input(
    z.object({
      projectId: z.string().describe("Project ID"),
    }),
  )
  .output(z.array(ProjectActivityWithRelationsSchema))
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Verify project belongs to user's organization
    const hasAccess = await verifyProjectAccess(
      input.projectId,
      context.session.activeOrganizationId,
    );

    if (!hasAccess) {
      throw new ORPCError("FORBIDDEN", {
        message: "You don't have access to this project",
      });
    }

    // Get all activities for this project
    const activities = await db.query.projectActivity.findMany({
      where: eq(projectActivity.projectId, input.projectId),
      orderBy: [asc(projectActivity.createdAt)],
    });

    return activities;
  });

/**
 * Create a new project activity
 *
 * Requires:
 * - Authentication
 * - "update" permission on project resource (owner/admin only)
 *   Creating activities is considered an "edit project" operation
 * - Project must belong to user's active organization
 */
export const createProjectActivity = authorized
  .use(requireProjectPermissions(["update"]))
  .route({
    method: "POST",
    path: "/projects/:id/activities",
    summary: "Create a new project activity",
    tags: ["project", "activity"],
  })
  .input(ProjectActivityFormSchema)
  .output(
    z.object({
      success: z.boolean(),
      activity: ProjectActivityWithRelationsSchema,
    }),
  )
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Verify project belongs to user's organization
    const hasAccess = await verifyProjectAccess(
      input.projectId,
      context.session.activeOrganizationId,
    );

    if (!hasAccess) {
      throw new ORPCError("FORBIDDEN", {
        message: "You don't have access to this project",
      });
    }

    const [newActivity] = await db
      .insert(projectActivity)
      .values({
        id: randomUUID(),
        ...input,
      })
      .returning();

    return {
      success: true,
      activity: newActivity,
    };
  });

/**
 * Update a project activity
 *
 * Requires:
 * - Authentication
 * - "update" permission on project resource (owner/admin only)
 *   Updating activities is considered an "edit project" operation
 * - Activity must belong to a project in user's active organization
 */
export const updateProjectActivity = authorized
  .use(requireProjectPermissions(["update"]))
  .route({
    method: "PATCH",
    path: "/projects/:projectId/activities/:id",
    summary: "Update a project activity",
    tags: ["project", "activity"],
  })
  .input(
    z.object({
      id: z.string().describe("Activity ID"),
      data: ProjectActivityFormSchema.omit({ projectId: true }).partial(),
    }),
  )
  .output(
    z.object({
      success: z.boolean(),
      activity: ProjectActivityWithRelationsSchema,
    }),
  )
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Fetch activity and verify it belongs to user's organization via project
    const [existingActivity] = await db
      .select({
        activity: projectActivity,
        projectOrgId: projectTable.organizationId,
      })
      .from(projectActivity)
      .innerJoin(projectTable, eq(projectActivity.projectId, projectTable.id))
      .where(eq(projectActivity.id, input.id))
      .limit(1);

    if (!existingActivity) {
      throw new ORPCError("NOT_FOUND", {
        message: "Activity not found",
      });
    }

    if (existingActivity.projectOrgId !== context.session.activeOrganizationId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You don't have permission to update this activity",
      });
    }

    const [updatedActivity] = await db
      .update(projectActivity)
      .set(input.data)
      .where(eq(projectActivity.id, input.id))
      .returning();

    return {
      success: true,
      activity: updatedActivity,
    };
  });

/**
 * Delete a project activity
 *
 * Requires:
 * - Authentication
 * - "update" permission on project resource (owner/admin only)
 *   Deleting activities is considered an "edit project" operation
 * - Activity must belong to a project in user's active organization
 */
export const deleteProjectActivity = authorized
  .use(requireProjectPermissions(["update"]))
  .route({
    method: "DELETE",
    path: "/projects/:projectId/activities/:id",
    summary: "Delete a project activity",
    tags: ["project", "activity"],
  })
  .input(
    z.object({
      id: z.string().describe("Activity ID"),
    }),
  )
  .output(
    z.object({
      success: z.boolean(),
    }),
  )
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Fetch activity and verify it belongs to user's organization via project
    const [existingActivity] = await db
      .select({
        activity: projectActivity,
        projectOrgId: projectTable.organizationId,
      })
      .from(projectActivity)
      .innerJoin(projectTable, eq(projectActivity.projectId, projectTable.id))
      .where(eq(projectActivity.id, input.id))
      .limit(1);

    if (!existingActivity) {
      throw new ORPCError("NOT_FOUND", {
        message: "Activity not found",
      });
    }

    if (existingActivity.projectOrgId !== context.session.activeOrganizationId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You don't have permission to delete this activity",
      });
    }

    await db.delete(projectActivity).where(eq(projectActivity.id, input.id));

    return {
      success: true,
    };
  });
