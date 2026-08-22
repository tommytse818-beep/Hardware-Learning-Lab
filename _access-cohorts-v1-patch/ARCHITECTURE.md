# Architecture — Access, Roles and Cohorts V1

## 1. Public commercial layer

Public routes remain visible without an account:

- home;
- About;
- Projects;
- For schools / quotation form;
- public project pages;
- `/courses/[courseSlug]/preview` for Course 0.

A public visitor cannot create an account. The old `/signup` URL remains only as an explanation page so stale links do not become an accidental registration path.

## 2. Enquiry and payment layer

The quotation form:

1. validates and rate-limits the request;
2. stores the enquiry in `school_enquiries`;
3. sends a notification through the server-only email helper;
4. does not disclose bank details or automate acceptance.

Commercial documents and bank-transfer instructions remain a verified human process.

## 3. Identity layer

Supabase Auth owns:

- email/password sign-in;
- password reset email;
- authenticated session cookies;
- password updates.

The application owns profile metadata in `public.profiles`:

- role: `admin`, `teacher` or `student`;
- display name;
- leaderboard alias;
- avatar key;
- global leaderboard opt-in;
- first-login password-change flag.

All users created by the normal auth trigger default to `student`. Admin and teacher roles are assigned only by trusted server/admin operations.

## 4. School and cohort layer

- `schools` represents a customer organisation.
- `cohorts` stores the school group and exact student seat limit.
- `cohort_memberships` assigns students and teachers.
- `cohort_courses` assigns purchased courses.
- database triggers enforce the student seat limit.
- teachers do not consume student seats.

## 5. Course access layer

Section 1 onward requires all of the following:

- authenticated user;
- verified account/session;
- temporary password already changed;
- direct active entitlement **or** active cohort membership with the course assigned.

UI hiding is not treated as security. Server pages and APIs verify the role and course access.

## 6. Portals

### Student

- current course and completion;
- points earned;
- cohort rank using an alias/avatar;
- optional anonymised global leaderboard;
- settings and password update.

### Teacher

- only cohorts assigned to that teacher;
- target lesson/checkpoint;
- completion and points per student;
- behind/on-track status;
- one-click server-generated catch-up reminder;
- no admin account provisioning.

### Admin

- create schools;
- create cohorts and set exact seat limits;
- assign courses;
- batch provision student accounts;
- provision teacher accounts;
- review high-level counts/audit trail.

## 7. Scoring

Each quiz submission creates a server-side attempt record.

- correct on attempt 1: 100% of checkpoint points;
- correct on attempt 2: 50%;
- correct on attempt 3: 25%;
- correct on attempt 4 or later: 0 points, but completion can still be recorded.

A later retry cannot overwrite the first correct award with a higher or lower score. Correct answers and worked methods remain server-side until the answer is correct.

## 8. Leaderboard privacy

- cohort boards show aliases and avatars, not email addresses;
- teachers see real names only for their assigned cohort;
- global participation is opt-in;
- global boards are pseudonymous and omit school/email;
- no public leaderboard is exposed to signed-out visitors.

## 9. Timed assessments

`quiz_sessions` is included as a database scaffold for future long-section timed quizzes. V1 does not start a timer because the final assessment content, timing rules, accommodations and resumption policy have not yet been approved.

## 10. Email reminders

Teacher catch-up emails are manually triggered from the teacher workspace and rate-limited per learner/cohort. Fully scheduled automatic emails are deliberately deferred until safeguarding, consent, school policy and delivery-provider behaviour are confirmed.
