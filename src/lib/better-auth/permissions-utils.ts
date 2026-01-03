/**
 * Client-side permission utilities
 *
 * These utilities help check permissions in the UI without making server requests.
 * They use Better Auth's checkRolePermission for synchronous role-based checks.
 *
 * Note: For server-side or dynamic role checks, use auth.api.hasPermission instead.
 */

import { MEMBER_ROLES, type MemberRole } from "@/features/organizations";
import type { ProjectPermission } from "@/features/projects/permissions";
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
function checkProjectPermission(
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
  let role: MemberRole = MEMBER_ROLES.Participant;

  // Find current user's role in the active organization
  if (activeOrg && session?.user?.id) {
    const currentMember = activeOrg.members.find(
      (member) => member.userId === session.user.id,
    );
    if (currentMember?.role) {
      role = currentMember.role;
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
    canArchive: checkProjectPermission(role, ["archive"]),
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
 * Check if a user's role can archive projects
 */
export function canArchiveProjects(role: MemberRole): boolean {
  return checkProjectPermission(role, ["archive"]);
}

/**
 * Determine whether a role has read-only project permissions.
 *
 * @returns `true` if the role can read projects but cannot create, update, or delete them, `false` otherwise.
 */
export function isReadOnlyMember(role: MemberRole): boolean {
  return (
    checkProjectPermission(role, ["read"]) &&
    !checkProjectPermission(role, ["create", "update", "delete"])
  );
}
