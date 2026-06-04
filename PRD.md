# PRD.md — FaceSculpt™ LMS

## Project Overview

A custom Learning Management System (LMS) for the FaceSculpt™ online course — a professional facial sculpting training programme for beauty therapists and skin specialists. The platform delivers structured course content, video demonstrations, quizzes, downloadable resources, and certification across 8 modules and 38 lessons.

This is a B2C product. Students purchase access, complete the course at their own pace over 12 months, and receive a FaceSculpt™ certificate on completion.

---

## Users

### Student (primary user)
- Beauty therapists and skin specialists purchasing access to learn FaceSculpt™
- Non-technical users — the interface must be intuitive without any onboarding
- Accesses the platform on desktop and mobile (treatment rooms, home study)
- Needs to track their own progress and pick up where they left off

### Admin (secondary user)
- Course creator / business owner
- Manages content, student enrolments, downloads and platform settings
- Not a developer — admin UI must be simple and visual

---

## Core User Journeys

### Student
1. Lands on marketing page → clicks "Enrol" → purchases access (Stripe)
2. Receives email with login link → sets password → enters course dashboard
3. Works through modules in order → watches videos, reads theory, completes quizzes
4. Downloads resources (PDFs, worksheets, checklists) from relevant lessons
5. Completes all lessons → triggers certificate generation → downloads PDF certificate
6. Returns at any time within 12-month access window

### Admin
1. Logs into admin panel → views student list and progress
2. Adds / edits / reorders modules and lessons
3. Uploads video files and downloadable resources
4. Views quiz results per student
5. Manually grants or revokes access if needed

---

## Features

### Must Have (MVP)

#### Authentication & Access
- Email + password login (students and admin)
- Password reset via email
- 12-month access expiry per student from purchase date
- Protected routes — unauthenticated users redirected to login

#### Course Structure
- 8 modules, each containing multiple lessons
- Lesson types: Theory (text), Video, Quiz, Download
- Lessons unlock sequentially within each module
- Modules unlock after the previous module is fully completed
- Student progress saved automatically and persists across sessions

#### Video Player
- Hosted video playback (Manta Media / Vimeo or Supabase storage)
- Marks lesson complete on video watch (minimum 80% watched)
- Mobile-friendly player with fullscreen support

#### Theory Lessons
- Rich text content rendered cleanly
- Images supported inline
- Marks complete when student scrolls to bottom or clicks "Mark complete"

#### Quizzes
- Multiple choice questions per lesson
- Pass mark: 80%
- Unlimited retakes
- Shows correct / incorrect feedback after submission
- Marks lesson complete only on passing score

#### Downloadable Resources
- PDFs, worksheets, checklists attached to relevant lessons
- Download button visible within lesson
- Files served securely (authenticated download only)

#### Student Dashboard
- Visual progress overview (modules completed, current position)
- Quick resume — "Continue where you left off" button
- Access expiry date shown clearly

#### Certificate
- Auto-generated on 100% course completion
- PDF certificate with student name, course name, completion date
- Downloadable from dashboard

#### Admin Panel
- View all students: name, email, enrolment date, access expiry, % progress
- Edit module and lesson content (title, body text, video URL, attachments)
- Reorder modules and lessons via drag-and-drop
- Upload and manage downloadable files
- Manually enrol a student (bypass Stripe for gifted access)

#### Payments
- Stripe Checkout for one-time course purchase
- Webhook updates database on successful payment and creates student account
- Confirmation email sent on purchase

### Should Have (Post-MVP)

- Discount codes / coupon support via Stripe
- Admin dashboard with aggregate stats (total students, completion rate, avg quiz scores)
- Student can re-watch completed videos freely
- Email reminders at 30 days before access expiry
- Module-level progress indicators (e.g. "5/6 lessons complete")

### Could Have (Future)

- Cohort / group enrolments (for clinic teams)
- Live Q&A session scheduling
- Student discussion forum per module
- Multiple course support (if FaceSculpt™ expands to additional courses)
- Mobile app (React Native)

---

## Content Structure

Based on the FaceSculpt™ curriculum:

```
Module 01 — Skin & Muscle Anatomy (6 lessons)
  01.01 The three layers of skin                    [Theory, Quiz]
  01.02 How the face ages                           [Theory]
  01.03 How FaceSculpt™ addresses ageing           [Theory, Quiz]
  01.04 The muscles of facial expression            [Theory, Reference PDF]
  01.05 Face mapping & muscle balance               [Theory, Worksheet]
  01.06 The lymphatic system & facial flow          [Theory, Quiz]

Module 02 — The Science of FaceSculpt™ (7 lessons)
  02.01 Ageing at every layer                       [Theory]
  02.02 Why fascia release comes first              [Theory, Quiz]
  02.03 Lymphatic drainage science                  [Theory]
  02.04 Understanding EMS technology                [Theory, Quiz]
  02.05 EMS settings, intervals & intensity         [Theory, Reference PDF]
  02.06 Choosing the right EMS device               [Theory]
  02.07 Combining EMS with manual sculpting         [Theory]

Module 03 — Manual Sculpting Technique (6 lessons)
  03.01 What sculpting actually is                  [Theory]
  03.02 Reading the face before you start           [Theory, Worksheet]
  03.03 Pressure & pace guidelines                  [Theory, Quiz]
  03.04 Core sculpting techniques                   [Theory, Reference PDF]
  03.05 Integrating EMS with manual sculpting       [Theory]
  03.06 Common mistakes & how to correct them       [Theory, Quiz]

Module 04 — Practical Demonstrations (12 lessons)
  04.01 Full FaceSculpt™ treatment — start to finish [Video]
  04.02 Lymphatic drainage pathways                 [Video]
  04.03 Jawline sculpting & release                 [Video]
  04.04 Mid-face lift & cheekbone definition        [Video]
  04.05 Under-eye & periorbital de-puffing          [Video]
  04.06 Forehead & brow lift techniques             [Video]
  04.07 Neck & décolletage release                  [Video]
  04.08 Buccal-inspired external sculpting          [Video]
  04.09 EMS device demonstration                    [Video]
  04.10 Treatment adaptation examples               [Video]
  04.11 Common mistakes & corrections               [Video]
  04.12 Treatment finishing & client results        [Video]

Module 05 — Consultation & Treatment Planning (8 lessons)
  05.01 Why consultation is where results start     [Theory]
  05.02 Medical history & contraindications         [Theory, Reference PDF, Quiz]
  05.03 Facial assessment                           [Theory, Worksheet]
  05.04 Client goals & managing expectations        [Theory]
  05.05 Creating a bespoke treatment plan           [Theory, Worksheet]
  05.06 Treatment frequency & course planning       [Theory]
  05.07 Homecare & lifestyle advice                 [Theory, Reference PDF]
  05.08 Consultation forms & documentation          [Theory, Download]

Module 06 — Treatment Protocol (9 lessons)
  06.01 Room setup & preparation                    [Theory, Checklist]
  06.02 Client arrival & pre-treatment check        [Theory]
  06.03 Cleanse & skin preparation                  [Theory]
  06.04 Lymphatic opening sequence                  [Theory]
  06.05 Manual sculpting flow                       [Theory]
  06.06 EMS integration within the protocol         [Theory]
  06.07 Lift & contour sequence                     [Theory]
  06.08 Finishing drainage                          [Theory]
  06.09 Cooldown, calming phase & aftercare         [Theory, Reference PDF]

Module 07 — Business, Pricing & Positioning (5 lessons)
  07.01 Positioning FaceSculpt™ as a premium treatment [Theory]
  07.02 Pricing for profit                          [Theory, Worksheet]
  07.03 High-converting consultations               [Theory]
  07.04 Content that sells FaceSculpt™             [Theory]
  07.05 Client retention & long-term growth         [Theory]

Module 08 — Certification & Student Success (5 lessons)
  08.01 How certification works                     [Info]
  08.02 12-month access & learning on demand        [Info]
  08.03 Downloadable resources                      [Downloads]
  08.04 How to launch FaceSculpt™ in clinic        [Theory]
  08.05 Building confidence as a practitioner       [Theory]
```

---

## Tech Stack

| Layer         | Choice                  | Reason                                               |
|---------------|-------------------------|------------------------------------------------------|
| Framework     | Next.js 14 (App Router) | Full-stack, SSR, API routes in one project           |
| Language      | TypeScript              | Type safety across frontend and backend              |
| Database      | Supabase (Postgres)     | Auth, DB, file storage, row-level security built in  |
| Auth          | Supabase Auth           | Email/password, magic links, session handling        |
| Styling       | Tailwind CSS            | Utility-first, fast to build, easy to maintain       |
| Payments      | Stripe Checkout         | One-time purchase, webhooks, coupon support          |
| Video hosting | Vimeo (private links)   | Reliable streaming, private embeds, mobile-friendly  |
| PDF export    | react-pdf               | Certificate generation in-browser                    |
| Email         | Resend                  | Transactional email (welcome, reset, expiry)         |
| Deployment    | Vercel                  | Zero-config Next.js deployment, edge functions       |
| File storage  | Supabase Storage        | PDFs, worksheets, checklists — authenticated access  |

---

## Database Schema (high level)

```
users
  id, email, full_name, role (student | admin),
  created_at, access_expires_at, stripe_customer_id

modules
  id, title, order_index, description, is_published

lessons
  id, module_id, title, order_index, type (theory | video | quiz | download),
  content_html, video_url, is_published

lesson_resources
  id, lesson_id, file_name, file_url, label

quizzes
  id, lesson_id, pass_mark (default 80)

quiz_questions
  id, quiz_id, question_text, order_index

quiz_options
  id, question_id, option_text, is_correct

student_progress
  id, user_id, lesson_id, status (not_started | in_progress | complete),
  quiz_attempts, quiz_passed, completed_at

certificates
  id, user_id, issued_at, pdf_url
```

---

## Page Structure

```
/ (marketing landing page)
/login
/signup (post-Stripe redirect)
/forgot-password
/reset-password

/dashboard (student home — progress overview)
/course (module list)
/course/[moduleSlug] (module overview + lesson list)
/course/[moduleSlug]/[lessonSlug] (lesson view)
/certificate (download page)

/admin (admin dashboard — student list)
/admin/students/[id] (individual student progress)
/admin/content (module + lesson editor)
/admin/content/[moduleId] (edit module)
/admin/content/[moduleId]/[lessonId] (edit lesson)
/admin/uploads (file manager)
```

---

## Key Business Rules

- Access expires exactly 12 months from the date of purchase
- Lessons unlock sequentially — a student cannot skip ahead
- A module is marked complete only when all its lessons are complete
- Quiz pass mark is 80% — retakes are unlimited, no cooldown
- Certificate is only issued on 100% overall course completion
- Admin accounts are created manually — there is no self-serve admin signup
- Video lessons require 80% watch time before marking complete
- All downloadable files require an active authenticated session to access

---

## What "Done" Looks Like (MVP)

- [ ] A student can purchase access via Stripe and receive login credentials by email
- [ ] A student can log in, see their progress, and pick up where they left off
- [ ] All 8 modules and 38 lessons are accessible to enrolled students
- [ ] Video lessons play and mark complete on sufficient watch time
- [ ] Theory lessons mark complete on scroll-to-bottom or manual confirmation
- [ ] Quizzes work with multiple choice, pass/fail feedback, and unlock on passing
- [ ] Downloads are accessible within lessons, secured behind authentication
- [ ] Certificate generates and downloads as a PDF on course completion
- [ ] Admin can view student progress and edit lesson content
- [ ] Access expires after 12 months and student is shown a clear expiry message

---

## Out of Scope for MVP

- Live sessions or real-time features
- Student-to-student interaction or forums
- Multiple courses or course bundles
- Mobile app
- Affiliate or referral system
- Advanced analytics or reporting beyond basic progress tracking

---

## Constraints & Notes

- This is a solo admin operation — keep the admin interface simple and forgiving
- The course creator is not a developer; content editing must be doable without touching code
- Students are predominantly mobile users — every screen must work well on mobile
- Video privacy is important — Vimeo private embeds prevent direct link sharing
- The platform should be fast and lightweight — this is not a heavy enterprise LMS
- Keep environment variables in `.env.local` — never commit secrets to git

---

## First Session Prompt for Claude Code

```
Read this PRD.md carefully. 

Propose:
1. The directory structure for this Next.js project
2. The first 5 files to create
3. Three architectural decisions I need to make before you write any code

Do not write any code yet.
```
