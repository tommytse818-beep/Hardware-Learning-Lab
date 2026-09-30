import type { Metadata } from "next";

import { HomeExperience } from "@/components/home/home-experience";

export const metadata: Metadata = {
  title: "Practical Engineering. Made Real.",
  description:
    "DrawerSense Mini is a proposed three-week school engineering programme that moves from electronic concepts to breadboard testing and reviewed PCB design.",
};

export default function HomePage() {
  return <HomeExperience />;
}
