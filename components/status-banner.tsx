type StatusBannerProps = {
  error?: string;
  message?: string;
};

export function StatusBanner({ error, message }: StatusBannerProps) {
  if (!error && !message) {
    return null;
  }

  const isError = Boolean(error);

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ?? message}
    </div>
  );
}
