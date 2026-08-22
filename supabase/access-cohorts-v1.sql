-- Hardware Learning Lab: access, cohorts and role portals V1
-- Run this file in Supabase SQL Editor after supabase/schema.sql is applied.
-- This is a scaffold for the real project configuration and is intentionally
-- kept server-authoritative. It does not run here.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'student'
    check (role in ('admin', 'teacher', 'student')),
  display_name text,
  leaderboard_alias text,
  avatar_key text default 'spark',
  leaderboard_opt_in boolean not null default false,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email := coalesce(new.email, (select email from auth.users where id = new.id));
  new.updated_at := now();
  return new;
end;
$$;

create or replace trigger profiles_set_email_and_timestamp
before insert or update on public.profiles
for each row
execute function public.sync_profile_email();

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Service role manages profiles"
  on public.profiles
  for all
  to service_role
  using (true)
  with check (true);

grant select on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text not null,
  contact_email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.schools enable row level security;

create policy "Authenticated users can read schools they are in"
  on public.schools
  for select
  to authenticated
  using (true);

create policy "Service role manages schools"
  on public.schools
  for all
  to service_role
  using (true)
  with check (true);

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  course_slug text not null,
  student_seat_limit integer not null check (student_seat_limit > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cohorts enable row level security;

create policy "Authenticated users can read cohorts they belong to"
  on public.cohorts
  for select
  to authenticated
  using (true);

create policy "Service role manages cohorts"
  on public.cohorts
  for all
  to service_role
  using (true)
  with check (true);

create table if not exists public.cohort_memberships (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'student'
    check (role in ('student', 'teacher')),
  joined_at timestamptz not null default now(),
  unique (cohort_id, user_id)
);

alter table public.cohort_memberships enable row level security;

create policy "Users can read their own cohort memberships"
  on public.cohort_memberships
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Service role manages cohort memberships"
  on public.cohort_memberships
  for all
  to service_role
  using (true)
  with check (true);

create table if not exists public.cohort_courses (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  course_slug text not null,
  active boolean not null default true,
  assigned_at timestamptz not null default now(),
  unique (cohort_id, course_slug)
);

alter table public.cohort_courses enable row level security;

create policy "Authenticated users can read assigned cohort courses"
  on public.cohort_courses
  for select
  to authenticated
  using (true);

create policy "Service role manages cohort courses"
  on public.cohort_courses
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.enforce_student_seat_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  cohort_limit integer;
begin
  if new.role <> 'student' then
    return new;
  end if;

  select c.student_seat_limit into cohort_limit
  from public.cohorts c
  where c.id = new.cohort_id;

  select count(*) into current_count
  from public.cohort_memberships cm
  where cm.cohort_id = new.cohort_id and cm.role = 'student';

  if current_count >= cohort_limit then
    raise exception 'Student seat limit reached for this cohort.';
  end if;

  return new;
end;
$$;

create or replace trigger cohort_membership_student_limit
before insert or update on public.cohort_memberships
for each row
execute function public.enforce_student_seat_limit();

create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_slug text not null,
  status text not null default 'active'
    check (status in ('active', 'completed', 'expired')),
  time_limit_seconds integer,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quiz_sessions enable row level security;

create policy "Users can read their own quiz sessions"
  on public.quiz_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Service role manages quiz sessions"
  on public.quiz_sessions
  for all
  to service_role
  using (true)
  with check (true);

create table if not exists public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_slug text not null,
  attempt_number integer not null check (attempt_number >= 1),
  submitted_answer jsonb,
  correct boolean not null default false,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "Users can read their own attempts"
  on public.quiz_attempts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Service role manages quiz attempts"
  on public.quiz_attempts
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.get_active_course_entitlement(p_user_id uuid, p_course_slug text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.course_entitlements ce
    where ce.user_id = p_user_id
      and ce.course_slug = p_course_slug
      and ce.active = true
      and (ce.ends_at is null or ce.ends_at > now())
      and ce.starts_at <= now()
  );
$$;

create or replace function public.get_active_cohort_course_access(p_user_id uuid, p_course_slug text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cohort_memberships cm
    join public.cohort_courses cc on cc.cohort_id = cm.cohort_id
    where cm.user_id = p_user_id
      and cm.role = 'student'
      and cc.course_slug = p_course_slug
      and cc.active = true
  );
$$;

create or replace function public.get_user_role(p_user_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = p_user_id),
    'student'
  );
$$;

grant execute on function public.get_active_course_entitlement(uuid, text) to authenticated;
grant execute on function public.get_active_cohort_course_access(uuid, text) to authenticated;

-- Notes for the live dashboard:
-- 1. Create the Auth user in Supabase Authentication -> Users.
-- 2. Add the matching record in public.profiles.
-- 3. Provision cohort membership rows and course entitlements only using a
--    trusted server-side administrative path.
-- 4. Keep RLS enabled and do not grant learners direct update rights to role,
--    membership, entitlement or admin-only tables.
