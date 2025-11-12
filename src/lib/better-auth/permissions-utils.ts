/**
 * Client-side permission utilities
 *
 * These utilities help check permissions in the UI without making server requests.
 * They use Better Auth's checkRolePermission for synchronous role-based checks.
 *
 * Note: For server-side or dynamic role checks, use auth.api.hasPermission instead.
 */

import type { OrganizationRole } from "@/components/features/organizations/types";
import { authClient } from "./auth-client";
import type { ProjectPermission } from "./permissions";

/**
 * Check if a given role has specific project permissions
 *
 * This is a client-side check only and does NOT include dynamic roles.
 * For server-side checks or dynamic roles, use auth.api.hasPermission.
 *
 * @param role - The role to check (owner, admin, member)
 * @param permissions - Array of project permissions to check
 * @returns boolean indicating if the role has all the specified permissions
 *
 * @example
 * ```ts
 * const canCreate = checkProjectPermission("admin", ["create"]);
 * const canManage = checkProjectPermission("owner", ["update", "delete"]);
 * ```
 */
export function checkProjectPermission(
  role: OrganizationRole,
  permissions: ProjectPermission[],
): boolean {
  return authClient.organization.checkRolePermission({
    role,
    permissions: {
      project: permissions,
    },
  });
}

/**
 * Hook to check if current user can perform project actions
 *
 * @returns Object with permission check functions
 *
 * @example
 * ```tsx
 * function ProjectActions() {
 *   const { canCreate, canUpdate, canDelete } = useProjectPermissions();
 *
 *   return (
 *     <div>
 *       {canCreate && <Button>New Project</Button>}
 *       {canUpdate && <Button>Edit</Button>}
 *       {canDelete && <Button>Delete</Button>}
 *     </div>
 *   );
 * }
 * ```
 */
export async function useProjectPermissions() {
  // Get the current user's active member data (includes role)
  const { data: activeMember } =
    await authClient.organization.getActiveMember();

  // Extract role with proper type casting
  const role = (activeMember?.role as OrganizationRole | undefined) || "member";

  return {
    role,
    canCreate: checkProjectPermission(role, ["create"]),
    canRead: checkProjectPermission(role, ["read"]),
    canUpdate: checkProjectPermission(role, ["update"]),
    canDelete: checkProjectPermission(role, ["delete"]),
    canShare: checkProjectPermission(role, ["share"]),
  };
}

/**
 * Check if a user's role can create projects
 */
export function canCreateProjects(role: OrganizationRole): boolean {
  return checkProjectPermission(role, ["create"]);
}

/**
 * Check if a user's role can update projects
 */
export function canUpdateProjects(role: OrganizationRole): boolean {
  return checkProjectPermission(role, ["update"]);
}

/**
 * Check if a user's role can delete projects
 */
export function canDeleteProjects(role: OrganizationRole): boolean {
  return checkProjectPermission(role, ["delete"]);
}

/**
 * Check if a user's role can only read projects (member role)
 */
export function isReadOnlyMember(role: OrganizationRole): boolean {
  return (
    checkProjectPermission(role, ["read"]) &&
    !checkProjectPermission(role, ["create", "update", "delete"])
  );
}
