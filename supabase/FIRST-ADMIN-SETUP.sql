-- Hardware Learning Lab — first administrator setup
-- Run only after:
--   1) supabase/schema.sql
--   2) supabase/access-cohorts-v1.sql
--   3) creating your own user in Supabase Authentication -> Users
--
-- Replace BOTH placeholders. The UUID and email must refer to the same account.

begin;

update public.profiles
set
  role = 'admin',
  display_name = 'Tommy Tse',
  leaderboard_alias = 'Tommy',
  must_change_password = false,
  updated_at = now()
where id = 'REPLACE_WITH_YOUR_AUTH_USER_UUID'::uuid
  and lower(email) = lower('REPLACE_WITH_YOUR_ADMIN_EMAIL');

-- This must return exactly one row before you commit.
select id, email, role, display_name, must_change_password
from public.profiles
where id = 'REPLACE_WITH_YOUR_AUTH_USER_UUID'::uuid;

-- Change ROLLBACK to COMMIT only after the SELECT is correct.
rollback;
