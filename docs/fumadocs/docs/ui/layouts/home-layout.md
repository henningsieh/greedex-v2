# Fumadocs UI (the default theme of Fumadocs): Home Layout
URL: /docs/ui/layouts/home-layout
Source: https://raw.githubusercontent.com/fuma-nama/fumadocs/refs/heads/main/apps/docs/content/docs/ui/layouts/home-layout.mdx

Shared layout for other pages
        




<FeedbackBlock id="5e75e7d45f66e8e3" body="A layout with only navbar.">
  A layout with only navbar.
</FeedbackBlock>

<img alt="preview" src={__img0} placeholder="blur" />

<Customisation />

Usage [#usage]

<FeedbackBlock id="ed78e5d1f81322c8" body="Add a navbar and search dialog across other pages.">
  Add a navbar and search dialog across other pages.
</FeedbackBlock>

```tsx title="/app/(home)/layout.tsx"
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
```

<FeedbackBlock id="316eaa959683c417" body="See detailed docs for links and nav options.">
  See detailed docs for [`links`](/docs/ui/layouts/links) and [`nav`](/docs/ui/layouts/nav) options.
</FeedbackBlock>
