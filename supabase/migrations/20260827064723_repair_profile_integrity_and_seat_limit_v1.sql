insert into public.profiles (
  id,
  email,
  role,
  display_name,
  leaderboard_alias,
  avatar_key,
  bio,
  leaderboard_opt_in,
  must_change_password,
  created_at,
  updated_at
)
select
  u.id,
  coalesce(u.email, u.id::text || '@unavailable.invalid'),
  'student',
  left(
    coalesce(
      nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
      'Learner'
    ),
    60
  ),
  left(
    coalesce(
      nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
      'Learner'
    ),
    32
  ),
  'spark',
  '',
  false,
  true,
  coalesce(u.created_at, now()),
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

create or replace function public.enforce_student_seat_limit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_current_count integer;
  v_cohort_limit integer;
begin
  if new.role <> 'student' then
    return new;
  end if;

  -- Updating an existing student without moving cohorts does not consume a new seat.
  if tg_op = 'UPDATE'
     and old.role = 'student'
     and old.cohort_id = new.cohort_id then
    return new;
  end if;

  -- Serialize seat allocation for this cohort so concurrent inserts cannot both pass.
  select c.student_seat_limit
    into v_cohort_limit
  from public.cohorts c
  where c.id = new.cohort_id
  for update;

  if v_cohort_limit is null then
    raise exception 'Cohort does not exist.';
  end if;

  if tg_op = 'UPDATE' then
    select count(*)
      into v_current_count
    from public.cohort_memberships cm
    where cm.cohort_id = new.cohort_id
      and cm.role = 'student'
      and cm.id <> old.id;
  else
    select count(*)
      into v_current_count
    from public.cohort_memberships cm
    where cm.cohort_id = new.cohort_id
      and cm.role = 'student';
  end if;

  if v_current_count >= v_cohort_limit then
    raise exception 'Student seat limit reached for this cohort.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_student_seat_limit()
  from public, anon, authenticated;
grant execute on function public.enforce_student_seat_limit()
  to service_role;
