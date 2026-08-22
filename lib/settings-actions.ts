"use server";

import { redirect } from "next/navigation";

import { getViewer } from "@/lib/viewer";

export async function completeFirstLogin(formData: FormData) {
  const displayName = (formData.get("displayName") ?? "").toString().trim();
  const alias = (formData.get("alias") ?? "").toString().trim();
  const bio = (formData.get("bio") ?? "").toString().trim();
  const avatar = (formData.get("avatar") ?? "sun").toString();
  const leaderboardOptIn = formData.get("leaderboardOptIn") === "on";
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  const finalDisplayName = displayName || viewer.displayName || "Student";
  const finalAlias = alias || viewer.displayName || "Learner";
  const finalBio = bio || viewer.bio || "School learner building practical electronics skills.";

  redirect(
    `/dashboard?message=${encodeURIComponent(
      `Welcome ${finalDisplayName}. Your account is ready and leaderboard participation is ${leaderboardOptIn ? "enabled" : "off"}. Alias: ${finalAlias}. Avatar: ${avatar}. Bio: ${finalBio}.`,
    )}`,
  );
}

export async function updateDisplaySettings(formData: FormData) {
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/login");
  }

  const displayName = (formData.get("displayName") ?? "").toString().trim();
  const alias = (formData.get("alias") ?? "").toString().trim();
  const bio = (formData.get("bio") ?? "").toString().trim();
  const avatarValue = formData.get("avatar");
  const avatar =
    typeof avatarValue === "string" && avatarValue.length > 0
      ? avatarValue
      : viewer.avatar || "sun";
  const leaderboardOptIn = formData.get("leaderboardOptIn") === "on";

  redirect(
    `/settings?message=${encodeURIComponent(
      `Profile saved. Display name: ${displayName || viewer.displayName}. Alias: ${alias || viewer.displayName}. Avatar: ${avatar}. Leaderboard opt-in: ${leaderboardOptIn ? "enabled" : "disabled"}. Bio: ${bio || viewer.bio}.`,
    )}`,
  );
}
