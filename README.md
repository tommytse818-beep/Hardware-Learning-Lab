# Hardware Learning Lab

Hardware Learning Lab is a Next.js learning platform for school-managed
hardware and electronics programmes. The current working course is OpenGuard
Mini. Public visitors can view the site and course preview; protected lessons,
progress, teacher tools and administration require a provisioned Supabase
account.

## Current account model

There is **no public self-registration**. The `/signup` route explains the
invitation-only process rather than creating an account.

1. A school requests and confirms a programme.
2. An administrator creates an approved school and cohort.
3. The administrator assigns a supported course and issues one private account
   per learner or teacher.
4. The learner replaces the temporary password on first login.
5. Later recovery uses the registered email and a Supabase recovery link.

Roles are trusted only from `public.profiles.role`. Client-editable Auth metadata
must never grant admin, teacher or course access.

## Local development

Requirements:

- Node.js 24, as specified by `.nvmrc`
- npm
- Git
- Visual Studio Code or another editor

From the repository root:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000` in a browser. Stop the server with `Control+C`.

## Environment variables

Fill `.env.local` from `.env.example`.

Browser-safe values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Server-only values:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RATE_LIMIT_SALT`
- `ENQUIRY_NOTIFICATION_EMAIL`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Never prefix a server secret with `NEXT_PUBLIC_`, print it in logs, return it
from an API route or commit `.env.local`.

## Supabase

The live project already has its migrations. Do **not** run the removed
`schema.sql`, `access-cohorts-v1.sql` or other old one-off SQL files.

The repository source of truth is `supabase/migrations/`. Read
`supabase/README.md` before changing the database. Read-only checks live in
`supabase/VERIFY-*.sql`.

The service-role key is intentionally used only by server-side administrative,
quiz, private-resource, rate-limit and notification paths. Browser code uses the
publishable key and remains subject to Row Level Security.

## Main routes

- `/` — public home
- `/projects/open-guard-mini` — public project page
- `/courses/open-guard-mini/preview` — public preview
- `/login`, `/forgot-password`, `/update-password` — account lifecycle
- `/dashboard` — authenticated learner progress
- `/teacher` — assigned teacher cohorts only
- `/admin` — trusted administrator provisioning only

Protected course APIs validate authentication, role and course access on the
server. Correct quiz answers remain server-side.

## Validation

Run before every commit:

```powershell
npm test
npm run check
git diff --check
node scripts/audit-public-assets.mjs
```

Or on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-project.ps1
```

GitHub Actions runs `npm ci`, the Vitest suite, ESLint, TypeScript checking and a
production Next.js build on pushes and pull requests.

## Production checklist

Before a real school pilot:

- configure production Site URL and allowed redirect URLs in Supabase Auth;
- keep public signup disabled at the Supabase project level;
- enable leaked-password protection when the project plan supports it;
- configure custom SMTP and verify recovery-email delivery and rate limits;
- configure the Resend notification sender and private inbox;
- test admin, teacher and student access with separate accounts;
- test first-login password change and a fresh recovery link exactly once;
- test that an additional student is rejected at the cohort seat limit;
- upload private course files only to the private `course-private` bucket;
- run the full validation commands and review the Git diff.
