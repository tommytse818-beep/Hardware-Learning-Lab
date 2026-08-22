"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  getConfiguredSiteUrl,
  isPublicSignupEnabled,
  isSupabaseConfigured,
} from "@/lib/env";
import { safeInternalPath } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
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

async function getRequestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin.replace(/\/+$/, "");
  }

  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");

  if (host) {
    const forwardedProtocol = headerStore.get("x-forwarded-proto");
    const protocol =
      forwardedProtocol ?? (host.includes("localhost") ? "http" : "https");

    return `${protocol}://${host}`;
  }

  return getConfiguredSiteUrl();
}

export async function login(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage(
      "/login",
      "error",
      "Connect Supabase first. The visual prototype is currently running in demo mode.",
    );
  }

  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");
  const next = safeInternalPath(readText(formData, "next"));

  if (!isValidEmail(email) || password.length === 0) {
    redirectWithMessage(
      "/login",
      "error",
      "Enter a valid email address and password.",
      { next },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message =
      error.message.toLowerCase().includes("email not confirmed")
        ? "Confirm your email address before signing in."
        : "The email or password is incorrect.";

    redirectWithMessage("/login", "error", message, { next });
  }

  redirect(next);
}

export async function signup(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage(
      "/signup",
      "error",
      "Connect Supabase first. Account creation is disabled in demo mode.",
    );
  }

  if (!isPublicSignupEnabled()) {
    redirectWithMessage("/signup", "error", "Public registration is currently closed. Ask your school administrator for an invitation.");
  }

  const displayName = readText(formData, "displayName");
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");
  const confirmPassword = readText(formData, "confirmPassword");

  if (displayName.length < 2) {
    redirectWithMessage(
      "/signup",
      "error",
      "Enter the student's display name.",
    );
  }

  if (!isValidEmail(email)) {
    redirectWithMessage(
      "/signup",
      "error",
      "Enter a valid email address.",
    );
  }

  if (password.length < 8) {
    redirectWithMessage(
      "/signup",
      "error",
      "Use a password with at least 8 characters.",
    );
  }

  if (password !== confirmPassword) {
    redirectWithMessage(
      "/signup",
      "error",
      "The two passwords do not match.",
    );
  }

  const origin = await getRequestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    redirectWithMessage(
      "/signup",
      "error",
      "The account could not be created. Check the details and try again.",
    );
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirectWithMessage(
    "/login",
    "message",
    "Check your email and select the confirmation link. Then sign in.",
  );
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage(
      "/forgot-password",
      "error",
      "Connect Supabase first. Password email is disabled in demo mode.",
    );
  }

  const email = readText(formData, "email").toLowerCase();

  if (!isValidEmail(email)) {
    redirectWithMessage(
      "/forgot-password",
      "error",
      "Enter a valid email address.",
    );
  }

  const origin = await getRequestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  if (error) {
    redirectWithMessage(
      "/forgot-password",
      "error",
      "The reset request could not be sent. Try again shortly.",
    );
  }

  // Keep this generic so the page does not reveal whether an account exists.
  redirectWithMessage(
    "/forgot-password",
    "message",
    "If an account exists for that address, a password-reset email has been sent.",
  );
}

export async function updatePassword(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage(
      "/update-password",
      "error",
      "Connect Supabase first.",
    );
  }

  const password = readText(formData, "password");
  const confirmPassword = readText(formData, "confirmPassword");

  if (password.length < 8) {
    redirectWithMessage(
      "/update-password",
      "error",
      "Use a password with at least 8 characters.",
    );
  }

  if (password !== confirmPassword) {
    redirectWithMessage(
      "/update-password",
      "error",
      "The two passwords do not match.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirectWithMessage(
      "/login",
      "error",
      "Open the newest password-reset link from your email.",
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirectWithMessage(
      "/update-password",
      "error",
      "The password could not be updated. Request a new reset link.",
    );
  }

  redirectWithMessage(
    "/dashboard",
    "message",
    "Your password has been updated.",
  );
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
