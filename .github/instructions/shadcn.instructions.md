---
name: "Shadcn UI Components"
description: "UI components, forms, tables, dialogs, and accessibility patterns"
applyTo: "src/components/ui/**/*.tsx,**/components/**/*.{ts,tsx}"
---

# Shadcn UI Components Guide

**Context**: When working with UI components, forms, tables, or accessibility features.

---

## Comprehensive Documentation

For component usage, patterns, and examples, **always consult** `/docs/shadcn/` first:

- **Field Component**: [docs/shadcn/shadcn-ui.new-field.documentation.md](../../docs/shadcn/shadcn-ui.new-field.documentation.md) — Combine labels, controls, and help text for accessible form fields
- **Empty Component**: [docs/shadcn/shadcn.empty.component.md](../../docs/shadcn/shadcn.empty.component.md) — Display empty states
- **Data Table Component**: [docs/shadcn/shadcn-ui.data-table.md](../../docs/shadcn/shadcn-ui.data-table.md) — Implement data tables with sorting, filtering, and pagination
- **Card Component**: [docs/shadcn/shadcn-ui.card.md](../../docs/shadcn/shadcn-ui.card.md) — Display cards with header, content, and footer
- **Sidebar Component**: [docs/shadcn/shadcn-ui.sidebar.md](../../docs/shadcn/shadcn-ui.sidebar.md) — Navigation sidebar patterns

---

## Official Resources

- Official docs: https://ui.shadcn.com/docs

---

## Getting Started

### Component Installation

All shadcn components are **installed locally** in this codebase at `src/components/ui/`.

**To add a new component**:

```bash
bunx shadcn@latest add <component-name>
```

The CLI will:

1. Download the component code
2. Place it in `src/components/ui/`
3. Install any required dependencies

**Important**: Components are copied into your project, so you can **modify them directly**. They're not imported from a package.

---

## Basic Rules

### Import Pattern

Import components directly from their specific files:

```typescript
// ✅ Good
import { ComponentName } from "@/components/ui/component-name";

// ❌ Avoid
import { ComponentName } from "@/components/ui";
```

### Customization

All components support the `className` prop for Tailwind CSS customization:

```typescript
<ComponentName className="custom-classes" />
```

### Variants and Sizes

Many components support `variant` and `size` props for different styles:

```typescript
<ComponentName variant="variant-name" size="size-name" />
```

---

## Best Practices

### Accessibility

- **Use semantic HTML**: shadcn components use proper ARIA attributes
- **Provide labels**: Always use appropriate labeling components for form inputs
- **Keyboard navigation**: All interactive components support keyboard navigation
- **Focus management**: Components handle focus appropriately

### Consistency

- **Prefer shadcn over custom**: Use shadcn components instead of building from scratch
- **Follow variant patterns**: Use built-in variants for consistency
- **Customize via className**: Extend with Tailwind classes, don't rewrite components

### Performance

- **Import specific components**: Import from specific files, not barrel exports

---

## File Locations

| Purpose                     | Location              |
| --------------------------- | --------------------- |
| **All shadcn components**   | `src/components/ui/`  |
| **Component documentation** | `docs/shadcn/`        |
| **Tailwind config**         | `tailwind.config.ts`  |
| **Global styles**           | `src/app/globals.css` |

---

## For More Details

- **All component documentation**: `/docs/shadcn/` (see individual `.md` files for each component)
- **Official shadcn docs**: https://ui.shadcn.com/docs.md
- **Accessibility guidelines**: WCAG 2.1 (wcag.org)
- **Code standards**: `.github/instructions/code-standards.instructions.md` (React & JSX section)
