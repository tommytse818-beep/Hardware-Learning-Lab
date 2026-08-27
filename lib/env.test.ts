import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("environment guards", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllEnvs();
  });

  it.each([
    "",
    "...",
    "https://YOUR_PROJECT.supabase.co",
    "https://example.com",
    "<project-url>",
    "not a URL",
  ])("rejects invalid Supabase URL %s", async (value) => {
    const { isValidSupabaseUrl } = await import("./env");
    expect(isValidSupabaseUrl(value)).toBe(false);
  });

  it("accepts a valid hosted Supabase URL", async () => {
    const { isValidSupabaseUrl } = await import("./env");
    expect(isValidSupabaseUrl("https://project-ref.supabase.co")).toBe(true);
  });

  it.each([
    "",
    "...",
    "YOUR_KEY",
    "sb_publishable_YOUR_KEY",
    "<publishable-key>",
  ])("rejects invalid publishable key %s", async (value) => {
    const { isValidPublishableKey } = await import("./env");
    expect(isValidPublishableKey(value)).toBe(false);
  });

  it("accepts a modern publishable key", async () => {
    const { isValidPublishableKey } = await import("./env");
    expect(
      isValidPublishableKey("sb_publishable_1234567890abcdefghijk"),
    ).toBe(true);
  });
});
