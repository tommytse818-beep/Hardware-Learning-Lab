type AvatarBadgeProps = {
  name: string;
  avatarKey?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const avatarClasses: Record<string, string> = {
  sun: "from-amber-400 to-orange-500",
  moon: "from-slate-400 to-indigo-500",
  star: "from-violet-400 to-fuchsia-500",
  leaf: "from-emerald-400 to-teal-500",
};

function getInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "HL";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AvatarBadge({
  name,
  avatarKey,
  size = "md",
}: AvatarBadgeProps) {
  const initials = getInitials(name);
  const safeKey = avatarKey && avatarKey in avatarClasses ? avatarKey : "sun";
  const gradient = avatarClasses[safeKey] ?? "from-emerald-400 via-cyan-400 to-indigo-500";

  return (
    <div
      role="img"
      aria-label={`${name} avatar`}
      title={name}
      className={`grid place-items-center rounded-full bg-gradient-to-br ${gradient} font-bold text-white shadow-sm ${sizeMap[size]}`}
    >
      {initials}
    </div>
  );
}
