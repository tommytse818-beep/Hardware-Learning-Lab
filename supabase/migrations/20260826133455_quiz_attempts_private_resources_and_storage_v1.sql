begin;

alter table public.quiz_attempts
  add column if not exists question_id text not null default 'lesson-checkpoint';

create unique index if not exists quiz_attempts_unique_submission_number_idx
  on public.quiz_attempts (
    user_id,
    course_slug,
    lesson_slug,
    question_id,
    attempt_number
  );

create index if not exists quiz_attempts_lookup_idx
  on public.quiz_attempts (
    user_id,
    course_slug,
    lesson_slug,
    question_id,
    created_at
  );

create table if not exists public.course_resources (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  resource_key text not null,
  title text not null,
  bucket_id text not null default 'course-private',
  object_path text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_slug, resource_key),
  constraint course_resources_safe_key
    check (resource_key ~ '^[a-z0-9][a-z0-9-]{1,80}$'),
  constraint course_resources_safe_path
    check (object_path !~ '(^|/)\.\.(/|$)')
);

alter table public.course_resources enable row level security;
revoke all on table public.course_resources from public, anon, authenticated;
grant all on table public.course_resources to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'course-private',
  'course-private',
  false,
  524288000,
  array[
    'application/pdf',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/webm',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.record_quiz_attempt_v1(
  p_user_id uuid,
  p_course_slug text,
  p_lesson_slug text,
  p_question_id text,
  p_submitted_answer jsonb,
  p_correct boolean
)
returns table (
  attempt_number integer,
  points_awarded integer,
  correct boolean,
  completed boolean
)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_attempt integer;
  v_points integer := 0;
  v_already_correct boolean;
begin
  if p_user_id is null
     or nullif(btrim(p_course_slug), '') is null
     or nullif(btrim(p_lesson_slug), '') is null
     or nullif(btrim(p_question_id), '') is null then
    raise exception 'Invalid quiz-attempt input';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_user_id::text || '|' || p_course_slug || '|' ||
      p_lesson_slug || '|' || p_question_id,
      0
    )
  );

  select coalesce(max(qa.attempt_number), 0) + 1
    into v_attempt
  from public.quiz_attempts qa
  where qa.user_id = p_user_id
    and qa.course_slug = p_course_slug
    and qa.lesson_slug = p_lesson_slug
    and qa.question_id = p_question_id;

  select exists (
    select 1
    from public.quiz_attempts qa
    where qa.user_id = p_user_id
      and qa.course_slug = p_course_slug
      and qa.lesson_slug = p_lesson_slug
      and qa.question_id = p_question_id
      and qa.correct = true
  ) into v_already_correct;

  if p_correct and not v_already_correct then
    v_points := case v_attempt
      when 1 then 100
      when 2 then 50
      when 3 then 25
      else 0
    end;
  end if;

  insert into public.quiz_attempts (
    user_id,
    course_slug,
    lesson_slug,
    question_id,
    attempt_number,
    submitted_answer,
    correct,
    points_awarded
  ) values (
    p_user_id,
    p_course_slug,
    p_lesson_slug,
    p_question_id,
    v_attempt,
    p_submitted_answer,
    p_correct,
    v_points
  );

  if p_correct then
    insert into public.lesson_progress (
      user_id,
      course_slug,
      lesson_slug,
      completed,
      quiz_score,
      updated_at
    ) values (
      p_user_id,
      p_course_slug,
      p_lesson_slug,
      true,
      v_points,
      now()
    )
    on conflict (user_id, course_slug, lesson_slug) do update
    set
      completed = true,
      quiz_score = greatest(
        coalesce(public.lesson_progress.quiz_score, 0),
        excluded.quiz_score
      ),
      updated_at = now();
  end if;

  return query
    select v_attempt, v_points, p_correct, p_correct or v_already_correct;
end;
$$;

revoke all on function public.record_quiz_attempt_v1(
  uuid, text, text, text, jsonb, boolean
) from public, anon, authenticated;

grant execute on function public.record_quiz_attempt_v1(
  uuid, text, text, text, jsonb, boolean
) to service_role;

commit;
