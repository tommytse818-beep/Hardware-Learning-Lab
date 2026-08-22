import type { LessonVideo as LessonVideoData } from "@/lib/courses";

type LessonVideoProps = {
  title: string;
  video: LessonVideoData;
};

export function LessonVideo({ title, video }: LessonVideoProps) {
  const hasLocalVideo = Boolean(video.videoSrc || video.webmSrc);

  if (hasLocalVideo) {
    return (
      <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
        <video
          className="aspect-video h-auto w-full object-contain"
          controls
          playsInline
          preload="metadata"
          poster={video.posterSrc}
          aria-label={`${title} lesson video`}
        >
          {video.webmSrc && <source src={video.webmSrc} type="video/webm" />}
          {video.videoSrc && <source src={video.videoSrc} type="video/mp4" />}
          Your browser does not support the lesson video.
        </video>
        <figcaption className="border-t border-white/10 px-5 py-4 text-sm leading-6 text-slate-300">
          {video.caption}
        </figcaption>
        <details className="border-t border-white/10 px-5 py-3 text-sm text-slate-300">
          <summary className="cursor-pointer font-semibold text-white">Read transcript</summary>
          <p className="mt-3 leading-6">{video.caption}</p>
        </details>
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative grid aspect-video place-items-center overflow-hidden bg-slate-950 p-7 text-center sm:p-10">
        {video.posterSrc && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 blur-[1px]"
            style={{ backgroundImage: `url(${video.posterSrc})` }}
            aria-hidden="true"
          />
        )}
        <div className="relative max-w-xl">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-white/10 text-2xl text-white shadow-2xl backdrop-blur">
            ▶
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Recording slot reserved
          </p>
          <p className="mt-2 text-xl font-semibold text-white">
            {title}
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-300">
            {video.caption}
          </p>
          {video.plannedPath && (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-left font-mono text-xs leading-5 text-slate-300">
              Replace this placeholder later by adding your recording at:
              <span className="mt-1 block break-all text-emerald-200">
                public{video.plannedPath}
              </span>
            </div>
          )}
        </div>
      </div>
      <figcaption className="border-t border-slate-200 px-5 py-4 text-sm leading-6 text-slate-600">
        The lesson text, question and navigation work now. No broken video request is made until a real source file is configured.
      </figcaption>
      <details className="border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
        <summary className="cursor-pointer font-semibold text-slate-900">Read transcript</summary>
        <p className="mt-3 leading-6">{video.caption}</p>
      </details>
    </figure>
  );
}
