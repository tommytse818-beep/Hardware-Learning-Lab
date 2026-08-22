import type { MetadataRoute } from "next";

import { getConfiguredSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/courses/", "/api/"] },
    sitemap: `${getConfiguredSiteUrl()}/sitemap.xml`,
  };
}