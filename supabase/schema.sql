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

  constraint lesson_progress_completion_score
    check (completed = false or quiz_score = 100),

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

revoke insert, update on table public.lesson_progress from authenticated;

create or replace function public.record_lesson_progress(
  p_course_slug text,
  p_lesson_slug text,
  p_completed boolean,
  p_quiz_score integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_course_slug is null or p_lesson_slug is null
    or p_quiz_score not between 0 and 100 then
    raise exception 'Invalid progress update';
  end if;

  insert into public.lesson_progress (user_id, course_slug, lesson_slug, completed, quiz_score)
  values (auth.uid(), p_course_slug, p_lesson_slug, p_completed and p_quiz_score = 100, p_quiz_score)
  on conflict (user_id, course_slug, lesson_slug) do update
    set completed = public.lesson_progress.completed or excluded.completed,
        quiz_score = greatest(coalesce(public.lesson_progress.quiz_score, 0), excluded.quiz_score),
        updated_at = now();
end;
$$;

revoke all on function public.record_lesson_progress(text, text, boolean, integer) from public;
grant execute on function public.record_lesson_progress(text, text, boolean, integer) to authenticated;

create table if not exists public.course_entitlements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  source text not null default 'school_manual',
  reference text,
  starts_at timestamptz not null default now(),
  active boolean not null default true,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_entitlements_valid_dates
    check (ends_at is null or ends_at > starts_at),
  unique (user_id, course_slug, starts_at)
);
alter table public.course_entitlements enable row level security;
create policy "Students can read their own entitlements"
  on public.course_entitlements for select to authenticated
  using ((select auth.uid()) = user_id);
grant select on table public.course_entitlements to authenticated;

revoke all on function public.record_lesson_progress(text, text, boolean, integer)
  from public, authenticated;

create table if not exists public.school_enquiries (
  id bigint generated always as identity primary key,
  school_name text not null,
  contact_name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.school_enquiries enable row level security;
