import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock("@/lib/env", () => ({
  isSupabaseConfigured: () => true,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mockMaybeSingle }),
      }),
    }),
  }),
}));

const user = {
  id: "user-123",
  email: "student@example.com",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  user_metadata: { role: "admin" },
};

const baseProfile = {
  role: "student",
  display_name: "Student One",
  leaderboard_alias: "CircuitFox",
  avatar_key: "spark",
  bio: "I enjoy testing circuits.",
  leaderboard_opt_in: false,
  must_change_password: false,
};

describe("getViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user },
      error: null,
    });
  });

  it("uses the trusted profile role, not editable user metadata", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: baseProfile,
      error: null,
    });

    const { getViewer } = await import("./viewer");
    const viewer = await getViewer();

    expect(viewer?.role).toBe("student");
    expect(viewer?.displayName).toBe("Student One");
  });

  it("returns the administrator role from the profile row", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { ...baseProfile, role: "admin" },
      error: null,
    });

    const { getViewer } = await import("./viewer");
    expect((await getViewer())?.role).toBe("admin");
  });

  it("fails closed when the profile is missing", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { getViewer } = await import("./viewer");
    expect(await getViewer()).toBeNull();
  });

  it("fails closed when the profile query fails", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { code: "42703" },
    });

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { getViewer } = await import("./viewer");

    expect(await getViewer()).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("does not default an unsupported role to student", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { ...baseProfile, role: "owner" },
      error: null,
    });

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { getViewer } = await import("./viewer");

    expect(await getViewer()).toBeNull();
    errorSpy.mockRestore();
  });
});
