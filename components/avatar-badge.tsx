import { AvatarIcon } from "@/components/avatar-icon";
import { getAvatarOption } from "@/lib/avatars";

type AvatarBadgeProps = {
  name: string;
  avatarKey?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
};

const iconMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-10 w-10",
};

export function AvatarBadge({
  name,
  avatarKey,
  size = "md",
}: AvatarBadgeProps) {
  const avatar = getAvatarOption(avatarKey);

  return (
    <div
      role="img"
      aria-label={`${name}: ${avatar.label} avatar`}
      title={`${name} · ${avatar.label}`}
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${avatar.gradient} text-white shadow-sm ring-1 ring-black/5 ${sizeMap[size]}`}
    >
      <AvatarIcon avatarKey={avatar.key} className={iconMap[size]} />
    </div>
  );
}
