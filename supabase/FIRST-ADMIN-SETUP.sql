insert into public.profiles (
  id,
  email,
  role,
  display_name,
  leaderboard_alias,
  must_change_password
)
values (
  '5c0ac709-2bdc-458e-a161-d699e8813bb3'::uuid,
  'tommytse818@gmail.com',
  'admin',
  'Tommy Tse',
  'Tommy',
  false
)
on conflict (id) do update
set
  email = excluded.email,
  role = 'admin',
  display_name = 'Tommy Tse',
  leaderboard_alias = 'Tommy',
  must_change_password = false,
  updated_at = now()
returning
  id,
  email,
  role,
  display_name,
  leaderboard_alias,
  must_change_password; -- Hardware Learning Lab — first administrator setup

begin;

update public.profiles
set
  role = 'admin',
  display_name = 'Tommy Tse',
  leaderboard_alias = 'Tommy',
  must_change_password = false,
  updated_at = now()
where id = '5c0ac709-2bdc-458e-a161-d699e8813bb3'::uuid
  and lower(email) = lower('tommytse818@gmail.com');

-- This must return exactly one row before you commit.
select
  id,
  email,
  role,
  display_name,
  must_change_password
from public.profiles
where id = '5c0ac709-2bdc-458e-a161-d699e8813bb3'::uuid;

-- Keep this as rollback for the first test.
rollback;
