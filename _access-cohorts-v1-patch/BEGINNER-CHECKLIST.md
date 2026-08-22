# Beginner Checklist — Exact Steps

## Part A — Put the patch beside the existing website files

1. Stop the current local server in VS Code Terminal with `Ctrl + C`.
2. Back up the complete `hardware-learning-platform` folder.
3. Extract the downloaded ZIP.
4. Move the extracted folder named `_access-cohorts-v1-patch` into the real project root.
5. The project root is the folder that directly contains `package.json`.

Correct structure:

```text
hardware-learning-platform
├── app
├── components
├── lib
├── public
├── supabase
├── package.json
└── _access-cohorts-v1-patch
    ├── code
    ├── README-FIRST.md
    ├── BEGINNER-CHECKLIST.md
    └── VSCODE-AGENT-PROMPT.md
```

Do not place the patch inside `app`, `components`, `public` or `supabase`.

## Part B — Use the correct VS Code chat

1. Open the real `hardware-learning-platform` folder in VS Code.
2. Press `Ctrl + Alt + I` to open the full Chat view.
3. Start a **new** chat/session.
4. Choose an editing-capable Agent/Local/Copilot/Codex target.
5. Open `VSCODE-AGENT-PROMPT.md` from the patch folder.
6. Copy the entire prompt and paste it into VS Code Agent Chat.
7. Let the agent inspect the existing files before approving changes.

Approve changes only to the files listed by the prompt. Do not approve package upgrades, deletion of the main project, or changes to the About V2 visual experience.

## Part C — Test the code locally

After the agent finishes:

```powershell
npm run check
npm run dev
```

Open these pages:

```text
http://localhost:3000/login
http://localhost:3000/signup
http://localhost:3000/courses/open-guard-mini/preview
http://localhost:3000/dashboard
http://localhost:3000/teacher
http://localhost:3000/admin
http://localhost:3000/settings
```

Before Supabase is connected, protected production functions will remain unavailable or use clearly labelled demo data.

## Part D — Configure Supabase safely

1. Open Supabase Dashboard for this project.
2. Open SQL Editor.
3. Run the existing base schema first if needed: `supabase/schema.sql`.
4. Review and then run: `supabase/access-cohorts-v1.sql`.
5. In Authentication → Users, create your own first user.
6. Copy that user’s UUID and email.
7. Open `supabase/FIRST-ADMIN-SETUP.sql` locally.
8. Replace both placeholders and run the query.
9. Confirm the query returns exactly your own profile with role `admin`.

Never put a service-role key in browser code or in a committed file.

## Part E — Configure private email notification

Create or edit `.env.local` in the project root. Do not commit it.

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000

RESEND_API_KEY=YOUR_RESEND_API_KEY
EMAIL_FROM=Hardware Learning Lab <enquiries@YOUR_VERIFIED_DOMAIN>
ENQUIRY_NOTIFICATION_EMAIL=tommytse818@gmail.com
```

You do not connect the Gmail inbox to VS Code. The website sends a transactional notification **to** that Gmail address.

For production, replace `NEXT_PUBLIC_SITE_URL` with the deployed HTTPS address and add the same callback URLs in Supabase Authentication URL settings.

## Part F — Test the real purchase-to-access flow

1. Submit a quotation form on `/schools`.
2. Confirm the enquiry appears in Supabase and the private Gmail inbox receives the notice.
3. Sign in as admin.
4. Open `/admin`.
5. Create a school.
6. Create a cohort and set the student seat limit to `12`.
7. Assign `open-guard-mini` to the cohort.
8. Paste 12 lines in the student batch box using `Student Name,email@example.com`.
9. Provision the teacher separately.
10. Copy/download the temporary credential result immediately; it is intentionally shown only once.
11. Test one student account in a private/incognito browser.
12. Confirm first login forces a new password.
13. Confirm the student can access Section 1 and sees their points/leaderboard.
14. Confirm the teacher can see the cohort but cannot open admin controls.
15. Confirm a signed-out visitor can view Course 0 only.

## Part G — Remove the temporary patch folder

After `npm run check` passes and the pages work, remove only:

```text
_access-cohorts-v1-patch
```

Do not delete the real project folder.
