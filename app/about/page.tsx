import type { Metadata } from "next";

import { AboutExperience } from "@/components/about/about-experience";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the people and purpose behind Hardware Learning Lab, a practical STEM education company helping schools turn technology from theory into something students can build, test and understand.",
};

export default function AboutPage() {
  return <AboutExperience />;
}
