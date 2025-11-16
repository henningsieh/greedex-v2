// src/components/features/projects/procedures.ts:

import { randomUUID } from "node:crypto";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  ProjectFormSchema,
  ProjectSelectSchema,
} from "@/components/features/projects/types";
import { auth } from "@/lib/better-auth";
import { db } from "@/lib/drizzle/db";
import { projectTable, session as sessionTable } from "@/lib/drizzle/schema";
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
      project: ProjectSelectSchema,
    }),
  )
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "2 No active organization. Please select an organization first.",
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

    return {
      success: true,
      project: newProject[0],
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
  .input(z.void())
  .output(z.array(ProjectSelectSchema))
  .handler(async ({ context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Get all projects that belong to the user's active organization
    // Permission check ensures user is a member of the organization
    const projects = await db
      .select()
      .from(projectTable)
      .where(
        eq(projectTable.organizationId, context.session.activeOrganizationId),
      );

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
  .input(z.object({ id: z.string().describe("Project ID") }))
  .output(ProjectSelectSchema)
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Fetch project and verify it belongs to user's organization
    const [project] = await db
      .select()
      .from(projectTable)
      .where(
        and(
          eq(projectTable.id, input.id),
          eq(projectTable.organizationId, context.session.activeOrganizationId),
        ),
      )
      .limit(1);

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
      project: ProjectSelectSchema,
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
        message: "Project not found or you don't have access to it",
      });
    }

    const [updatedProject] = await db
      .update(projectTable)
      .set(input.data)
      .where(eq(projectTable.id, input.id))
      .returning();

    return {
      success: true,
      project: updatedProject,
    };
  });

/**
 * Delete a project
 *
 * Requires:
 * - Authentication
 * - "delete" permission on project resource (admin/owner only)
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
  .input(z.object({ id: z.string().describe("Project ID") }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    if (!context.session.activeOrganizationId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "No active organization. Please select an organization first.",
      });
    }

    // Verify project belongs to user's organization before deleting
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

    await db.delete(projectTable).where(eq(projectTable.id, input.id));

    return { success: true };
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
  .input(z.object({ projectId: z.string().optional() }))
  .handler(async ({ input, context }) => {
    // If projectId is provided, verify user has access to it
    if (input.projectId) {
      if (!context.session.activeOrganizationId) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "No active organization. Please select an organization first.",
        });
      }

      // Check if user has read permission
      const hasPermission = await auth.api.hasPermission({
        headers: context.headers,
        body: {
          permissions: {
            project: ["read"],
          },
        },
      });

      if (!hasPermission) {
        throw new ORPCError("FORBIDDEN", {
          message: "You don't have permission to access projects",
        });
      }

      // Verify project belongs to user's organization
      const [project] = await db
        .select()
        .from(projectTable)
        .where(
          and(
            eq(projectTable.id, input.projectId),
            eq(
              projectTable.organizationId,
              context.session.activeOrganizationId,
            ),
          ),
        )
        .limit(1);

      if (!project) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found or you don't have access to it",
        });
      }
    }

    await db
      .update(sessionTable)
      .set({ activeProjectId: input.projectId })
      .where(eq(sessionTable.id, context.session.id));

    return { success: true };
  });
