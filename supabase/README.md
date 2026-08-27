# Supabase source of truth

The live project is managed through ordered, timestamped files in
`supabase/migrations/`. Do not run the removed one-off scaffold SQL files.
They represented older intermediate states and could recreate weaker policies.

## Live project status on 27 August 2026

The following eight migrations are already recorded in the connected project:

1. `20260826132418_repair_profiles_rls_grants_and_indexes_v1`
2. `20260826133455_quiz_attempts_private_resources_and_storage_v1`
3. `20260826133531_allow_completion_with_attempt_points_v1`
4. `20260826133903_portal_targets_reminders_and_rate_limits_v1`
5. `20260826134305_portal_foreign_key_indexes_v1`
6. `20260826134320_document_server_only_rls_policies_v1`
7. `20260827064723_repair_profile_integrity_and_seat_limit_v1`
8. `20260827065137_reserve_teacher_reminders_v1`

The last two migration files are included in this handoff so repository history
matches the database. They must **not** be run again against the live project.

For a fresh development project, apply all timestamped migrations in order with
the Supabase CLI or another reviewed migration workflow. Never paste a random
archive's SQL directly into production.

Read-only verification scripts remain under `supabase/VERIFY-*.sql`.
`FIRST-ADMIN-SETUP.example.sql` is only a parameterized reference for an
initial administrator; it is not an automatic installer.
