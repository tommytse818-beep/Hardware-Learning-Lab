import type { Metadata } from "next";

import { SchoolsExperience } from "@/components/schools/schools-experience";

export const metadata: Metadata = {
  title: "For schools",
  description:
    "A three-week practical electronics programme for F4–F5 learners: six live sessions, real bench building and a manufactured circuit board. Cohort pricing and Hong Kong funding routes for schools.",
};

export default function SchoolsPage() {
  return <SchoolsExperience />;
}
