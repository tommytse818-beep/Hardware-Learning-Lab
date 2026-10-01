"use client";

import { useId } from "react";
import { DrawerSensePrediction, predictionDescriptions } from "./drawersense-prediction";

export function DrawerSenseTaskDiagram({ lessonId }: { lessonId: string }) {
  const instanceId = useId().replace(/:/g, "");
  const description = predictionDescriptions[lessonId];
  if (!description) return null;
  return <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="border-b border-slate-200 px-5 py-4"><h4 className="font-semibold text-slate-950">{description.title}</h4></div>
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`${description.title}. Scroll horizontally on a narrow screen.`}>
      <svg viewBox="0 0 920 534" role="img" aria-labelledby={`${instanceId}-title ${instanceId}-description`} className="block h-auto w-full min-w-[840px]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <title id={`${instanceId}-title`}>{description.title}</title>
        <desc id={`${instanceId}-description`}>{description.description}</desc>
        <rect width={920} height={534} fill="#fffefa" />
        <DrawerSensePrediction lessonId={lessonId}/>
      </svg>
    </div>
    <figcaption className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">{description.caption}</figcaption>
  </figure>;
}