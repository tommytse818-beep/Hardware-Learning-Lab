import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string | null;
  email: string;
  displayName: string;
  demo: boolean;
  verified: boolean;
};

export async function getViewer(): Promise<Viewer | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: null,
      email: "demo.student@example.com",
      displayName: "Demo Student",
      demo: true,
      verified: true,
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

  return {
    id: user.id,
    email: user.email ?? "student",
    displayName,
    demo: false,
    verified: Boolean(user.email_confirmed_at),
  };
}
