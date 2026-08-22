# Supabase Setup Notes

## Run order

1. Existing `supabase/schema.sql`
2. New `supabase/access-cohorts-v1.sql`
3. Create the first Auth user in the Supabase Dashboard
4. Run `supabase/FIRST-ADMIN-SETUP.sql` after replacing its placeholders

## First administrator

Do not put a permanent “admin email” bypass in TypeScript. The first administrator is promoted once in SQL, and later admins should be managed through an audited trusted process.

## Seat provisioning

The admin UI uses a server-only Supabase admin client. It creates one Auth user per student and then inserts the profile/cohort membership. The database independently enforces the student seat limit.

## Email addresses

Every account requires a distinct reachable email address if the learner needs self-service password recovery. For minors, use school-managed addresses or aliases approved by the school rather than inventing inaccessible addresses.

## Redirect URLs

Add these to the Supabase Auth URL configuration for local and production environments:

```text
http://localhost:3000/auth/callback
https://YOUR-DOMAIN/auth/callback
```

Set the Site URL to the deployed HTTPS website in production.

## Security review before launch

- confirm RLS is enabled on every learner-data table;
- confirm the service-role key appears only in server environment variables;
- confirm public signup remains disabled in both UI and server action;
- test a student cannot open `/teacher` or `/admin`;
- test a teacher cannot provision accounts;
- test a student cannot read another cohort’s records;
- test seat 13 is rejected for a 12-seat cohort;
- test global leaderboard output contains no email or school name;
- test password-reset links return to the intended production domain.
