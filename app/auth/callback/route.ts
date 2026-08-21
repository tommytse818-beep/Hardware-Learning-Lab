import { NextResponse } from "next/server";

import { safeInternalPath } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeInternalPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProtocol =
        request.headers.get("x-forwarded-proto") ?? "https";

      if (process.env.NODE_ENV === "development") {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }

      if (forwardedHost) {
        return NextResponse.redirect(
          `${forwardedProtocol}://${forwardedHost}${next}`,
        );
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  const errorUrl = new URL("/login", requestUrl.origin);
  errorUrl.searchParams.set(
    "error",
    "The email link is invalid or has expired. Request a new one.",
  );

  return NextResponse.redirect(errorUrl);
}
