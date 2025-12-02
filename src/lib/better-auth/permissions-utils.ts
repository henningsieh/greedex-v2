/**
 * Client-side permission utilities
 *
 * These utilities help check permissions in the UI without making server requests.
 * They use Better Auth's checkRolePermission for synchronous role-based checks.
 *
 * Note: For server-side or dynamic role checks, use auth.api.hasPermission instead.
 */

import {
  type MemberRole,
  memberRoles,
} from "@/components/features/organizations/types";
import type { ProjectPermission } from "@/components/features/projects/permissions";
import { authClient } from "@/lib/better-auth/auth-client";

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
  role: MemberRole,
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
 * @returns Object with permission check functions and current role
 *
 * @example
 * ```tsx
 * function ProjectActions() {
 *   const { canCreate, canUpdate, canDelete, role } = useProjectPermissions();
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
  // Get session and active organization
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: activeOrg, isPending: orgPending } =
    authClient.useActiveOrganization();

  // Default to least privileged role
  let role: MemberRole = memberRoles.Participant;

  // Find current user's role in the active organization
  if (activeOrg && session?.user?.id) {
    const currentMember = activeOrg.members.find(
      (member) => member.userId === session.user.id,
    );
    if (currentMember?.role) {
      role = currentMember.role as MemberRole;
    }
  }

  const isPending = sessionPending || orgPending;

  return {
    role,
    isPending,
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
export function canCreateProjects(role: MemberRole): boolean {
  return checkProjectPermission(role, ["create"]);
}

/**
 * Check if a user's role can update projects
 */
export function canUpdateProjects(role: MemberRole): boolean {
  return checkProjectPermission(role, ["update"]);
}

/**
 * Check if a user's role can delete projects
 */
export function canDeleteProjects(role: MemberRole): boolean {
  return checkProjectPermission(role, ["delete"]);
}

/**
 * Check if a user's role can only read projects (member role)
 */
export function isReadOnlyMember(role: MemberRole): boolean {
  return (
    checkProjectPermission(role, ["read"]) &&
    !checkProjectPermission(role, ["create", "update", "delete"])
  );
}
