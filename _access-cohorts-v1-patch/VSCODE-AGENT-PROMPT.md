# VS Code Agent Prompt — Apply Access, Cohorts and Role Portals V1

You are modifying my EXISTING `hardware-learning-platform` / `Hardware-Learning-Lab` Next.js repository.

Do not create a new app, do not create a replacement website, do not initialise a second Supabase project, and do not remove the About V2 or Project Experience V1 work.

The temporary targeted patch folder is in the project root as:

`_access-cohorts-v1-patch`

## 1. Read repository rules and inspect before editing

Before changing anything:

1. Read `AGENTS.md`.
2. Read the relevant local Next.js 16 documentation under `node_modules/next/dist/docs/` as required by `AGENTS.md`.
3. Inspect:
   - `package.json`
   - `.env.example`
   - `app/layout.tsx`
   - `app/globals.css`
   - `app/login/page.tsx`
   - `app/signup/page.tsx`
   - `app/forgot-password/page.tsx`
   - `app/update-password/page.tsx`
   - `app/auth/callback/route.ts`
   - `app/dashboard/page.tsx`
   - `app/courses/[courseSlug]/page.tsx`
   - `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx`
   - `app/api/quiz/route.ts`
   - `app/api/school-enquiry/route.ts`
   - `components/site-header.tsx`
   - `components/site-mobile-nav.tsx`
   - `components/lesson-quiz.tsx`
   - `components/schools/schools-experience.tsx`
   - `lib/auth-actions.ts`
   - `lib/course-access.ts`
   - `lib/courses.ts`
   - `lib/env.ts`
   - `lib/progress.ts`
   - `lib/viewer.ts`
   - `lib/supabase/admin.ts`
   - `lib/supabase/server.ts`
   - `lib/supabase/proxy.ts`
   - `lib/supabase/public-routes.ts`
   - `supabase/schema.sql`
4. Inspect every supplied file under `_access-cohorts-v1-patch/code` before copying it.
5. Review the current Git diff. Preserve valid later work if the local repository is ahead of the patch assumptions.

## 2. Business flow to implement exactly

There is no free registration.

The real flow is:

1. A school requests a quotation through the public website.
2. The enquiry is saved and a private notification is sent to the inbox configured through `ENQUIRY_NOTIFICATION_EMAIL`.
3. Tommy manually verifies the contact and sends quotation/programme documents/bank-transfer instructions.
4. Only after approval/payment does an admin create a school, cohort and purchased course assignment.
5. A 12-seat cohort permits a maximum of 12 student accounts.
6. Every student gets an individual school-issued account with their own email and unique temporary password. Never create one shared cohort password.
7. Teacher accounts are separate and do not consume student seats.
8. On first login, every provisioned user must replace the temporary password.
9. Later password recovery uses Supabase email reset to the individual account email.
10. Signed-out visitors may view only the public Course 0 preview for a course.
11. Section 1 onward requires an authenticated account plus active entitlement/cohort course assignment.

Use the UI term **temporary password** or **school-issued access**, not WebAuthn passkey, because the current system is Supabase email/password authentication.

## 3. Roles and visibility

Roles are `admin`, `teacher`, and `student`.

### Admin

- `/admin`
- create schools;
- create cohorts;
- set exact student seat limit;
- assign a purchased course;
- batch provision students from `Name,email` lines;
- provision teachers;
- see credentials once for secure distribution;
- no secrets or temporary passwords stored in the application database.

### Teacher

- `/teacher`
- see only assigned cohorts;
- view real student names, aliases, progress, points and behind/on-track state;
- set a target checkpoint;
- trigger a server-generated catch-up email;
- must not see or call student/admin provisioning actions.

### Student

- `/dashboard`
- see own completion and points;
- see cohort leaderboard through aliases/avatars, not peer emails;
- see an opt-in pseudonymous global leaderboard;
- `/settings` permits display name, alias, cute avatar, global leaderboard opt-in and password change.

Do not rely on hiding tabs. Authorise every protected page and API on the server.

## 4. Quiz scoring

Implement and preserve this server-authoritative scoring rule per checkpoint:

- first correct attempt: 100% of available points;
- second correct attempt: 50%;
- third correct attempt: 25%;
- fourth or later correct attempt: 0 points, but completion is still recorded.

Every submitted answer increments the attempt count. Once a learner obtains the first correct result, do not alter that awarded score on later retries. Do not expose correct answers or worked methods before the answer is correct.

The supplied database includes a `quiz_sessions` scaffold for future timed quizzes. Do not invent a live timer or final assessment rules until approved content exists.

## 5. Privacy and safeguarding defaults

- cohort boards show alias/avatar, not email;
- teacher sees real names only for assigned cohorts;
- global leaderboard is opt-in and pseudonymous;
- never display school or email on the global board;
- no signed-out leaderboard;
- reminder emails do not mention rank;
- teacher reminder email is manual/one-click and rate-limited in V1;
- do not add unattended scheduled emails;
- do not send bank details automatically from the public form.

## 6. Apply the targeted patch

Use `_access-cohorts-v1-patch/code` as the source.

For every supplied file:

- create the destination directory when necessary;
- add or replace the matching path in the real project;
- preserve local improvements when a direct replacement would regress a later valid change;
- resolve conflicts by keeping the business/security rules in this prompt.

The supplied code includes changes/additions under:

- `.env.example`
- `app/admin/**`
- `app/api/admin/**`
- `app/api/quiz/route.ts`
- `app/api/school-enquiry/route.ts`
- `app/api/teacher/**`
- `app/courses/[courseSlug]/preview/**`
- `app/courses/[courseSlug]/page.tsx`
- `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx`
- `app/dashboard/page.tsx`
- `app/first-login/**`
- `app/login/page.tsx`
- `app/settings/**`
- `app/signup/page.tsx`
- `app/teacher/**`
- `components/admin/**`
- `components/dashboard/**`
- `components/teacher/**`
- `components/avatar-badge.tsx`
- `components/lesson-quiz.tsx`
- `components/site-header.tsx`
- `components/site-mobile-nav.tsx`
- `lib/auth-actions.ts`
- `lib/authorization.ts`
- `lib/course-access.ts`
- `lib/course-preview.ts`
- `lib/email.ts`
- `lib/env.ts`
- `lib/portal-data.ts`
- `lib/progress.ts`
- `lib/settings-actions.ts`
- `lib/viewer.ts`
- `supabase/access-cohorts-v1.sql`
- `supabase/FIRST-ADMIN-SETUP.sql`

### CSS merge

Append `_access-cohorts-v1-patch/code/globals-css-additions.css` to `app/globals.css` exactly once.

If an earlier block marked `Access, cohorts and role portals V1` already exists, replace that scoped block rather than duplicating it.

Do not delete About V2 CSS, Project Experience V1 CSS or unrelated global styles.

## 7. Email configuration rules

The code uses a server-side transactional email helper.

- Never commit `tommytse818@gmail.com` into tracked application source.
- Never put a Gmail password in the application.
- Never expose `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` or recipient configuration through `NEXT_PUBLIC_` variables.
- Keep placeholders in `.env.example`.
- Tell me to place this only in `.env.local` / protected deployment environment:

```env
ENQUIRY_NOTIFICATION_EMAIL=tommytse818@gmail.com
```

The quote API must save the enquiry even when notification email delivery fails, and record the delivery state.

## 8. Supabase rules

- Preserve the existing browser/server Supabase clients and auth callback unless a compatibility fix is genuinely required.
- Service-role use must remain server-only.
- Do not execute SQL against my real Supabase project.
- Copy `supabase/access-cohorts-v1.sql` and `supabase/FIRST-ADMIN-SETUP.sql`, then tell me to review/run them manually.
- Keep RLS enabled.
- Do not grant learner roles direct insert/update rights for roles, memberships, entitlements, attempts, reminders or audit records.
- Seat limits must be enforced in the database as well as in UI/API validation.
- A user created through an untrusted path must never be able to choose `admin` or `teacher` through metadata.

## 9. Preserve existing work

Do not modify or remove unless required for a narrow integration fix:

- `app/about/**`
- About V2 components, images and CSS;
- `app/projects/**`
- Project Experience V1 components, images, video and CSS;
- school programme visual content;
- course curriculum wording/diagrams except where needed for access or scoring;
- package versions.

Do not install a UI or animation library. Use the existing Tailwind/CSS system.

## 10. UI requirements

Match the polished Hardware Learning Lab visual direction:

- spacious Apple-inspired composition without copying Apple branding;
- dark glass/gradient login panel;
- subtle reveal, hover and magnification motion;
- clear school-issued access explanation;
- obvious “no public registration” message without making the page look like an error;
- role-appropriate dashboard navigation;
- cute but restrained avatar choices;
- responsive at 390, 768, 1024 and 1440 px;
- keyboard accessible;
- honour `prefers-reduced-motion`;
- no horizontal overflow.

## 11. Verify the integration

Run:

```powershell
npm run check
```

Fix only errors caused by this patch. Do not upgrade Next.js, React, Supabase or other packages to make an error disappear.

Then inspect, or tell me to inspect after `npm run dev`:

- `/login`
- `/signup`
- `/forgot-password`
- `/courses/open-guard-mini/preview`
- `/dashboard`
- `/settings`
- `/teacher`
- `/admin`
- `/schools`
- `/about`
- `/projects`

Security/acceptance checks:

1. no Create account link/form;
2. public Course 0 works signed out;
3. Section 1 redirects signed-out users;
4. first-login password replacement is mandatory;
5. student cannot access teacher/admin routes or APIs;
6. teacher cannot access admin route/API;
7. 13th student is rejected in a 12-seat cohort;
8. teacher does not consume a student seat;
9. quiz attempts award 100/50/25/0%;
10. wrong answers do not reveal methods;
11. peer/global boards expose no email;
12. quote submission persists even if email sending fails;
13. reminder endpoint verifies teacher/cohort membership and rate limit;
14. existing About/Projects/Schools pages still work.

## 12. Cleanup and final report

Only after the code is copied, merged and `npm run check` passes, delete the temporary folder:

`_access-cohorts-v1-patch`

Do not delete the real project folder.

Report:

1. every file created/changed;
2. whether `npm run check` passed;
3. confirmation that About V2 and Project Experience V1 were preserved;
4. confirmation public registration is impossible through both UI and server action;
5. confirmation role checks are server-side;
6. the SQL files I must run manually;
7. the `.env.local` variables I must set manually;
8. the exact next command `npm run dev`;
9. the URLs to test;
10. all remaining V1 limitations honestly;
11. confirmation that no replacement website/project was created.

Inspect, integrate, test and report now. Do not stop after giving me only a plan unless there is a genuine conflict that cannot be resolved safely.
