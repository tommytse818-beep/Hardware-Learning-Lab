# Hardware Learning Lab — Access, Cohorts and Role Portals V1

This is a **targeted patch**, not a replacement website.

It upgrades the existing Hardware Learning Lab project with:

- invite-only Supabase email/password accounts;
- no public/free registration;
- public Course 0 previews while signed out;
- exact cohort seat limits;
- admin provisioning for students and teachers;
- mandatory temporary-password replacement on first login;
- Supabase forgot-password/reset flow;
- student, teacher and admin portals;
- cohort and opt-in global leaderboards;
- attempt-weighted quiz points;
- teacher-triggered catch-up emails;
- school-enquiry email notification to a private inbox through a transactional email service;
- a database scaffold for future timed quizzes.

## Important terminology

The school-issued credential in this V1 is a **unique temporary password**, not a WebAuthn passkey and not one shared cohort code. Every learner needs a separate account and a separate reachable email address so password recovery can work.

For a 12-student cohort, provision exactly 12 student accounts. Teacher accounts are separate and do not consume student seats.

## What this patch does not do

- It does not take card payments.
- It does not send bank details automatically from the public form.
- It does not make a shared password safe.
- It does not enable public sign-up.
- It does not publish student emails or real names on a global leaderboard.
- It does not implement unattended scheduled reminder emails yet.
- It does not configure Supabase, DNS or Resend automatically.
- It does not run SQL against your real Supabase project.

## Commercial flow

1. A school opens **For schools** and submits a quotation enquiry.
2. The server stores the enquiry in Supabase.
3. The server sends a notification to the private address configured as `ENQUIRY_NOTIFICATION_EMAIL`.
4. Tommy checks the school and manually sends the quotation, programme documents and bank-transfer instructions.
5. After payment/approval is confirmed, an admin creates the school, cohort and exact student seat limit.
6. The admin provisions unique student accounts and teacher account(s).
7. Temporary credentials are shown once to the admin for secure distribution.
8. Each user signs in and must replace the temporary password.
9. Supabase handles later forgot-password emails to each user’s own email address.
10. Students access Section 1 onward only when signed in and entitled. Signed-out visitors can still watch Course 0 previews.

## Apply this patch

Read `BEGINNER-CHECKLIST.md` and paste `VSCODE-AGENT-PROMPT.md` into VS Code Agent Chat.

## Required manual setup after the code is applied

1. Review and run your existing `supabase/schema.sql` if it has not already been run.
2. Review and run `supabase/access-cohorts-v1.sql` in Supabase SQL Editor.
3. Create the first auth user in Supabase Dashboard.
4. Use the guarded query in `FIRST-ADMIN-SETUP.sql` after replacing the placeholders.
5. Put secrets in `.env.local`, never in Git or browser code.
6. Configure a verified transactional sender and set `ENQUIRY_NOTIFICATION_EMAIL=tommytse818@gmail.com` in `.env.local` only.
7. Restart the development server.

## Validation

See `VALIDATION.md` for the exact checks performed and any remaining limitations.
