import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("dotenv config import in node entrypoints", () => {
  const files = ["src/socket-server.ts"];

  for (const file of files) {
    it(`should import dotenv config at top of ${file}`, () => {
      const content = readFileSync(path.resolve(file), "utf8");
      const lines = content.split("\n");
      const importLine = lines.findIndex(
        (line) => line.trim() === 'import { config } from "dotenv";',
      );
      expect(importLine).toBeGreaterThanOrEqual(0);
      expect(importLine).toBeLessThan(3); // Should be within first 3 lines
    });
  }
});
