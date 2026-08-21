import type { Metadata } from "next";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isSupabaseConfigured } from "@/lib/env";

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
  const demoMode = !isSupabaseConfigured();

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        <SiteHeader />
        {demoMode && <DemoModeBanner />}
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
