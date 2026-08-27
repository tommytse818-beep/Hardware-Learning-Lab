import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { StatusBanner } from "@/components/status-banner";
import { updateRecoveredPassword } from "@/lib/auth-actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import {
  hasActivePasswordRecovery,
  PASSWORD_RECOVERY_COOKIE,
} from "@/lib/password-recovery";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

type UpdatePasswordPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const { error, message } = await searchParams;
  const cookieStore = await cookies();

  if (
    !hasActivePasswordRecovery(
      cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value,
    )
  ) {
    redirect(
      "/forgot-password?error=Open+the+newest+password-recovery+link+from+your+email.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      "/forgot-password?error=The+recovery+session+is+invalid+or+has+expired.",
    );
  }

  return (
    <AuthShell
      eyebrow="Secure recovery session"
      title="Choose a new password for your own account."
      description="Open this page from the newest recovery email. The link establishes a temporary recovery session before the password can change."
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
        New password
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
        Finish account recovery
      </h2>
      <div className="mt-5">
        <StatusBanner error={error} message={message} />
      </div>
      <form action={updateRecoveredPassword} className="mt-7 space-y-5">
        <PasswordField
          label="New password"
          name="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          hint={`Use at least ${PASSWORD_MIN_LENGTH} characters. A short passphrase is welcome.`}
        />
        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
        />
        <button
          type="submit"
          className="w-full rounded-2xl bg-emerald-600 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
        >
          Save new password
        </button>
      </form>
      <Link
        href="/forgot-password"
        className="mt-6 inline-flex text-sm font-semibold text-emerald-700"
      >
        Request another link
      </Link>
    </AuthShell>
  );
}
