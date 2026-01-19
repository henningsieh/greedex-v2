# Next.js Dev Server Memory Optimization

## Summary

This document describes the memory optimization changes made to reduce Next.js dev server memory usage and prevent frequent restarts due to memory threshold warnings.

## Problem

The Next.js dev server was experiencing frequent restarts with the warning:

```
⚠ Server is approaching the used memory threshold, restarting...
```

This is a known issue in Next.js (see [#83275](https://github.com/vercel/next.js/issues/83275), [#84648](https://github.com/vercel/next.js/issues/84648)) primarily caused by:

- Inefficient imports from icon/component libraries
- Webpack memory handling
- Loading entire icon libraries instead of just used icons

## Analysis Results

### Icon Library Usage

- **lucide-react**: ~75 unique icons imported across 67+ files
- **@radix-ui packages**: ~34 files importing from various Radix UI packages
- **No usage found for**: react-icons, @mui/icons-material, @heroicons/react

### Barrel Files

Two icon registry files were identified but are **already optimized** (not barrel exports):

- `src/components/features/organizations/organization-icons.ts` - Maps 7 icons
- `src/components/features/projects/project-icons.ts` - Maps 9 icons

These files create semantic mappings (e.g., `PROJECT_ICONS.location`) and do not re-export everything, so they don't contribute to the memory issue.

## Changes Made

### 1. Updated `next.config.ts`

Added the `experimental.optimizePackageImports` configuration to optimize how packages are imported:

```typescript
experimental: {
  // Optimize package imports to avoid loading entire icon libraries
  // This prevents webpack from bundling all icons, only importing what's used
  optimizePackageImports: [
    "lucide-react",
    "@radix-ui/react-accordion",
    "@radix-ui/react-alert-dialog",
    "@radix-ui/react-aspect-ratio",
    "@radix-ui/react-avatar",
    "@radix-ui/react-checkbox",
    "@radix-ui/react-collapsible",
    "@radix-ui/react-context-menu",
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-hover-card",
    "@radix-ui/react-label",
    "@radix-ui/react-menubar",
    "@radix-ui/react-navigation-menu",
    "@radix-ui/react-popover",
    "@radix-ui/react-progress",
    "@radix-ui/react-radio-group",
    "@radix-ui/react-scroll-area",
    "@radix-ui/react-select",
    "@radix-ui/react-separator",
    "@radix-ui/react-slider",
    "@radix-ui/react-slot",
    "@radix-ui/react-switch",
    "@radix-ui/react-tabs",
    "@radix-ui/react-toggle",
    "@radix-ui/react-toggle-group",
    "@radix-ui/react-tooltip",
    "@radix-ui/react-use-controllable-state",
  ],

  // Enable webpack memory optimizations (Next.js 15+)
  webpackMemoryOptimizations: true,

  // Reduce initial memory footprint
  preloadEntriesOnStart: false,
}
```

**Why this helps:**

- `optimizePackageImports`: Transforms imports to load only the specific components/icons needed, not the entire package
- `webpackMemoryOptimizations`: Enables memory-efficient webpack configurations available in Next.js 15+
- `preloadEntriesOnStart: false`: Reduces initial memory footprint by not preloading all entries at startup

### 2. Updated `package.json`

Added a new development script with increased Node.js memory allocation:

```json
{
  "scripts": {
    "dev:memory": "NODE_OPTIONS='--max-old-space-size=4096' concurrently --kill-others \"NODE_OPTIONS='--max-old-space-size=4096' next dev\" \"bun run dev:socket\""
  }
}
```

**Why this helps:**

- Increases Node.js heap size to 4GB (from default ~1.4GB)
- Provides a fallback option if optimizations alone aren't sufficient
- Useful for development machines with sufficient RAM

## How to Use

### Standard Development (Recommended)

The regular dev script now benefits from the optimizations:

```bash
bun run dev
```

### Memory-Optimized Development

If you still experience memory issues, use the memory-optimized script:

```bash
bun run dev:memory
```

This allocates more memory to Node.js, giving the dev server more headroom.

## Expected Benefits

After these optimizations:

1. **Reduced Memory Usage**: Dev server uses less memory by only loading needed icons/components
2. **Fewer Restarts**: Less likely to hit memory threshold and restart
3. **Faster Hot Reload**: Smaller bundles mean faster hot-reload times
4. **Better Build Performance**: Webpack processes less code

## Technical Details

### Why `optimizePackageImports` Works

When you write:

```typescript
import { CheckIcon, ChevronDownIcon } from "lucide-react";
```

**Before optimization:**

- Webpack loads the entire lucide-react package (~1000+ icons)
- All icons are parsed, processed, and kept in memory
- Memory usage: High

**After optimization:**

- Next.js transforms the import to load only `CheckIcon` and `ChevronDownIcon`
- Webpack only processes the needed icons
- Memory usage: Low

### Next.js Version Compatibility

- **Next.js 16.x (Current)**: ✅ Supports `optimizePackageImports`
- **Next.js 15.x+**: ✅ Supports `webpackMemoryOptimizations`
- **Next.js 14.x and earlier**: Would need `modularizeImports` instead

## Verification

The changes have been validated:

- ✅ Formatting: `bun run format` passed
- ✅ Linting: `bun run lint` passed (oxlint found 0 warnings/errors)
- ✅ TypeScript: Compiles successfully

## Related Issues

- [Next.js Issue #83275](https://github.com/vercel/next.js/issues/83275) - Memory threshold restart warning
- [Next.js Issue #84648](https://github.com/vercel/next.js/issues/84648) - Related memory problem reports
- [Next.js PR #85529](https://github.com/vercel/next.js/pull/85529) - Potential fix being developed

## Monitoring

To monitor if the optimization is working:

1. Start the dev server with `bun run dev`
2. Watch for memory warnings in the console
3. Use `node --inspect` flag and Chrome DevTools to monitor heap usage
4. Compare memory usage before/after making code changes

## Future Considerations

If memory issues persist:

1. Consider lazy-loading heavy components
2. Review and optimize custom barrel files (if any are added)
3. Use dynamic imports for rarely-used features
4. Monitor for Next.js updates that further address this issue

---

**Date**: 2026-01-19
**Next.js Version**: 16.1.1
**Optimization Type**: Package Import Optimization + Webpack Memory Settings
