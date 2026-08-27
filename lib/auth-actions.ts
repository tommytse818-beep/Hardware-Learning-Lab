"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getConfiguredSiteUrl,
  isSupabaseConfigured,
} from "@/lib/env";
import { safeInternalPath } from "@/lib/navigation";
import { validateNewPassword } from "@/lib/password-policy";
import {
  hasActivePasswordRecovery,
  PASSWORD_RECOVERY_COOKIE,
} from "@/lib/password-recovery";
import { getRoleHome } from "@/lib/role-home";
import { createClient } from "@/lib/supabase/server";
import { getViewerFromClient } from "@/lib/viewer";

function readTrimmed(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function readPassword(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function redirectWithMessage(
  pathname: string,
  type: "error" | "message",
  message: string,
  extraParams: Record<string, string> = {},
): never {
  const params = new URLSearchParams(extraParams);
  params.set(type, message);
  redirect(`${pathname}?${params.toString()}`);
}

export async function login(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage(
      "/login",
      "error",
      "Account access is not configured on this deployment.",
    );
  }

  const email = readTrimmed(formData, "email").toLowerCase();
  const password = readPassword(formData, "password");
  const requestedNext = readTrimmed(formData, "next");

  if (!isValidEmail(email) || password.length === 0) {
    redirectWithMessage(
      "/login",
      "error",
      "Enter a valid email address and password.",
      requestedNext ? { next: requestedNext } : {},
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message = error.message.toLowerCase().includes("email not confirmed")
      ? "Confirm your email address before signing in."
      : "The email or password is incorrect.";

    redirectWithMessage(
      "/login",
      "error",
      message,
      requestedNext ? { next: requestedNext } : {},
    );
  }

  const viewer = await getViewerFromClient(supabase);

  if (!viewer) {
    await supabase.auth.signOut();
    redirectWithMessage(
      "/login",
      "error",
      "This account is authenticated but has not been provisioned for the programme. Contact your school administrator.",
    );
  }

  if (viewer.mustChangePassword) {
    redirect("/first-login");
  }

  const roleHome = getRoleHome(viewer.role);
  const target = requestedNext
    ? safeInternalPath(requestedNext, roleHome)
    : roleHome;

  redirect(target);
}

export async function signup(formData: FormData) {
  void formData;

  redirectWithMessage(
    "/signup",
    "error",
    "Public registration is closed. Accounts are issued through an approved school programme.",
  );
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage(
      "/forgot-password",
      "error",
      "Password recovery is not configured on this deployment.",
    );
  }

  const email = readTrimmed(formData, "email").toLowerCase();

  if (!isValidEmail(email)) {
    redirectWithMessage(
      "/forgot-password",
      "error",
      "Enter a valid email address.",
    );
  }

  const supabase = await createClient();
  const redirectTo = `${getConfiguredSiteUrl()}/auth/callback?next=/update-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    redirectWithMessage(
      "/forgot-password",
      "error",
      "The reset request could not be sent. Try again shortly.",
    );
  }

  redirectWithMessage(
    "/forgot-password",
    "message",
    "If an account exists for that address, a password-reset email has been sent.",
  );
}

export async function updateRecoveredPassword(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage(
      "/update-password",
      "error",
      "Password recovery is unavailable.",
    );
  }

  const cookieStore = await cookies();

  if (
    !hasActivePasswordRecovery(
      cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value,
    )
  ) {
    redirectWithMessage(
      "/forgot-password",
      "error",
      "Open the newest password-recovery link from your email.",
    );
  }

  const password = readPassword(formData, "password");
  const confirmation = readPassword(formData, "confirmPassword");
  const validation = validateNewPassword(password);

  if (!validation.ok) {
    redirectWithMessage("/update-password", "error", validation.message);
  }

  if (password !== confirmation) {
    redirectWithMessage(
      "/update-password",
      "error",
      "The two passwords do not match.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirectWithMessage(
      "/forgot-password",
      "error",
      "The recovery session is invalid or has expired. Request a new link.",
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirectWithMessage(
      "/update-password",
      "error",
      "The password could not be updated. Request a new recovery link.",
    );
  }

  cookieStore.delete(PASSWORD_RECOVERY_COOKIE);

  const viewer = await getViewerFromClient(supabase);
  const target = viewer ? getRoleHome(viewer.role) : "/login";

  redirectWithMessage(target, "message", "Your password has been updated.");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
