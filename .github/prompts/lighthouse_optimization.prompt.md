# Aggressive Lighthouse Optimization Task

You are an elite full-stack developer specializing in performance optimization and SEO. Your mission is to achieve a perfect or near-perfect Google Lighthouse score across all categories (Performance, Accessibility, Best Practices, SEO) for a SaaS landing page.

## Context & Environment

- **Framework**: Next.js App Router (latest version)
- **Dev Server**: Running on `http://localhost:3000`
- **Tools Available**:
  - Playwright MCP with Lighthouse extension already installed
  - Chrome browser with Lighthouse extension
  - Full access to the codebase via file operations

## Reference Documentation

Before starting, fetch and analyze:

```
https://developer.chrome.com/docs/lighthouse/overview
```

Study the latest Lighthouse scoring criteria, metrics, and optimization techniques.

## Optimization Areas to Address

### 1. **Performance (Target: 100/100)**

- **Core Web Vitals**:
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
  - INP (Interaction to Next Paint) < 200ms
  - TTFB (Time to First Byte) < 800ms

- **Next.js Specific Optimizations**:
  - Enable `experimental.reactCompiler` in next.config.js
  - Implement `loading="eager"` for above-the-fold images
  - Use `loading="lazy"` and `fetchPriority="low"` for below-fold content
  - Optimize `next/image` with proper `sizes` and `priority` props
  - Implement `next/font` with `preload` and `display: swap`
  - Enable static generation where possible
  - Use Server Components by default, Client Components only when needed

- **Resource Optimization**:
  - Minimize JavaScript bundle size (code splitting, tree shaking)
  - Defer non-critical JavaScript
  - Inline critical CSS, defer non-critical CSS
  - Compress and optimize all images (WebP, AVIF formats)
  - Implement responsive images with proper srcset
  - Remove unused dependencies and code
  - Enable Brotli/Gzip compression
  - Implement resource hints (preconnect, dns-prefetch, preload)

### 2. **Accessibility (Target: 100/100)**

- Semantic HTML5 elements
- Proper ARIA labels and roles
- Sufficient color contrast ratios (WCAG AA minimum)
- Keyboard navigation support
- Screen reader compatibility
- Alt text for all images
- Form labels and error messages
- Focus indicators
- Proper heading hierarchy (h1, h2, h3...)

### 3. **Best Practices (Target: 100/100)**

- HTTPS enforcement
- No browser console errors
- Proper image aspect ratios (prevent CLS)
- No deprecated APIs
- Secure JavaScript libraries
- Proper CSP headers
- No geolocation on page load
- No notification permission requests

### 4. **SEO (Target: 100/100)**

- Valid meta descriptions (150-160 characters)
- Descriptive page titles
- Semantic HTML structure
- Mobile-friendly viewport
- Legible font sizes
- Tap targets properly sized (48x48px minimum)
- Valid robots.txt
- Structured data (JSON-LD schema)
- Canonical URLs
- hreflang tags (if applicable)
- Open Graph and Twitter Card meta tags

## Execution Strategy

### Phase 1: Baseline Assessment

1. Use Playwright to navigate to `http://localhost:3000`
2. Run Lighthouse audit and capture the initial report
3. Identify all failing audits and opportunities
4. Create a prioritized list of optimizations

### Phase 2: Iterative Optimization Loop

Execute the following cycle recursively until all scores are 95+ (target 100):

1. **Analyze Current Report**
   - Identify the lowest-scoring category
   - List all failed audits and opportunities
   - Calculate potential score improvements

2. **Implement Fixes**
   - Address issues in order of impact (highest point gains first)
   - Make targeted code changes to components, pages, and configuration
   - Document each change made

3. **Validate Changes**
   - Run Lighthouse audit again
   - Compare new scores to previous iteration
   - Verify no regressions were introduced

4. **Iterate**
   - If any score < 95, repeat from step 1
   - If all scores >= 95, perform final validation
   - Run 3 consecutive audits to ensure consistent results

### Phase 3: Final Validation

1. Run Lighthouse in multiple modes (desktop + mobile)
2. Test on different network conditions (Fast 3G, Slow 4G)
3. Verify scores remain stable across multiple runs
4. Document all optimizations made

## Output Requirements

For each iteration, provide:

1. **Current Scores**:

   ```
   Performance: XX/100
   Accessibility: XX/100
   Best Practices: XX/100
   SEO: XX/100
   ```

2. **Changes Made**:
   - File path
   - Specific modification
   - Rationale

3. **Impact Analysis**:
   - Score delta (before/after)
   - Remaining issues

4. **Next Steps**:
   - Next optimization target
   - Expected impact

## Success Criteria

- **Performance**: 95-100
- **Accessibility**: 100
- **Best Practices**: 95-100
- **SEO**: 100
- **Consistency**: Scores stable across 3+ consecutive runs

## Additional Techniques to Consider

- Implement partial prerendering (PPR)
- Use `<Suspense>` boundaries strategically
- Optimize third-party scripts with `next/script` strategy
- Implement service worker for offline support
- Use `stale-while-revalidate` caching strategies
- Minimize layout shifts with skeleton screens
- Optimize font loading with `font-display: swap`
- Remove render-blocking resources
- Implement critical CSS extraction
- Use dynamic imports for route-based code splitting
- Optimize middleware execution
- Enable streaming SSR where applicable

## Constraints

- Do not break existing functionality
- Maintain code readability and maintainability
- Follow Next.js best practices
- Ensure changes are production-ready
- Keep bundle size minimal

## Starting Command

Begin by running:

```bash
playwright-mcp navigate to http://localhost:3000 and run lighthouse audit
```

Then enter the optimization loop. Continue until all targets are achieved or no further improvements are possible.

---

**Remember**: This is an iterative process. Make incremental improvements, validate each change, and keep iterating until you achieve excellence. Don't settle for "good enough" – aim for perfect scores.
