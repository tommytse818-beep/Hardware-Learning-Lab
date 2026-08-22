import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type ViewerRole = "admin" | "teacher" | "student";

export type Viewer = {
  id: string | null;
  email: string;
  displayName: string;
  role: ViewerRole;
  demo: boolean;
  verified: boolean;
  mustChangePassword: boolean;
  avatar: string;
  bio: string;
  leaderboardOptIn: boolean;
};

export async function getViewer(): Promise<Viewer | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: null,
      email: "demo.student@example.com",
      displayName: "Demo Student",
      role: "student",
      demo: true,
      verified: true,
      mustChangePassword: false,
      avatar: "sun",
      bio: "Prototype learner reviewing the local platform.",
      leaderboardOptIn: false,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "role, display_name, avatar_key, leaderboard_opt_in, must_change_password",
    )
    .eq("id", user.id)
    .maybeSingle();

  // Prefer the application's profile name.
  // Keep Auth metadata/email as a fallback.
  const metadataName = user.user_metadata?.display_name;

  const displayName =
    typeof profile?.display_name === "string" &&
    profile.display_name.trim().length > 0
      ? profile.display_name.trim()
      : typeof metadataName === "string" && metadataName.trim().length > 0
        ? metadataName.trim()
        : user.email?.split("@")[0] ?? "Student";

  // IMPORTANT:
  // Admin / teacher / student authority comes from public.profiles,
  // not editable Auth user metadata.
  const roleValue = profile?.role;

  const role: ViewerRole =
    roleValue === "admin" ||
    roleValue === "teacher" ||
    roleValue === "student"
      ? roleValue
      : "student";

  return {
    id: user.id,
    email: user.email ?? "student",
    displayName,
    role,
    demo: false,
    verified: Boolean(user.email_confirmed_at),

    mustChangePassword:
      profile?.must_change_password ??
      (user.user_metadata?.must_change_password === true ||
        user.user_metadata?.force_reset === true),

    // Use the database avatar first, while preserving your old
    // Auth-metadata behaviour as a fallback.
    avatar:
      typeof profile?.avatar_key === "string" &&
      profile.avatar_key.trim().length > 0
        ? profile.avatar_key
        : typeof user.user_metadata?.avatar === "string"
          ? user.user_metadata.avatar
          : "sun",

    // Keep your existing bio logic unchanged because your
    // current profiles table does not contain a bio column.
    bio:
      typeof user.user_metadata?.bio === "string"
        ? user.user_metadata.bio
        : "School learner building practical electronics skills.",

    // Database value is authoritative, but preserve the old
    // metadata fallback if a profile is ever missing.
    leaderboardOptIn:
      profile?.leaderboard_opt_in ??
      (user.user_metadata?.leaderboard_opt_in === true ||
        user.user_metadata?.leaderboardOptIn === true),
  };
}
