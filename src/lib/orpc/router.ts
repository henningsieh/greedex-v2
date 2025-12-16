import type { InferRouterOutputs } from "@orpc/server";
import {
  listOrganizations,
  searchMembers,
} from "@/components/features/organizations/procedures";
import {
  batchDeleteProjects,
  createProject,
  createProjectActivity,
  deleteProject,
  deleteProjectActivity,
  getProjectActivities,
  getProjectById,
  getProjectForParticipation,
  getProjectParticipants,
  listProjects,
  setActiveProject,
  updateProject,
  updateProjectActivity,
} from "@/components/features/projects/procedures";
import {
  getFullOrganization,
  getHealth,
  getProfile,
  getSession,
  helloWorld,
} from "@/lib/orpc/procedures";

/**
 * Main oRPC router
 * Defines all available procedures organized by namespace
 */
export const router = {
  // Public procedures
  helloWorld,
  health: getHealth,

  // User namespace for authenticated procedures
  users: {
    getProfile,
  },

  // Auth namespace for Better Auth procedures
  betterauth: {
    getSession,
  },

  // Organization namespace
  organizations: {
    list: listOrganizations,
    getActive: getFullOrganization,
  },

  // Member namespace
  members: {
    search: searchMembers,
  },

  // Project namespace
  projects: {
    list: listProjects,
    create: createProject,
    getById: getProjectById,
    getForParticipation: getProjectForParticipation,
    update: updateProject,
    delete: deleteProject,
    batchDelete: batchDeleteProjects,
    setActive: setActiveProject,
    getParticipants: getProjectParticipants,
  },

  // Project Activity namespace
  projectActivities: {
    list: getProjectActivities,
    create: createProjectActivity,
    update: updateProjectActivity,
    delete: deleteProjectActivity,
  },
};

export type Router = typeof router;

export type Outputs = InferRouterOutputs<typeof router>;

/**
 * Type-safe error codes inferred from the base context's .errors() definition
 * This is automatically derived and should not be manually maintained
 */
export type { BaseErrorCode as ErrorCode } from "@/lib/orpc/context";
