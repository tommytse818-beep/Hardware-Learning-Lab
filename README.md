# Hardware Learning Platform — Stage 1

This is the first runnable version of the planned Hong Kong secondary-school hardware education platform.

It deliberately focuses on the foundation:

- Clean public pages: Home, Projects, For Schools and About
- Email/password signup and login through Supabase
- Automatic password-reset email flow
- Protected student dashboard
- Smart Door Lab course overview
- Four prototype lessons with previous/next navigation
- Server-checked quiz answers
- Cloud progress storage with Row Level Security
- An instant, human-verified tutor preview

It does **not** connect a paid AI API yet. The tutor preview uses approved lesson guidance and demonstrates the interface and logic before live AI is added.

---

## 1. Which computer to use

Use your **Mac Studio** or Windows desktop, not the iPhone or iPad, for development.

The instructions below work on both macOS and Windows.

---

## 2. Install the tools once

Install:

1. **Visual Studio Code**
2. **Git**
3. **Node.js 24 LTS** (recommended; Node.js 22 LTS is also supported)

After Node.js is installed, open a new Terminal and verify:

```bash
node --version
npm --version
```

Node 24.x is recommended. Node 22.x LTS also satisfies this starter project.

---

## 3. Open the downloaded project

### macOS

1. Unzip the downloaded file.
2. Move the `hardware-learning-platform` folder somewhere easy, such as Documents.
3. Open Visual Studio Code.
4. Select **File -> Open Folder**.
5. Choose `hardware-learning-platform`.
6. In VS Code, select **Terminal -> New Terminal**.

Run:

```bash
npm install
npm run dev
```

### Windows PowerShell

1. Unzip the downloaded file.
2. Open Visual Studio Code.
3. Select **File -> Open Folder**.
4. Choose `hardware-learning-platform`.
5. Select **Terminal -> New Terminal**.

Run:

```powershell
npm install
npm run dev
```

Then open this address in Chrome, Edge or Safari:

```text
http://localhost:3000
```

Do not type the address into the VS Code terminal. Type it into the browser address bar.

To stop the website, return to the terminal and press:

```text
Control + C
```

---

## 4. What works before Supabase is connected

The project automatically starts in **demo mode**.

You can immediately test:

- Homepage and navigation
- Dashboard
- Smart Door Lab overview
- Lesson sidebar
- Previous/next buttons
- Quiz checking
- Browser-only demo progress across the lesson, course and dashboard pages
- Verified tutor preview
- Loading and error states
- Responsive layout

Real account forms are intentionally disabled until you add Supabase. Demo progress uses an HTTP-only browser cookie and is not a school record or cloud account.

---

## 5. Connect Supabase for real login and password email

### A. Create the project

Create a Supabase project from the Supabase dashboard.

From its **Connect** panel, copy:

- Project URL
- Publishable key

Do **not** use a service-role key in this website.

### B. Create `.env.local`

In the project root, duplicate `.env.example` and name the copy:

```text
.env.local
```

On macOS Terminal:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` in VS Code and replace the placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ALLOW_PUBLIC_SIGNUP=false
# Server-only, never expose this value to the browser.
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Save the file.

### C. Create the progress table

In Supabase:

1. Open **SQL Editor**
2. Select **New query**
3. Open `supabase/schema.sql` from this project
4. Copy the whole SQL file into Supabase
5. Select **Run**

The SQL enables Row Level Security so each student can read and change only their own progress row.

### D. Configure authentication URLs

In Supabase, open:

```text
Authentication -> URL Configuration
```

Set:

```text
Site URL:
http://localhost:3000
```

Add this redirect URL for local development:

```text
http://localhost:3000/**
```

The wildcard is useful locally because confirmation and reset flows both return through `/auth/callback`.

### E. Restart the development server

Stop it with `Control + C`, then run:

```bash
npm run dev
```

The yellow demo banner should disappear.

---

## 6. Test the complete account flow

### Registration

1. Open `http://localhost:3000/signup`
2. Create an account
3. Open the confirmation email
4. Select the confirmation link
5. You should arrive at the dashboard

### Login

1. Sign out
2. Open `http://localhost:3000/login`
3. Enter the same email and password

### Forgot password

1. Open `http://localhost:3000/forgot-password`
2. Enter the account email
3. Open the newest reset email
4. Choose a new password
5. Return to the dashboard

Supabase's default test email service is rate-limited and best-effort. It is suitable for initial development, not the September 2027 production service. A branded custom SMTP provider should be connected before school pilots.

---

## 7. Learn the code as you build

Open:

```text
LEARNING-GUIDE.md
```

It explains the browser/server flow, dynamic course routes, authentication, quiz checking and the safest first edits in beginner order.

---

## 8. Where to edit your business content

### Change the course and lesson content

Open:

```text
lib/courses.ts
```

That file currently contains:

- Smart Door Lab course details
- Four lessons
- Learning objectives
- Quiz options and verified answers
- Tutor hints and diagnostic prompts

Keeping verified content in code is sensible for the first course because Git records every change.

### Change the homepage

Open:

```text
app/page.tsx
```

### Change the project roadmap

Open:

```text
app/projects/page.tsx
```

### Change the school package wording

Open:

```text
app/schools/page.tsx
```

### Change the visual style

Open:

```text
app/globals.css
```

Most layout styling is applied with Tailwind utility classes directly inside the `.tsx` page and component files.

---

## 9. Important prototype limitations

Before a real school launch, add or review:

- Invite-only school accounts
- Teacher and administrator roles
- Child-centred privacy notice and retention rules
- CAPTCHA and stricter rate limits
- Custom SMTP email delivery
- Production error monitoring
- Server-side assessment rules for larger question banks
- Teacher dashboard and class management
- Video hosting
- Live AI tutor with restricted approved context
- Human escalation
- Security testing
- Traditional Chinese localization
- PCB upload, ERC/DRC and human approval workflow

The current quiz is checked on the server, so the correct answer is not sent to the lesson page. The course content itself is still prototype material and should be reviewed as you build the final curriculum.

---

## 10. First files to understand

Read them in this order:

1. `app/page.tsx` — homepage
2. `lib/courses.ts` — course data
3. `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx` — lesson layout
4. `components/lesson-quiz.tsx` — interactive quiz interface
5. `app/api/quiz/route.ts` — server checks the answer and saves progress
6. `lib/auth-actions.ts` — login, signup and password reset
7. `lib/supabase/proxy.ts` — protects private pages
8. `supabase/schema.sql` — database and access rules

---

## 11. Common problems

### `npm` is not recognized

Node.js is not installed correctly, or the terminal was open before installation. Install Node.js LTS and open a new terminal.

### The browser says it cannot connect

Confirm that `npm run dev` is still running and that the terminal shows a local address.

### The yellow demo banner remains

Check that the file is named exactly `.env.local`, the keys are not placeholders, and the server was restarted.

### Confirmation or reset email does not arrive

Check spam, Supabase Auth logs and the default email rate limit. Confirm that `http://localhost:3000/**` is in the allowed Redirect URLs.

### Quiz checks but progress is not saved

Run the whole `supabase/schema.sql` file in the Supabase SQL Editor.

### A course page sends you to login

That is expected after Supabase is connected. Private learning pages are protected by `proxy.ts`.

### I want to clear the demo progress

Clear the site data/cookies for `localhost:3000` in your browser, then refresh the dashboard.

---

## 12. Check the project after making changes

Run these from the project folder:

```bash
npm run typecheck
npm run lint
```

Before publishing a deployment, run the combined check:

```bash
npm run check
```

---

## 13. The next development step

After this foundation works reliably, the next code milestone should be:

1. Teacher roles and invite-only classes
2. Real lesson video storage
3. A `/api/chat` route that retrieves only the current verified lesson context
4. Streaming tutor responses
5. Usage limits and teacher escalation

Do not place an OpenAI API key in a variable beginning with `NEXT_PUBLIC_`. The live tutor request must run on the server.
