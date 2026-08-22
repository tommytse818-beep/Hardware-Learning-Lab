export function parseEngineeringNumber(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const normalized = trimmed
    .toLowerCase()
    .replaceAll(",", "")
    .replaceAll("ω", "ohm")
    .replaceAll("Ω", "ohm");
  const match = normalized.match(
    /^([-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?)\s*(ohm|meg(?:ohm)?|k(?:ohm)?|m(?:ohm|illi)?|(?:u|µ)(?:ohm|icro)?|v|a)?$/,
  );
  if (!match) return null;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return null;
  const suffix = match[2] ?? "";
  const originalSuffix = trimmed.match(/[a-zA-ZµΩ]+$/)?.[0] ?? "";
  if (originalSuffix === "M" || originalSuffix === "MOhm") {
    return base * 1_000_000;
  }
  if (suffix.startsWith("k")) return base * 1_000;
  if (suffix.startsWith("meg")) return base * 1_000_000;
  if (suffix === "m" || suffix.startsWith("milli")) return base / 1_000;
  if (suffix === "u" || suffix === "µ" || suffix.startsWith("micro")) return base / 1_000_000;
  return base;
}