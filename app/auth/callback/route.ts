import { NextResponse } from "next/server";

import { getConfiguredSiteUrl } from "@/lib/env";
import { safeInternalPath } from "@/lib/navigation";
import {
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RECOVERY_COOKIE_VALUE,
  PASSWORD_RECOVERY_MAX_AGE_SECONDS,
} from "@/lib/password-recovery";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeInternalPath(
    requestUrl.searchParams.get("next"),
    "/dashboard",
  );
  const appOrigin = getConfiguredSiteUrl();
  const destination = new URL(next, appOrigin);
  const recoveryDestination = destination.pathname === "/update-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(destination);

      if (recoveryDestination) {
        response.cookies.set(
          PASSWORD_RECOVERY_COOKIE,
          PASSWORD_RECOVERY_COOKIE_VALUE,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: PASSWORD_RECOVERY_MAX_AGE_SECONDS,
          },
        );
      }

      return response;
    }
  }

  const errorUrl = new URL(
    recoveryDestination ? "/forgot-password" : "/login",
    appOrigin,
  );
  errorUrl.searchParams.set(
    "error",
    "The email link is invalid or has expired. Request a new one.",
  );

  return NextResponse.redirect(errorUrl);
}
