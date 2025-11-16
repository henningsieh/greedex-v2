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
export function useProjectPermissions() {
  // Get session and organizations
  const { data: session } = authClient.useSession();
  const { data: organizations } = authClient.useListOrganizations();

  // Find active organization
  const activeOrgId = session?.session?.activeOrganizationId;
  const activeOrg = organizations?.find((org) => org.id === activeOrgId);

  // Try to get role from the active organization
  // Note: useListOrganizations returns organizations with a members array
  // but TypeScript types don't reflect this. We need to access it at runtime.
  const currentUserId = session?.user?.id;
  let role: OrganizationRole = "member"; // default to least privileged

  if (activeOrg && currentUserId) {
    // Access members property which exists at runtime but not in types
    const orgWithMembers = activeOrg as typeof activeOrg & {
      members?: Array<{ userId: string; role: string }>;
    };
    const members = orgWithMembers.members;
    if (Array.isArray(members)) {
      const membership = members.find((m) => m.userId === currentUserId);
      if (membership?.role) {
        role = membership.role as OrganizationRole;
      }
    }
  }

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
