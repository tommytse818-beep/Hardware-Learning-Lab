-- Secure progress writes for the quiz API.
-- Apply after schema.sql. The API performs auth and entitlement checks, then
-- writes through the service role; learners must not call the write RPC.

alter table public.lesson_progress enable row level security;

drop policy if exists "Students can insert their own progress"
  on public.lesson_progress;
drop policy if exists "Students can update their own progress"
  on public.lesson_progress;

revoke insert, update, delete on table public.lesson_progress from authenticated;
revoke usage, select on sequence public.lesson_progress_id_seq from authenticated;
revoke all on function public.record_lesson_progress(text, text, boolean, integer)
  from public, authenticated;