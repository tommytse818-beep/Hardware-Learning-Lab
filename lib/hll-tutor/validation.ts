import { HLL_MAX_IMAGE_BYTES, validateHllImage, type HllTutorRequest } from "@/lib/hll-tutor-contract";

export class TutorError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function readTutorRequest(request: Request): Promise<HllTutorRequest> {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") throw new TutorError("Send a JSON request.", 415);
  const limit = Math.ceil(HLL_MAX_IMAGE_BYTES * 4 / 3) + 60_000;
  const reader = request.body?.getReader();
  if (!reader) throw new TutorError("Your question is missing.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw new TutorError("Choose an image no larger than 5 MB.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let value;
  try { value = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new TutorError("The question could not be read."); }
  if (!value || typeof value !== "object" || Array.isArray(value) ||
    typeof value.requestId !== "string" || !/^[\w-]{1,80}$/.test(value.requestId) ||
    !value.lesson || typeof value.lesson.courseSlug !== "string" || typeof value.lesson.lessonId !== "string" ||
    !/^[a-z0-9-]{1,100}$/.test(value.lesson.courseSlug) || !/^[a-zA-Z0-9.-]{1,100}$/.test(value.lesson.lessonId) ||
    typeof value.message !== "string" || !value.message.trim() || value.message.length > 4000) throw new TutorError("Enter a question of up to 4,000 characters in an available lesson.");
  const history = value.history ?? [];
  if (!Array.isArray(history) || history.length > 6 || history.length % 2 !== 0 ||
    history.some((item, index) => !item || item.role !== (index % 2 ? "assistant" : "user") || typeof item.content !== "string" || item.content.length > 4000) ||
    history.reduce((total, item) => total + item.content.length, 0) > 12000) throw new TutorError("The conversation is too long. Start a new chat.");
  const images = value.images ?? [];
  if (!Array.isArray(images) || images.length > 1) throw new TutorError("Attach one image at a time.");
  for (const image of images) {
    if (!image || typeof image.base64 !== "string" || image.base64.length > Math.ceil(HLL_MAX_IMAGE_BYTES / 3) * 4 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(image.base64)) throw new TutorError("The image could not be read.");
    const bytes = Buffer.from(image.base64, "base64");
    if (bytes.toString("base64") !== image.base64) throw new TutorError("The image could not be read.");
    const error = await validateHllImage({ type: image.mimeType, size: bytes.length,
      slice: (start, end) => ({ arrayBuffer: async () => Uint8Array.from(bytes.subarray(start, end)).buffer }) });
    if (error) throw new TutorError(error);
  }
  return { requestId: value.requestId, lesson: { courseSlug: value.lesson.courseSlug, lessonId: value.lesson.lessonId },
    message: value.message.trim(), history: history.map((item) => ({ role: item.role, content: item.content })), images };
}
