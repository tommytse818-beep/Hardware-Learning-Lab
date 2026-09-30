# UI and Supabase audit — 3 September 2026

Historical audit snapshot. The findings below describe the September 3 review, not current deployment status. Later course, access and tutor work is documented in `docs/HLL-SELF-HOSTED-TUTOR.md`; verify live services before acting on older configuration findings.

## Scope checked

- Public home, projects, OpenGuard Mini, schools and about pages in Edge.
- Signed-in admin, course overview, lesson and password-recovery pages.
- Live Supabase tables, migrations, course resources and advisors.
- Current Next.js 16 form and image behaviour.

## Fixed in this review

- Password recovery now disables its submit button while Supabase is processing the request. A repeated request inside Supabase's email cooldown is shown as a neutral, privacy-safe message instead of a false generic failure.
- A missing course recording now shows an honest `Recording pending` state. The page no longer makes a known-broken protected-video request or exposes internal recording instructions as if they were a transcript.
- Home, project and schools copy now says clearly that the pilot curriculum and final recordings are still in development. The old claim of around 30 available micro-lessons was removed; the platform currently contains Section 0 plus nine Week 1 checkpoints.
- The admin page uses the available desktop width, includes visible field labels and presents the course by name instead of exposing its internal slug.
- The admin page now lists the 20 newest school enquiries, including their saved notification status. Previously it showed only a count, which was not enough while email delivery is unconfigured.
- Funding copy was checked against current official guidance. QEF application windows, 2026/27 LWLSSG and CITG figures, and the IT-Lab final extension are now dated and caveated. Direct official links were added.
- Deprecated Next.js image `priority` props were replaced with the current loading/preload behaviour.

## Live items still requiring configuration or approval

1. **Progress and review migration is not installed.** The live database has neither the `lesson_progress.review_state` column nor the `record_quiz_attempt_v2` function. Until `20260901094500_lesson_readiness_and_review_v1.sql` is applied, quiz recording and teacher review cannot work reliably. Applying it changes the live schema and requires explicit approval.
2. **Password-recovery redirect is not allowlisted exactly.** Supabase Auth currently allows `/auth/callback`, while the app sends `/auth/callback?next=/update-password`. Add that exact local URL now and the production equivalent before deployment.
3. **No lesson recordings are uploaded.** `course_resources` contains zero active rows and the private course bucket contains zero objects. Written lessons and checks work, but recordings do not yet exist.
4. **Transactional email is not configured.** `RESEND_API_KEY` and the sender domain are still placeholders. Enquiries are saved to Supabase and are now visible in the admin inbox, but private enquiry notifications and teacher reminder emails will not deliver.
5. **Leaked-password protection is disabled.** Supabase's security advisor recommends enabling its compromised-password check before a real pilot: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Findings that are intentional, not bugs

- Accounts are invitation-only and roles come from `public.profiles`; there is no public demo login.
- The current live acceptance-test cohort is full at 1/1 student seats, so another student cannot be added to that cohort unless its limit changes or another cohort is created.
- OpenGuard Mini is presented as an opening alert, not a lock or certified security product.
- Future project themes are labelled as planned/upcoming rather than available products.
- The verified tutor is explicitly offline and uses approved guidance; it is not pretending that a paid AI service is connected.

## Verification

- 18 test files and 90 tests pass.
- ESLint and TypeScript checks pass.
- The Next.js 16.3.2 production build completes successfully for all 32 generated routes.
- Edge reload checks confirm the admin layout, enquiry inbox, password form, lesson placeholder and revised funding copy render correctly.

## Official funding references used

- QEF Dedicated Funding Programme: https://www.qef.org.hk/en/application_guide/dfp_program.html
- EDB Life-wide Learning and Sister School Grant: https://www.edb.gov.hk/en/curriculum-development/curriculum-area/life-wide-learning/LWLSSG/index.html
- EDB Composite Information Technology Grant: https://www.edb.gov.hk/en/edu-system/primary-secondary/applicable-to-primary-secondary/it-in-edu/citg.html
- IT-Lab end-of-programme arrangement: https://www.it-lab.gov.hk/en/end_of_programme_arrangement.php
