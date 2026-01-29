# Fumadocs UI (the default theme of Fumadocs): Layout Links
URL: /docs/ui/layouts/links
Source: https://raw.githubusercontent.com/fuma-nama/fumadocs/refs/heads/main/apps/docs/content/docs/ui/layouts/links.mdx

Navigation configurations on all layouts.
        








Overview [#overview]

<FeedbackBlock id="5c2e55985377f186" body="Fumadocs allows adding navigation links to your layouts with a links prop, like linking to your &#x22;showcase&#x22; page.">
  Fumadocs allows adding navigation links to your layouts with a `links` prop, like linking to your "showcase" page.
</FeedbackBlock>

<div className="not-prose grid gap-2 *:border max-sm:*:last:hidden sm:grid-cols-[2fr_1fr]">
  <>
    <img alt="Nav" src={__img0} placeholder="blur" />
  </>

  <>
    <img alt="Nav" src={__img1} placeholder="blur" />
  </>
</div>

<CodeBlockTabs defaultValue="All">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="All">
      All
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Docs Layout">
      Docs Layout
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Home Layout">
      Home Layout
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="All">
    ```tsx  title="lib/layout.shared.tsx"
    import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

    export function baseOptions(): BaseLayoutProps {
      return {
        links: [], // [!code ++]
      };
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="Docs Layout">
    ```tsx  title="app/docs/layout.tsx"
    import { DocsLayout } from 'fumadocs-ui/layouts/docs';
    import { baseOptions } from '@/lib/layout.shared';
    import { source } from '@/lib/source';
    import type { ReactNode } from 'react';

    export default function Layout({ children }: { children: ReactNode }) {
      return (
        <DocsLayout
          {...baseOptions()}
          tree={source.getPageTree()}
          links={[]} // [!code highlight]
        >
          {children}
        </DocsLayout>
      );
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="Home Layout">
    ```tsx  title="app/(home)/layout.tsx"
    import { HomeLayout } from 'fumadocs-ui/layouts/home';
    import { baseOptions } from '@/lib/layout.shared';
    import type { ReactNode } from 'react';

    export default function Layout({ children }: { children: ReactNode }) {
      return (
        <HomeLayout
          {...baseOptions()}
          links={[]} // [!code highlight]
        >
          {children}
        </HomeLayout>
      );
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<FeedbackBlock id="ba196a4360e89891" body="You can see all supported items below:">
  You can see all supported items below:
</FeedbackBlock>

Link Item [#link-item]

<FeedbackBlock id="c1ce849c619eabef" body="A link to navigate to a URL/href, can be external.">
  A link to navigate to a URL/href, can be external.
</FeedbackBlock>

```tsx title="lib/layout.shared.tsx"
import { BookIcon } from 'lucide-react';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    links: [
      {
        icon: <BookIcon />,
        text: 'Blog',
        url: '/blog',
        // secondary items will be displayed differently on navbar
        secondary: false,
      },
    ],
  };
}
```

Active Mode [#active-mode]

<FeedbackBlock id="0bf112ee4fd78ff6" body="The conditions to be marked as active.">
  The conditions to be marked as active.
</FeedbackBlock>

| Mode         | Description                                                 |
| ------------ | ----------------------------------------------------------- |
| `url`        | When browsing the specified url                             |
| `nested-url` | When browsing the url and its child pages like `/blog/post` |
| `none`       | Never be active                                             |

```tsx title="lib/layout.shared.tsx"
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    links: [
      {
        text: 'Blog',
        url: '/blog',
        active: 'nested-url',
      },
    ],
  };
}
```

Icon Item [#icon-item]

<FeedbackBlock
  id="c1e9a2acdf265bb3"
  body="Same as link item, but is shown as an icon button.
Icon items are secondary by default."
>
  Same as link item, but is shown as an icon button.
  Icon items are secondary by default.
</FeedbackBlock>

```tsx title="lib/layout.shared.tsx"
import { BookIcon } from 'lucide-react';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    links: [
      {
        type: 'icon',
        label: 'Visit Blog', // `aria-label`
        icon: <BookIcon />,
        text: 'Blog',
        url: '/blog',
      },
    ],
  };
}
```

Custom Item [#custom-item]

<FeedbackBlock id="792e607d9e6f6872" body="Display a custom component.">
  Display a custom component.
</FeedbackBlock>

```tsx title="lib/layout.shared.tsx"
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    links: [
      {
        type: 'custom',
        children: <Button variant="primary">Login</Button>,
        secondary: true,
      },
    ],
  };
}
```

GitHub URL [#github-url]

<FeedbackBlock id="7446c873991744cb" body="There's also a shortcut for adding GitHub repository link item.">
  There's also a shortcut for adding GitHub repository link item.
</FeedbackBlock>

```tsx twoslash title="lib/layout.shared.tsx"
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: 'https://github.com',
  };
}
```

Normal Menu [#normal-menu]

<FeedbackBlock id="cf4e555ac0fd3259" body="A menu containing multiple link items.">
  A menu containing multiple link items.
</FeedbackBlock>

```tsx title="lib/layout.shared.tsx"
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    links: [
      {
        type: 'menu',
        text: 'Guide',
        items: [
          {
            text: 'Getting Started',
            description: 'Learn to use Fumadocs',
            url: '/docs',
          },
        ],
      },
    ],
  };
}
```

Navigation Menu [#navigation-menu]

<FeedbackBlock id="f9713513db1f066e" body="In Home Layout, you can add navigation menu (fully animated) to the navbar.">
  In Home Layout, you can add navigation menu (fully animated) to the navbar.
</FeedbackBlock>

<img alt="Nav" src={__img2} placeholder="blur" />

```tsx title="app/(home)/layout.tsx"
import { baseOptions } from '@/lib/layout.shared';
import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        {
          type: 'custom',
          // only displayed on navbar, not mobile menu
          on: 'nav',
          children: (
            <NavbarMenu>
              <NavbarMenuTrigger>Documentation</NavbarMenuTrigger>
              <NavbarMenuContent>
                <NavbarMenuLink href="/docs">Hello World</NavbarMenuLink>
              </NavbarMenuContent>
            </NavbarMenu>
          ),
        },
        // other items
      ]}
    >
      {children}
    </HomeLayout>
  );
}
```
