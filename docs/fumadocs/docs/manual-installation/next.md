# Fumadocs (Framework Mode): Next.js
URL: /docs/manual-installation/next
Source: https://raw.githubusercontent.com/fuma-nama/fumadocs/refs/heads/main/apps/docs/content/docs/(framework)/manual-installation/next.mdx

Setup Fumadocs on Next.js.
        


Prerequisite [#prerequisite]

<FeedbackBlock id="3299e7bae11d7e6c" body="Before continuing, make sure you have configured:">
  Before continuing, make sure you have configured:
</FeedbackBlock>

<FeedbackBlock id="0bf68520c9ea854a" body="Next.js 16.Tailwind CSS 4.">
  * Next.js 16.
  * Tailwind CSS 4.
</FeedbackBlock>

<FeedbackBlock id="d6a064c7de2a8eb2" body="We will use Fumadocs MDX as a content source, you can configure it first:">
  We will use [Fumadocs MDX](/docs/mdx) as a content source, you can configure it first:
</FeedbackBlock>

<div className="fd-steps [&_h3]:fd-step">
  Installation [#installation]

  <CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
    <CodeBlockTabsList>
      <CodeBlockTabsTrigger value="npm">
        npm
      </CodeBlockTabsTrigger>

      <CodeBlockTabsTrigger value="pnpm">
        pnpm
      </CodeBlockTabsTrigger>

      <CodeBlockTabsTrigger value="yarn">
        yarn
      </CodeBlockTabsTrigger>

      <CodeBlockTabsTrigger value="bun">
        bun
      </CodeBlockTabsTrigger>
    </CodeBlockTabsList>

    <CodeBlockTab value="npm">
      ```bash
      npm i fumadocs-mdx fumadocs-core @types/mdx
      ```
    </CodeBlockTab>

    <CodeBlockTab value="pnpm">
      ```bash
      pnpm add fumadocs-mdx fumadocs-core @types/mdx
      ```
    </CodeBlockTab>

    <CodeBlockTab value="yarn">
      ```bash
      yarn add fumadocs-mdx fumadocs-core @types/mdx
      ```
    </CodeBlockTab>

    <CodeBlockTab value="bun">
      ```bash
      bun add fumadocs-mdx fumadocs-core @types/mdx
      ```
    </CodeBlockTab>
  </CodeBlockTabs>

  Create the configuration file:

  ```ts title="source.config.ts"
  import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

  export const docs = defineDocs({
    dir: 'content/docs',
  });

  export default defineConfig();
  ```

  Add the plugin to Next.js config:

  ```js title="next.config.mjs"
  import { createMDX } from 'fumadocs-mdx/next';

  /** @type {import('next').NextConfig} */
  const config = {
    reactStrictMode: true,
  };

  // [!code ++:4]
  const withMDX = createMDX({
    // customise the config file path
    // configPath: "source.config.ts"
  });

  // [!code highlight]
  export default withMDX(config);
  ```

  <Callout title="ESM Only" type="warn">
    Fumadocs MDX is ESM-only, it's recommended to use `next.config.mjs` for accurate ESM resolution.

    For TypeScript config file, it requires Native Node.js TypeScript Resolver, you can see [Next.js docs](https://nextjs.org/docs/app/api-reference/config/typescript#using-nodejs-native-typescript-resolver-for-nextconfigts) for details.
  </Callout>

  Setup an import alias (recommended):

  ```json title="tsconfig.json"
  {
    "compilerOptions": {
      "paths": {
        // [!code ++]
        "fumadocs-mdx:collections/*": [".source/*"]
      }
    }
  }
  ```

  Integrate with Fumadocs [#integrate-with-fumadocs]

  You can create a `lib/source.ts` file and obtain Fumadocs source from the `docs` collection output.

  ```ts title="lib/source.ts"
  import { docs } from 'fumadocs-mdx:collections/server';
  import { loader } from 'fumadocs-core/source';

  export const source = loader({
    baseUrl: '/docs',
    source: docs.toFumadocsSource(),
  });
  ```

  The `.source` folder will be generated when you run `next dev` or `next build`.

  Done [#done]

  You can now write content in `content/docs` folder.
</div>

<Callout title="Good to Know">
  Fumadocs also supports other content sources, including [Content Collections](/docs/headless/content-collections) and headless CMS.
</Callout>

Getting Started [#getting-started]

<CodeBlockTabs defaultValue="npm" groupId="package-manager" persist>
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="npm">
      npm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="pnpm">
      pnpm
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="yarn">
      yarn
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="bun">
      bun
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="npm">
    ```bash
    npm i fumadocs-ui fumadocs-core
    ```
  </CodeBlockTab>

  <CodeBlockTab value="pnpm">
    ```bash
    pnpm add fumadocs-ui fumadocs-core
    ```
  </CodeBlockTab>

  <CodeBlockTab value="yarn">
    ```bash
    yarn add fumadocs-ui fumadocs-core
    ```
  </CodeBlockTab>

  <CodeBlockTab value="bun">
    ```bash
    bun add fumadocs-ui fumadocs-core
    ```
  </CodeBlockTab>
</CodeBlockTabs>

Root Layout [#root-layout]

<FeedbackBlock id="e8e5e3b4c6f9b53b" body="Wrap the entire application inside Root Provider, and add required styles to body.">
  Wrap the entire application inside [Root Provider](/docs/ui/layouts/root-provider), and add required styles to `body`.
</FeedbackBlock>

```tsx title="app/layout.tsx"
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // required styles [!code ++]
        className="flex flex-col min-h-screen"
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
```

Styles [#styles]

<FeedbackBlock id="4437ae39510ea442" body="Add the following Tailwind CSS styles to global.css.">
  Add the following Tailwind CSS styles to `global.css`.
</FeedbackBlock>

```css title="global.css"
@import 'tailwindcss';
/* [!code ++:2] */
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';
```

> <FeedbackBlock id="67cdca8c396962a3" body="It doesn't come with a default font, you may choose one from next/font.">
>   It doesn't come with a default font, you may choose one from `next/font`.
> </FeedbackBlock>

Routes [#routes]

<FeedbackBlock id="50048497ed45334b" body="Create a lib/layout.shared.tsx file to put the shared options for our layouts.">
  Create a `lib/layout.shared.tsx` file to put the shared options for our layouts.
</FeedbackBlock>

```tsx title="lib/layout.shared.tsx"
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'My App',
    },
  };
}

```

<FeedbackBlock id="8eb205dccf243691" body="Create the following files & routes:">
  Create the following files & routes:
</FeedbackBlock>

<CodeBlockTabs defaultValue="mdx-components.tsx">
  <CodeBlockTabsList>
    <CodeBlockTabsTrigger value="mdx-components.tsx">
      mdx-components.tsx
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="app/docs/layout.tsx">
      app/docs/layout.tsx
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="app/docs/[[...slug]]/page.tsx">
      app/docs/[[...slug]]/page.tsx
    </CodeBlockTabsTrigger>

    <CodeBlockTabsTrigger value="app/api/search/route.ts">
      app/api/search/route.ts
    </CodeBlockTabsTrigger>
  </CodeBlockTabsList>

  <CodeBlockTab value="mdx-components.tsx">
    ```tsx
    import defaultMdxComponents from 'fumadocs-ui/mdx';
    import type { MDXComponents } from 'mdx/types';

    export function getMDXComponents(components?: MDXComponents): MDXComponents {
      return {
        ...defaultMdxComponents,
        ...components,
      };
    }

    ```
  </CodeBlockTab>

  <CodeBlockTab value="app/docs/layout.tsx">
    ```tsx
    import { source } from '@/lib/source';
    import { DocsLayout } from 'fumadocs-ui/layouts/docs';
    import { baseOptions } from '@/lib/layout.shared';

    export default function Layout({ children }: LayoutProps<'/docs'>) {
      return (
        <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
          {children}
        </DocsLayout>
      );
    }

    ```
  </CodeBlockTab>

  <CodeBlockTab value="app/docs/[[...slug]]/page.tsx">
    ```tsx
    import { source } from '@/lib/source';
    import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
    import { notFound } from 'next/navigation';
    import { getMDXComponents } from '@/mdx-components';
    import type { Metadata } from 'next';
    import { createRelativeLink } from 'fumadocs-ui/mdx';

    export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
      const params = await props.params;
      const page = source.getPage(params.slug);
      if (!page) notFound();

      const MDX = page.data.body;

      return (
        <DocsPage toc={page.data.toc} full={page.data.full}>
          <DocsTitle>{page.data.title}</DocsTitle>
          <DocsDescription>{page.data.description}</DocsDescription>
          <DocsBody>
            <MDX
              components={getMDXComponents({
                // this allows you to link to other pages with relative file paths
                a: createRelativeLink(source, page),
              })}
            />
          </DocsBody>
        </DocsPage>
      );
    }

    export async function generateStaticParams() {
      return source.generateParams();
    }

    export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
      const params = await props.params;
      const page = source.getPage(params.slug);
      if (!page) notFound();

      return {
        title: page.data.title,
        description: page.data.description,
      };
    }

    ```
  </CodeBlockTab>

  <CodeBlockTab value="app/api/search/route.ts">
    ```ts
    import { source } from '@/lib/source';
    import { createFromSource } from 'fumadocs-core/search/server';

    export const { GET } = createFromSource(source, {
      // https://docs.orama.com/docs/orama-js/supported-languages
      language: 'english',
    });

    ```
  </CodeBlockTab>
</CodeBlockTabs>

> <FeedbackBlock id="b1944231964d54d7" body="The search is powered by Orama, learn more about Document Search.">
>   The search is powered by Orama, learn more about [Document Search](/docs/headless/search).
> </FeedbackBlock>

Finish [#finish]

<FeedbackBlock id="397f12ffd478fc81" body="You can start the dev server and create MDX files.">
  You can start the dev server and create MDX files.
</FeedbackBlock>

```mdx title="content/docs/index.mdx"
---
title: Hello World
---

## Introduction

I love Anime.
```
