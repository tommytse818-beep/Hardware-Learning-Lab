-- The live Hardware Learning Lab project already has an administrator.
-- Keep this file as a generic recovery example only.
-- Replace both placeholders, review the selected Auth user, and run inside
-- one explicit transaction. Never commit a real email address or generated ID.

begin;

update public.profiles
set
  role = 'admin',
  must_change_password = false,
  updated_at = now()
where id = 'REPLACE_WITH_AUTH_USER_UUID'::uuid
  and lower(email) = lower('REPLACE_WITH_ADMIN_EMAIL');

select id, email, role, display_name, must_change_password
from public.profiles
where id = 'REPLACE_WITH_AUTH_USER_UUID'::uuid;

-- Change this to COMMIT only after the SELECT returns exactly the intended user.
rollback;
