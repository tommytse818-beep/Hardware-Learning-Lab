import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getClaims: vi.fn(),
  getSupabaseConfig: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock("@/lib/env", () => ({
  getSupabaseConfig: mocks.getSupabaseConfig,
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.getSupabaseConfig.mockReturnValue({
      url: "https://example.supabase.co",
      publishableKey: "publishable-key",
    });
    mocks.getClaims.mockResolvedValue({ data: { claims: null } });
    mocks.createServerClient.mockReturnValue({
      auth: { getClaims: mocks.getClaims },
    });
  });

  it("does not contact Supabase for an anonymous public request", async () => {
    const { updateSession } = await import("./proxy");

    const response = await updateSession(
      new NextRequest("http://localhost/about"),
    );

    expect(response.status).toBe(200);
    expect(mocks.createServerClient).not.toHaveBeenCalled();
    expect(mocks.getClaims).not.toHaveBeenCalled();
  });

  it("refreshes auth state on a public request carrying a Supabase token", async () => {
    const { updateSession } = await import("./proxy");

    await updateSession(
      new NextRequest("http://localhost/about", {
        headers: { cookie: "sb-example-auth-token.0=token" },
      }),
    );

    expect(mocks.createServerClient).toHaveBeenCalledOnce();
    expect(mocks.getClaims).toHaveBeenCalledOnce();
  });

  it("redirects an anonymous protected request to login", async () => {
    const { updateSession } = await import("./proxy");

    const response = await updateSession(
      new NextRequest("http://localhost/dashboard?tab=progress"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login?next=%2Fdashboard%3Ftab%3Dprogress",
    );
  });
});