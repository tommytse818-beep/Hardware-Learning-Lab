import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("./context", () => ({ tutorInstructions: () => "Approved teaching instructions" }));
vi.mock("@/lib/hll-tutor-contract", () => import("../hll-tutor-contract"));
import { generateTutorReply } from "./provider";
import type { HllTutorAuthorizedContext } from "../hll-tutor-contract";
const input = { requestId: "test-1", lesson: { courseSlug: "open-guard-mini", lessonId: "2.1B" }, message: "Explain a floating input" };
const context: HllTutorAuthorizedContext = { lesson: { ...input.lesson, title: "Inputs" }, stage: "learn", helpMode: "hint-only", approvedTeaching: [{ sourceId: "/courses/open-guard-mini/week-2?lesson=2.1B", text: "Notes" }] };
describe("self-hosted model adapter", () => {
  beforeEach(() => { vi.stubEnv("HLL_TUTOR_ENABLED", "true"); vi.stubEnv("HLL_TUTOR_BASE_URL", "http://127.0.0.1:11434/v1/"); vi.stubEnv("HLL_TUTOR_MODEL", "qwen3-vl:8b"); vi.stubEnv("HLL_TUTOR_IMAGES_ENABLED", "false"); });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  it("uses only the configured endpoint, bounded output and server-derived sources", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ choices: [{ finish_reason: "stop", message: { content: "Check the return path." } }] })); vi.stubGlobal("fetch", fetcher);
    expect((await generateTutorReply(input, context, new AbortController().signal)).sourceIds).toEqual([context.approvedTeaching[0].sourceId]);
    expect(fetcher.mock.calls[0][0].href).toBe("http://127.0.0.1:11434/v1/chat/completions");
    const options = fetcher.mock.calls[0][1]; expect(options.redirect).toBe("error");
    expect(JSON.parse(options.body).max_tokens).toBe(650);
  });
  it.each(["length", "tool_calls", "content_filter", undefined])("rejects incomplete replies (%s)", async (finish_reason) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ choices: [{ finish_reason, message: { content: "Unfinished" } }] })));
    await expect(generateTutorReply(input, context, new AbortController().signal)).rejects.toMatchObject({ status: 503 });
  });
  it("does not send images when vision is disabled", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    await expect(generateTutorReply({ ...input, images: [{ mimeType: "image/png", base64: "abc" }] }, context, new AbortController().signal)).rejects.toMatchObject({ status: 422 });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("hides provider errors and secrets", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("private endpoint secret")));
    await expect(generateTutorReply(input, context, new AbortController().signal)).rejects.toThrow("could not finish");
  });
});
