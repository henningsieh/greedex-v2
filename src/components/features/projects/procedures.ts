// src/components/features/projects/procedures.ts:

import { randomUUID } from "node:crypto";
import { and, eq, inArray, or } from "drizzle-orm";
import { z } from "zod";
import {
  ProjectFormSchema,
  ProjectSelectSchema,
} from "@/components/features/projects/types";
import { db } from "@/lib/drizzle/db";
import {
  projectParticipant,
  projectTable,
  session as sessionTable,
} from "@/lib/drizzle/schema";
import { authorized } from "@/lib/orpc/middleware";

/**
 * Create a new project
 * Requires authentication and uses Drizzle-generated schema
 */
export const createProject = authorized
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
      project: ProjectSelectSchema, // Use the select schema here
    }),
  )
  .handler(async ({ input, context }) => {
    const newProject = await db
      .insert(projectTable)
      .values({
        id: randomUUID(), // Generate server-side
        ...input,
        responsibleUserId: context.user.id, // Add from context
      })
      .returning();

    return {
      success: true,
      project: newProject[0],
    };
  });

export const listProjects = authorized
  .route({
    method: "GET",
    path: "/projects",
    summary: "List all projects",
    tags: ["project"],
  })
  .input(z.void())
  .output(z.array(ProjectSelectSchema))
  .handler(async ({ context }) => {
    // Find all project IDs where the user is a participant
    const participantProjects = await db
      .select({ projectId: projectParticipant.projectId })
      .from(projectParticipant)
      .where(eq(projectParticipant.userId, context.user.id));

    const participantProjectIds = participantProjects.map((p) => p.projectId);

    // Query projects where user is responsible OR is a participant
    const projects = await db
      .select()
      .from(projectTable)
      .where(
        or(
          and(
            eq(projectTable.responsibleUserId, context.user.id),
            eq(
              projectTable.organizationId,
              context.session.activeOrganizationId as string,
            ),
          ),
          participantProjectIds.length > 0
            ? inArray(projectTable.id, participantProjectIds)
            : undefined,
        ),
      );

    return projects;
  });

/**
 * Get project details by ID
 */
export const getProjectById = authorized
  .route({
    method: "GET",
    path: "/projects/:id",
    summary: "Get project details by ID",
    tags: ["project"],
  })
  .input(z.object({ id: z.string().describe("Project ID") }))
  .output(ProjectSelectSchema)
  .handler(async ({ input, context }) => {
    const [project] = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, input.id))
      .limit(1)
      .execute();

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  });

/**
 * Set active project for the session
 */
export const setActiveProject = authorized
  .input(z.object({ projectId: z.string().optional() }))
  .handler(async ({ input, context }) => {
    await db
      .update(sessionTable)
      .set({ activeProjectId: input.projectId })
      .where(eq(sessionTable.id, context.session.id));

    return { success: true };
  });
