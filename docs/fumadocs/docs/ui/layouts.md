# Fumadocs UI (the default theme of Fumadocs): Layouts
URL: /docs/ui/layouts
Source: https://raw.githubusercontent.com/fuma-nama/fumadocs/refs/heads/main/apps/docs/content/docs/ui/layouts/index.mdx

A list of layout components.
        


Overview [#overview]

<FeedbackBlock id="8c11728382472294" body="Fumadocs UI provides essential layouts to display content.">
  Fumadocs UI provides essential layouts to display content.
</FeedbackBlock>

<DocsCategory />

Configurations [#configurations]

<FeedbackBlock id="e8be181cafdea8cd" body="Each layout supports a shared set of options.">
  Each layout supports a shared set of options.
</FeedbackBlock>

<FeedbackBlock id="b4f878d546eaab89" body="It is recommended to store these options into a file, and pass them to the layouts.">
  It is recommended to store these options into a file, and pass them to the layouts.
</FeedbackBlock>

<CodeBlockTabs defaultValue="Shared Options">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="Shared Options">
      Shared Options
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Docs Layout">
      Docs Layout
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="Home Layout">
      Home Layout
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="Shared Options">
    ```tsx  title="lib/layout.shared.tsx"
    import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

    export function baseOptions(): BaseLayoutProps {
      return {
        nav: {
          title: 'My App',
        },
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
          // [!code highlight]
          {...baseOptions()}
          tree={source.getPageTree()}
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
          // [!code highlight]
          {...baseOptions()}
        >
          {children}
        </HomeLayout>
      );
    }
    ```
  </CodeBlockTab>
</CodeBlockTabs>

<FeedbackBlock id="316eaa959683c417" body="See detailed docs for links and nav options.">
  See detailed docs for [`links`](/docs/ui/layouts/links) and [`nav`](/docs/ui/layouts/nav) options.
</FeedbackBlock>

<TypeTable
  type={{
  "name": "BaseLayoutProps",
  "description": "",
  "entries": [
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
    },
    {
      "name": "children",
      "description": "",
      "tags": [],
      "type": "react15.ReactNode",
      "simplifiedType": "ReactNode",
      "required": false,
      "deprecated": false
    }
  ]
}}
/>
