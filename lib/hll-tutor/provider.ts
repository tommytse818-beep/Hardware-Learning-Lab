import "server-only";
import type { HllTutorAuthorizedContext, HllTutorRequest } from "@/lib/hll-tutor-contract";
import { tutorConfig } from "./config";
import { tutorInstructions } from "./context";
import { TutorError } from "./validation";

export async function generateTutorReply(input: HllTutorRequest, context: HllTutorAuthorizedContext, signal: AbortSignal) {
  const config = tutorConfig();
  if (!config) throw new TutorError("The school’s AI server has not been connected yet. Your question is kept here.", 503);
  if (input.images?.length && !config.images) throw new TutorError("Image questions are not enabled on the school’s AI server yet.", 422);
  const content = [{ type: "text", text: input.message }, ...(input.images ?? []).map((image) => ({ type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.base64}` } }))];
  try {
    const response = await fetch(new URL("chat/completions", config.url), {
      method: "POST", redirect: "error", cache: "no-store",
      signal: AbortSignal.any([signal, AbortSignal.timeout(90_000)]),
      headers: { "Content-Type": "application/json", ...(config.key ? { Authorization: `Bearer ${config.key}` } : {}) },
      body: JSON.stringify({ model: config.model, stream: false, temperature: 0.2, max_tokens: 650,
        ...(config.effort ? { reasoning_effort: config.effort } : {}),
        messages: [{ role: "system", content: tutorInstructions(context) }, ...(input.history ?? []), { role: "user", content }] }),
    });
    if (!response.ok) throw new Error("Provider unavailable");
    const result = await response.json();
    const choice = result.choices?.[0];
    if (choice?.finish_reason !== "stop" || typeof choice.message?.content !== "string" ||
      !choice.message.content.trim() || choice.message.content.length > 12000 || choice.message.tool_calls?.length) throw new Error("Incomplete provider reply");
    return { requestId: input.requestId, text: choice.message.content.trim(), sourceIds: context.approvedTeaching.map((item) => item.sourceId) };
  } catch {
    throw new TutorError(signal.aborted ? "Reply stopped. Your question is kept here." : "The AI server could not finish a reply. Your question is kept here; try again shortly.", 503);
  }
}
