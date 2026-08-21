# Learning Guide — Understand the Starter Instead of Only Copying It

This guide explains the code in the order a beginner should learn it. Do not try to understand every file on the first day.

## 1. The whole system in one picture

```text
Student's browser
       |
       v
Next.js pages and components
       |
       +--> Server Actions: signup, login, reset password
       |
       +--> API route: check a quiz answer
       |
       +--> Supabase Auth: accounts and sessions
       |
       +--> Supabase Database: lesson progress
```

The first version intentionally keeps verified lesson content in the code. Supabase stores changing student information, not the official answer key.

## 2. What Next.js is doing

The `app` folder controls the website routes. A folder containing `page.tsx` becomes a page.

Examples:

```text
app/page.tsx                         -> /
app/about/page.tsx                   -> /about
app/dashboard/page.tsx               -> /dashboard
app/courses/[courseSlug]/page.tsx    -> /courses/smart-door-lab
```

Square brackets mean that part of the address is dynamic. The same lesson-page code can therefore display many different lessons.

## 3. Read these files in this order

### A. `app/page.tsx`

This is the public homepage. It is mainly HTML-like JSX plus Tailwind class names.

First exercise: change one heading, save the file and watch the browser update.

### B. `lib/courses.ts`

This is the verified curriculum data for Stage 1. Each lesson contains:

- title and duration
- objectives
- explanation sections
- practical task
- quiz
- approved tutor guidance

First exercise: change the wording of one lesson summary. Do not change the correct answer until you understand the quiz route.

### C. `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx`

This file takes one course slug and one lesson slug, finds the matching content and displays:

- lesson sidebar
- video area
- explanation
- practical task
- quiz
- tutor panel
- previous and next buttons

### D. `components/lesson-quiz.tsx`

This is a Client Component because the learner clicks radio buttons and receives an immediate result. The words `"use client"` tell Next.js that this component needs browser-side interactivity.

It does not contain the correct answer.

### E. `app/api/quiz/route.ts`

This server route receives the selected option, finds the verified answer in `lib/courses.ts`, checks it and returns the explanation.

In demo mode it stores progress in a browser cookie. With Supabase connected it stores progress in the database.

### F. `lib/auth-actions.ts`

This file contains server actions for:

- account creation
- login
- password-reset email
- setting the new password
- sign out

The browser never receives a Supabase service-role key. This project does not use one.

### G. `lib/supabase/proxy.ts`

This checks the user's session before protected pages open. Public pages such as Home and About remain available without an account.

### H. `supabase/schema.sql`

This creates the lesson-progress table and Row Level Security policies. The policies limit each signed-in learner to their own progress records.

## 4. Server Components and Client Components

Most pages are Server Components by default. Use them for secure data access and content that does not need browser state.

A Client Component begins with:

```ts
"use client";
```

Use it only when you need interaction such as:

- `useState`
- click handlers
- browser-only APIs
- interactive forms that do not use a server action

Keeping most of the platform server-rendered reduces the amount of JavaScript sent to school devices.

## 5. How authentication flows

### Signup

```text
/signup form
    -> signup() server action
    -> Supabase creates account
    -> confirmation email
    -> /auth/callback exchanges the code for a session
    -> /dashboard
```

### Forgot password

```text
/forgot-password form
    -> Supabase sends recovery email
    -> /auth/callback creates temporary recovery session
    -> /update-password
    -> updateUser() changes password
```

Raw passwords are never stored in the course database.

## 6. How to add a video

Each lesson accepts an optional `videoEmbedUrl` in `lib/courses.ts`:

```ts
videoEmbedUrl: "https://www.youtube-nocookie.com/embed/VIDEO_ID",
```

Use your own videos and confirm that the video host and privacy settings are suitable for schools. Without an embed URL, the clean placeholder remains visible.

## 7. How to add a fifth lesson

In `lib/courses.ts`, copy one complete lesson object, then change:

- `slug`
- `number`
- `title`
- `summary`
- objectives and sections
- quiz ID, options, correct index and explanation
- tutor guidance

The course overview, sidebar and previous/next navigation update automatically from the array order.

Use a unique slug such as:

```text
transistor-buzzer-driver
```

Do not use spaces in a slug.

## 8. Why the tutor is offline in Stage 1

The tutor panel currently selects only human-written guidance. This proves the student interface without API cost or hallucinated grading.

The live AI stage should later receive only:

- current lesson
- current verified question
- approved answer rubric
- approved common mistakes
- recent student attempts

The deterministic quiz route must remain responsible for official scoring.

## 9. Safe first edits

Make these changes one at a time:

1. Change the temporary brand name in the header and footer.
2. Rewrite the homepage value proposition.
3. Add one real Smart Door Lab diagram to `public/`.
4. Add your first short lesson video.
5. Expand Lesson 1 with your verified circuit instructions.
6. Add a fifth lesson only after the first four pages work.

After each meaningful change, run:

```bash
npm run typecheck
npm run lint
```

Before deployment, run:

```bash
npm run check
```

## 10. Git habit to learn immediately

Initialize Git once from the project folder:

```bash
git init
```

After each working change:

```bash
git status
git add .
git commit -m "Describe the change clearly"
```

Commit small working stages. This gives you a safe point to return to when a later change breaks the website.

## 11. What not to build yet

Do not add these before the basic course flow is reliable:

- payment system
- unrestricted live AI
- browser KiCad clone
- custom PCB ordering
- student social messaging
- multiple school roles
- 15 complete courses

The next genuine milestone is a teacher-controlled class and invitation system, followed by the restricted live tutor.
