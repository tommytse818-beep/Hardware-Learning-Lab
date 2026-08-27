select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'bio'
  ) as bio_exists,
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename in ('schools', 'cohorts', 'cohort_courses')
      and cmd = 'SELECT'
      and qual = 'true'
  ) as broad_true_select_policies,
  has_function_privilege(
    'anon',
    'public.enforce_student_seat_limit()',
    'EXECUTE'
  ) as anon_can_execute_seat_function,
  has_function_privilege(
    'anon',
    'public.get_user_role(uuid)',
    'EXECUTE'
  ) as anon_can_execute_role_function;

select id, email, role, display_name, must_change_password
from public.profiles
order by created_at;
