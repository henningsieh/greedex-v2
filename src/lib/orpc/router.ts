import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  setActiveProject,
  updateProject,
} from "@/components/features/projects/procedures";
import { getHealth, getProfile, helloWorld } from "@/lib/orpc/procedures";

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

  // Project namespace
  project: {
    create: createProject,
    list: listProjects,
    getById: getProjectById,
    update: updateProject,
    delete: deleteProject,
    setActive: setActiveProject,
  },
};

export type Router = typeof router;
