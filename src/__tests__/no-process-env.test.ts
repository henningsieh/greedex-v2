import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PROCESS_ENV_FINDER_REGEX = /\bprocess\.env\b/;

function walkDir(dir: string, extensions: string[] = [".ts", ".tsx"]): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "test") {
        continue; // skip old tests directory
      }
      if (entry.name === "__tests__") {
        continue; // skip tests directory
      }
      if (
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === "build" ||
        entry.name === "docs"
      ) {
        continue;
      }
      files.push(...walkDir(fullPath, extensions));
    } else if (extensions.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("no direct process.env usage", () => {
  const root = path.resolve(__dirname, "..", "..", "src");
  const files = walkDir(root);
  const allowedFiles = [
    path.resolve(root, "env.ts"),
    path.resolve(root, "instrumentation.ts"), // Next.js instrumentation needs runtime check
  ];

  it("should not use process.env in source files (except src/env.ts and src/instrumentation.ts)", () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (allowedFiles.includes(file)) {
        continue;
      }
      const content = fs.readFileSync(file, "utf8");
      if (PROCESS_ENV_FINDER_REGEX.test(content)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});
