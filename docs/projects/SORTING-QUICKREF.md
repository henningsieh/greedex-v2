---
applyTo: 'src/config/**|src/features/projects/**|src/components/features/projects/**'
description: 'Quick reference guide for the centralized project sorting architecture'
---

# Project Sorting Architecture: Quick Reference

## Single-Page Cheat Sheet

### Configuration Entry Point

```typescript
// src/config/projects.ts - THE SOURCE OF TRUTH
export const DEFAULT_PROJECT_SORT = {
  column: "name",      // Which field to sort by
  order: "desc",       // Sort direction: "asc" or "desc"
} as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};
```

### Type Validation Layer

```typescript
// src/features/projects/types.ts
// Ensures sort fields match actual DB schema

type ProjectColumns = keyof typeof projectsTable.$inferSelect;
export type ProjectSortField = ProjectColumns;

// ✅ Only fields that exist in projectsTable are allowed
export const PROJECT_SORT_FIELDS = [
  "name",
  "location",      // NOT "country" - matches DB schema
  "startDate",
  "createdAt",
  "updatedAt",
] as const satisfies readonly ProjectSortField[];

// Re-export with validation
export const DEFAULT_PROJECT_SORT = CONFIG_DEFAULT_PROJECT_SORT as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};
```

### Conversion Helper for TanStack

```typescript
// src/features/projects/utils.ts
export function getProjectsDefaultSorting() {
  return [
    {
      id: DEFAULT_PROJECT_SORT.column,
      desc: DEFAULT_PROJECT_SORT.order === "desc",
    },
  ];
}
```

---

## Consumer Patterns (Copy-Paste Friendly)

### Pattern A: Grid View (In-Memory Sorting)

```typescript
// src/components/features/projects/dashboard/projects-grid.tsx
import { DEFAULT_PROJECT_SORT } from "@/config/projects";

export function ProjectsGrid() {
  // Initialize from config
  const [sortBy, setSortBy] = useState<ProjectSortField>(
    DEFAULT_PROJECT_SORT.column
  );
  const [sortDesc, setSortDesc] = useState<boolean>(
    DEFAULT_PROJECT_SORT.order === "desc"
  );

  // Use in sorting logic
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aValue = a[sortBy as keyof ProjectType];
      const bValue = b[sortBy as keyof ProjectType];
      
      // Handle sorting...
      const result = compare(aValue, bValue);
      return sortDesc ? -result : result;
    });
  }, [projects, sortBy, sortDesc]);

  return <div>{/* render sorted projects */}</div>;
}
```

### Pattern B: TanStack Table

```typescript
// src/components/features/projects/dashboard/projects-table.tsx
import { getProjectsDefaultSorting } from "@/features/projects/utils";

export function ProjectsTable() {
  // Initialize with converted config
  const [sorting, setSorting] = useState<SortingState>(() =>
    getProjectsDefaultSorting()
  );

  const table = useReactTable({
    data: projects,
    columns: projectTableColumns,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return <DataTable table={table} />;
}
```

### Pattern C: Server-Side Prefetch

```typescript
// src/app/[locale]/(app)/org/projects/page.tsx
import { DEFAULT_PROJECT_SORT } from "@/config/projects";

export default async function ProjectsPage() {
  const queryClient = getQueryClient();

  // Prefetch with same config as client
  await queryClient.prefetchQuery(
    orpcQuery.projects.list.queryOptions({
      input: {
        sort_by: DEFAULT_PROJECT_SORT.column,
      },
    }),
  );

  return <ProjectsTab />;
}
```

### Pattern D: Backend RPC Procedure

```typescript
// src/features/projects/procedures.ts
import { DEFAULT_PROJECT_SORT } from "@/config/projects";

export const listProjects = authorized
  .handler(async ({ input }) => {
    const sortField = input?.sort_by ?? DEFAULT_PROJECT_SORT.column;
    
    let sortDesc: boolean;
    if (input?.sort_by === undefined) {
      // No sort requested → use default order
      sortDesc = DEFAULT_PROJECT_SORT.order === "desc";
    } else if (input.sort_by === DEFAULT_PROJECT_SORT.column) {
      // User chose default column → use default direction
      sortDesc = DEFAULT_PROJECT_SORT.order === "desc";
    } else {
      // User chose different column → default to ascending
      sortDesc = false;
    }

    // Apply to query
    const orderByClause = sortDesc
      ? desc(projectsTable[sortField])
      : asc(projectsTable[sortField]);

    return db.select().from(projectsTable).orderBy(orderByClause);
  });
```

---

## Type Safety at a Glance

```typescript
// ✅ This compiles - field exists in DB
const sort: ProjectSortField = "name";

// ❌ This fails - field doesn't exist in DB
const bad: ProjectSortField = "invalid_field";

// ✅ This works - validates structure
const config = {
  column: "name",
  order: "desc",
} as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};

// ❌ This fails - invalid field
const invalid = {
  column: "nonexistent",
  order: "desc",
} as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};
```

---

## Import Paths

### Correct Imports

```typescript
// Configuration (in src/config/)
import { DEFAULT_PROJECT_SORT } from "@/config/projects";

// Types (in src/features/)
import { PROJECT_SORT_FIELDS, type ProjectSortField, type ProjectType } from "@/features/projects/types";

// Utilities (in src/features/)
import {
  getProjectsDefaultSorting,
  getColumnDisplayName,
} from "@/features/projects/utils";
```

### ❌ Wrong Imports (Avoid)

```typescript
// ❌ Don't import DEFAULT_PROJECT_SORT from features
import { DEFAULT_PROJECT_SORT } from "@/config/projects";  // ✅ correct source is config/projects

// ❌ Don't import from old paths
// Deprecated import removed - use { DEFAULT_PROJECT_SORT } from "@/config/projects" instead
```

---

## File Locations

```
src/
  config/
    projects.ts              ← DEFAULT_PROJECT_SORT defined here
  features/projects/
    types.ts                 ← PROJECT_SORT_FIELDS, ProjectSortField
    utils.ts                 ← getProjectsDefaultSorting()
    procedures.ts            ← Backend RPC using config
  components/features/projects/
    dashboard/
      projects-grid.tsx      ← Grid view using DEFAULT_PROJECT_SORT
      projects-table.tsx     ← Table view using getProjectsDefaultSorting()
      projects-table-columns.tsx  ← Column definitions
      projects-tab.tsx       ← Tab wrapper
      archived-projects-tab.tsx   ← Archived tab
  app/[locale]/(app)/org/
    projects/
      page.tsx              ← Server prefetch using DEFAULT_PROJECT_SORT.column
    dashboard/
      page.tsx              ← Dashboard prefetch using DEFAULT_PROJECT_SORT.column
```

---

## Changing Default Sort

### Scenario 1: Change Default Column

```typescript
// Before: sorts by "name" in descending order
export const DEFAULT_PROJECT_SORT = {
  column: "name",
  order: "desc",
} as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};

// After: sorts by "startDate" in descending order
export const DEFAULT_PROJECT_SORT = {
  column: "startDate",    // ← Changed
  order: "desc",
} as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};

// ✅ Grid, table, backend ALL automatically use new default
```

### Scenario 2: Change Default Direction

```typescript
// Before: descending
export const DEFAULT_PROJECT_SORT = {
  column: "name",
  order: "desc",
} as const satisfies { ... };

// After: ascending
export const DEFAULT_PROJECT_SORT = {
  column: "name",
  order: "asc",          // ← Changed
} as const satisfies { ... };

// ✅ ALL consumers automatically respect new direction
```

### Scenario 3: Add New Sortable Field

```typescript
// Step 1: Add to PROJECT_SORT_FIELDS
export const PROJECT_SORT_FIELDS = [
  "name",
  "location",
  "startDate",
  "createdAt",
  "updatedAt",
  "newField",           // ← Add here
] as const satisfies readonly ProjectSortField[];

// Step 2: Add sort logic in backend (procedures.ts)
case "newField":
  orderByClause = sortDesc
    ? desc(projectsTable.newField)
    : asc(projectsTable.newField);
  break;

// Step 3: Add column definition in table (if sortable)
{
  accessorKey: "newField",
  header: ({ column, table }) => (
    <SortableHeader
      column={column}
      table={table}
      title={getColumnDisplayName(column.id, t)}
    />
  ),
  sortingFn: customSort,  // Add custom sort if needed
}

// ✅ Grid automatically includes in dropdown
// ✅ Type safety ensures "newField" is valid
```

---

## Translation Integration

```typescript
// In src/features/projects/utils.ts
export function getColumnDisplayName(
  columnId: ProjectSortField | string,
  t: (key: string) => string,
): string {
  switch (columnId) {
    case "name":
      return t("table.name");
    case "location":
      return t("table.country");  // ← Key stays "country" for backward compat
    case "startDate":
      return t("table.start-date");
    case "createdAt":
      return t("table.created");
    case "updatedAt":
      return t("table.updated");
    default:
      return columnId;
  }
}

// Usage in Grid
const sortLabel = getColumnDisplayName(sortBy, t);

// Usage in Table
const header = getColumnDisplayName(column.id, t);
```

---

## Common Tasks

### Task 1: Initialize a Component with Default Sort

```typescript
const [sortBy, setSortBy] = useState<ProjectSortField>(
  DEFAULT_PROJECT_SORT.column
);
const [sortDesc, setSortDesc] = useState<boolean>(
  DEFAULT_PROJECT_SORT.order === "desc"
);
```

### Task 2: Check if Current Sort Is Default

```typescript
const isDefaultSort = 
  sortBy === DEFAULT_PROJECT_SORT.column &&
  sortDesc === (DEFAULT_PROJECT_SORT.order === "desc");
```

### Task 3: Reset to Default Sort

```typescript
const resetSort = () => {
  setSortBy(DEFAULT_PROJECT_SORT.column);
  setSortDesc(DEFAULT_PROJECT_SORT.order === "desc");
};
```

### Task 4: Get Sort Direction Label

```typescript
const sortLabel = DEFAULT_PROJECT_SORT.order === "desc" 
  ? "Descending" 
  : "Ascending";
```

### Task 5: Query with Default Sort

```typescript
const result = await orpc.projects.list({
  sort_by: DEFAULT_PROJECT_SORT.column,
});
```

---

## Troubleshooting

### Error: `"field" is not assignable to type `ProjectSortField`

**Cause**: Field doesn't exist in DB schema  
**Fix**: Check `projectsTable.$inferSelect` to see valid fields

```typescript
// View valid fields in DB schema
type ProjectColumns = keyof typeof projectsTable.$inferSelect;
// Use only fields from this type
```

### Error: `Cannot find module '@/features/projects'` (after refactor)

**Cause**: Importing `DEFAULT_PROJECT_SORT` from old location  
**Fix**: Change import path to `@/config/projects`

```typescript
// ❌ Wrong
import { DEFAULT_PROJECT_SORT } from "@/config/projects";

// ✅ Correct: import DEFAULT_PROJECT_SORT from config
import { DEFAULT_PROJECT_SORT } from "@/config/projects";
import { DEFAULT_PROJECT_SORT } from "@/config/projects";
```

### Sort Not Working in Grid

**Cause**: Using `"country"` accessor instead of `"location"`  
**Fix**: Use correct field name

```typescript
// ❌ Wrong
const value = project["country"];

// ✅ Correct
const value = project["location"];
```

### TanStack Table Not Sorting

**Cause**: Initializing with wrong format  
**Fix**: Use `getProjectsDefaultSorting()` helper

```typescript
// ❌ Wrong
const [sorting, setSorting] = useState([
  { id: DEFAULT_PROJECT_SORT.column, desc: true }
]);

// ✅ Correct
const [sorting, setSorting] = useState<SortingState>(() =>
  getProjectsDefaultSorting()
);
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│         src/config/projects.ts                  │
│  DEFAULT_PROJECT_SORT = {column, order}         │
│  ↓ imports ProjectSortField type                │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────▼─────────────┐
    │ src/features/projects/   │
    │ types.ts                 │
    │ Validates type safety    │
    │ ↓ exports                │
    ├──────────────────────────┤
    │ utils.ts                 │
    │ getProjectsDefaultSort() │
    │ ↓ helper converts format │
    └────────────┬─────────────┘
                 │
    ┌────────────┴──────────────────────┐
    │                                   │
    ▼                                   ▼
┌──────────────────────┐     ┌──────────────────────┐
│   Grid View          │     │   Table View         │
│ (In-memory sort)     │     │ (TanStack Table)     │
│ Uses:                │     │ Uses:                │
│ - .column            │     │ - getProjectsDefault │
│ - .order             │     │   Sorting()          │
└──────────────────────┘     └──────────────────────┘
         │                            │
         └────────────┬───────────────┘
                      │ Same defaults
    ┌─────────────────┴─────────────────┐
    │                                   │
    ▼                                   ▼
┌──────────────────────┐     ┌──────────────────────┐
│   Server Prefetch    │     │   Backend RPC        │
│   (Page.tsx)         │     │   (procedures.ts)    │
│ Uses:                │     │ Uses:                │
│ - .column for sort_by│     │ - .column for field  │
│ - Consistent w/client│     │ - .order for dir     │
└──────────────────────┘     └──────────────────────┘

    ▼ All source from single location → Consistency!
```

---

## Key Principles

1. **Single Source of Truth**: All sorting config in `src/config/projects.ts`
2. **Type Safety**: Fields validated against DB schema at compile-time
3. **Clear Semantics**: Property names (`.column`, `.order`) vs array indexes
4. **Consistency**: Grid, table, backend all use same configuration
5. **Isolation**: TanStack conversion in helper, not scattered in components
6. **Backward Compatibility**: Translation keys unchanged, no breaking changes

---

## Related Documentation

- 📖 [Comprehensive Refactoring Guide](./sorting-centralization-refactoring.md)
- 📋 [Session Summary](./SESSION-SUMMARY.md)
- 📚 [Architecture Overview](../README.md)

---

**Last Updated**: January 4, 2026  
**Version**: 1.0 (Post-Refactoring)
