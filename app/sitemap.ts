import type { MetadataRoute } from "next";

import { getConfiguredSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getConfiguredSiteUrl();
  return ["/", "/about", "/projects", "/schools", "/privacy", "/terms", "/accessibility", "/safeguarding", "/projects/open-guard-mini"].map(
    (path) => ({ url: `${baseUrl}${path}`, changeFrequency: "monthly", priority: path === "/" ? 1 : 0.7 }),
  );
}