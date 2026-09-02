begin;

alter table public.lesson_progress
  add column if not exists review_state text not null default 'not_started',
  add column if not exists reviewer_id uuid,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_feedback text,
  add column if not exists online_ready_at timestamptz;

alter table public.lesson_progress
  drop constraint if exists lesson_progress_review_state;

alter table public.lesson_progress
  add constraint lesson_progress_review_state
  check (
    review_state in (
      'not_started',
      'online_ready',
      'awaiting_review',
      'approved',
      'revision_requested'
    )
  );

alter table public.lesson_progress
  drop constraint if exists lesson_progress_review_feedback_length;

alter table public.lesson_progress
  add constraint lesson_progress_review_feedback_length
  check (review_feedback is null or char_length(review_feedback) <= 500);

create or replace function public.record_quiz_attempt_v2(
  p_user_id uuid,
  p_course_slug text,
  p_lesson_slug text,
  p_question_id text,
  p_required_question_ids text[],
  p_human_review_required boolean,
  p_submitted_answer jsonb,
  p_correct boolean
)
returns table (
  attempt_number integer,
  points_awarded integer,
  correct boolean,
  completed boolean,
  online_ready boolean,
  quiz_score integer,
  solved_question_ids text[],
  review_state text
)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_attempt integer;
  v_points integer := 0;
  v_already_correct boolean;
  v_required_ids text[];
  v_solved_ids text[] := array[]::text[];
  v_score integer := 0;
  v_online_ready boolean := false;
  v_completed boolean := false;
  v_review_state text := 'not_started';
begin
  v_required_ids := coalesce(
    (
      select array_agg(distinct nullif(btrim(value), '') order by nullif(btrim(value), ''))
      from unnest(coalesce(p_required_question_ids, array[]::text[])) as value
      where nullif(btrim(value), '') is not null
    ),
    array[]::text[]
  );

  if p_user_id is null
     or nullif(btrim(p_course_slug), '') is null
     or nullif(btrim(p_lesson_slug), '') is null
     or nullif(btrim(p_question_id), '') is null
     or array_length(v_required_ids, 1) is null
     or not (p_question_id = any(v_required_ids)) then
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

  with first_correct as (
    select distinct on (qa.question_id)
      qa.question_id,
      qa.points_awarded
    from public.quiz_attempts qa
    where qa.user_id = p_user_id
      and qa.course_slug = p_course_slug
      and qa.lesson_slug = p_lesson_slug
      and qa.question_id = any(v_required_ids)
      and qa.correct = true
    order by qa.question_id, qa.attempt_number asc, qa.created_at asc
  )
  select
    coalesce(array_agg(fc.question_id order by fc.question_id), array[]::text[]),
    coalesce(round(avg(fc.points_awarded))::integer, 0)
  into v_solved_ids, v_score
  from first_correct fc;

  v_online_ready := cardinality(v_solved_ids) = cardinality(v_required_ids);
  if not v_online_ready then
    v_score := 0;
  end if;

  v_completed := v_online_ready and not coalesce(p_human_review_required, false);
  v_review_state := case
    when v_online_ready and coalesce(p_human_review_required, false) then 'awaiting_review'
    when v_online_ready then 'online_ready'
    else 'not_started'
  end;

  if p_correct then
    insert into public.lesson_progress (
      user_id,
      course_slug,
      lesson_slug,
      completed,
      quiz_score,
      review_state,
      reviewer_id,
      reviewed_at,
      review_feedback,
      online_ready_at,
      updated_at
    ) values (
      p_user_id,
      p_course_slug,
      p_lesson_slug,
      v_completed,
      v_score,
      v_review_state,
      null,
      null,
      null,
      case when v_online_ready then now() else null end,
      now()
    )
    on conflict (user_id, course_slug, lesson_slug) do update
    set
      completed = case
        when public.lesson_progress.review_state = 'approved' then true
        else excluded.completed
      end,
      quiz_score = excluded.quiz_score,
      review_state = case
        when public.lesson_progress.review_state = 'approved' then 'approved'
        else excluded.review_state
      end,
      reviewer_id = case
        when public.lesson_progress.review_state = 'approved' then public.lesson_progress.reviewer_id
        else null
      end,
      reviewed_at = case
        when public.lesson_progress.review_state = 'approved' then public.lesson_progress.reviewed_at
        else null
      end,
      review_feedback = case
        when public.lesson_progress.review_state = 'approved' then public.lesson_progress.review_feedback
        else null
      end,
      online_ready_at = case
        when excluded.online_ready_at is not null then coalesce(public.lesson_progress.online_ready_at, excluded.online_ready_at)
        else public.lesson_progress.online_ready_at
      end,
      updated_at = now();
  end if;

  return query
    select
      v_attempt,
      v_points,
      p_correct,
      v_completed,
      v_online_ready,
      v_score,
      v_solved_ids,
      v_review_state;
end;
$$;

revoke all on function public.record_quiz_attempt_v2(
  uuid, text, text, text, text[], boolean, jsonb, boolean
) from public, anon, authenticated;

grant execute on function public.record_quiz_attempt_v2(
  uuid, text, text, text, text[], boolean, jsonb, boolean
) to service_role;

commit;
