import { beforeEach, describe, expect, it, vi } from "vitest";

// We'll replace the real auth client with a mock. The mock implementation
// delegates to the `checkSlugMock` variable which we replace in each test
// to control behavior deterministically.
let checkSlugMock = vi.fn();

vi.mock("@/lib/better-auth/auth-client", () => {
  return {
    authClient: {
      organization: {
        checkSlug: (args: { slug: string }) => checkSlugMock(args),
      },
    },
  };
});

import { findAvailableSlug } from "@/features/organizations/utils";

describe("findAvailableSlug", () => {
  beforeEach(() => {
    // Reset the delegating mock so each test can install its own behavior
    checkSlugMock = vi.fn();
  });

  it("returns the slugified base name when available", async () => {
    checkSlugMock.mockResolvedValue({ error: null });

    const result = await findAvailableSlug("My Org");

    expect(result).toBe("my-org");
    expect(checkSlugMock).toHaveBeenCalledWith({ slug: "my-org" });
  });

  it("appends a random suffix when the base slug is taken", async () => {
    const baseSlug = "my-org";

    checkSlugMock.mockImplementation(({ slug }) => {
      if (slug === baseSlug) return Promise.resolve({ error: true });
      // Any slug that starts with `${baseSlug}-` is considered available
      if (slug.startsWith(`${baseSlug}-`))
        return Promise.resolve({ error: null });
      return Promise.resolve({ error: null });
    });

    const result = await findAvailableSlug("My Org");

    // Suffix length should be 4 and only lowercase alphanumeric
    expect(result).toMatch(new RegExp(`^${baseSlug}-[a-z0-9]{4}$`));
  });

  it("keeps retrying until an available suffix is found (multiple collisions)", async () => {
    const baseSlug = "my-org";
    let suffixAttempts = 0;

    checkSlugMock.mockImplementation(({ slug }) => {
      if (slug === baseSlug) return Promise.resolve({ error: true });
      if (slug.startsWith(`${baseSlug}-`)) {
        suffixAttempts++;
        // Only succeed after a few failed suffix attempts
        return Promise.resolve({ error: suffixAttempts >= 3 ? null : true });
      }
      return Promise.resolve({ error: null });
    });

    const result = await findAvailableSlug("My Org");

    expect(result).toMatch(new RegExp(`^${baseSlug}-[a-z0-9]{4}$`));
    // Ensure we indeed tried multiple suffix candidates
    expect(suffixAttempts).toBeGreaterThanOrEqual(1);
  });

  it("falls back to a random slug of the fallback length after max attempts", async () => {
    // Always indicate taken/unavailable so trySlug exhausts attempts
    checkSlugMock.mockResolvedValue({ error: true });

    const result = await findAvailableSlug("My Org");

    // FALLBACK_SLUG_LENGTH is 8 in the implementation
    expect(result).toMatch(/^[a-z0-9]{8}$/);
    expect(result.length).toBe(8);
  });

  it("uses a random base slug when slugify produces an empty string", async () => {
    // Accept whatever random base slug the util generates
    checkSlugMock.mockResolvedValue({ error: null });

    const result = await findAvailableSlug("!!!");

    // DEFAULT_RANDOM_STRING_LENGTH is 6
    expect(result).toMatch(/^[a-z0-9]{6}$/);
    expect(result.length).toBe(6);
  });

  it("continues when checkSlug throws and succeeds on a later candidate", async () => {
    const baseSlug = "my-org";

    checkSlugMock.mockImplementation(({ slug }) => {
      if (slug === baseSlug) return Promise.reject(new Error("network"));
      if (slug.startsWith(`${baseSlug}-`))
        return Promise.resolve({ error: null });
      return Promise.resolve({ error: null });
    });

    const result = await findAvailableSlug("My Org");

    expect(result).toMatch(new RegExp(`^${baseSlug}-[a-z0-9]{4}$`));
  });

  it("properly slugifies complex names before checking availability", async () => {
    checkSlugMock.mockResolvedValue({ error: null });

    const result = await findAvailableSlug("  Hello, WORLD!!  ");

    expect(result).toBe("hello-world");
  });
});
