import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getViewer: vi.fn(),
  getCourseAccess: vi.fn(),
  getDrawerSenseAccess: vi.fn(),
  getDrawerSenseMediaResource: vi.fn(),
  getDrawerSenseServerProgress: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/viewer", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/lib/course-access", () => ({ getCourseAccess: mocks.getCourseAccess }));
vi.mock("@/lib/drawersense-access", () => ({ getDrawerSenseAccess: mocks.getDrawerSenseAccess }));
vi.mock("@/lib/drawersense-media", () => ({ getDrawerSenseMediaResource: mocks.getDrawerSenseMediaResource }));
vi.mock("@/lib/drawersense-server-progress", () => ({ getDrawerSenseServerProgress: mocks.getDrawerSenseServerProgress }));
vi.mock("@/lib/drawersense-curriculum", () => ({ drawerSenseLessons: [{ id: "2.0A", questions: [{ id: "q1" }] }, { id: "2.0B", questions: [{ id: "q2" }] }] }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));

type QueryBuilder = {
  select: () => QueryBuilder;
  eq: () => QueryBuilder;
  maybeSingle: () => unknown;
};

function adminMock(resourceResult: unknown, signedUrlResult: unknown) {
  const from = vi.fn(() => {
    const builder = {} as QueryBuilder;
    builder.select = vi.fn(() => builder);
    builder.eq = vi.fn(() => builder);
    builder.maybeSingle = vi.fn(() => resourceResult);
    return builder;
  });
  const createSignedUrl = vi.fn(async () => signedUrlResult);

  return {
    client: {
      from,
      storage: { from: vi.fn(() => ({ createSignedUrl })) },
    },
    createSignedUrl,
  };
}

function context() {
  return {
    params: Promise.resolve({
      courseSlug: "open-guard-mini",
      resourceKey: "lesson-1-1-video",
    }),
  };
}

describe("GET /api/courses/[courseSlug]/resources/[resourceKey]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCourseAccess.mockResolvedValue({ allowed: true, message: "ok" });
    mocks.getDrawerSenseMediaResource.mockReturnValue(null);
    mocks.getDrawerSenseAccess.mockResolvedValue({ allowed: true, canReview: false, storageScope: "student-1" });
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: true, weekOneReady: true, progress: {} });
  });

  it("returns 401 for a signed-out visitor", async () => {
    mocks.getViewer.mockResolvedValue(null);
    const { GET } = await import("./route");

    expect((await GET(new Request("http://localhost"), context())).status).toBe(401);
    expect(mocks.getCourseAccess).not.toHaveBeenCalled();
  });

  it("returns 403 for a viewer without course access", async () => {
    mocks.getViewer.mockResolvedValue({ id: "student-1" });
    mocks.getCourseAccess.mockResolvedValue({ allowed: false, message: "No seat." });
    const { GET } = await import("./route");

    expect((await GET(new Request("http://localhost"), context())).status).toBe(403);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("redirects an entitled viewer to a signed private URL", async () => {
    const mock = adminMock(
      { data: { bucket_id: "course-private", object_path: "open-guard/video.mp4", title: "Video" }, error: null },
      { data: { signedUrl: "https://storage.example/signed-video" }, error: null },
    );
    mocks.getViewer.mockResolvedValue({ id: "student-1" });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost"), context());

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://storage.example/signed-video");
    expect(mock.createSignedUrl).toHaveBeenCalledWith("open-guard/video.mp4", 60 * 60);
  });

  it("denies a Week 2 solution resource before the saved attempt and checks", async () => {
    mocks.getViewer.mockResolvedValue({ id: "student-1", verified: true, role: "student" });
    mocks.getDrawerSenseMediaResource.mockReturnValue({ lessonId: "2.0A", kind: "solution", format: "video" });
    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), context());
    expect(response.status).toBe(403);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("allows a Week 2 solution resource after the same saved-work gate", async () => {
    const mock = adminMock(
      { data: { bucket_id: "course-private", object_path: "solution.mp4", title: "Solution" }, error: null },
      { data: { signedUrl: "https://storage.example/signed-solution" }, error: null },
    );
    mocks.getViewer.mockResolvedValue({ id: "student-1", verified: true, role: "student" });
    mocks.getDrawerSenseMediaResource.mockReturnValue({ lessonId: "2.0A", kind: "solution", format: "video" });
    mocks.getDrawerSenseServerProgress.mockResolvedValue({ databaseReady: true, weekOneReady: true, progress: { "2.0A": { saved: true, correct: ["q1"] } } });
    mocks.createAdminClient.mockReturnValue(mock.client);
    const { GET } = await import("./route");
    expect((await GET(new Request("http://localhost"), context())).status).toBe(307);
  });

  it("denies concept media for a future activity", async () => {
    mocks.getViewer.mockResolvedValue({ id: "student-1", verified: true, role: "student" });
    mocks.getDrawerSenseMediaResource.mockReturnValue({ lessonId: "2.0B", kind: "concept", format: "video" });
    const { GET } = await import("./route");
    expect((await GET(new Request("http://localhost"), context())).status).toBe(403);
  });
});
