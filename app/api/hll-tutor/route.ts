import { requireApiViewer } from "@/lib/api-authorization";
import { consumeAccountRateLimit } from "@/lib/rate-limit";
import { tutorConfig } from "@/lib/hll-tutor/config";
import { authorizeTutorContext } from "@/lib/hll-tutor/context";
import { generateTutorReply } from "@/lib/hll-tutor/provider";
import { readTutorRequest, TutorError } from "@/lib/hll-tutor/validation";

export const runtime = "nodejs";
export const maxDuration = 120;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const auth = await requireApiViewer(["student", "teacher", "admin"]);
  if (auth.response) return auth.response;
  const config = tutorConfig();
  // Configured does not assert that a model is healthy or accuracy-approved.
  const available = Boolean(config && (auth.viewer.role !== "student" || config.students));
  return json({ configured: available, images: available && (config?.images ?? false), pilot: Boolean(config && !config.students) });
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return json({ error: "Open the assistant from the learning platform." }, 403);
  const auth = await requireApiViewer(["student", "teacher", "admin"]);
  if (auth.response) return auth.response;
  try {
    const input = await readTutorRequest(request);
    const context = await authorizeTutorContext(auth.viewer, input.lesson);
    const config = tutorConfig();
    if (!config) throw new TutorError("The school’s AI server has not been connected yet. Your question is kept here.", 503);
    if (auth.viewer.role === "student" && !config.students) throw new TutorError("The assistant is being reviewed by your teachers before student release.", 503);
    if (!await consumeAccountRateLimit(auth.viewer.id!, "hll-tutor-minute", 6, 60) ||
      !await consumeAccountRateLimit(auth.viewer.id!, "hll-tutor-day", 100, 86400) ||
      !await consumeAccountRateLimit("school-server", "hll-tutor-global-minute", 120, 60)) throw new TutorError("The assistant has reached its current request limit. Please wait before trying again.", 429);
    return json(await generateTutorReply(input, context, request.signal));
  } catch (error) {
    return json({ error: error instanceof TutorError ? error.message : "The assistant is temporarily unavailable. Your question is kept here." }, error instanceof TutorError ? error.status : 503);
  }
}
