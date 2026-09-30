"use client";

import { useId, useRef } from "react";

import styles from "./open-guard-system-animation.module.css";

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
  const animationRef = useRef<SVGSVGElement>(null);
  const instanceId = useId().replaceAll(":", "");
  const backgroundId = `${instanceId}-drawer-bg`;
  const traceId = `${instanceId}-drawer-trace`;
  const titleId = `${instanceId}-drawer-title`;
  const descriptionId = `${instanceId}-drawer-description`;
  const publicIntroduction = variant === "public";

  function replayAnimation() {
    animationRef.current?.getAnimations({ subtree: true }).forEach((animation) => {
      animation.currentTime = 0;
      animation.play();
    });
  }

  return (
    <figure
      className={`${styles.frame} ${className}`}
    >
      <svg ref={animationRef} viewBox="0 0 960 560" role="img" aria-labelledby={`${titleId} ${descriptionId}`} className={styles.svg}>
        <title id={titleId}>DrawerSense Mini open, wait, remind and reset demonstration</title>
        <desc id={descriptionId}>The magnet remains fixed while the drawer-mounted PCB and secured battery holder move. A sustained open state triggers a reminder; closing clears the output and resets the cycle.</desc>
        <defs>
          <linearGradient id={backgroundId} x1="0" y1="0" x2="960" y2="560">
            <stop stopColor="#071018" />
            <stop offset="1" stopColor="#06120e" />
          </linearGradient>
          <linearGradient id={traceId} x1="390" y1="280" x2="835" y2="280">
            <stop stopColor="#67e8f9" />
            <stop offset=".52" stopColor="#6ee7b7" />
            <stop offset="1" stopColor="#c4b5fd" />
          </linearGradient>
        </defs>
        <rect width="960" height="560" rx="34" fill={`url(#${backgroundId})`} />
        <g opacity=".12">
          {Array.from({ length: 12 }).map((_, index) => (
            <path key={`v-${index}`} d={`M${index * 80} 0V560`} stroke="#94a3b8" />
          ))}
          {Array.from({ length: 8 }).map((_, index) => (
            <path key={`h-${index}`} d={`M0 ${index * 80}H960`} stroke="#94a3b8" />
          ))}
        </g>

        <text x="48" y="62" fill="#6ee7b7" fontSize="17" fontWeight="700" letterSpacing="3">
          {publicIntroduction ? "A DRAWER REMINDER · A WHOLE ENGINEERING LESSON" : "DRAWERSENSE MINI · CONCEPT SEQUENCE"}
        </text>

        <g>
          <rect x="48" y="116" width="330" height="286" rx="20" fill="#64748b" stroke="#94a3b8" strokeWidth="2" />
          <rect x="70" y="142" width="286" height="224" rx="10" fill="#0f172a" />
          <rect x="92" y="166" width="18" height="54" rx="5" fill="#f4cf6a" />
          <text x="62" y="438" fill="white" fontSize="16" fontWeight="700">FIXED MAGNET</text>
          <text x="62" y="462" fill="#94a3b8" fontSize="13">stays on the frame</text>
        </g>

        <g className={styles.drawer}>
          <rect x="116" y="188" width="222" height="160" rx="10" fill="#cdb695" stroke="#ead6b8" strokeWidth="3" />
          <rect x="142" y="216" width="104" height="82" rx="10" fill="#16465b" stroke="#67e8f9" strokeOpacity=".55" />
          <rect x="260" y="216" width="54" height="82" rx="10" fill="#334155" stroke="#94a3b8" />
          <rect x="126" y="210" width="10" height="34" rx="4" fill="#6ee7b7" />
          <circle cx="165" cy="256" r="8" fill="#6ee7b7" />
          <circle cx="200" cy="256" r="8" fill="#c4b5fd" />
          <circle cx="228" cy="256" r="8" fill="#fde68a" />
          <path d="M176 332h102" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          <text x="143" y="320" fill="#e2e8f0" fontSize="12">PCB + HOLDER MOVE</text>
        </g>

        <path d="M390 278H820" stroke={`url(#${traceId})`} strokeWidth="6" strokeLinecap="round" opacity=".35" />
        <path className={styles.pulse} d="M390 278H820" stroke={`url(#${traceId})`} strokeWidth="7" strokeLinecap="round" />

        {[
          [430, "SENSE", "reed state"],
          [550, "WAIT", "sustained open"],
          [670, "DECIDE", "logic"],
          [790, "DRIVE", "reminder"],
        ].map(([x, title, part], index) => (
          <g key={String(title)} className={styles.stage} style={{ animationDelay: `${index * 0.55}s` }}>
            <rect x={Number(x) - 48} y="222" width="96" height="112" rx="18" fill="#ffffff" fillOpacity=".055" stroke="#ffffff" strokeOpacity=".15" />
            <circle cx={Number(x)} cy="278" r="10" fill={index < 2 ? "#6ee7b7" : "#c4b5fd"} />
            <text x={Number(x)} y="196" fill="white" fontSize="14" fontWeight="700" textAnchor="middle">{title}</text>
            <text x={Number(x)} y="362" fill="#94a3b8" fontSize="12" textAnchor="middle">{part}</text>
          </g>
        ))}

        <g className={styles.alert}>
          <circle cx="876" cy="278" r="36" fill="#fde68a" fillOpacity=".12" stroke="#fde68a" strokeWidth="3" />
          <circle cx="876" cy="278" r="9" fill="#fde68a" />
          <path d="M910 250c24 14 24 42 0 56M926 234c43 25 43 63 0 88" stroke="#6ee7b7" strokeWidth="5" strokeLinecap="round" />
          <text x="838" y="360" fill="white" fontSize="15" fontWeight="700">REMIND</text>
          <text x="838" y="384" fill="#94a3b8" fontSize="12">light / alert optional</text>
        </g>

        <rect x="250" y="432" width="650" height="72" rx="17" fill="#020617" fillOpacity=".65" stroke="#ffffff" strokeOpacity=".1" />
        <text x="278" y="474" fill="#cbd5e1" fontSize="16">
          1 OPEN  →  2 WAIT  →  3 REMIND  →  4 CLOSE / RESET
        </text>
      </svg>

      {controls && (
        <button
          type="button"
          onClick={replayAnimation}
          className={styles.control}
        >
          Replay demonstration
        </button>
      )}
    </figure>
  );
}
