-- Hardware Learning Lab: targeted OpenGuard Mini access layer
-- Run after the existing supabase/schema.sql file.
--
-- First school pilots should normally use quotation/invoice plus manual seat
-- activation. This table records the resulting server-verified entitlement.
-- It does not collect card details and it is not a payment webhook.

create table if not exists public.course_entitlements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  source text not null default 'school_manual',
  reference text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint course_entitlements_valid_dates
    check (ends_at is null or ends_at > starts_at),

  constraint course_entitlements_unique_active_window
    unique (user_id, course_slug, starts_at)
);

alter table public.course_entitlements enable row level security;

drop policy if exists "Learners can read their own course entitlements"
  on public.course_entitlements;

create policy "Learners can read their own course entitlements"
  on public.course_entitlements
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Do not grant authenticated users insert/update/delete access. Entitlements
-- are assigned by an audited admin/server workflow, or manually during the
-- first pilot through the Supabase dashboard by an authorised administrator.
grant select on table public.course_entitlements to authenticated;

-- Example pilot activation. Replace the UUID and dates deliberately.
-- insert into public.course_entitlements
--   (user_id, course_slug, source, reference, starts_at, ends_at)
-- values
--   ('00000000-0000-0000-0000-000000000000',
--    'open-guard-mini',
--    'school_manual',
--    'PILOT-SCHOOL-001',
--    now(),
--    now() + interval '12 months');
