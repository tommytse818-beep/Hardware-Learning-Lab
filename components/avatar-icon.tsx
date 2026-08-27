import type { AvatarKey } from "@/lib/avatars";

type AvatarIconProps = {
  avatarKey: AvatarKey;
  className?: string;
};

export function AvatarIcon({
  avatarKey,
  className = "h-6 w-6",
}: AvatarIconProps) {
  const common = {
    "aria-hidden": true,
    viewBox: "0 0 32 32",
    className,
    fill: "none",
  } as const;

  switch (avatarKey) {
    case "bot":
      return (
        <svg {...common}>
          <rect x="7" y="9" width="18" height="16" rx="5" stroke="currentColor" strokeWidth="1.9" />
          <path d="M16 9V5m-3 0h6M11 20h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="15" r="1.5" fill="currentColor" />
          <circle cx="20" cy="15" r="1.5" fill="currentColor" />
        </svg>
      );
    case "chip":
      return (
        <svg {...common}>
          <rect x="8" y="8" width="16" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.9" />
          <rect x="12" y="12" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M11 4v4m5-4v4m5-4v4M11 24v4m5-4v4m5-4v4M4 11h4m-4 5h4m-4 5h4m16-10h4m-4 5h4m-4 5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "orbit":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="3.2" fill="currentColor" />
          <ellipse cx="16" cy="16" rx="12" ry="5.8" stroke="currentColor" strokeWidth="1.7" transform="rotate(28 16 16)" />
          <ellipse cx="16" cy="16" rx="12" ry="5.8" stroke="currentColor" strokeWidth="1.7" transform="rotate(-28 16 16)" />
          <circle cx="26" cy="20" r="2" fill="currentColor" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M18.2 3 7.5 17.2h7.2L13.8 29l10.7-15.2h-7.1L18.2 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          <path d="M3 16h5l2.2-7.5L14 24l3.2-16 3.1 12.2 2.2-7.2H29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "rocket":
      return (
        <svg {...common}>
          <path d="M18.3 5.1c3.6-2.2 7.3-2 8.6-1.8.2 1.3.4 5-1.8 8.6L17 20l-5-5 6.3-9.9Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
          <circle cx="21.7" cy="8.3" r="2.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="m12.2 15.4-5.1 1.2-3.2 3.2 6.3.8m6.4-1.1-1.2 5.2-3.2 3.2-.8-6.3m-2.7 2.1-3.2 3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M26 5.5C16.2 6 8.5 10.5 8.5 19c0 4.5 3.2 7.5 7.5 7.5 8.3 0 10.4-9.2 10-21Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
          <path d="M5.5 27c4.3-8 9.8-11.8 16.7-15.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 3v4m0 18v4M3 16h4m18 0h4M6.8 6.8l2.8 2.8m12.8 12.8 2.8 2.8M25.2 6.8l-2.8 2.8M9.6 22.4l-2.8 2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M24.7 21.8A10.8 10.8 0 0 1 10.2 7.3 11.2 11.2 0 1 0 24.7 21.8Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m16 4 3.5 7.1 7.8 1.1-5.6 5.5 1.3 7.7-7-3.7-7 3.7 1.3-7.7-5.6-5.5 7.8-1.1L16 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "spark":
    default:
      return (
        <svg {...common}>
          <path d="M17.8 3 8 16.5h6.8L13.7 29 24 14.2h-6.7L17.8 3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
          <path d="M5 7.5h4M7 5.5v4m17 15h3m-1.5-1.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
}
