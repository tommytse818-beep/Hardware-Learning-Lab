"use client";

import { useState } from "react";

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
  const [paused, setPaused] = useState(false);
  const publicIntroduction = variant === "public";

  return (
    <figure
      className={`${styles.frame} ${paused ? styles.paused : ""} ${className}`}
      aria-label={
        publicIntroduction
          ? "OpenGuard Mini introduction: a door opening changes a reed sensor state, a visible logic chain waits, decides and drives an LED and buzzer"
          : "OpenGuard Mini signal animation from reed sensor through timing and logic to the output alert"
      }
    >
      <svg viewBox="0 0 960 560" role="img" className={styles.svg}>
        <defs>
          <linearGradient id="og-bg" x1="0" y1="0" x2="960" y2="560">
            <stop stopColor="#071018" />
            <stop offset="1" stopColor="#06120e" />
          </linearGradient>
          <linearGradient id="og-trace" x1="220" y1="280" x2="820" y2="280">
            <stop stopColor="#67e8f9" />
            <stop offset=".52" stopColor="#6ee7b7" />
            <stop offset="1" stopColor="#c4b5fd" />
          </linearGradient>
        </defs>
        <rect width="960" height="560" rx="34" fill="url(#og-bg)" />
        <g opacity=".12">
          {Array.from({ length: 12 }).map((_, index) => (
            <path key={`v-${index}`} d={`M${index * 80} 0V560`} stroke="#94a3b8" />
          ))}
          {Array.from({ length: 8 }).map((_, index) => (
            <path key={`h-${index}`} d={`M0 ${index * 80}H960`} stroke="#94a3b8" />
          ))}
        </g>

        <text x="48" y="62" fill="#6ee7b7" fontSize="17" fontWeight="700" letterSpacing="3">
          {publicIntroduction ? "A REAL OPENING BECOMES A TESTABLE ALERT" : "VISIBLE SIGNAL CHAIN"}
        </text>

        <g className={styles.door}>
          <rect x="54" y="126" width="142" height="286" rx="14" fill="#0f172a" stroke="#94a3b8" strokeOpacity=".5" strokeWidth="2" />
          <path d="M165 144V394" stroke="#334155" strokeWidth="6" />
          <circle cx="86" cy="274" r="7" fill="#e2e8f0" />
          <rect x="202" y="228" width="12" height="78" rx="6" fill="#a7f3d0" />
          <rect x="228" y="238" width="18" height="58" rx="8" fill="#6ee7b7" fillOpacity=".26" stroke="#6ee7b7" />
          <path d="M214 267H228" stroke="#6ee7b7" strokeWidth="4" strokeDasharray="5 6" />
          <text x="54" y="448" fill="white" fontSize="17" fontWeight="700">REED SENSOR</text>
          <text x="54" y="474" fill="#94a3b8" fontSize="14">door state</text>
        </g>

        <path d="M248 278H812" stroke="url(#og-trace)" strokeWidth="6" strokeLinecap="round" opacity=".35" />
        <path className={styles.pulse} d="M248 278H812" stroke="url(#og-trace)" strokeWidth="7" strokeLinecap="round" />

        {[
          [330, "WAIT", "RC"],
          [480, "CLEAN", "74HC14"],
          [630, "DECIDE", "74HC08"],
          [780, "DRIVE", "2N3904"],
        ].map(([x, title, part], index) => (
          <g key={String(title)} className={styles.stage} style={{ animationDelay: `${index * 0.55}s` }}>
            <rect x={Number(x) - 54} y="218" width="108" height="120" rx="20" fill="#ffffff" fillOpacity=".055" stroke="#ffffff" strokeOpacity=".15" />
            <circle cx={Number(x)} cy="278" r="10" fill={index < 2 ? "#6ee7b7" : "#c4b5fd"} />
            <text x={Number(x)} y="196" fill="white" fontSize="14" fontWeight="700" textAnchor="middle">{title}</text>
            <text x={Number(x)} y="368" fill="#94a3b8" fontSize="12" textAnchor="middle">{part}</text>
          </g>
        ))}

        <g className={styles.alert}>
          <circle cx="865" cy="278" r="42" fill="#fde68a" fillOpacity=".12" stroke="#fde68a" strokeWidth="3" />
          <circle cx="865" cy="278" r="9" fill="#fde68a" />
          <path d="M904 248c30 15 30 45 0 60M922 229c55 28 55 70 0 98" stroke="#6ee7b7" strokeWidth="5" strokeLinecap="round" />
          <text x="826" y="366" fill="white" fontSize="15" fontWeight="700">LED + BUZZER</text>
          <text x="826" y="390" fill="#94a3b8" fontSize="12">opening reminder</text>
        </g>

        <rect x="274" y="438" width="534" height="66" rx="17" fill="#020617" fillOpacity=".65" stroke="#ffffff" strokeOpacity=".1" />
        <text x="302" y="477" fill="#cbd5e1" fontSize="15">
          ARMED · DOOR OPEN · DELAY PASSED → ALERT
        </text>
      </svg>

      {controls && (
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className={styles.control}
        >
          {paused ? "Play signal animation" : "Pause signal animation"}
        </button>
      )}
    </figure>
  );
}
