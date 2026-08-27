begin;

drop policy if exists "Service role manages school enquiries" on public.school_enquiries;
create policy "Service role manages school enquiries"
  on public.school_enquiries for all to service_role
  using (true) with check (true);

drop policy if exists "Service role manages course resources" on public.course_resources;
create policy "Service role manages course resources"
  on public.course_resources for all to service_role
  using (true) with check (true);

drop policy if exists "Service role manages cohort targets" on public.cohort_targets;
create policy "Service role manages cohort targets"
  on public.cohort_targets for all to service_role
  using (true) with check (true);

drop policy if exists "Service role manages teacher reminders" on public.teacher_reminders;
create policy "Service role manages teacher reminders"
  on public.teacher_reminders for all to service_role
  using (true) with check (true);

drop policy if exists "Service role manages request rate limits" on public.request_rate_limits;
create policy "Service role manages request rate limits"
  on public.request_rate_limits for all to service_role
  using (true) with check (true);

commit;
