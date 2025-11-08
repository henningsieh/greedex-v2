# Data Model: Organization Registration & Dashboard

**Phase**: 1 (Design & Contracts)  
**Date**: November 7, 2025  
**Purpose**: Define data structures, validation rules, and state transitions

## Entity Definitions

### Organization

**Description**: Represents a workspace or team container for projects and members.

**Source**: Better Auth `organization` table (already exists in database schema)

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PRIMARY KEY, auto-generated | Unique identifier (UUID) |
| `name` | string | NOT NULL, LENGTH(3-50) | Human-readable organization name |
| `slug` | string | NOT NULL, UNIQUE, LENGTH(3-50), REGEX(/^[a-z0-9-]+$/) | URL-friendly identifier |
| `logo` | string \| null | OPTIONAL, URL | Organization logo URL |
| `createdAt` | timestamp | NOT NULL, auto-generated | Creation timestamp |
| `metadata` | string \| null | OPTIONAL, JSON | Additional organization data |

**Validation Rules** (Zod Schema):
```typescript
const organizationNameSchema = z
  .string()
  .min(3, 'Name must be at least 3 characters')
  .max(50, 'Name must not exceed 50 characters')
  .trim()

const organizationSlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must not exceed 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .trim()
  .toLowerCase()
```

**Uniqueness Constraint**: `slug` must be globally unique across all organizations

**State Transitions**: None (organizations are created and persist; deletion not in scope for MVP)

**Relationships**:
- ONE organization HAS MANY members (via `member` table)
- ONE organization HAS MANY projects (future feature - not implemented in MVP)

---

### Member

**Description**: Represents the relationship between a user and an organization with role-based access.

**Source**: Better Auth `member` table (already exists in database schema)

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PRIMARY KEY, auto-generated | Unique identifier (UUID) |
| `userId` | string | NOT NULL, FOREIGN KEY → user.id | Reference to user |
| `organizationId` | string | NOT NULL, FOREIGN KEY → organization.id | Reference to organization |
| `role` | string | NOT NULL, DEFAULT('member') | User role: 'owner', 'admin', 'member' |
| `createdAt` | timestamp | NOT NULL, auto-generated | Membership start timestamp |

**Validation Rules**:
- `role` must be one of: `'owner'`, `'admin'`, `'member'`
- Composite uniqueness: `(userId, organizationId)` pair must be unique (one membership per user per org)

**State Transitions**:
1. **Created** (Initial): User creates organization → member record created with `role='owner'`
2. **Future states** (not in MVP): Role changes, member removal

**Relationships**:
- MANY members BELONG TO ONE organization
- ONE member REFERENCES ONE user
- ONE organization MUST HAVE at least ONE member with `role='owner'`

**Derived Data for Display**:
- User information (name, email) joined from `user` table
- Join date displayed as formatted `createdAt` timestamp

---

### User

**Description**: Authenticated person with verified email (existing Better Auth entity)

**Source**: Better Auth `user` table (already exists)

**Relevant Fields** (for this feature):

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PRIMARY KEY | Unique identifier |
| `name` | string | NOT NULL | User's display name |
| `email` | string | NOT NULL, UNIQUE | User's email address |
| `emailVerified` | boolean | NOT NULL, DEFAULT(false) | Email verification status |

**Feature-Specific Constraints**:
- User MUST have `emailVerified=true` to create organizations (enforced by Better Auth config: `requireEmailVerification: true`)

**Relationships**:
- ONE user HAS MANY memberships (via `member` table)
- ONE user CAN CREATE MANY organizations (as owner)

---

### Session

**Description**: User session with organization context (existing Better Auth entity)

**Source**: Better Auth `session` table (already exists)

**Relevant Fields** (for this feature):

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PRIMARY KEY | Session identifier |
| `userId` | string | NOT NULL, FOREIGN KEY → user.id | Associated user |
| `activeOrganizationId` | string \| null | OPTIONAL, FOREIGN KEY → organization.id | Currently active organization |
| `expiresAt` | timestamp | NOT NULL | Session expiration |

**Feature Usage**:
- `activeOrganizationId` set when user creates their first organization
- Used for dashboard context and organization-scoped operations
- Better Auth plugin manages this field automatically

---

### Project (Future)

**Description**: Work items or initiatives within an organization (EMPTY STATE ONLY in MVP)

**Implementation Status**: ⚠️ **DEFERRED** - Only empty state component implemented

**Fields** (Planned for future):

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | string | PRIMARY KEY | Unique identifier |
| `organizationId` | string | NOT NULL, FOREIGN KEY → organization.id | Owner organization |
| `name` | string | NOT NULL | Project name |
| `description` | string \| null | OPTIONAL | Project description |
| `status` | string | NOT NULL | Project status |

**MVP Implementation**:
- No database table or API endpoints
- Projects tab displays shadcn Empty component
- Instructional message: "No projects yet. Projects will help you organize your work. Stay tuned!"

---

## Data Flow Diagrams

### Organization Creation Flow

```
┌─────────────┐
│   User      │
│ (verified)  │
└──────┬──────┘
       │
       │ 1. POST /api/organizations
       │    { name, slug }
       ▼
┌──────────────────┐
│  Server Action   │
│ createOrg()      │
└────────┬─────────┘
         │
         │ 2. Validate input (Zod)
         │    - name: 3-50 chars
         │    - slug: 3-50 chars, alphanumeric + hyphens
         ▼
┌──────────────────┐
│  Better Auth API │
│ createOrg()      │
└────────┬─────────┘
         │
         │ 3. Check slug uniqueness
         │ 4. Insert organization record
         │ 5. Insert member record (role='owner')
         │ 6. Set session.activeOrganizationId
         ▼
┌──────────────────┐
│    Database      │
│  PostgreSQL      │
└────────┬─────────┘
         │
         │ 7. Return organization data
         ▼
┌──────────────────┐
│  Client redirect │
│  → /dashboard    │
└──────────────────┘
```

### Dashboard Data Loading Flow

```
┌─────────────┐
│   User      │
│ → /dashboard│
└──────┬──────┘
       │
       │ 1. GET /dashboard
       ▼
┌──────────────────┐
│  Server Component│
│  dashboard/page  │
└────────┬─────────┘
         │
         │ 2. Check session
         │ 3. List organizations
         ▼
┌──────────────────┐
│  Better Auth API │
│ getSession()     │
│ listOrgs()       │
│ listMembers()    │
└────────┬─────────┘
         │
         │ 4. Query database
         │    JOIN user ON member.userId
         ▼
┌──────────────────┐
│    Database      │
│  PostgreSQL      │
└────────┬─────────┘
         │
         │ 5. Return data
         ▼
┌──────────────────┐
│  Dashboard Shell │
│  - Tabs (URL)    │
│  - Team Table    │
│  - Empty States  │
└──────────────────┘
```

---

## Validation Rules Summary

### Organization Name
- **Min Length**: 3 characters
- **Max Length**: 50 characters
- **Allowed Characters**: Any Unicode characters (trimmed)
- **Transformation**: Trim whitespace
- **Error Messages**:
  - Empty: "Organization name is required"
  - Too short: "Name must be at least 3 characters"
  - Too long: "Name must not exceed 50 characters"

### Organization Slug
- **Min Length**: 3 characters
- **Max Length**: 50 characters
- **Allowed Characters**: Lowercase letters (a-z), numbers (0-9), hyphens (-)
- **Transformation**: Trim whitespace, convert to lowercase
- **Uniqueness**: Must be globally unique (checked server-side)
- **Error Messages**:
  - Empty: "Organization slug is required"
  - Too short: "Slug must be at least 3 characters"
  - Too long: "Slug must not exceed 50 characters"
  - Invalid format: "Slug must contain only lowercase letters, numbers, and hyphens"
  - Duplicate: "This slug is already taken. Please choose a different one."

### Email Verification (Pre-condition)
- **Rule**: `user.emailVerified` must be `true`
- **Enforcement**: Better Auth configuration (`requireEmailVerification: true`)
- **Error Handling**: Users without verified emails cannot reach org creation page (redirected to verification flow)

---

## Database Indexes

**Existing Indexes** (from Better Auth plugin):
- `organization.slug` - UNIQUE index for uniqueness constraint and fast lookup
- `organization.id` - PRIMARY KEY index
- `member.organizationId` - INDEX for member queries
- `member.userId` - INDEX for user membership queries
- `session.activeOrganizationId` - INDEX for active org queries

**No additional indexes required for MVP**

---

## Data Access Patterns

### Pattern 1: Check if User Has Organizations
```typescript
// Used in: (app)/layout.tsx for redirect logic
const organizations = await auth.api.listOrganizations({ headers: await headers() })
const hasOrganizations = organizations.length > 0

// Database Query:
// SELECT o.* FROM organization o
// JOIN member m ON m.organizationId = o.id
// WHERE m.userId = :sessionUserId
```

### Pattern 2: Create Organization
```typescript
// Used in: Server Action createOrganization()
const result = await auth.api.createOrganization({
  body: {
    name: 'My Organization',
    slug: 'my-org',
  },
  headers: await headers()
})

// Database Queries:
// 1. Check uniqueness:
//    SELECT id FROM organization WHERE slug = :slug
// 2. Insert organization:
//    INSERT INTO organization (id, name, slug, createdAt) VALUES (...)
// 3. Insert member:
//    INSERT INTO member (id, userId, organizationId, role, createdAt) VALUES (..., 'owner', ...)
// 4. Update session:
//    UPDATE session SET activeOrganizationId = :orgId WHERE id = :sessionId
```

### Pattern 3: List Organization Members
```typescript
// Used in: Team table component
const members = await auth.api.listMembers({
  query: { organizationId: 'org-id' },
  headers: await headers()
})

// Database Query:
// SELECT m.*, u.name, u.email, u.image
// FROM member m
// JOIN user u ON u.id = m.userId
// WHERE m.organizationId = :organizationId
// ORDER BY m.createdAt ASC
```

---

## Type Definitions

```typescript
// Generated from Zod schemas

export interface Organization {
  id: string
  name: string
  slug: string
  logo: string | null
  createdAt: Date
  metadata: Record<string, unknown> | null
}

export interface Member {
  id: string
  userId: string
  organizationId: string
  role: 'owner' | 'admin' | 'member'
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

export interface CreateOrganizationInput {
  name: string // 3-50 chars
  slug: string // 3-50 chars, alphanumeric + hyphens
  logo?: string | null
  metadata?: Record<string, unknown> | null
}

export interface OrganizationWithMembers extends Organization {
  members: Member[]
  memberCount: number
}
```

---

## State Management

### Server State (Database)
- **Organizations**: Persisted in PostgreSQL via Better Auth
- **Members**: Persisted in PostgreSQL via Better Auth
- **Active Organization**: Stored in `session.activeOrganizationId`

### Client State (React)
- **Tab Selection**: URL parameter via nuqs (`?tab=dashboard|team|projects`)
- **Form State**: React Hook Form (local component state)
- **Optimistic Updates**: None required for MVP (Server Actions with revalidation)

### URL State (nuqs)
```typescript
// Tab parameter structure
?tab=dashboard  // Default tab (stats placeholder)
?tab=team       // Team members table
?tab=projects   // Projects grid (empty state)

// Type-safe parsing
const tabSchema = z.enum(['dashboard', 'team', 'projects'])
const [tab, setTab] = useQueryState('tab', {
  defaultValue: 'dashboard',
  parse: (value) => tabSchema.safeParse(value).success ? value : 'dashboard'
})
```

---

## Migration Requirements

**Status**: ✅ **NO MIGRATION REQUIRED**

All necessary tables already exist from Better Auth organization plugin migration:
- `organization` table with all required fields
- `member` table with role support
- `session` table with `activeOrganizationId` field
- `invitation` table (not used in MVP but exists for future)

**Verification Command**:
```bash
# Check existing schema
bun run drizzle-kit introspect
```

---

## Data Integrity Rules

### Referential Integrity
- `member.userId` → `user.id` (CASCADE on delete)
- `member.organizationId` → `organization.id` (CASCADE on delete)
- `session.activeOrganizationId` → `organization.id` (SET NULL on delete)

### Business Logic Constraints
1. **Organization must have at least one owner**: Enforced by Better Auth plugin on creation
2. **User can only create one organization at a time**: Enforced by form submission state
3. **Slug uniqueness**: Enforced by database UNIQUE constraint + validation error handling
4. **Email verification required**: Enforced by Better Auth session middleware

### Consistency Guarantees
- **Transaction**: Organization creation + member insertion + session update wrapped in database transaction by Better Auth
- **Rollback**: If any step fails, entire operation rolls back (no orphaned records)

---

## Performance Considerations

### Query Optimization
- Member list query includes user JOIN (single query vs N+1)
- Organization list limited to 100 by default (adequate for single-org MVP)
- Indexes on foreign keys provide fast lookups

### Caching Strategy (Future)
- Not required for MVP (low traffic, <50 members)
- Consider React Server Component caching for static dashboard sections
- Database query caching via Better Auth plugin

### Pagination (Future)
- Members table: No pagination in MVP (FR-011 clarification: display all)
- Consider pagination when member count exceeds 100 (future enhancement)

---

## Security & Privacy

### Data Access Control
- **Organization data**: Only accessible to organization members
- **Member list**: Only accessible to organization members
- **Slug availability**: Publicly checkable (for validation during creation)

### Personal Data Handling
- **Organization name/slug**: Not considered personal data (represents institution)
- **Member email/name**: Personal data from existing user records (already GDPR-compliant via Better Auth)
- **No new personal data collected**: This feature only creates relationships

### GDPR Compliance
- ✅ **Data Minimization**: Only collects organization identifier and name
- ✅ **Purpose Limitation**: Organization data used solely for workspace organization
- ✅ **Right to Erasure**: Cascading deletes ensure clean removal (future feature)

---

## Testing Data Requirements (documentation only)

The following fixtures, seed data, and E2E scenarios are documented for clarity and future use. Test execution and automated seeding are out-of-scope for the current product policy; these entries are reference artifacts only.

### Unit Test Fixtures (documented for reference)
```typescript
// Valid organization inputs (reference fixtures)
const validOrganization = {
  name: 'Test Organization',
  slug: 'test-org'
}

// Edge cases (reference fixtures)
const minLengthOrg = { name: 'Abc', slug: 'abc' }
const maxLengthOrg = {
  name: 'A'.repeat(50),
  slug: 'a'.repeat(50)
}

// Invalid inputs (reference fixtures)
const tooShortName = { name: 'Ab', slug: 'test' }
const tooLongName = { name: 'A'.repeat(51), slug: 'test' }
const invalidSlug = { name: 'Test', slug: 'Invalid_Slug!' }
```

### Integration Test Data (reference)
- Mock Better Auth API responses (for documentation)
- Example seed data documented (e.g., users with verified emails); seeding/execution is out-of-scope
- Example organizations shown for uniqueness scenarios (documentation only)

### E2E Test Scenarios (reference)
- User account with verified email (no organizations)
- Organization with owner member
- Multiple members for testing table display
