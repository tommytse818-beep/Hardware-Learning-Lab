import { cookies } from "next/headers";

import { decodeDemoProgress, DEMO_PROGRESS_COOKIE } from "@/lib/demo-progress";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type LessonProgressRecord = {
  lesson_slug: string;
  completed: boolean;
  quiz_score: number | null;
};

export type CourseProgressResult = {
  records: LessonProgressRecord[];
  databaseReady: boolean;
};

export async function getCourseProgress(
  userId: string | null,
  courseSlug: string,
): Promise<CourseProgressResult> {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const demoRecords = decodeDemoProgress(
      cookieStore.get(DEMO_PROGRESS_COOKIE)?.value,
    )
      .filter((entry) => entry.courseSlug === courseSlug)
      .map((entry) => ({
        lesson_slug: entry.lessonSlug,
        completed: entry.completed,
        quiz_score: entry.quizScore,
      }));

    return {
      records: demoRecords,
      databaseReady: false,
    };
  }

  if (!userId) {
    return {
      records: [],
      databaseReady: false,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_slug, completed, quiz_score")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug);

  if (error) {
    return {
      records: [],
      databaseReady: false,
    };
  }

  return {
    records: data ?? [],
    databaseReady: true,
  };
}
