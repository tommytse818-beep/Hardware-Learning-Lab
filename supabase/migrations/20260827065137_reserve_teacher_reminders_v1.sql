alter table public.teacher_reminders
  drop constraint if exists teacher_reminders_status_check;

alter table public.teacher_reminders
  add constraint teacher_reminders_status_check
  check (status in ('pending', 'sent', 'failed'));

alter table public.teacher_reminders
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.reserve_teacher_reminder_v1(
  p_teacher_id uuid,
  p_student_id uuid,
  p_cohort_id uuid
)
returns table(reminder_id bigint, allowed boolean)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_now timestamptz := now();
  v_reminder_id bigint;
begin
  if p_teacher_id is null or p_student_id is null or p_cohort_id is null then
    raise exception 'Invalid reminder reservation input';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_teacher_id::text || '|' || p_student_id::text || '|' || p_cohort_id::text,
      0
    )
  );

  -- Recover automatically if a server process stopped after reserving but before
  -- recording the delivery result.
  update public.teacher_reminders
  set
    status = 'failed',
    error_code = 'reservation-timeout',
    updated_at = v_now
  where teacher_id = p_teacher_id
    and student_id = p_student_id
    and cohort_id = p_cohort_id
    and status = 'pending'
    and sent_at < v_now - interval '10 minutes';

  if exists (
    select 1
    from public.teacher_reminders tr
    where tr.teacher_id = p_teacher_id
      and tr.student_id = p_student_id
      and tr.cohort_id = p_cohort_id
      and tr.status in ('pending', 'sent')
      and tr.sent_at >= v_now - interval '24 hours'
  ) then
    return query select null::bigint, false;
    return;
  end if;

  insert into public.teacher_reminders (
    teacher_id,
    student_id,
    cohort_id,
    status,
    error_code,
    sent_at,
    updated_at
  ) values (
    p_teacher_id,
    p_student_id,
    p_cohort_id,
    'pending',
    null,
    v_now,
    v_now
  )
  returning id into v_reminder_id;

  return query select v_reminder_id, true;
end;
$$;

revoke all on function public.reserve_teacher_reminder_v1(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.reserve_teacher_reminder_v1(uuid, uuid, uuid)
  to service_role;
