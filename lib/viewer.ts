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

  const metadataName = user.user_metadata?.display_name;
  const displayName =
    typeof metadataName === "string" && metadataName.trim().length > 0
      ? metadataName.trim()
      : user.email?.split("@")[0] ?? "Student";

  const roleValue = user.user_metadata?.role;
  const role: ViewerRole =
    roleValue === "admin" || roleValue === "teacher" || roleValue === "student"
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
      user.user_metadata?.must_change_password === true ||
      user.user_metadata?.force_reset === true,
    avatar: typeof user.user_metadata?.avatar === "string" ? user.user_metadata.avatar : "sun",
    bio:
      typeof user.user_metadata?.bio === "string"
        ? user.user_metadata.bio
        : "School learner building practical electronics skills.",
    leaderboardOptIn:
      user.user_metadata?.leaderboard_opt_in === true ||
      user.user_metadata?.leaderboardOptIn === true,
  };
}
