# Fumadocs (Framework Mode): Navigation
URL: /docs/navigation
Source: https://raw.githubusercontent.com/fuma-nama/fumadocs/refs/heads/main/apps/docs/content/docs/(framework)/navigation.mdx

Configure navigation in your Fumadocs app.
        


import { LinkIcon, PanelLeftDashed } from 'lucide-react';

<FeedbackBlock id="7054e2c4729ea7ed" body="Fumadocs UI provides different layouts to display content, you can specify navigation configurations via layouts.">
  **Fumadocs UI** provides different layouts to display content, you can specify navigation configurations via layouts.
</FeedbackBlock>

<Cards>
  <Card icon={<LinkIcon />} title="Layout Links" href="/docs/ui/layouts/links">
    Display **navigation links** in your layouts.

    It is useful for linking to frequently used resources like showcase and pricing pages.
  </Card>

  <Card icon={<PanelLeftDashed />} title="Sidebar Items" href="/docs/ui/layouts/docs#sidebar-items">
    Sidebar renders links to all documentation pages.

    Under the hood, **Page Tree** is used to represent the navigation structure.
  </Card>
</Cards>
