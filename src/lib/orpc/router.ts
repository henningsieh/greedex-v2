import {
  listOrganizations,
  searchMembers,
} from "@/components/features/organizations/procedures";
import {
  batchDeleteProjects,
  createProject,
  deleteProject,
  getProjectById,
  getProjectParticipants,
  listProjects,
  setActiveProject,
  updateProject,
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
  user: {
    getProfile,
  },

  // Auth namespace for Better Auth procedures
  betterauth: {
    getSession,
  },

  // Organization namespace
  organizations: {
    getActive: getFullOrganization,
    list: listOrganizations,
  },

  // Member namespace
  member: {
    search: searchMembers,
  },

  // Project namespace
  project: {
    create: createProject,
    list: listProjects,
    getById: getProjectById,
    update: updateProject,
    delete: deleteProject,
    batchDelete: batchDeleteProjects,
    setActive: setActiveProject,
    getParticipants: getProjectParticipants,
  },
};

export type Router = typeof router;
