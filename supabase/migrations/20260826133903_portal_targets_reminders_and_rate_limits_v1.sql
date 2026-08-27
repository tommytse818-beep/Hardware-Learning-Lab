begin;

create table if not exists public.cohort_targets (
  cohort_id uuid primary key references public.cohorts(id) on delete cascade,
  target_lesson_slug text not null,
  updated_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_reminders (
  id bigint generated always as identity primary key,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  status text not null check (status in ('sent', 'failed')),
  error_code text,
  sent_at timestamptz not null default now()
);

create table if not exists public.request_rate_limits (
  key_hash text not null,
  scope text not null,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  expires_at timestamptz not null,
  primary key (key_hash, scope, window_start)
);

alter table public.cohort_targets enable row level security;
alter table public.teacher_reminders enable row level security;
alter table public.request_rate_limits enable row level security;

revoke all on table public.cohort_targets from public, anon, authenticated;
revoke all on table public.teacher_reminders from public, anon, authenticated;
revoke all on table public.request_rate_limits from public, anon, authenticated;
grant all on table public.cohort_targets to service_role;
grant all on table public.teacher_reminders to service_role;
grant all on table public.request_rate_limits to service_role;
grant usage, select on sequence public.teacher_reminders_id_seq to service_role;

create index if not exists teacher_reminders_lookup_idx
  on public.teacher_reminders (teacher_id, student_id, cohort_id, sent_at desc);
create index if not exists teacher_reminders_student_idx
  on public.teacher_reminders (student_id, sent_at desc);
create index if not exists request_rate_limits_expiry_idx
  on public.request_rate_limits (expires_at);

create or replace function public.consume_rate_limit_v1(
  p_key_hash text,
  p_scope text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count integer;
begin
  if nullif(btrim(p_key_hash), '') is null
     or nullif(btrim(p_scope), '') is null
     or p_limit < 1
     or p_window_seconds < 1 then
    raise exception 'Invalid rate-limit input';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  delete from public.request_rate_limits
  where expires_at < v_now;

  insert into public.request_rate_limits (
    key_hash, scope, window_start, request_count, expires_at
  ) values (
    p_key_hash,
    p_scope,
    v_window_start,
    1,
    v_window_start + make_interval(secs => p_window_seconds * 2)
  )
  on conflict (key_hash, scope, window_start) do update
  set request_count = public.request_rate_limits.request_count + 1
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit_v1(
  text, text, integer, integer
) from public, anon, authenticated;

grant execute on function public.consume_rate_limit_v1(
  text, text, integer, integer
) to service_role;

commit;
