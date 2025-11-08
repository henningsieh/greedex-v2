# Quickstart: Organization Registration & Dashboard

**Feature**: Organization Registration & Dashboard  
**Branch**: `001-org-registration`  
**Last Updated**: November 7, 2025

## Overview

This guide provides a rapid implementation path for the organization registration and dashboard feature. Follow these steps sequentially to build the feature from scratch.

## Prerequisites

✅ **Before starting, verify**:
- [ ] Better Auth organization plugin configured in `src/lib/better-auth/index.ts`
- [ ] Better Auth client plugin configured in `src/lib/better-auth/auth-client.ts`
- [ ] Database migrations applied (organization, member, invitation tables exist)
- [ ] nuqs library installed (`bun add nuqs`)
- [ ] NuqsAdapter wrapped around app in `src/app/layout.tsx`
- [ ] shadcn/ui components installed (Table, Card, Tabs, Empty)
- [ ] User authentication and email verification working

## Implementation Sequence

### Phase 1: Validation Layer (30 minutes)

#### 1.1 Create Validation Schemas

**File**: `src/lib/validations/organization.ts`

```typescript
import { z } from 'zod'

export const organizationNameSchema = z
  .string()
  .min(3, 'Name must be at least 3 characters')
  .max(50, 'Name must not exceed 50 characters')
  .trim()

export const organizationSlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must not exceed 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .trim()
  .toLowerCase()

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
```

#### 1.2 Validation Tests (reference)

Example unit test snippets for validation are documented in the repository for reference. Automated test files and execution commands have been removed from the quickstart — test implementation and execution are out-of-scope for MVP. Use the documented Zod schemas and fixtures above as reference when writing tests in the future.

---

### Phase 2: Server Actions (45 minutes)

#### 2.1 Create Organization Server Actions

**File**: `src/lib/actions/organization.ts`

```typescript
'use server'

import { auth } from '@/lib/better-auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createOrganizationSchema } from '@/lib/validations/organization'

export async function createOrganization(input: unknown) {
  try {
    // Validate input
    const validated = createOrganizationSchema.parse(input)

    // Create organization via Better Auth
    const result = await auth.api.createOrganization({
      body: validated,
      headers: await headers(),
    })

    // Revalidate dashboard page
    revalidatePath('/dashboard')
    revalidatePath('/(app)', 'layout')

    return { success: true, data: result }
  } catch (error: any) {
    // Handle specific errors
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      throw new Error('This slug is already taken. Please choose a different one.')
    }
    if (error.name === 'ZodError') {
      throw error // Let client handle validation errors
    }
    throw new Error('Failed to create organization. Please try again.')
  }
}

export async function listOrganizations() {
  try {
    const result = await auth.api.listOrganizations({
      headers: await headers(),
    })
    return { success: true, data: result }
  } catch (error) {
    throw new Error('Failed to load organizations')
  }
}

export async function listMembers(organizationId: string) {
  try {
    const result = await auth.api.listMembers({
      query: { organizationId },
      headers: await headers(),
    })
    return { success: true, data: result }
  } catch (error) {
    throw new Error('Failed to load members')
  }
}
```

#### 2.2 Integration Tests (reference)

Integration test examples and mocking patterns are documented here for future contributors. Test harnesses and example integration files have been removed from the quickstart; implementing and running integration tests is out-of-scope for the MVP. The server action implementation above includes patterns useful for future test authoring.

---

### Phase 3: Organization Creation Page (60 minutes)

#### 3.1 Create Organization Form

**File**: `src/app/(app)/org/create/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createOrganization } from '@/lib/actions/organization'
import { createOrganizationSchema, type CreateOrganizationInput } from '@/lib/validations/organization'

export default function CreateOrganizationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  })

  async function onSubmit(data: CreateOrganizationInput) {
    setIsLoading(true)
    try {
      await createOrganization(data)
      toast.success('Organization created successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create organization')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create Your Organization</h1>
          <p className="text-muted-foreground">
            Get started by creating your first organization
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="my-organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Organization'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
```

#### 3.2 Add Layout Redirect Logic

**File**: `src/app/(app)/layout.tsx`

```typescript
import { auth } from '@/lib/better-auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect('/login')
  }

  // Check if user has any organizations
  const organizations = await auth.api.listOrganizations({ headers: await headers() })

  // Allow access to org creation page
  const headersList = headers()
  const pathname = headersList.get('x-invoke-path') || headersList.get('referer') || ''

  if (organizations.length === 0 && !pathname.includes('/org/create')) {
    redirect('/org/create')
  }

  return <>{children}</>
}
```

---

### Phase 4: Dashboard Shell (90 minutes)

#### 4.1 Create Tab Navigation Component

**File**: `src/app/(app)/dashboard/_components/dashboard-tabs.tsx`

```typescript
'use client'

import { useQueryState } from 'nuqs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardStats } from './dashboard-stats'
import { TeamTable } from './team-table'
import { ProjectsGrid } from './projects-grid'
import type { Member } from '@/specs/001-org-registration/contracts/members-list.contract'

interface DashboardTabsProps {
  members: Member[]
}

export function DashboardTabs({ members }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'dashboard',
    parse: (value) =>
      ['dashboard', 'team', 'projects'].includes(value) ? value : 'dashboard',
  })

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="mt-6">
        <DashboardStats />
      </TabsContent>

      <TabsContent value="team" className="mt-6">
        <TeamTable members={members} />
      </TabsContent>

      <TabsContent value="projects" className="mt-6">
        <ProjectsGrid />
      </TabsContent>
    </Tabs>
  )
}
```

#### 4.2 Create Dashboard Page

**File**: `src/app/(app)/dashboard/page.tsx`

```typescript
import { auth } from '@/lib/better-auth'
import { headers } from 'next/headers'
import { DashboardTabs } from './_components/dashboard-tabs'

export default async function DashboardPage() {
  // Get active organization members
  const session = await auth.api.getSession({ headers: await headers() })
  const members = await auth.api.listMembers({
    query: { organizationId: session.session.activeOrganizationId! },
    headers: await headers(),
  })

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your organization dashboard
          </p>
        </div>

        <DashboardTabs members={members} />
      </div>
    </div>
  )
}
```

#### 4.3 Create Stats Placeholder

**File**: `src/app/(app)/dashboard/_components/dashboard-stats.tsx`

```typescript
import { Card } from '@/components/ui/card'

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6">
        <div className="text-sm font-medium text-muted-foreground">Total Members</div>
        <div className="text-2xl font-bold">Coming Soon</div>
      </Card>
      <Card className="p-6">
        <div className="text-sm font-medium text-muted-foreground">Active Projects</div>
        <div className="text-2xl font-bold">Coming Soon</div>
      </Card>
      <Card className="p-6">
        <div className="text-sm font-medium text-muted-foreground">Total Activities</div>
        <div className="text-2xl font-bold">Coming Soon</div>
      </Card>
    </div>
  )
}
```

---

### Phase 5: Team Table (60 minutes)

#### 5.1 Create Team Table Component

**File**: `src/app/(app)/dashboard/_components/team-table.tsx`

```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Member } from '@/specs/001-org-registration/contracts/members-list.contract'

interface TeamTableProps {
  members: Member[]
}

export function TeamTable({ members }: TeamTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.user.image || undefined} />
                    <AvatarFallback>
                      {member.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{member.user.name}</span>
                </div>
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                  {member.role}
                </Badge>
              </TableCell>
              <TableCell>
                {new Intl.DateTimeFormat('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }).format(new Date(member.createdAt))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

---

### Phase 6: Projects Empty State (30 minutes)

#### 6.1 Create Projects Grid Component

**File**: `src/app/(app)/dashboard/_components/projects-grid.tsx`

```typescript
import { FolderOpen } from 'lucide-react'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function ProjectsGrid() {
  // No projects in MVP - always show empty state
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Projects will help you organize your work and track activities. Stay tuned for this feature!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
```

---

## Manual Testing Checklist

- [ ] Manual test: Register new user → Verify email → Create org → View dashboard
- [ ] Manual test: Try duplicate slug (should show error)
- [ ] Manual test: Switch tabs (URL should update)
- [ ] Manual test: Refresh page on specific tab (should persist)
- [ ] Manual test: Verify validation messages for name/slug too short
- [ ] Manual test: Verify validation messages for name/slug too long
- [ ] Manual test: Verify slug accepts only lowercase letters, numbers, and hyphens

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Code linted and formatted: `bun run lint && bun run format`
- [ ] Manual testing completed (see checklist above)
 - [ ] Accessibility: rely on `shadcn/ui` default semantics; no formal accessibility audit in MVP

---

## Troubleshooting

**Problem**: "Organization slug already taken" error  
**Solution**: Check database for existing slugs, try a different slug

**Problem**: Redirect loop on dashboard  
**Solution**: Verify `activeOrganizationId` is set in session after org creation

**Problem**: Tab doesn't persist on refresh  
**Solution**: Check nuqs is correctly configured with NuqsAdapter in root layout

**Problem**: Team table shows no data  
**Solution**: Verify `listMembers` API is returning data, check organizationId is correct

---

## Next Steps

After completing this quickstart:

1. Run `/speckit.tasks` to break down implementation into granular tasks
2. Consider adding accessibility improvements (keyboard navigation, ARIA labels)
3. Plan for future features: Project management, Member invitations, Role management
