import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock("@/lib/env", () => ({
  isSupabaseConfigured: () => true,
  isDemoModeEnabled: () => false,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    }),
  }),
}));

describe("getViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to authenticated user metadata when the profile row is missing", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "student@example.com",
          email_confirmed_at: "2024-01-01T00:00:00Z",
          user_metadata: {
            display_name: "Student One",
            avatar: "moon",
            role: "student",
            must_change_password: true,
            leaderboard_opt_in: true,
          },
        },
      },
    });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { getViewer } = await import("./viewer");
    const viewer = await getViewer();

    expect(viewer).not.toBeNull();
    expect(viewer?.id).toBe("user-123");
    expect(viewer?.displayName).toBe("Student One");
    expect(viewer?.role).toBe("student");
    expect(viewer?.mustChangePassword).toBe(true);
  });
});
