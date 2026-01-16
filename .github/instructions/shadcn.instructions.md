---
applyTo: "src/components/ui/**/*.{ts,tsx}|src/components/**/form*.{ts,tsx}"
description: Shadcn UI components - forms, tables, empty states, and accessible UI patterns
---

# Shadcn UI Instructions

## Comprehensive Documentation

**⚠️ CRITICAL**: This repository contains comprehensive Shadcn UI documentation in `/docs/shadcn/`. **Always consult these comprehensive guides first** for component usage, patterns, and examples.

## Components

All shadcn components are installed and set up in this codebase at `src/components/ui`.

- **Field Component**: Combine labels, controls, and help text to compose accessible form fields and grouped inputs.
  - See: [docs/shadcn/shadcn-ui.new-field.documentation.md](../../docs/shadcn/shadcn-ui.new-field.documentation.md)
- **Empty Component**: Use the Empty component to display an empty state.
  - See: [docs/shadcn/shadcn.empty.component.md](../../docs/shadcn/shadcn.empty.component.md)
- **Data Table Component**: Implement data tables with sorting, filtering, and pagination using TanStack Table.
  - See: [docs/shadcn/shadcn-ui.data-table.md](../../docs/shadcn/shadcn-ui.data-table.md)

- **Card Component**: Displays a card with header, content, and footer.
  - See: [docs/shadcn/shadcn-ui.card.md](../../docs/shadcn/shadcn-ui.card.md)

## Installation

To add a new shadcn component:

```bash
bunx shadcn@latest add <component-name>
```

## Best Practices

- Use semantic HTML and ARIA attributes for accessibility
- Prefer shadcn components over custom implementations for consistency
- Check the component documentation for usage examples and variants
- All components support className prop for Tailwind CSS customization

### Official Shadcn UI Resources

For the latest upstream documentation:

- Official docs: https://ui.shadcn.com/docs

For detailed component documentation and examples, refer to the files in `/docs/shadcn/`.
