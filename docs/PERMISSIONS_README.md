# Better Auth Permissions System

This document explains how the Better Auth organization permissions work in this application.

## Overview

We use Better Auth's native organization plugin with custom permissions for project management. This provides:

- **Organization-scoped access**: Users can only access projects within organizations they're members of
- **Role-based permissions**: Different roles (owner, admin, member) have different capabilities
- **Type-safe permissions**: Full TypeScript support for permission checks
- **Server and client validation**: Permissions enforced on both sides

## Permission Structure

### Roles

| Role | Description | Project Permissions |
|------|-------------|---------------------|
| **Owner** | Organization creator, full control | create, read, update, delete, share |
| **Admin** | Can manage most resources | create, read, update, delete, share |
| **Member** | Regular participant, read-only | read |

### Resources

Currently, we have one custom resource: `project`

**Project Actions:**
- `create` - Create new projects
- `read` - View project details
- `update` - Modify project information
- `delete` - Remove projects
- `share` - Share projects with others (future feature)

## Architecture

### Files Structure

```
src/lib/better-auth/
├── permissions.ts          # Permission definitions (owner, admin, member roles)
├── permissions-utils.ts    # Client-side utility functions
├── index.ts                # Better Auth configuration with permissions
└── auth-client.ts          # Client configuration with permissions

src/lib/orpc/
└── middleware.ts           # Permission middleware for oRPC procedures

src/components/features/projects/
└── procedures.ts           # Project procedures with permission checks
```

### How It Works

#### 1. Permission Definition (`permissions.ts`)

```typescript
import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  ...defaultStatements,
  project: ["create", "read", "update", "delete", "share"],
} as const;

export const ac = createAccessControl(statement);

export const member = ac.newRole({
  ...memberAc.statements,
  project: ["read"], // Members can only read
});
```

#### 2. Server-Side Enforcement (`middleware.ts`)

```typescript
export const requireProjectPermissions = (permissions: ProjectPermission[]) => {
  return authorized.middleware(async ({ context, next }) => {
    // Check if user has required permissions
    const hasPermission = await auth.api.hasPermission({
      headers: context.headers,
      body: {
        permissions: {
          project: permissions,
        },
      },
    });

    if (!hasPermission) {
      throw new ORPCError("FORBIDDEN", "Missing required permissions");
    }

    return next();
  });
};
```

#### 3. Procedure Implementation (`procedures.ts`)

```typescript
export const createProject = authorized
  .use(requireProjectPermissions(["create"]))
  .handler(async ({ input, context }) => {
    // Only users with "create" permission can reach here
    // Members are automatically blocked
  });

export const listProjects = authorized
  .use(requireProjectPermissions(["read"]))
  .handler(async ({ context }) => {
    // All members can read projects in their organization
    const projects = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.organizationId, context.session.activeOrganizationId));
    
    return projects;
  });
```

#### 4. Client-Side Checks (`permissions-utils.ts`)

```typescript
export function useProjectPermissions() {
  const { data: activeMember } = authClient.useActiveOrganization();
  const role = activeMember?.member.role || "member";
  
  return {
    canCreate: checkProjectPermission(role, ["create"]),
    canUpdate: checkProjectPermission(role, ["update"]),
    // ...
  };
}
```

## Usage Examples

### Server-Side (oRPC Procedures)

#### Require Specific Permissions

```typescript
// Only admins and owners can create
export const createProject = authorized
  .use(requireProjectPermissions(["create"]))
  .handler(async ({ input, context }) => {
    // Implementation
  });

// All members can read
export const listProjects = authorized
  .use(requireProjectPermissions(["read"]))
  .handler(async ({ context }) => {
    // Implementation
  });

// Only admins and owners can delete
export const deleteProject = authorized
  .use(requireProjectPermissions(["delete"]))
  .handler(async ({ input, context }) => {
    // Implementation
  });
```

#### Manual Permission Check

```typescript
import { auth } from "@/lib/better-auth";

export const someHandler = authorized.handler(async ({ context }) => {
  // Manual check if needed
  const hasPermission = await auth.api.hasPermission({
    headers: context.headers,
    body: {
      permissions: {
        project: ["create"],
      },
    },
  });

  if (hasPermission) {
    // Do something
  }
});
```

### Client-Side (React Components)

#### Using the Hook

```tsx
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

#### Direct Role Check

```tsx
import { checkProjectPermission } from "@/lib/better-auth/permissions-utils";
import { authClient } from "@/lib/better-auth/auth-client";

function ProjectDashboard() {
  const { data: activeMember } = authClient.useActiveOrganization();
  const role = activeMember?.member.role || "member";
  
  const isAdmin = role === "admin" || role === "owner";
  const canManage = checkProjectPermission(role, ["update", "delete"]);
  
  return (
    <div>
      {isAdmin ? (
        <AdminPanel />
      ) : (
        <MemberPanel />
      )}
    </div>
  );
}
```

#### Conditional Rendering

```tsx
import { useProjectPermissions, isReadOnlyMember } from "@/lib/better-auth/permissions-utils";

function ProjectCard({ project }) {
  const { role, canUpdate, canDelete } = useProjectPermissions();
  const isReadOnly = isReadOnlyMember(role);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {isReadOnly && (
          <Badge variant="secondary">View Only</Badge>
        )}
        <p>{project.description}</p>
      </CardContent>
      {(canUpdate || canDelete) && (
        <CardFooter>
          {canUpdate && <Button>Edit</Button>}
          {canDelete && <Button variant="destructive">Delete</Button>}
        </CardFooter>
      )}
    </Card>
  );
}
```

## Permission Flow

### Creating a Project

1. User clicks "New Project" button (shown only if `canCreate` is true)
2. Form is submitted to `project.create` procedure
3. `requireProjectPermissions(["create"])` middleware checks:
   - User is authenticated ✓
   - User has active organization ✓
   - User's role has "create" permission ✓
4. If checks pass, project is created in the active organization
5. If checks fail, `FORBIDDEN` error is thrown

### Viewing Projects

1. Component calls `orpc.project.list()`
2. `requireProjectPermissions(["read"])` middleware checks permissions
3. All organization members pass (everyone can read)
4. Query returns ONLY projects from user's active organization
5. Users cannot see projects from other organizations

### Updating/Deleting Projects

1. User clicks edit/delete button (shown only if `canUpdate`/`canDelete` is true)
2. Request goes to `project.update` or `project.delete`
3. `requireProjectPermissions(["update"])` or `requireProjectPermissions(["delete"])` checks permissions
4. Only admins and owners pass
5. Additional check ensures project belongs to user's organization
6. If all checks pass, operation is performed

## Security Considerations

### Organization Isolation

Projects are strictly isolated by organization:
```typescript
// Always filter by activeOrganizationId
const projects = await db
  .select()
  .from(projectTable)
  .where(eq(projectTable.organizationId, context.session.activeOrganizationId));
```

### Multi-Layer Protection

1. **Middleware layer**: Checks role permissions before handler execution
2. **Handler layer**: Verifies organization ownership of resources
3. **Database layer**: Filters by organizationId in queries

### Permission Checks

- **Server-side**: Always enforced via `auth.api.hasPermission()`
- **Client-side**: UI optimization only, not for security
- **Database queries**: Always scope by `organizationId`

## Adding New Permissions

### 1. Update Permission Definition

```typescript
// src/lib/better-auth/permissions.ts

const statement = {
  ...defaultStatements,
  project: ["create", "read", "update", "delete", "share"],
  report: ["create", "read", "export"], // New resource
} as const;

export const member = ac.newRole({
  ...memberAc.statements,
  project: ["read"],
  report: ["read"], // Members can read reports
});
```

### 2. Create Middleware

```typescript
// src/lib/orpc/middleware.ts

export const requireReportPermissions = (permissions: ReportPermission[]) => {
  return authorized.middleware(async ({ context, next }) => {
    const hasPermission = await auth.api.hasPermission({
      headers: context.headers,
      body: {
        permissions: {
          report: permissions,
        },
      },
    });

    if (!hasPermission) {
      throw new ORPCError("FORBIDDEN", "Missing required report permissions");
    }

    return next();
  });
};
```

### 3. Use in Procedures

```typescript
export const createReport = authorized
  .use(requireReportPermissions(["create"]))
  .handler(async ({ input, context }) => {
    // Implementation
  });
```

## Troubleshooting

### Permission Denied Errors

**Problem**: User gets "FORBIDDEN" error when trying to access a resource

**Solutions**:
1. Check user's role: `authClient.organization.getActiveMemberRole()`
2. Verify active organization is set: Check `session.activeOrganizationId`
3. Confirm role has required permission in `permissions.ts`
4. Check server logs for specific permission failure

### Users Can't See Projects

**Problem**: Project list is empty for members

**Solutions**:
1. Verify user is a member of an organization
2. Check `activeOrganizationId` is set in session
3. Confirm projects exist in that organization
4. Verify `listProjects` is using correct organization filter

### Permission Checks Not Working

**Problem**: Client-side permission checks return unexpected results

**Solutions**:
1. Remember: `checkRolePermission` doesn't include dynamic roles
2. For dynamic checks, use server-side `auth.api.hasPermission()`
3. Verify role configuration in both server and client
4. Check that permissions are imported correctly

## Best Practices

1. **Always require active organization**: Check `activeOrganizationId` in handlers
2. **Use middleware for permissions**: Don't manually check in every handler
3. **Scope database queries**: Always filter by `organizationId`
4. **Client-side for UX only**: Never rely on client checks for security
5. **Test all roles**: Verify behavior for owner, admin, and member roles
6. **Document permission requirements**: Add comments explaining required permissions

## References

- [Better Auth Documentation](https://www.better-auth.com/docs/plugins/organization)
- [Access Control Guide](https://www.better-auth.com/docs/plugins/organization#access-control)
- [Permission Examples](https://www.better-auth.com/docs/plugins/organization#custom-permissions)
