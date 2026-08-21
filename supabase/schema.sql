-- Hardware Learning Lab: Stage 1 progress storage
-- Run this entire file once in Supabase Dashboard -> SQL Editor.
--
-- Course explanations and correct answers remain version-controlled in code.
-- This table stores only each authenticated student's progress.

create table if not exists public.lesson_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_slug text not null,
  completed boolean not null default false,
  quiz_score integer,
  updated_at timestamptz not null default now(),

  constraint lesson_progress_score_range
    check (quiz_score is null or (quiz_score >= 0 and quiz_score <= 100)),

  constraint lesson_progress_unique_lesson
    unique (user_id, course_slug, lesson_slug)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "Students can read their own progress"
  on public.lesson_progress;

create policy "Students can read their own progress"
  on public.lesson_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Students can insert their own progress"
  on public.lesson_progress;

create policy "Students can insert their own progress"
  on public.lesson_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Students can update their own progress"
  on public.lesson_progress;

create policy "Students can update their own progress"
  on public.lesson_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on table public.lesson_progress
  to authenticated;

grant usage, select on sequence public.lesson_progress_id_seq
  to authenticated;
