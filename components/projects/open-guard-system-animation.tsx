type OpenGuardSystemAnimationProps = {
  className?: string;
  controls?: boolean;
  variant?: "card" | "public";
};

export function OpenGuardSystemAnimation({
  className = "",
  controls = false,
  variant = "card",
}: OpenGuardSystemAnimationProps) {
  const publicIntroduction = variant === "public";
  const stem = publicIntroduction
    ? "/media/projects/open-guard-mini/open-guard-public-introduction"
    : "/media/projects/open-guard-mini/open-guard-system-preview";

  return (
    <video
      className={className}
      autoPlay
      muted
      loop={!publicIntroduction}
      playsInline
      controls={controls}
      preload="metadata"
      poster={`${stem}-poster.webp`}
      aria-label={
        publicIntroduction
          ? "Public OpenGuard Mini introduction showing how a physical opening becomes a timed electronic alert"
          : "Four-second concept animation showing a door opening, a sensor changing state, a timed logic decision and an LED and buzzer alert"
      }
    >
      <source src={`${stem}.webm`} type="video/webm" />
      <source src={`${stem}.mp4`} type="video/mp4" />
      Your browser does not support the project preview video.
    </video>
  );
}
