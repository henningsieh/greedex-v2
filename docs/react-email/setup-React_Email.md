---
applyTo: '**'
---
# Automatic Setup

> Add React Email to any JavaScript or TypeScript project in minutes.

<Note>Using monorepos? Then, we recommend following the [monorepo setup](/getting-started/monorepo-setup/choose-package-manager).</Note>

## 1. Install

We recommend using `create-email`, which sets up everything automatically for you.

<CodeGroup>
  ```sh npm
  npx create-email@latest
  ```

  ```sh yarn
  yarn create email
  ```

  ```sh pnpm
  pnpm create email
  ```
</CodeGroup>

This will create a new folder called `react-email-starter` with a few email templates.

## 2. Run locally

First, install the dependencies:

<CodeGroup>
  ```sh npm
  npm install
  ```

  ```sh yarn
  yarn
  ```

  ```sh pnpm
  pnpm install
  ```
</CodeGroup>

Then, run the development server:

<CodeGroup>
  ```sh npm
  npm run dev
  ```

  ```sh yarn
  yarn dev
  ```

  ```sh pnpm
  pnpm dev
  ```
</CodeGroup>

## 3. See changes live

Visit [localhost:3000](http://localhost:3000) and edit any of the files on the `emails` folder to see the changes.

## 4. Next steps

Try adding these other components to your email.

<CardGroup>
  <Card title="Image" icon="image" href="/components/image">
    Display an image in your email.
  </Card>

  <Card title="Link" icon="link" href="/components/link">
    A hyperlink to web pages or anything else a URL can address.
  </Card>

  <Card title="Divider" icon="horizontal-rule" href="/components/hr">
    Display a divider that separates content areas in your email.
  </Card>

  <Card title="Preview" icon="magnifying-glass" href="/components/preview">
    A preview text that will be displayed in the inbox of the recipient.
  </Card>
</CardGroup>
