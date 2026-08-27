begin;

create index if not exists cohort_targets_updated_by_idx
  on public.cohort_targets (updated_by);

create index if not exists teacher_reminders_cohort_id_idx
  on public.teacher_reminders (cohort_id);

commit;
