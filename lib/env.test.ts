import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("demo mode guards", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllEnvs();
  });

  it("allows explicit local demo mode only when Supabase is missing", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ENABLE_DEMO_MODE", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    const { isDemoModeEnabled } = await import("./env");

    expect(isDemoModeEnabled()).toBe(true);
  });

  it("fails closed in production when Supabase is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ENABLE_DEMO_MODE", "false");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    const { isDemoModeEnabled } = await import("./env");

    expect(isDemoModeEnabled()).toBe(false);
  });
});
