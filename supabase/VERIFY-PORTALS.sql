select
  exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='cohort_targets'
  ) as cohort_targets_exists,
  exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='teacher_reminders'
  ) as teacher_reminders_exists,
  exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='request_rate_limits'
  ) as rate_limits_exists,
  has_function_privilege(
    'anon',
    'public.consume_rate_limit_v1(text,text,integer,integer)',
    'EXECUTE'
  ) as anon_can_consume,
  has_function_privilege(
    'service_role',
    'public.consume_rate_limit_v1(text,text,integer,integer)',
    'EXECUTE'
  ) as service_role_can_consume;
