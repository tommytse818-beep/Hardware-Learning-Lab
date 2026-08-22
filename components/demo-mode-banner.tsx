import Link from "next/link";

export function DemoModeBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          <strong>Demo mode:</strong> the visual learning platform works, but
          real accounts and cloud progress are not active until Supabase is
          connected.
        </p>
        <Link href="/about" className="font-semibold underline">
          Read about the platform
        </Link>
      </div>
    </div>
  );
}
