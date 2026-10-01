import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getViewer: vi.fn() }));
vi.mock("@/lib/viewer", () => ({ getViewer: mocks.getViewer }));
vi.mock("@/lib/role-home", () => import("./role-home"));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));

const teacher = { id: "teacher-1", role: "teacher", verified: true, demo: false, mustChangePassword: false };

describe("staff page and API identity boundaries", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getViewer.mockResolvedValue(teacher); });

  it.each([null, { ...teacher, verified: false }, { ...teacher, demo: true }, { ...teacher, id: null }])("rejects an unverified or simulated identity on both surfaces", async (viewer) => {
    mocks.getViewer.mockResolvedValue(viewer);
    const { requireApiViewer } = await import("./api-authorization");
    const { requireViewerRole } = await import("./authorization");
    expect((await requireApiViewer(["teacher"])).response?.status).toBe(401);
    await expect(requireViewerRole(["teacher"])).rejects.toThrow("REDIRECT:/login");
  });

  it("requires completion of first-login setup", async () => {
    mocks.getViewer.mockResolvedValue({ ...teacher, mustChangePassword: true });
    const { requireApiViewer } = await import("./api-authorization");
    const { requireViewerRole } = await import("./authorization");
    expect((await requireApiViewer(["teacher"])).response?.status).toBe(403);
    await expect(requireViewerRole(["teacher"])).rejects.toThrow("REDIRECT:/first-login");
  });

  it("keeps school account administration restricted to the administrator role", async () => {
    const { requireApiViewer } = await import("./api-authorization");
    const { requireViewerRole } = await import("./authorization");
    expect((await requireApiViewer(["admin"])).response?.status).toBe(403);
    await expect(requireViewerRole(["admin"])).rejects.toThrow("REDIRECT:/teacher");
  });

  it("allows a verified account with the required role", async () => {
    const { requireApiViewer } = await import("./api-authorization");
    const { requireViewerRole } = await import("./authorization");
    expect((await requireApiViewer(["teacher"])).viewer).toEqual(teacher);
    await expect(requireViewerRole(["teacher"])).resolves.toEqual(teacher);
  });
});
