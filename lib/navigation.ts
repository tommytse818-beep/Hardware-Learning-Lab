const INTERNAL_ORIGIN = "https://internal.local";

export function safeInternalPath(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (value.includes("\\") || value.includes("\0")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, INTERNAL_ORIGIN);

    if (parsed.origin !== INTERNAL_ORIGIN) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
