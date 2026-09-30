import "server-only";

export function tutorConfig() {
  if (process.env.HLL_TUTOR_ENABLED !== "true") return null;
  const model = process.env.HLL_TUTOR_MODEL?.trim();
  const raw = process.env.HLL_TUTOR_BASE_URL?.trim();
  if (!model || !raw || model.length > 150 || /cloud/i.test(model)) return null;
  try {
    const url = new URL(raw.endsWith("/") ? raw : `${raw}/`);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash ||
      (url.protocol !== "https:" && !(loopback && url.protocol === "http:"))) return null;
    const key = process.env.HLL_TUTOR_API_KEY?.trim();
    // A remote self-hosted service must use TLS and a server-only access key.
    if (!loopback && !key) return null;
    const effort = process.env.HLL_TUTOR_REASONING_EFFORT?.trim();
    if (effort && !["none", "low", "medium", "high"].includes(effort)) return null;
    return { url, model, key, effort, images: process.env.HLL_TUTOR_IMAGES_ENABLED === "true", students: process.env.HLL_TUTOR_STUDENTS_ENABLED === "true" };
  } catch { return null; }
}
