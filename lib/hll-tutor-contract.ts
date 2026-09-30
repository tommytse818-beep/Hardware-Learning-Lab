export type HllTutorStage = "learn" | "practice" | "solution" | "transfer";
export type HllTutorHelpMode = "hint-only" | "worked-review";

/** Display context only. The server re-checks access and stage. */
export type HllTutorContext = {
  courseSlug?: string;
  lessonId?: string;
  lessonTitle: string;
  stage: HllTutorStage;
  helpMode?: HllTutorHelpMode;
};

export type HllImageMimeType = "image/png" | "image/jpeg" | "image/webp";

/** Provider-neutral input. Stage and answer access are never client authority. */
export type HllTutorRequest = {
  requestId: string;
  conversationId?: string;
  lesson: { courseSlug: string; lessonId: string };
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  images?: Array<{ mimeType: HllImageMimeType; base64: string }>;
};

/** Built by the server from verified progress, never accepted from the browser. */
export type HllTutorAuthorizedContext = {
  lesson: { courseSlug: string; lessonId: string; title: string };
  stage: HllTutorStage;
  helpMode: HllTutorHelpMode;
  approvedTeaching: Array<{ sourceId: string; text: string }>;
};

export type HllTutorReply = {
  requestId: string;
  text: string;
  sourceIds: string[];
};

export const HLL_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const HLL_IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";

type LocalImageFile = {
  type: string;
  size: number;
  slice(start: number, end: number): { arrayBuffer(): Promise<ArrayBuffer> };
};

/** Validate both the declared type and file signature before creating a preview. */
export async function validateHllImage(file: LocalImageFile): Promise<string | null> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    return "Choose a PNG, JPEG or WebP image. Other file types are not supported.";
  }
  if (!Number.isFinite(file.size) || file.size <= 0) return "This image is empty or could not be read.";
  if (file.size > HLL_MAX_IMAGE_BYTES) return "Choose an image no larger than 5 MB.";

  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const startsWith = (signature: number[], offset = 0) =>
      signature.every((value, index) => bytes[index + offset] === value);
    const valid = file.type === "image/png"
      ? startsWith([137, 80, 78, 71, 13, 10, 26, 10])
      : file.type === "image/jpeg"
        ? startsWith([255, 216, 255])
        : startsWith([82, 73, 70, 70]) && startsWith([87, 69, 66, 80], 8);
    return valid ? null : "The file contents do not match its image type. Export a new PNG, JPEG or WebP image.";
  } catch {
    return "This image could not be read. Choose another file.";
  }
}
