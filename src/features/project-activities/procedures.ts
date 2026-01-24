import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/drizzle/db";
import { projectActivitiesTable, projectsTable } from "@/lib/drizzle/schema";
import { authorized, requireProjectPermissions } from "@/lib/orpc/middleware";

import {
  CreateActivityInputSchema,
  ProjectActivityWithRelationsSchema,
  UpdateActivityInputSchema,
} from "./validation-schemas";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine whether the specified project belongs to the given organization.
 *
 * @returns `true` if a project with `projectId` exists and its `organizationId` equals the provided `organizationId`, `false` otherwise.
 */
async function verifyProjectAccess(
  projectId: string,
  organizationId: string,
): Promise<boolean> {
  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, projectId),
  });

  return project?.organizationId === organizationId;
}

// ============================================================================
// PROJECT ACTIVITY PROCEDURES
// ============================================================================

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
  .input(CreateActivityInputSchema)
  .output(
    z.object({
      success: z.boolean(),
      activity: ProjectActivityWithRelationsSchema,
    }),
  )
  .handler(async ({ input, context, errors }) => {
    if (!context.session.activeOrganizationId) {
      throw errors.BAD_REQUEST({
        message: "No active organization. Please select an organization first.",
      });
    }

    // Verify project belongs to user's organization
    const hasAccess = await verifyProjectAccess(
      input.projectId,
      context.session.activeOrganizationId,
    );

    if (!hasAccess) {
      throw errors.FORBIDDEN({
        message: "You don't have access to this project",
      });
    }

    const [newActivity] = await db
      .insert(projectActivitiesTable)
      .values({
        projectId: input.projectId,
        activityType: input.activityType,
        distanceKm: input.distanceKm,
        description: input.description,
        activityDate: input.activityDate,
      })
      .returning();

    const newActivityWithRelations =
      await db.query.projectActivitiesTable.findFirst({
        where: eq(projectActivitiesTable.id, newActivity.id),
        with: {
          project: true,
        },
      });

    if (!newActivityWithRelations) {
      throw new Error("Failed to fetch newly created activity");
    }

    return {
      success: true,
      activity: newActivityWithRelations,
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
      data: UpdateActivityInputSchema,
    }),
  )
  .output(
    z.object({
      success: z.boolean(),
      activity: ProjectActivityWithRelationsSchema,
    }),
  )
  .handler(async ({ input, context, errors }) => {
    if (!context.session.activeOrganizationId) {
      throw errors.BAD_REQUEST({
        message: "No active organization. Please select an organization first.",
      });
    }

    // Fetch activity and verify it belongs to user's organization via project
    const [existingActivity] = await db
      .select({
        activity: projectActivitiesTable,
        projectOrgId: projectsTable.organizationId,
      })
      .from(projectActivitiesTable)
      .innerJoin(
        projectsTable,
        eq(projectActivitiesTable.projectId, projectsTable.id),
      )
      .where(eq(projectActivitiesTable.id, input.id))
      .limit(1);

    if (!existingActivity) {
      throw errors.NOT_FOUND({
        message: "Activity not found",
      });
    }

    if (existingActivity.projectOrgId !== context.session.activeOrganizationId) {
      throw errors.FORBIDDEN({
        message: "You don't have permission to update this activity",
      });
    }

    const { distanceKm, ...restData } = input.data;
    const updateData: typeof restData & { distanceKm?: number } = {
      ...restData,
    };
    if (distanceKm !== undefined) {
      updateData.distanceKm = distanceKm;
    }

    const [updatedActivity] = await db
      .update(projectActivitiesTable)
      .set(updateData)
      .where(eq(projectActivitiesTable.id, input.id))
      .returning();

    const updatedActivityWithRelations =
      await db.query.projectActivitiesTable.findFirst({
        where: eq(projectActivitiesTable.id, updatedActivity.id),
        with: {
          project: true,
        },
      });

    if (!updatedActivityWithRelations) {
      throw new Error("Failed to fetch updated activity");
    }

    return {
      success: true,
      activity: updatedActivityWithRelations,
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
  .handler(async ({ input, context, errors }) => {
    if (!context.session.activeOrganizationId) {
      throw errors.BAD_REQUEST({
        message: "No active organization. Please select an organization first.",
      });
    }

    // Fetch activity and verify it belongs to user's organization via project
    const [existingActivity] = await db
      .select({
        activity: projectActivitiesTable,
        projectOrgId: projectsTable.organizationId,
      })
      .from(projectActivitiesTable)
      .innerJoin(
        projectsTable,
        eq(projectActivitiesTable.projectId, projectsTable.id),
      )
      .where(eq(projectActivitiesTable.id, input.id))
      .limit(1);

    if (!existingActivity) {
      throw errors.NOT_FOUND({
        message: "Activity not found",
      });
    }

    if (existingActivity.projectOrgId !== context.session.activeOrganizationId) {
      throw errors.FORBIDDEN({
        message: "You don't have permission to delete this activity",
      });
    }

    await db
      .delete(projectActivitiesTable)
      .where(eq(projectActivitiesTable.id, input.id));

    return {
      success: true,
    };
  });
