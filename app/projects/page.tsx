import type { Metadata } from "next";

import { ProjectsExperience } from "@/components/projects/projects-experience";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore Hardware Learning Lab projects across smart living, sustainability and climate, health and movement, and space and communications.",
};

export default function ProjectsPage() {
  return <ProjectsExperience />;
}
