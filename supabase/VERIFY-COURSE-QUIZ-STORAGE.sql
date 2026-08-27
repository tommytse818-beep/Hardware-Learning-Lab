select
  exists (
    select 1 from storage.buckets
    where id = 'course-private' and public = false
  ) as private_bucket_exists,
  exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'course_resources'
  ) as resource_registry_exists,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quiz_attempts'
      and column_name = 'question_id'
  ) as question_id_exists,
  has_function_privilege(
    'anon',
    'public.record_quiz_attempt_v1(uuid,text,text,text,jsonb,boolean)',
    'EXECUTE'
  ) as anon_can_record_attempt,
  has_function_privilege(
    'authenticated',
    'public.record_quiz_attempt_v1(uuid,text,text,text,jsonb,boolean)',
    'EXECUTE'
  ) as authenticated_can_record_attempt,
  has_function_privilege(
    'service_role',
    'public.record_quiz_attempt_v1(uuid,text,text,text,jsonb,boolean)',
    'EXECUTE'
  ) as service_role_can_record_attempt;
