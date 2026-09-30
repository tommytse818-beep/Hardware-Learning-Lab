import { HllTutorPanel } from "@/components/hll-tutor-panel";
import type { TutorGuidance } from "@/lib/courses";
import type { HllTutorContext } from "@/lib/hll-tutor-contract";

type VerifiedTutorProps = {
  lessonTitle: string;
  guidance: TutorGuidance;
  context?: Omit<HllTutorContext, "lessonTitle">;
};

export function VerifiedTutor({ lessonTitle, guidance, context }: VerifiedTutorProps) {
  return <HllTutorPanel context={{ stage: "learn", helpMode: "hint-only", ...context, lessonTitle }} guidance={guidance} />;
}
