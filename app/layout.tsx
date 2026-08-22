import type { Metadata } from "next";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isDemoModeEnabled, isSupabaseConfigured } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hardware Learning Lab",
    template: "%s | Hardware Learning Lab",
  },
  description:
    "A verified, project-based electronics learning platform prototype for secondary-school students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const demoMode = isDemoModeEnabled() && !isSupabaseConfigured();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 antialiased"
        suppressHydrationWarning
      >
        <SiteHeader />
        {demoMode && <DemoModeBanner />}
        <main id="main-content" className="block w-full overflow-x-hidden">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
