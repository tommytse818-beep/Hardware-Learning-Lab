# Learning Guide — Current Architecture

This guide explains the current system, not the earlier public-signup starter.
Read `AGENTS.md` first because the repository uses Next.js 16 conventions.

## 1. Request flow

```text
Browser
  -> Next.js page / client component
  -> server action or API route
  -> authenticated Supabase user
  -> trusted public.profiles role
  -> role/course/cohort authorization
  -> Row Level Security or server-only administrative client
```

The publishable key may reach the browser. The service-role key must remain in
server-only modules and environment variables.

## 2. Identity and roles

`lib/viewer.ts` loads the Auth user, then resolves `admin`, `teacher` or
`student` from `public.profiles.role`. Missing or invalid profiles fail closed.
Auth `user_metadata.role` is not trusted.

`lib/authorization.ts`, `lib/api-authorization.ts` and the Supabase proxy guard
protected pages and APIs. First-login accounts are redirected until the
provisioned temporary password has been replaced.

## 3. Provisioning

The admin portal creates:

1. an approved school;
2. an active cohort with a supported course and seat limit;
3. a learner or teacher Auth account;
4. the matching trusted profile and cohort membership.

Temporary passwords are generated server-side. Teacher accounts do not consume
student seats. The database trigger is the final concurrent seat-limit guard.

## 4. Course and quiz flow

Verified curriculum content and correct answers live in `lib/courses.ts`.

`app/api/quiz/route.ts`:

1. requires an authenticated user;
2. verifies course access;
3. resolves the known course, lesson and quiz;
4. scores the submitted answer on the server;
5. records the attempt and best progress through trusted database operations.

Never put a correct answer or service-role credential in a Client Component.

## 5. Private resources

`app/api/courses/[courseSlug]/resources/[resourceKey]/route.ts` verifies the
user and course access before creating a short-lived signed URL. The
`course-private` bucket remains private and has no broad direct learner policy.

## 6. Teacher operations

Teachers may view only assigned cohorts. A target lesson must resolve to a real
lesson in that cohort's course. Reminder delivery uses a database reservation
before sending so simultaneous requests cannot send duplicates.

## 7. Password recovery

`lib/auth-actions.ts`, `app/auth/callback/route.ts` and the password pages handle
recovery. Use only the newest recovery email and open a one-time link once.
Repeated rapid tests may hit Supabase email limits. Configure custom SMTP before
a real pilot.

## 8. Database changes

Use timestamped files under `supabase/migrations/`. The live database already
contains the migrations listed in `supabase/README.md`. Do not restore or run
the deleted scaffold SQL files.

## 9. Safe change order

1. Create a Git branch and confirm a clean working tree.
2. Read the page, API route, authorization helper and relevant migration.
3. Make one bounded change.
4. Add or update focused tests.
5. Run `npm test` and `npm run check`.
6. Review `git diff --check` and the complete diff.
7. Commit only after the role and access boundaries remain clear.
