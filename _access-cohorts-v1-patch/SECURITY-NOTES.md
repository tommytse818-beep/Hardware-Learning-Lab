# Security and Privacy Notes

## Unique accounts, never a shared code

A single password shared by 12 students makes individual progress, password reset, audit history and access removal unreliable. Provision 12 distinct student accounts for 12 seats.

## Temporary password

The temporary password is:

- generated using a cryptographically secure server function;
- shown to the admin once;
- never stored in the application database;
- replaced at first login;
- recoverable later only through the user’s email reset flow.

## Role checks

A hidden tab is only a visual convenience. Every protected page/API must check the authenticated role on the server.

## Service role

The Supabase service-role key bypasses RLS. It belongs only in server-side environment variables and must never be returned to the browser, committed to Git, placed in screenshots or pasted into a client component.

## Student privacy

- use cute aliases/avatars on peer boards;
- do not expose emails to classmates;
- make global ranking optional;
- do not display school identity globally;
- allow schools to disable peer/global boards if their safeguarding policy requires it;
- define retention/deletion rules before a real launch.

## Email and minors

Schools should approve the account-email model, parent/guardian notices where required, leaderboard visibility, reminder wording and retention period before learner accounts are created.

## Production hardening still required

- move in-memory public-form throttling to durable edge/database rate limiting;
- add CAPTCHA or an equivalent abuse control if public spam appears;
- add admin MFA before real customer data is held;
- add audit exports and account deactivation;
- consider one-time invitation links instead of emailed temporary passwords;
- complete a data-protection and safeguarding review;
- add automated integration/security tests against a staging Supabase project.
