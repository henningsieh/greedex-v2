import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  APP_NAME,
  BASE_URL,
  DESCRIPTION,
  KEYWORDS,
  LOGO_PATH,
  TITLE,
} from "@/config/metadata";

describe("Metadata configuration", () => {
  describe("LOGO_PATH", () => {
    it("should point to an existing image file in the public directory", () => {
      // Remove leading slash and construct full path
      const relativePath = LOGO_PATH.startsWith("/")
        ? LOGO_PATH.slice(1)
        : LOGO_PATH;
      const filePath = path.join(process.cwd(), "public", relativePath);

      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.statSync(filePath).isFile()).toBe(true);
    });
  });

  describe("APP_NAME", () => {
    it("should be a non-empty string", () => {
      expect(typeof APP_NAME).toBe("string");
      expect(APP_NAME.length).toBeGreaterThan(0);
    });
  });

  describe("TITLE", () => {
    it("should be a non-empty string with reasonable length", () => {
      expect(typeof TITLE).toBe("string");
      expect(TITLE.length).toBeGreaterThan(10);
      expect(TITLE.length).toBeLessThan(200);
    });
  });

  describe("DESCRIPTION", () => {
    it("should be a non-empty string with substantial content", () => {
      expect(typeof DESCRIPTION).toBe("string");
      expect(DESCRIPTION.length).toBeGreaterThan(50);
      expect(DESCRIPTION.length).toBeLessThan(500);
    });
  });

  describe("KEYWORDS", () => {
    it("should be an array with at least 3 keywords", () => {
      expect(Array.isArray(KEYWORDS)).toBe(true);
      expect(KEYWORDS.length).toBeGreaterThanOrEqual(3);
      KEYWORDS.forEach((keyword) => {
        expect(typeof keyword).toBe("string");
        expect(keyword.length).toBeGreaterThan(0);
      });
    });
  });

  describe("BASE_URL", () => {
    it("should be a valid URL", () => {
      expect(typeof BASE_URL).toBe("string");
      expect(BASE_URL.length).toBeGreaterThan(0);
      expect(() => new URL(BASE_URL)).not.toThrow();
      expect(BASE_URL.startsWith("http")).toBe(true);
    });
  });
});
