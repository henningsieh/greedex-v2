# Oxc Documentation Index

This folder contains documentation for the Oxc tools used in this project: **Oxlint** (linter) and **Oxfmt** (formatter).

## Folder Structure

```
docs/oxc/
├── oxfmt/
│   ├── formatter.md      # Main formatter guide
│   └── quickstart.md     # Quickstart guide for Oxfmt
├── oxlint/
│   ├── linter.md         # Main linter guide
│   └── quickstart.md     # Quickstart guide for Oxlint
└── README.md             # This index file
```

## Oxfmt (Formatter)

- [Formatter Guide](oxfmt/formatter.md) - Comprehensive guide for using Oxfmt
- [Quickstart](oxfmt/quickstart.md) - Get started with Oxfmt quickly

## Oxlint (Linter)

- [Linter Guide](oxlint/linter.md) - Comprehensive guide for using Oxlint
- [Quickstart](oxlint/quickstart.md) - Get started with Oxlint quickly

## Usage in This Project

- **Format code**: `bun run format` (runs Oxfmt with import sorting and Tailwind class sorting)
- **Lint code**: `bun run lint` (runs Oxlint with auto-fix and TypeScript type checking)

Configuration files:
- `.oxfmtrc.json` - Oxfmt configuration
- `.oxlintrc.json` - Oxlint configuration

For more information, visit [oxc.rs](https://oxc.rs/).