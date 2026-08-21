type LessonVideoProps = {
  title: string;
  embedUrl?: string;
};

export function LessonVideo({ title, embedUrl }: LessonVideoProps) {
  if (embedUrl) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
        <div className="aspect-video">
          <iframe
            className="h-full w-full"
            src={embedUrl}
            title={`${title} video`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-8 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-xl shadow-sm">
          ▶
        </span>
        <p className="mt-4 font-semibold text-slate-900">
          Lesson video placeholder
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Add your own short project video later. The lesson text, quiz and
          navigation already work without a video provider.
        </p>
      </div>
    </div>
  );
}
