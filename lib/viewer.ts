import type { SupabaseClient } from "@supabase/supabase-js";

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

type ProfileRow = {
  role: string;
  display_name: string | null;
  leaderboard_alias: string | null;
  avatar_key: string | null;
  bio: string | null;
  leaderboard_opt_in: boolean;
  must_change_password: boolean;
};

function parseRole(value: string): ViewerRole | null {
  if (value === "admin" || value === "teacher" || value === "student") {
    return value;
  }

  return null;
}

export async function getViewerFromClient(
  supabase: SupabaseClient,
): Promise<Viewer | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select(
      "role, display_name, leaderboard_alias, avatar_key, bio, leaderboard_opt_in, must_change_password",
    )
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (profileError) {
    // Never log tokens, cookies, passwords or the full user record.
    console.error("Profile lookup failed", {
      code: profileError.code,
      userId: user.id,
    });
    return null;
  }

  if (!data) {
    console.error("Authenticated account has no provisioned profile", {
      userId: user.id,
    });
    return null;
  }

  const role = parseRole(data.role);

  if (!role) {
    console.error("Profile contains an unsupported role", {
      userId: user.id,
    });
    return null;
  }

  const fallbackName = user.email?.split("@")[0] || "Learner";
  const displayName = data.display_name?.trim() || fallbackName;
  const leaderboardAlias = data.leaderboard_alias?.trim() || displayName;

  return {
    id: user.id,
    email: user.email || "account",
    displayName,
    leaderboardAlias,
    role,
    demo: false,
    verified: Boolean(user.email_confirmed_at),
    mustChangePassword: data.must_change_password,
    avatar: data.avatar_key?.trim() || "spark",
    bio:
      data.bio?.trim() ||
      "School learner building practical electronics skills.",
    leaderboardOptIn: data.leaderboard_opt_in,
  };
}

export async function getViewer(): Promise<Viewer | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  return getViewerFromClient(supabase);
}
