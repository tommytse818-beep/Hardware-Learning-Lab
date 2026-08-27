import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 antialiased"
        suppressHydrationWarning
      >
        <SiteHeader />
        <main id="main-content" className="block w-full overflow-x-hidden">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
