import type { InferRouterOutputs } from "@orpc/server";
import {
	createProjectActivity,
	deleteProjectActivity,
	updateProjectActivity,
} from "@/features/project-activities";
import {
	archiveProject,
	batchDeleteProjects,
	createProject,
	deleteProject,
	getProjectActivities,
	getProjectById,
	getProjectForParticipation,
	getProjectParticipants,
	listProjects,
	setActiveProject,
	updateProject,
} from "@/features/projects";
import {
	getFullOrganization,
	getOrganizationRole,
	getOrganizationStats,
	listOrganizations,
	searchMembers,
} from "@/features/organizations";
import {
	getHealth,
	getProfile,
	getSession,
	helloWorld,
	signIn,
	signOut,
	signUp,
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
    signIn,
    signUp,
    signOut,
  },

  // Organization namespace
  organizations: {
    list: listOrganizations,
    getActive: getFullOrganization,
    getRole: getOrganizationRole,
    getStats: getOrganizationStats,
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
    archive: archiveProject,
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
