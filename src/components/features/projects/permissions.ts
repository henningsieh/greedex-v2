/**
 * Better Auth Custom Permissions for Projects
 *
 * This file defines the access control structure for projects within organizations.
 * Projects are resources that belong to organizations, and access is controlled
 * through organization membership roles.
 */

import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * Define all available actions for the project resource
 *
 * - create: Create new projects
 * - read: View project details
 * - update: Modify project information
 * - delete: Remove projects
 * - share: Share projects with other users
 */
const statement = {
  ...defaultStatements, // Includes default organization, member, invitation and team permissions
  project: ["create", "read", "update", "delete", "share"],
} as const;

/**
 * Create the access controller with our custom statement
 */
export const ac = createAccessControl(statement);

/**
 * Owner Role
 * - Full control over all resources including projects
 * - Can create, read, update, delete, and share projects
 * - Inherits all default owner permissions
 */
export const owner = ac.newRole({
  ...ownerAc.statements,
  project: ["create", "read", "update", "delete", "share"],
});

/**
 * Admin Role
 * - Can manage projects and most organization resources
 * - Can create, read, update, and share projects
 * - CANNOT delete projects (only owners can delete)
 * - Inherits all default admin permissions
 */
export const admin = ac.newRole({
  ...adminAc.statements,
  project: ["create", "read", "update", "share"],
});

/**
 * Member Role (Regular Participant)
 * - Can only READ projects within their organization
 * - CANNOT create new projects
 * - CANNOT update or delete projects
 * - CANNOT share projects
 * - This role represents regular participants/team members
 */
export const member = ac.newRole({
  ...memberAc.statements,
  project: ["read"], // Members can only read projects
});

/**
 * Export types for use throughout the application
 */
export type ProjectPermission = (typeof statement)["project"][number];
