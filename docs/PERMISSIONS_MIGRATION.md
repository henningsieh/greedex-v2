# Better Auth Permissions Migration Guide

This document outlines the migration from custom participant roles to Better Auth's native organization permissions.

## Overview

We've migrated from a custom `projectParticipant` table to Better Auth's native organization membership system. This provides:

- Unified permission management across the application
- Standard roles (owner, admin, member)
- Organization-based access control
- No need for custom participant tracking

## Changes Summary

### 1. Removed Custom Tables

**Deleted:**
- `projectParticipant` table (replaced by Better Auth's `member` table)
- Custom `participantRoleValues` enum

### 2. Updated Permission System

**Old System:**
- Custom participant roles: `["participant", "leader"]`
- Manual project-participant relationship management

**New System:**
- Better Auth roles: `["owner", "admin", "member"]`
- Organization-based access control
- Automatic permission inheritance

### 3. Permission Matrix

| Role | Create Projects | Read Projects | Update Projects | Delete Projects |
|------|----------------|----------------|-----------------|-----------------|
| **Owner**  |  ✅      |       ✅      |        ✅       |       ✅       |
| **Admin**  |  ✅      |       ✅      |        ✅       |       ✅       |
| **Member** |  ❌      |       ✅      |        ❌       |       ❌       |

**Key Points:**
- Members can ONLY READ projects within their organization
- Members CANNOT create new projects
- Admins and Owners have full control
- All access is scoped by organization membership

## Database Migration Steps

### Step 1: Generate Migration

Run the Better Auth CLI to generate the migration:

```bash
npx @better-auth/cli migrate
```

This will create the necessary tables if they don't exist.

### Step 2: Data Migration (if you have existing data)

If you have existing `projectParticipant` data, you need to migrate it to organization memberships:

```sql
-- Example migration SQL (adjust based on your needs)

-- 1. Ensure all users who were participants are now organization members
INSERT INTO member (id, organization_id, user_id, role, created_at)
SELECT 
  gen_random_uuid(),
  p.organization_id,
  pp.user_id,
  CASE 
    WHEN pp.role = 'leader' THEN 'admin'
    ELSE 'member'
  END as role,
  pp.created_at
FROM project_participant pp
JOIN project p ON pp.project_id = p.id
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 2. Drop the old table
DROP TABLE IF EXISTS project_participant CASCADE;
```

### Step 3: Verify Migration

1. Check that all users have appropriate organization memberships:
```sql
SELECT 
  u.email,
  o.name as organization,
  m.role
FROM member m
JOIN "user" u ON m.user_id = u.id
JOIN organization o ON m.organization_id = o.id
ORDER BY o.name, u.email;
```

2. Verify project access by testing in the UI with different roles

## Code Changes

### Updated Files

1. **`src/lib/better-auth/permissions.ts`** (NEW)
   - Defines custom access control for projects
   - Configures owner, admin, member roles

2. **`src/lib/better-auth/index.ts`**
   - Added permissions configuration to organization plugin

3. **`src/lib/better-auth/auth-client.ts`**
   - Added permissions to client plugin

4. **`src/lib/orpc/middleware.ts`**
   - Added `requireProjectPermissions` middleware
   - Checks permissions using Better Auth's API

5. **`src/components/features/projects/procedures.ts`**
   - Refactored to use permission middleware
   - Removed `projectParticipant` queries
   - All queries now scoped by organization

6. **`src/lib/drizzle/schemas/project-schema.ts`**
   - Removed `projectParticipant` table
   - Removed `participantRoleValues` enum

## Usage Examples

### Server-Side Permission Check

```typescript
// In oRPC procedures
export const createProject = authorized
  .use(requireProjectPermissions(["create"]))
  .handler(async ({ input, context }) => {
    // User has create permission, proceed
  });
```

### Client-Side Permission Check

```typescript
import { useProjectPermissions } from "@/lib/better-auth/permissions-utils";

function ProjectActions() {
  const { canCreate, canUpdate, canDelete } = useProjectPermissions();
  
  return (
    <div>
      {canCreate && <Button>New Project</Button>}
      {canUpdate && <Button>Edit</Button>}
      {canDelete && <Button>Delete</Button>}
    </div>
  );
}
```

### Checking Permissions for Specific Roles

```typescript
import { checkProjectPermission } from "@/lib/better-auth/permissions-utils";

const adminCanCreate = checkProjectPermission("admin", ["create"]); // true
const memberCanCreate = checkProjectPermission("member", ["create"]); // false
const memberCanRead = checkProjectPermission("member", ["read"]); // true
```

## Testing Checklist

- [ ] Members can view projects in their organization
- [ ] Members CANNOT create projects
- [ ] Members CANNOT update or delete projects
- [ ] Admins can create, read, update, delete projects
- [ ] Owners can create, read, update, delete projects
- [ ] Users cannot see projects from other organizations
- [ ] Setting active project works correctly
- [ ] Project list shows correct projects based on active organization

## Rollback Plan

If you need to rollback:

1. Restore the `projectParticipant` table from backup
2. Revert code changes using git:
   ```bash
   git checkout HEAD~1 src/lib/better-auth/
   git checkout HEAD~1 src/lib/orpc/middleware.ts
   git checkout HEAD~1 src/components/features/projects/procedures.ts
   git checkout HEAD~1 src/lib/drizzle/schemas/project-schema.ts
   ```

## Support

For issues or questions:
1. Check Better Auth documentation: https://www.better-auth.com/docs/plugins/organization
2. Review the permission configuration in `src/lib/better-auth/permissions.ts`
3. Test with different user roles to verify behavior
