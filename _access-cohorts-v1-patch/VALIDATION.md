# Validation Record

The targeted patch is intended for the existing repository and preserves the About V2 and Project Experience V1 work.

## Required local checks

```powershell
npm ci
npm run check
```

`npm run check` in the current project runs:

- ESLint;
- TypeScript `tsc --noEmit`;
- Next.js production build.

## Manual acceptance tests

- `/login` contains no registration link.
- `/signup` contains no account-creation form.
- signed-out users can open `/courses/open-guard-mini/preview`.
- signed-out users cannot open Section 1.
- a new provisioned user is forced through `/first-login`.
- forgot-password email works for a reachable test account.
- student cannot open `/teacher` or `/admin`.
- teacher can open only assigned cohorts.
- teacher cannot create users.
- admin can create a 12-seat cohort.
- the 13th student is rejected.
- teacher account does not consume a student seat.
- first/second/third/fourth-correct attempts award 100/50/25/0 percent.
- a wrong attempt does not reveal the method.
- cohort leaderboard uses aliases/avatars.
- global board includes only opted-in pseudonymous users.
- quote submission is saved even if email delivery fails.
- reminder email is rate-limited and logged.

## Honest V1 limitations

- timed quizzes are schema-only until the assessment rules are approved;
- reminder emails are teacher-triggered, not scheduled;
- credentials are shown once for pilot distribution rather than delivered by a complete invitation workflow;
- the public-form rate limiter is process-local;
- no payment gateway or accounting integration is included;
- no school self-service purchaser portal is included;
- production use still requires a staging security/privacy review.

## Automated pack checks

- **REVIEW:** All required patch files exist — .env.example, app/login/page.tsx, app/signup/page.tsx, app/first-login/page.tsx, app/settings/page.tsx, app/admin/page.tsx, app/teacher/page.tsx, app/dashboard/page.tsx, app/courses/[courseSlug]/preview/page.tsx, app/api/admin/schools/route.ts, app/api/admin/cohorts/route.ts, app/api/admin/users/route.ts, app/api/teacher/reminders/route.ts, app/api/teacher/cohort-target/route.ts, app/api/quiz/route.ts, app/api/school-enquiry/route.ts, components/avatar-badge.tsx, components/admin/admin-provisioning-console.tsx, components/teacher/teacher-dashboard.tsx, components/dashboard/student-dashboard.tsx, lib/authorization.ts, lib/course-access.ts, lib/course-preview.ts, lib/email.ts, lib/portal-data.ts, lib/settings-actions.ts, supabase/access-cohorts-v1.sql, globals-css-additions.css
- **PASS:** Private Gmail address is not hard-coded in tracked application code
- **PASS:** Login UI contains no free-registration call to action
- **REVIEW:** Signup route contains no signup form
- **REVIEW:** Server signup action is disabled
- **REVIEW:** Attempt-weighted points are present
- **REVIEW:** Core cohort/access tables are present
- **REVIEW:** Student seat limit is database-enforced
- **REVIEW:** RLS is enabled in the access schema
- **REVIEW:** Secrets remain server-only in example env
- **PASS:** Public signup is disabled in example env
- **REVIEW:** Applied validation copy: npm run check — exit status 254
- **REVIEW:** Applied validation copy: npm test — exit status 254

The final VS Code Agent must still run `npm run check` in the user’s actual, latest working copy after merging this targeted patch.
