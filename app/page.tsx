import type { Metadata } from "next";

import { HomeExperience } from "@/components/home/home-experience";

export const metadata: Metadata = {
  title: "Build real electronics",
  description:
    "A three-week secondary-school electronics programme that turns a real user need into a measured, tested and reviewed OpenGuard Mini product.",
};

export default function HomePage() {
  return <HomeExperience />;
}
