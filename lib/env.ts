const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

const PLACEHOLDER_PARTS = [
  "your_project",
  "your-project",
  "your_key",
  "your-key",
  "placeholder",
  "replace_me",
  "replace-with",
  "example.com",
  "<",
  ">",
  "...",
];

function containsPlaceholder(value: string) {
  const normalized = value.trim().toLowerCase();

  return (
    normalized.length === 0 ||
    PLACEHOLDER_PARTS.some((part) => normalized.includes(part))
  );
}

export function isValidSupabaseUrl(value: string) {
  if (containsPlaceholder(value)) {
    return false;
  }

  try {
    const parsed = new URL(value);

    return (
      (parsed.protocol === "https:" ||
        (parsed.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(parsed.hostname))) &&
      parsed.username.length === 0 &&
      parsed.password.length === 0
    );
  } catch {
    return false;
  }
}

export function isValidPublishableKey(value: string) {
  if (containsPlaceholder(value)) {
    return false;
  }

  if (value.startsWith("sb_publishable_")) {
    return value.length >= 28;
  }

  // Supabase legacy anon keys are JWT-shaped. Keep support while preferring
  // the modern publishable-key format.
  const parts = value.split(".");
  return (
    parts.length === 3 &&
    parts.every((part) => part.length > 10) &&
    value.startsWith("eyJ")
  );
}

function isValidServerSecret(value: string) {
  return !containsPlaceholder(value) && value.length >= 24;
}

export function isSupabaseConfigured() {
  return (
    isValidSupabaseUrl(supabaseUrl) &&
    isValidPublishableKey(supabasePublishableKey)
  );
}

export function getSupabaseConfig() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Add a valid project URL and publishable key to .env.local.",
    );
  }

  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
  };
}

export function getSupabaseAdminConfig() {
  if (!isSupabaseConfigured() || !isValidServerSecret(supabaseServiceRoleKey)) {
    throw new Error("Supabase server-only administrator access is not configured.");
  }

  return {
    url: supabaseUrl,
    serviceRoleKey: supabaseServiceRoleKey,
  };
}

export function getConfiguredSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!value || containsPlaceholder(value)) {
    return "http://localhost:3000";
  }

  try {
    const parsed = new URL(value);
    return parsed.origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function isPublicSignupEnabled() {
  return process.env.ENABLE_PUBLIC_SIGNUP === "true";
}

export function getSafeConfigurationStatus() {
  return {
    supabaseConfigured: isSupabaseConfigured(),
    serviceRoleConfigured: isValidServerSecret(supabaseServiceRoleKey),
  };
}
