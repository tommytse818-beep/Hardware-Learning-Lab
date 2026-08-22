type AvatarBadgeProps = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function AvatarBadge({ name, size = "md" }: AvatarBadgeProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "HL";

  return (
    <div
      aria-label={name}
      className={`grid place-items-center rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-indigo-500 font-bold text-white shadow-sm ${sizeMap[size]}`}
    >
      {initials}
    </div>
  );
}
