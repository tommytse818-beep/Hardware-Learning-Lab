"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAvatarKey } from "@/lib/avatars";
import { isSupabaseConfigured } from "@/lib/env";
import { validateNewPassword } from "@/lib/password-policy";
import { getRoleHome } from "@/lib/role-home";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

function readTrimmed(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function readPassword(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function redirectWithMessage(
  pathname: string,
  type: "error" | "message",
  message: string,
): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`${pathname}?${params.toString()}`);
}

type ProfileFormResult =
  | { ok: false; error: string }
  | {
      ok: true;
      value: {
        display_name: string;
        leaderboard_alias: string;
        avatar_key: string;
        bio: string;
        leaderboard_opt_in: boolean;
      };
    };

function readProfile(formData: FormData, fallbackName: string): ProfileFormResult {
  const displayName = readTrimmed(formData, "displayName") || fallbackName;
  const alias = readTrimmed(formData, "alias") || displayName;
  const bio = readTrimmed(formData, "bio");
  const avatarValue = readTrimmed(formData, "avatar");
  const avatar = isAvatarKey(avatarValue) ? avatarValue : "spark";
  const leaderboardOptIn = formData.get("leaderboardOptIn") === "on";

  if (displayName.length > 60) {
    return { ok: false, error: "Display name must be 60 characters or fewer." };
  }

  if (alias.length > 32) {
    return { ok: false, error: "Leaderboard alias must be 32 characters or fewer." };
  }

  if (bio.length > 280) {
    return { ok: false, error: "Bio must be 280 characters or fewer." };
  }

  return {
    ok: true,
    value: {
      display_name: displayName,
      leaderboard_alias: alias,
      avatar_key: avatar,
      bio,
      leaderboard_opt_in: leaderboardOptIn,
    },
  };
}

export async function completeFirstLogin(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage("/login", "error", "Account setup is unavailable.");
  }

  const viewer = await getViewer();

  if (!viewer?.id) {
    redirect("/login");
  }

  if (!viewer.mustChangePassword) {
    redirect(getRoleHome(viewer.role));
  }

  const password = readPassword(formData, "password");
  const confirmation = readPassword(formData, "confirmPassword");
  const validation = validateNewPassword(password);

  if (!validation.ok) {
    redirectWithMessage("/first-login", "error", validation.message);
  }

  if (password !== confirmation) {
    redirectWithMessage(
      "/first-login",
      "error",
      "The password confirmation does not match.",
    );
  }

  const profile = readProfile(formData, viewer.displayName);

  if (!profile.ok) {
    redirectWithMessage("/first-login", "error", profile.error);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || user.id !== viewer.id) {
    redirect("/login");
  }

  const { error: passwordError } = await supabase.auth.updateUser({
    password,
  });

  if (passwordError) {
    redirectWithMessage(
      "/first-login",
      "error",
      "Your new password could not be saved. Try again.",
    );
  }

  let profileUpdateFailed = false;

  try {
    const { error: profileError } = await createAdminClient()
      .from("profiles")
      .update({
        ...profile.value,
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", viewer.id);

    profileUpdateFailed = Boolean(profileError);
  } catch {
    profileUpdateFailed = true;
  }

  if (profileUpdateFailed) {
    redirectWithMessage(
      "/first-login",
      "error",
      "Your password changed, but profile setup is incomplete. Submit this page again after the server-only Supabase key is configured.",
    );
  }

  revalidatePath("/", "layout");
  redirect(getRoleHome(viewer.role));
}

export async function updateDisplaySettings(formData: FormData) {
  const viewer = await getViewer();

  if (!viewer?.id) {
    redirect("/login");
  }

  if (viewer.mustChangePassword) {
    redirect("/first-login");
  }

  const profile = readProfile(formData, viewer.displayName);

  if (!profile.ok) {
    redirectWithMessage("/settings", "error", profile.error);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(profile.value)
    .eq("id", viewer.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirectWithMessage(
      "/settings",
      "error",
      "Profile changes could not be saved.",
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/profile");
  revalidatePath("/settings");
  redirectWithMessage("/settings", "message", "Profile saved.");
}

export async function updatePasswordFromSettings(formData: FormData) {
  const viewer = await getViewer();

  if (!viewer?.id) {
    redirect("/login");
  }

  if (viewer.mustChangePassword) {
    redirect("/first-login");
  }

  const currentPassword = readPassword(formData, "currentPassword");
  const newPassword = readPassword(formData, "newPassword");
  const confirmation = readPassword(formData, "confirmPassword");
  const validation = validateNewPassword(newPassword);

  if (currentPassword.length === 0) {
    redirectWithMessage(
      "/settings",
      "error",
      "Enter your current password before choosing a new one.",
    );
  }

  if (!validation.ok) {
    redirectWithMessage("/settings", "error", validation.message);
  }

  if (newPassword !== confirmation) {
    redirectWithMessage(
      "/settings",
      "error",
      "The new password does not match the confirmation.",
    );
  }

  const supabase = await createClient();
  const { data: verified, error: verifyError } =
    await supabase.auth.signInWithPassword({
      email: viewer.email,
      password: currentPassword,
    });

  if (
    verifyError ||
    !verified.user ||
    verified.user.id !== viewer.id
  ) {
    redirectWithMessage(
      "/settings",
      "error",
      "The current password is incorrect.",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    redirectWithMessage(
      "/settings",
      "error",
      "The password could not be changed. Try again.",
    );
  }

  redirectWithMessage("/settings", "message", "Password updated.");
}
