# Fumadocs UI (the default theme of Fumadocs): Docs Layout
URL: /docs/ui/layouts/docs
Source: https://raw.githubusercontent.com/fuma-nama/fumadocs/refs/heads/main/apps/docs/content/docs/ui/layouts/docs.mdx

The layout of documentation
        








<FeedbackBlock id="6ea1659320b0167d" body="The layout of documentation pages, it includes a sidebar and mobile-only navbar/header.">
  The layout of documentation pages, it includes a sidebar and **mobile-only** navbar/header.
</FeedbackBlock>

<img alt="preview" src={__img0} placeholder="blur" />

<Customisation />

Usage [#usage]

<FeedbackBlock id="310e2db1e96fe642" body="Pass your page tree to the component.">
  Pass your page tree to the component.
</FeedbackBlock>

```tsx title="layout.tsx"
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout {...baseOptions()} tree={tree}>
      {children}
    </DocsLayout>
  );
}
```

<FeedbackBlock id="316eaa959683c417" body="See detailed docs for links and nav options.">
  See detailed docs for [`links`](/docs/ui/layouts/links) and [`nav`](/docs/ui/layouts/nav) options.
</FeedbackBlock>

References [#references]

<TypeTable
  type={{
  "name": "$Fumadocs",
  "description": "",
  "entries": [
    {
      "name": "tree",
      "description": "",
      "tags": [],
      "type": "Root",
      "simplifiedType": "object",
      "required": true,
      "deprecated": false
    },
    {
      "name": "sidebar",
      "description": "",
      "tags": [],
      "type": "SidebarOptions | undefined",
      "simplifiedType": "object",
      "required": false,
      "deprecated": false
    },
    {
      "name": "tabMode",
      "description": "",
      "tags": [],
      "type": "\"top\" | \"auto\" | undefined",
      "simplifiedType": "\"auto\" | \"top\"",
      "required": false,
      "deprecated": false
    },
    {
      "name": "containerProps",
      "description": "Props for the `div` container",
      "tags": [],
      "type": "HTMLAttributes<HTMLDivElement> | undefined",
      "simplifiedType": "object",
      "required": false,
      "deprecated": false
    },
    {
      "name": "themeSwitch",
      "description": "",
      "tags": [],
      "type": "{ enabled?: boolean; component?: ReactNode; mode?: \"light-dark\" | \"light-dark-system\"; } | undefined",
      "simplifiedType": "object",
      "required": false,
      "deprecated": false
    },
    {
      "name": "searchToggle",
      "description": "",
      "tags": [],
      "type": "Partial<{ enabled: boolean; components: Partial<{ sm: ReactNode; lg: ReactNode; }>; }> | undefined",
      "simplifiedType": "Partial<object>",
      "required": false,
      "deprecated": false
    },
    {
      "name": "i18n",
      "description": "I18n options",
      "tags": [
        {
          "name": "defaultValue",
          "text": "false"
        }
      ],
      "type": "boolean | I18nConfig<string> | undefined",
      "simplifiedType": "object | boolean",
      "required": false,
      "deprecated": false
    },
    {
      "name": "githubUrl",
      "description": "GitHub url",
      "tags": [],
      "type": "string | undefined",
      "simplifiedType": "string",
      "required": false,
      "deprecated": false
    },
    {
      "name": "links",
      "description": "",
      "tags": [],
      "type": "LinkItemType[] | undefined",
      "simplifiedType": "array",
      "required": false,
      "deprecated": false
    },
    {
      "name": "nav",
      "description": "Replace or disable navbar",
      "tags": [],
      "type": "Partial<NavOptions> | undefined",
      "simplifiedType": "Partial<object>",
      "required": false,
      "deprecated": false
    }
  ]
}}
/>

Sidebar [#sidebar]

```tsx title="layout.tsx"
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

<DocsLayout
  sidebar={{
    enabled: true,
  }}
/>;
```

Sidebar Items [#sidebar-items]

<FeedbackBlock id="d464b0a445d179c2" body="Customise sidebar navigation links.">
  Customise sidebar navigation links.
</FeedbackBlock>

<div className="flex justify-center items-center *:max-w-[200px] bg-gradient-to-br from-fd-primary/10 rounded-xl border">
    <img alt="Sidebar" src={__img1} placeholder="blur" />
</div>

<FeedbackBlock id="409a793ac8456103" body="Sidebar items are rendered from the page tree you passed to <DocsLayout />.">
  Sidebar items are rendered from the page tree you passed to `<DocsLayout />`.
</FeedbackBlock>

<FeedbackBlock id="095027fdabbf04f5" body="For page tree from loader(), it generates the tree from your file structure, see available patterns.">
  For page tree from [`loader()`](/docs/headless/source-api), it generates the tree from your file structure, see [available patterns](/docs/page-conventions).
</FeedbackBlock>

```tsx title="layout.tsx"
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      // other props
    >
      {children}
    </DocsLayout>
  );
}
```

<FeedbackBlock id="813e9ea200e940d6" body="You may hardcode it too:">
  You may hardcode it too:
</FeedbackBlock>

```tsx title="layout.tsx"
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={{
        name: 'docs',
        children: [],
      }}
      // other props
    >
      {children}
    </DocsLayout>
  );
}
```

Sidebar Tabs (Dropdown) [#sidebar-tabs]

<FeedbackBlock id="9e5a57b1a72cd753" body="Sidebar Tabs are folders with tab-like behaviours, only the content of opened tab will be visible.">
  Sidebar Tabs are folders with tab-like behaviours, only the content of opened tab will be visible.
</FeedbackBlock>

<div className="flex justify-center items-center *:max-w-[360px] bg-linear-to-br from-fd-primary/10 rounded-xl border">
    <img alt="Sidebar Tabs" src={__img2} placeholder="blur" />
</div>

<FeedbackBlock id="bbb570470441026f" body="By default, the tab trigger will be displayed as a Dropdown component (hidden unless one of its items is active).">
  By default, the tab trigger will be displayed as a **Dropdown** component (hidden unless one of its items is active).
</FeedbackBlock>

<FeedbackBlock id="f7afd1968a95b72f" body="You can add items by marking folders as Root Folders, create a meta.json file in the folder:">
  You can add items by marking folders as [Root Folders](/docs/page-conventions#root-folder), create a `meta.json` file in the folder:
</FeedbackBlock>

```json title="content/docs/my-folder/meta.json"
{
  "title": "Name of Folder",
  "description": "The description of root folder (optional)",
  "root": true
}
```

<FeedbackBlock id="39dc650711619302" body="Or specify them explicitly:">
  Or specify them explicitly:
</FeedbackBlock>

```tsx title="/app/docs/layout.tsx"
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

<DocsLayout
  sidebar={{
    tabs: [
      {
        title: 'Components',
        description: 'Hello World!',
        // active for `/docs/components` and sub routes like `/docs/components/button`
        url: '/docs/components',

        // optionally, you can specify a set of urls which activates the item
        // urls: new Set(['/docs/test', '/docs/components']),
      },
    ],
  }}
/>;
```

<FeedbackBlock id="30045a916a7d58a8" body="Set it to false to disable:">
  Set it to `false` to disable:
</FeedbackBlock>

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

<DocsLayout sidebar={{ tabs: false }} />;
```

<Callout title="Want further customisations?">
  You can specify a `banner` to the [Docs Layout](/docs/ui/layouts/docs) component.

  ```tsx
  import { DocsLayout, type DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
  import type { ReactNode } from 'react';
  import { baseOptions } from '@/lib/layout.shared';
  import { source } from '@/lib/source';

  export default function Layout({ children }: { children: ReactNode }) {
    return (
      <DocsLayout
        {...baseOptions()}
        tree={source.getPageTree()}
        sidebar={{
          // [!code ++]
          banner: <div>Hello World</div>,
        }}
      >
        {children}
      </DocsLayout>
    );
  }
  ```
</Callout>

Decoration [#decoration]

<FeedbackBlock id="9da7031fda3c3ef8" body="Change the icon/styles of tabs.">
  Change the icon/styles of tabs.
</FeedbackBlock>

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

<DocsLayout
  sidebar={{
    tabs: {
      transform: (option, node) => ({
        ...option,
        icon: <MyIcon />,
      }),
    },
  }}
/>;
```

Sidebar Components [#sidebar-components]

<FeedbackBlock id="978e10571544f9d6" body="You can replace certain components for rendering page tree.">
  You can replace certain components for rendering page tree.
</FeedbackBlock>

<CodeBlockTabs defaultValue="layout.tsx">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="layout.tsx">
      layout.tsx
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="layout.client.tsx">
      layout.client.tsx
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="layout.tsx">
    ```tsx
    import { DocsLayout } from 'fumadocs-ui/layouts/docs';
    import { SidebarSeparator } from './layout.client';

    <DocsLayout
      sidebar={{
        enabled: true,
        components: {
          Separator: SidebarSeparator,
        },
      }}
    />;
    ```
  </CodeBlockTab>

  <CodeBlockTab value="layout.client.tsx">
    ```tsx
    'use client';
    import * as Base from 'fumadocs-ui/components/sidebar/base';

    export function SidebarSeparator({ className, style, children, ...props }: ComponentProps<'p'>) {
      const depth = Base.useFolderDepth();

      return (
        <Base.SidebarSeparator
          className={cn('[&_svg]:size-4 [&_svg]:shrink-0', className)}
          style={{
            paddingInlineStart: `calc(${2 + 3 * depth} * var(--spacing))`,
            ...style,
          }}
          {...props}
        >
          {children}
        </Base.SidebarSeparator>
      );
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

References [#references-1]

<TypeTable
  type={{
  "name": "SidebarProps",
  "description": "",
  "entries": [
    {
      "name": "footer",
      "description": "",
      "tags": [],
      "type": "ReactNode",
      "simplifiedType": "ReactNode",
      "required": false,
      "deprecated": false
    },
    {
      "name": "defaultOpenLevel",
      "description": "Open folders by default if their level is lower or equal to a specific level\n(Starting from 1)",
      "tags": [
        {
          "name": "defaultValue",
          "text": "0"
        }
      ],
      "type": "number | undefined",
      "simplifiedType": "number",
      "required": false,
      "deprecated": false
    },
    {
      "name": "prefetch",
      "description": "Prefetch links, default behaviour depends on your React.js framework.",
      "tags": [],
      "type": "boolean | undefined",
      "simplifiedType": "boolean",
      "required": false,
      "deprecated": false
    },
    {
      "name": "enabled",
      "description": "",
      "tags": [],
      "type": "boolean | undefined",
      "simplifiedType": "boolean",
      "required": false,
      "deprecated": false
    },
    {
      "name": "component",
      "description": "",
      "tags": [],
      "type": "ReactNode",
      "simplifiedType": "ReactNode",
      "required": false,
      "deprecated": false
    },
    {
      "name": "components",
      "description": "",
      "tags": [],
      "type": "Partial<SidebarPageTreeComponents> | undefined",
      "simplifiedType": "Partial<object>",
      "required": false,
      "deprecated": false
    },
    {
      "name": "tabs",
      "description": "Root Toggle options",
      "tags": [],
      "type": "false | SidebarTabWithProps[] | GetSidebarTabsOptions | undefined",
      "simplifiedType": "object | array | false",
      "required": false,
      "deprecated": false
    },
    {
      "name": "banner",
      "description": "",
      "tags": [],
      "type": "ReactNode",
      "simplifiedType": "ReactNode",
      "required": false,
      "deprecated": false
    },
    {
      "name": "collapsible",
      "description": "Support collapsing the sidebar on desktop mode",
      "tags": [
        {
          "name": "defaultValue",
          "text": "true"
        }
      ],
      "type": "boolean | undefined",
      "simplifiedType": "boolean",
      "required": false,
      "deprecated": false
    }
  ]
}}
/>

Advanced [#advanced]

Prefetching [#prefetching]

<FeedbackBlock id="5777b58c0504fd79" body="Fumadocs use the <Link /> component of your React framework, and keep their default prefetch behaviours.">
  Fumadocs use the `<Link />` component of your React framework, and keep their default prefetch behaviours.
</FeedbackBlock>

<FeedbackBlock
  id="f69f3e8aea22a426"
  body="On Vercel, prefetch requests may cause a higher usage of serverless functions and Data Cache.
It can also hit the limits of some other hosting platforms."
>
  On Vercel, prefetch requests may cause a higher usage of serverless functions and Data Cache.
  It can also hit the limits of some other hosting platforms.
</FeedbackBlock>

<FeedbackBlock id="69003a3d2d16d067" body="You can disable prefetching to reduce the amount of prefetch requests, or enable explicitly:">
  You can disable prefetching to reduce the amount of prefetch requests, or enable explicitly:
</FeedbackBlock>

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

<DocsLayout sidebar={{ prefetch: false }} />;
```

The Layout System [#the-layout-system]

<FeedbackBlock id="c0720076d4805111" body="Handling layout is challenging, Fumadocs UI needed an approach that is:">
  Handling layout is challenging, Fumadocs UI needed an approach that is:
</FeedbackBlock>

<FeedbackBlock id="fcb4a393fdaa4103" body="Composable: Layout components should manage their position and size effortlessly, ideally in place.Flexible: The system should avoid reliance on fixed values or heights, enabling seamless integration of external components, such as AI chat interfaces.Cohesive: Components should respond to changes in others, for instance, by animating sidebar collapses.Predictable: Layout properties should remain centralized, allowing the final result to be readily anticipated from the source code.Compatible: The solution should work on older browsers by leveraging only Baseline Widly Available CSS features.">
  * **Composable:** Layout components should manage their position and size effortlessly, ideally in place.
  * **Flexible:** The system should avoid reliance on fixed values or heights, enabling seamless integration of external components, such as AI chat interfaces.
  * **Cohesive:** Components should respond to changes in others, for instance, by animating sidebar collapses.
  * **Predictable:** Layout properties should remain centralized, allowing the final result to be readily anticipated from the source code.
  * **Compatible:** The solution should work on older browsers by leveraging only Baseline Widly Available CSS features.
</FeedbackBlock>

<FeedbackBlock id="862fc0d5132eeca1" body="Fumadocs UI does this with a grid system:">
  Fumadocs UI does this with a grid system:
</FeedbackBlock>

```css
#nd-docs-layout {
  grid-template:
    'sidebar header toc'
    'sidebar toc-popover toc'
    'sidebar main toc' 1fr / minmax(var(--fd-sidebar-col), 1fr) minmax(0, var(--fd-page-col))
    minmax(min-content, 1fr);

  --fd-docs-row-1: var(--fd-banner-height, 0px);
  --fd-docs-row-2: calc(var(--fd-docs-row-1) + var(--fd-header-height));
  --fd-docs-row-3: calc(var(--fd-docs-row-2) + var(--fd-toc-popover-height));
  --fd-sidebar-col: var(--fd-sidebar-width);
  --fd-page-col: calc(
    var(--fd-layout-width, 97rem) - var(--fd-sidebar-width) - var(--fd-toc-width)
  );
  --fd-sidebar-width: 0px;
  --fd-toc-width: 0px;

  --fd-header-height: 0px;
  --fd-toc-popover-height: 0px;
}
```

<FeedbackBlock id="7c3e86e3d603be89" body="The layout container uses grid layout, grid-template is set to produce predictable result.--fd-docs-row-* define the top offset of each row, allowing elements with position: sticky to hook a correct top offset.--fd-*-width and --fd-*-height are set by layout components using CSS, they are essential to maintain the grid structure, or calculating --fd-docs-row-*.--fd-*-col are dynamic values, updated as state changes (e.g. --fd-sidebar-col becomes 0px when the sidebar is collapsed).">
  * The layout container uses grid layout, `grid-template` is set to produce predictable result.
  * `--fd-docs-row-*` define the top offset of each row, allowing elements with `position: sticky` to hook a correct top offset.
  * `--fd-*-width` and `--fd-*-height` are set by layout components using CSS, they are essential to maintain the grid structure, or calculating `--fd-docs-row-*`.
  * `--fd-*-col` are dynamic values, updated as state changes (e.g. `--fd-sidebar-col` becomes `0px` when the sidebar is collapsed).
</FeedbackBlock>

<FeedbackBlock id="37548ba1aa82b571" body="Both default and the notebook layout utilize this system.">
  Both default and the notebook layout utilize this system.
</FeedbackBlock>
