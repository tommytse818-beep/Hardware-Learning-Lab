"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

const ALLOWED_AVATAR_KEYS = new Set(["sun", "moon", "star", "leaf"]);

function readField(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(pathname: string, type: "error" | "message", message: string) {
  const params = new URLSearchParams({ [type]: message });
  redirect(`${pathname}?${params.toString()}`);
}

export async function completeFirstLogin(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage("/login", "error", "Connect Supabase before completing your first login.");
  }

  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  const password = readField(formData, "password");
  const confirmPassword = readField(formData, "confirmPassword");
  const displayName = readField(formData, "displayName") || viewer.displayName || "Student";
  const alias = readField(formData, "alias") || viewer.leaderboardAlias || viewer.displayName || "Learner";
  const bio = readField(formData, "bio") || viewer.bio || "School learner building practical electronics skills.";
  const avatarValue = readField(formData, "avatar");
  const avatar = ALLOWED_AVATAR_KEYS.has(avatarValue) ? avatarValue : viewer.avatar || "sun";
  const leaderboardOptIn = formData.get("leaderboardOptIn") === "on";

  if (password.length < 8) {
    redirectWithMessage("/first-login", "error", "Use a password with at least 8 characters.");
  }

  if (password !== confirmPassword) {
    redirectWithMessage("/first-login", "error", "The password confirmation does not match.");
  }

  if (displayName.length > 60) {
    redirectWithMessage("/first-login", "error", "Display name is too long.");
  }

  if (alias.length > 24) {
    redirectWithMessage("/first-login", "error", "Leaderboard alias must be 24 characters or fewer.");
  }

  if (bio.length > 280) {
    redirectWithMessage("/first-login", "error", "Bio is too long. Keep it under 280 characters.");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || user.id !== viewer.id) {
    redirect("/login");
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password });

  if (passwordError) {
    redirectWithMessage("/first-login", "error", "Your password could not be updated. Please try again.");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      leaderboard_alias: alias,
      avatar_key: avatar,
      bio,
      leaderboard_opt_in: leaderboardOptIn,
      must_change_password: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", viewer.id);

  if (profileError) {
    redirectWithMessage("/first-login", "error", "Your profile could not be saved. Please try again.");
  }

  const roleHome =
    viewer.role === "admin"
      ? "/admin"
      : viewer.role === "teacher"
        ? "/teacher"
        : "/dashboard";

  redirect(roleHome);
}

export async function updateDisplaySettings(formData: FormData) {
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  const displayName = readField(formData, "displayName") || viewer.displayName || "Student";
  const alias = readField(formData, "alias") || viewer.leaderboardAlias || viewer.displayName || "Learner";
  const bio = readField(formData, "bio") || viewer.bio || "School learner building practical electronics skills.";
  const avatarValue = readField(formData, "avatar");
  const avatar = ALLOWED_AVATAR_KEYS.has(avatarValue) ? avatarValue : viewer.avatar || "sun";
  const leaderboardOptIn = formData.get("leaderboardOptIn") === "on";

  if (displayName.length > 60) {
    redirectWithMessage("/settings", "error", "Display name is too long.");
  }

  if (alias.length > 24) {
    redirectWithMessage("/settings", "error", "Leaderboard alias must be 24 characters or fewer.");
  }

  if (bio.length > 280) {
    redirectWithMessage("/settings", "error", "Bio is too long. Keep it under 280 characters.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      leaderboard_alias: alias,
      avatar_key: avatar,
      bio,
      leaderboard_opt_in: leaderboardOptIn,
      updated_at: new Date().toISOString(),
    })
    .eq("id", viewer.id);

  if (error) {
    redirectWithMessage("/settings", "error", "Profile changes could not be saved. Please try again.");
  }

  redirectWithMessage("/settings", "message", "Profile saved successfully.");
}

export async function updatePassword(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage("/settings", "error", "Connect Supabase before changing your password.");
  }

  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  const password = readField(formData, "newPassword");
  const confirmPassword = readField(formData, "confirmPassword");

  if (password.length < 8) {
    redirectWithMessage("/settings", "error", "Use a password with at least 8 characters.");
  }

  if (password !== confirmPassword) {
    redirectWithMessage("/settings", "error", "The new password does not match the confirmation.");
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user || user.id !== viewer.id) {
    redirect("/login");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirectWithMessage("/settings", "error", "The password could not be updated. Please try again.");
  }

  redirectWithMessage("/settings", "message", "Password updated successfully.");
}
