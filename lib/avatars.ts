export const AVATAR_KEYS = [
  "spark",
  "bot",
  "chip",
  "orbit",
  "bolt",
  "wave",
  "rocket",
  "leaf",
  // Legacy keys remain renderable for existing accounts.
  "sun",
  "moon",
  "star",
] as const;

export type AvatarKey = (typeof AVATAR_KEYS)[number];

export type AvatarOption = {
  key: AvatarKey;
  label: string;
  description: string;
  gradient: string;
  featured: boolean;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    key: "spark",
    label: "Spark",
    description: "A first idea becoming a circuit.",
    gradient: "from-amber-400 via-orange-400 to-rose-500",
    featured: true,
  },
  {
    key: "bot",
    label: "Build Bot",
    description: "A friendly maker and testing companion.",
    gradient: "from-cyan-400 via-sky-500 to-indigo-600",
    featured: true,
  },
  {
    key: "chip",
    label: "Microchip",
    description: "Signals, logic and careful connections.",
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    featured: true,
  },
  {
    key: "orbit",
    label: "Orbit",
    description: "Curiosity that keeps exploring.",
    gradient: "from-violet-400 via-indigo-500 to-sky-500",
    featured: true,
  },
  {
    key: "bolt",
    label: "Energy",
    description: "Power, action and a clear next step.",
    gradient: "from-yellow-300 via-amber-400 to-orange-500",
    featured: true,
  },
  {
    key: "wave",
    label: "Signal",
    description: "Measurements and information in motion.",
    gradient: "from-blue-400 via-cyan-400 to-emerald-400",
    featured: true,
  },
  {
    key: "rocket",
    label: "Launch",
    description: "Turn a tested idea into a real result.",
    gradient: "from-fuchsia-400 via-violet-500 to-indigo-600",
    featured: true,
  },
  {
    key: "leaf",
    label: "Green Circuit",
    description: "Engineering with people and planet in mind.",
    gradient: "from-lime-400 via-emerald-500 to-teal-600",
    featured: true,
  },
  {
    key: "sun",
    label: "Sun",
    description: "Legacy avatar.",
    gradient: "from-amber-400 to-orange-500",
    featured: false,
  },
  {
    key: "moon",
    label: "Moon",
    description: "Legacy avatar.",
    gradient: "from-slate-400 to-indigo-500",
    featured: false,
  },
  {
    key: "star",
    label: "Star",
    description: "Legacy avatar.",
    gradient: "from-violet-400 to-fuchsia-500",
    featured: false,
  },
];

export function isAvatarKey(value: string): value is AvatarKey {
  return (AVATAR_KEYS as readonly string[]).includes(value);
}

export function getAvatarOption(value?: string | null) {
  return (
    AVATAR_OPTIONS.find((option) => option.key === value) ??
    AVATAR_OPTIONS[0]
  );
}

export function getFeaturedAvatarOptions() {
  return AVATAR_OPTIONS.filter((option) => option.featured);
}
