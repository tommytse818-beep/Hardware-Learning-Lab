import "server-only";

import { createHash } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

function clientAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function consumeRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number,
) {
  const salt = process.env.RATE_LIMIT_SALT?.trim();

  if (!salt || salt.length < 24) {
    throw new Error("RATE_LIMIT_SALT is not configured.");
  }

  const keyHash = createHash("sha256")
    .update(`${scope}|${clientAddress(request)}|${salt}`)
    .digest("hex");

  const { data, error } = await createAdminClient().rpc(
    "consume_rate_limit_v1",
    {
      p_key_hash: keyHash,
      p_scope: scope,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    },
  );

  if (error || typeof data !== "boolean") {
    throw new Error("Rate-limit storage is unavailable.");
  }

  return data;
}
