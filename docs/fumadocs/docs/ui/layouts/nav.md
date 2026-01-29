# Fumadocs UI (the default theme of Fumadocs): Navbar
URL: /docs/ui/layouts/nav
Source: https://raw.githubusercontent.com/fuma-nama/fumadocs/refs/heads/main/apps/docs/content/docs/ui/layouts/nav.mdx

Navbar/header configurations.
        


Configurations [#configurations]

<FeedbackBlock id="76d1cbf084398d48" body="Options for navbar (header).">
  Options for navbar (header).
</FeedbackBlock>

<TypeTable
  type={{
  "name": "$Fumadocs",
  "description": "",
  "entries": [
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
      "name": "title",
      "description": "",
      "tags": [],
      "type": "ReactNode | ((props: ComponentProps<\"a\">) => ReactNode)",
      "simplifiedType": "function | object | boolean | bigint | number | string | null",
      "required": false,
      "deprecated": false
    },
    {
      "name": "url",
      "description": "Redirect url of title",
      "tags": [
        {
          "name": "defaultValue",
          "text": "'/'"
        }
      ],
      "type": "string | undefined",
      "simplifiedType": "string",
      "required": false,
      "deprecated": false
    },
    {
      "name": "transparentMode",
      "description": "Use transparent background",
      "tags": [
        {
          "name": "defaultValue",
          "text": "none"
        }
      ],
      "type": "\"always\" | \"top\" | \"none\" | undefined",
      "simplifiedType": "\"none\" | \"top\" | \"always\"",
      "required": false,
      "deprecated": false
    }
  ]
}}
/>

Transparent Mode [#transparent-mode]

<FeedbackBlock id="5002e21ef9ebfaaa" body="To make the navbar background transparent, you can configure transparent mode.">
  To make the navbar background transparent, you can configure transparent mode.
</FeedbackBlock>

<CodeBlockTabs defaultValue="All">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="All">
      All
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Home Layout">
      Home Layout
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Docs Layout">
      Docs Layout
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="All">
    ```tsx  title="lib/layout.shared.tsx"
    import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

    export function baseOptions(): BaseLayoutProps {
      return {
        nav: {
          title: 'My App',
          // [!code ++]
          transparentMode: 'top',
        },
      };
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="Home Layout">
    ```tsx
    import { baseOptions } from '@/lib/layout.shared';
    import { HomeLayout } from 'fumadocs-ui/layouts/home';
    import type { ReactNode } from 'react';

    export default function Layout({ children }: { children: ReactNode }) {
      const base = baseOptions();
      return (
        <HomeLayout
          {...base}
          nav={{
            ...base.nav,
            // [!code ++]
            transparentMode: 'top',
          }}
        >
          {children}
        </HomeLayout>
      );
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="Docs Layout">
    ```tsx
    import { baseOptions } from '@/lib/layout.shared';
    import { DocsLayout } from 'fumadocs-ui/layouts/docs';
    import type { ReactNode } from 'react';

    export default function Layout({ children }: { children: ReactNode }) {
      const base = baseOptions();
      return (
        <DocsLayout
          {...base}
          nav={{
            ...base.nav,
            // [!code ++]
            transparentMode: 'top',
          }}
        >
          {children}
        </DocsLayout>
      );
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

| Mode     | Description                              |
| -------- | ---------------------------------------- |
| `always` | Always use a transparent background      |
| `top`    | When at the top of page                  |
| `none`   | Disable transparent background (default) |

Replace Navbar [#replace-navbar]

<FeedbackBlock id="55e5bc6bc9cf5477" body="To replace the navbar in different layouts, set nav.component to your own component.">
  To replace the navbar in different layouts, set `nav.component` to your own component.
</FeedbackBlock>

<CodeBlockTabs defaultValue="All">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="All">
      All
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Home Layout">
      Home Layout
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Docs Layout">
      Docs Layout
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="All">
    ```tsx  title="lib/layout.shared.tsx"
    import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

    export function baseOptions(): BaseLayoutProps {
      return {
        nav: {
          // [!code ++]
          component: <CustomNavbar />,
        },
      };
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="Home Layout">
    ```tsx
    import { baseOptions } from '@/lib/layout.shared';
    import { HomeLayout } from 'fumadocs-ui/layouts/home';
    import type { ReactNode } from 'react';

    export default function Layout({ children }: { children: ReactNode }) {
      const base = baseOptions();
      return (
        <HomeLayout
          {...base}
          nav={{
            ...base.nav,
            // [!code ++]
            component: <CustomNavbar />,
          }}
        >
          {children}
        </HomeLayout>
      );
    }
    ```
  </CodeBlockTab>

  <CodeBlockTab value="Docs Layout">
    ```tsx
    import { baseOptions } from '@/lib/layout.shared';
    import { DocsLayout } from 'fumadocs-ui/layouts/docs';
    import type { ReactNode } from 'react';

    export default function Layout({ children }: { children: ReactNode }) {
      const base = baseOptions();
      return (
        <DocsLayout
          {...base}
          nav={{
            ...base.nav,
            // [!code ++]
            component: <CustomNavbar />,
          }}
        >
          {children}
        </DocsLayout>
      );
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<FeedbackBlock id="f417fc040e065b67" body="Fumadocs uses CSS Variables to share the size of layout components, and fit each layout component into appropriate position.">
  Fumadocs uses **CSS Variables** to share the size of layout components, and fit each layout component into appropriate position.
</FeedbackBlock>

<FeedbackBlock id="f787f1a250ef40ed" body="You need to override --fd-nav-height to the exact height of your custom navbar, this can be done with a CSS stylesheet (e.g. in global.css):">
  You need to override `--fd-nav-height` to the exact height of your custom navbar, this can be done with a CSS stylesheet (e.g. in `global.css`):
</FeedbackBlock>

```css
:root {
  --fd-nav-height: 80px !important;
}
```
