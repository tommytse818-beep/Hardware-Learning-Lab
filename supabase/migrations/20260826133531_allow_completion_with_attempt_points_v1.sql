begin;

alter table public.lesson_progress
  drop constraint if exists lesson_progress_completion_score;

-- Completion and awarded points are separate concepts. A learner who answers
-- correctly on attempt 2, 3 or later still completes the checkpoint while
-- receiving 50, 25 or 0 points. The existing score-range constraint remains.

commit;
