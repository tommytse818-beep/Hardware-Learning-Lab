begin;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated, service_role;

alter table public.profiles
  add column if not exists bio text not null default '';

alter table public.school_enquiries
  add column if not exists notification_status text not null default 'pending',
  add column if not exists notification_error_code text,
  add column if not exists notification_sent_at timestamptz;

do $$
begin
  alter table public.profiles drop constraint if exists profiles_display_name_length;
  alter table public.profiles add constraint profiles_display_name_length
    check (display_name is null or char_length(display_name) <= 60);

  alter table public.profiles drop constraint if exists profiles_alias_length;
  alter table public.profiles add constraint profiles_alias_length
    check (leaderboard_alias is null or char_length(leaderboard_alias) <= 32);

  alter table public.profiles drop constraint if exists profiles_bio_length;
  alter table public.profiles add constraint profiles_bio_length
    check (char_length(bio) <= 280);

  alter table public.profiles drop constraint if exists profiles_avatar_key_allowed;
  alter table public.profiles add constraint profiles_avatar_key_allowed
    check (
      avatar_key is null or avatar_key in (
        'spark', 'sun', 'moon', 'star', 'leaf',
        'bot', 'chip', 'orbit', 'bolt', 'wave', 'rocket'
      )
    );

  alter table public.school_enquiries drop constraint if exists school_enquiries_notification_status_allowed;
  alter table public.school_enquiries add constraint school_enquiries_notification_status_allowed
    check (notification_status in ('pending', 'sent', 'failed'));
end
$$;

create or replace function private.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

create or replace function private.current_user_has_school(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    private.current_user_is_admin()
    or exists (
      select 1
      from public.cohorts c
      join public.cohort_memberships cm on cm.cohort_id = c.id
      where c.school_id = p_school_id
        and cm.user_id = (select auth.uid())
    );
$$;

create or replace function private.current_user_has_cohort(p_cohort_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    private.current_user_is_admin()
    or exists (
      select 1
      from public.cohort_memberships cm
      where cm.cohort_id = p_cohort_id
        and cm.user_id = (select auth.uid())
    );
$$;

create or replace function private.current_user_teaches_cohort(p_cohort_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    private.current_user_is_admin()
    or exists (
      select 1
      from public.cohort_memberships cm
      where cm.cohort_id = p_cohort_id
        and cm.user_id = (select auth.uid())
        and cm.role = 'teacher'
    );
$$;

revoke all on function private.current_user_is_admin() from public, anon;
revoke all on function private.current_user_has_school(uuid) from public, anon;
revoke all on function private.current_user_has_cohort(uuid) from public, anon;
revoke all on function private.current_user_teaches_cohort(uuid) from public, anon;
grant execute on function private.current_user_is_admin() to authenticated, service_role;
grant execute on function private.current_user_has_school(uuid) to authenticated, service_role;
grant execute on function private.current_user_has_cohort(uuid) to authenticated, service_role;
grant execute on function private.current_user_teaches_cohort(uuid) to authenticated, service_role;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Authenticated users can read schools they are in" on public.schools;
create policy "Members can read their school"
  on public.schools for select to authenticated
  using (private.current_user_has_school(id));

drop policy if exists "Authenticated users can read cohorts they belong to" on public.cohorts;
create policy "Members can read their cohort"
  on public.cohorts for select to authenticated
  using (private.current_user_has_cohort(id));

drop policy if exists "Users can read their own cohort memberships" on public.cohort_memberships;
create policy "Members can read permitted cohort memberships"
  on public.cohort_memberships for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.current_user_teaches_cohort(cohort_id)
  );

drop policy if exists "Authenticated users can read assigned cohort courses" on public.cohort_courses;
create policy "Members can read assigned cohort courses"
  on public.cohort_courses for select to authenticated
  using (private.current_user_has_cohort(cohort_id));

drop policy if exists "Students can read their own entitlements" on public.course_entitlements;
create policy "Users can read their own entitlements"
  on public.course_entitlements for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.schools from anon, authenticated;
revoke all on table public.cohorts from anon, authenticated;
revoke all on table public.cohort_memberships from anon, authenticated;
revoke all on table public.cohort_courses from anon, authenticated;
revoke all on table public.course_entitlements from anon, authenticated;
revoke all on table public.lesson_progress from anon, authenticated;
revoke all on table public.quiz_sessions from anon, authenticated;
revoke all on table public.quiz_attempts from anon, authenticated;
revoke all on table public.school_enquiries from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, leaderboard_alias, avatar_key, bio, leaderboard_opt_in)
  on table public.profiles to authenticated;
grant select on table public.schools to authenticated;
grant select on table public.cohorts to authenticated;
grant select on table public.cohort_memberships to authenticated;
grant select on table public.cohort_courses to authenticated;
grant select on table public.course_entitlements to authenticated;
grant select on table public.lesson_progress to authenticated;
grant select on table public.quiz_sessions to authenticated;
grant select on table public.quiz_attempts to authenticated;

revoke execute on function public.enforce_student_seat_limit() from public, anon, authenticated;
revoke execute on function public.sync_profile_email() from public, anon, authenticated;
revoke execute on function public.get_active_course_entitlement(uuid, text) from public, anon, authenticated;
revoke execute on function public.get_active_cohort_course_access(uuid, text) from public, anon, authenticated;
revoke execute on function public.get_user_role(uuid) from public, anon, authenticated;
revoke execute on function public.record_lesson_progress(text, text, boolean, integer) from public, anon, authenticated;

create index if not exists cohorts_school_id_idx
  on public.cohorts (school_id);
create index if not exists cohort_memberships_user_id_idx
  on public.cohort_memberships (user_id);
create index if not exists quiz_sessions_user_id_idx
  on public.quiz_sessions (user_id);
create index if not exists quiz_attempts_user_id_idx
  on public.quiz_attempts (user_id);
create index if not exists course_entitlements_active_lookup_idx
  on public.course_entitlements (user_id, course_slug, active, starts_at, ends_at);
create index if not exists cohort_courses_course_lookup_idx
  on public.cohort_courses (course_slug, active, cohort_id);

commit;
