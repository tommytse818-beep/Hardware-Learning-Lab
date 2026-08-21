const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

function isPlaceholder(value: string) {
  return (
    value.length === 0 ||
    value.includes("YOUR_PROJECT") ||
    value.includes("YOUR_KEY")
  );
}

export function isSupabaseConfigured() {
  return !isPlaceholder(supabaseUrl) && !isPlaceholder(supabasePublishableKey);
}

export function getSupabaseConfig() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and add your project URL and publishable key.",
    );
  }

  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
  };
}

export function getConfiguredSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!value) {
    return "http://localhost:3000";
  }

  return value.replace(/\/+$/, "");
}
