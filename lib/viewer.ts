import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type ViewerRole = "admin" | "teacher" | "student";

export type Viewer = {
  id: string | null;
  email: string;
  displayName: string;
  leaderboardAlias: string;
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
    if (process.env.NODE_ENV === "production") {
      return null;
    }

    return {
      id: null,
      email: "demo.student@example.com",
      displayName: "Demo Student",
      leaderboardAlias: "Demo",
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
      "role, display_name, leaderboard_alias, avatar_key, bio, leaderboard_opt_in, must_change_password",
    )
    .eq("id", user.id)
    .maybeSingle();

  const safeProfile = profile ?? {
    role: user.user_metadata?.role,
    display_name: user.user_metadata?.display_name,
    leaderboard_alias: user.user_metadata?.leaderboard_alias,
    avatar_key: user.user_metadata?.avatar,
    bio: user.user_metadata?.bio,
    leaderboard_opt_in:
      user.user_metadata?.leaderboard_opt_in === true ||
      user.user_metadata?.leaderboardOptIn === true,
    must_change_password:
      user.user_metadata?.must_change_password === true ||
      user.user_metadata?.force_reset === true,
  };

  const metadataName = user.user_metadata?.display_name;
  const displayName =
    typeof safeProfile.display_name === "string" && safeProfile.display_name.trim().length > 0
      ? safeProfile.display_name.trim()
      : typeof metadataName === "string" && metadataName.trim().length > 0
        ? metadataName.trim()
        : user.email?.split("@")[0] ?? "Student";

  const roleValue = safeProfile.role;
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
    leaderboardAlias:
      typeof safeProfile.leaderboard_alias === "string" &&
      safeProfile.leaderboard_alias.trim().length > 0
        ? safeProfile.leaderboard_alias.trim()
        : displayName,
    role,
    demo: false,
    verified: Boolean(user.email_confirmed_at),
    mustChangePassword:
      safeProfile.must_change_password ??
      (user.user_metadata?.must_change_password === true ||
        user.user_metadata?.force_reset === true),
    avatar:
      typeof safeProfile.avatar_key === "string" && safeProfile.avatar_key.trim().length > 0
        ? safeProfile.avatar_key
        : typeof user.user_metadata?.avatar === "string"
          ? user.user_metadata.avatar
          : "sun",
    bio:
      typeof safeProfile.bio === "string" && safeProfile.bio.trim().length > 0
        ? safeProfile.bio.trim()
        : typeof user.user_metadata?.bio === "string"
          ? user.user_metadata.bio
          : "School learner building practical electronics skills.",
    leaderboardOptIn:
      safeProfile.leaderboard_opt_in ??
      (user.user_metadata?.leaderboard_opt_in === true ||
        user.user_metadata?.leaderboardOptIn === true),
  };
}
