## Phaseflow – Daily Routine Companion

**Phaseflow** is a focused daily-routine companion that helps you commit to a time-bound "phase" (e.g. 30 days), design a gentle routine, and then track how life actually unfolds. It combines **structured routine blocks**, **ad‑hoc timesheet logging**, and **non‑punitive streaks** into one calm interface.

> **Live Demo**: _Add your Vercel URL here (e.g. `https://phaseflow.vercel.app`)_  
> **Architecture**: See `docs/ARCHITECTURE.md` for a deep technical walkthrough.

---

## Screenshots

### Authentication & Onboarding

<div align="center">

**Login Page**  
![Login](./docs/screenshots/login.png)

**Registration Page**  
![Register](./docs/screenshots/register.png)

</div>

### Main Application

<div align="center">

**Home Dashboard**  
*Your current phase, progress, and quick actions*  
![Home](./docs/screenshots/home.png)

**Today View**  
*Mark routine blocks as done or skipped, navigate between days*  
![Today](./docs/screenshots/today.png)

**Phase Management**  
*View and edit your phase details and routine blocks*  
![Phase Management](./docs/screenshots/phase-management.png)

**Timesheet**  
*Log ad-hoc activities without affecting your streaks*  
![Timesheet](./docs/screenshots/unplanned-activity-timesheet.png)

**Analytics & Insights**  
*Track your momentum, streaks, rhythm, and time balance*  
![Analytics](./docs/screenshots/analytics.png)

</div>

---

## Table of Contents

- [Screenshots](#screenshots)
- **For busy visitors**
  - [Quick Glance (TL;DR)](#quick-glance-tldr)
  - [Why Phaseflow?](#why-phaseflow)
- **For people who might use Phaseflow**
  - [Core Concepts](#core-concepts)
  - [User Journeys](#user-journeys)
- **For recruiters & reviewers**
  - [What This Project Demonstrates](#what-this-project-demonstrates)
  - [Highlights of the Implementation](#highlights-of-the-implementation)
- **For developers**
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Running the Project Locally](#running-the-project-locally)
  - [Environment Variables](#environment-variables)
  - [Database & Migrations](#database--migrations)
  - [Key Flows (Architecture-Level)](#key-flows-architecture-level)
- [Future Improvements & Ideas](#future-improvements--ideas)

---

## Quick Glance (TL;DR)

- **What**: A **Next.js (App Router)** app for running focused habit phases with routines, streaks, and a gentle timesheet.
- **Who it serves**:
  - **End users**: People who want to run 30–90 day experiments on their life without harsh productivity pressure.
  - **Recruiters**: A concrete example of full‑stack product thinking (from UX to schema design and analytics).
  - **Developers**: A clean, modern Next.js + Prisma + Postgres codebase with clear domain boundaries.
- **Why it exists**: Most habit trackers are either too strict or too vague. Phaseflow focuses on **intentional phases**, **one active commitment**, and **70% success days** instead of perfection.

---

## Why Phaseflow?

Traditional tools either:
- Track habits as endless checklists with no sense of beginning or end, or
- Track time as raw timesheets with no connection to a bigger intention.

**Phaseflow bridges both worlds**:
- **Phase**: A time‑boxed commitment (e.g. "30‑day Morning Focus").
- **Routine Blocks**: The plan – recurring blocks you want to show up to.
- **Executions & Streaks**: The reality – what you actually did, with a non‑punitive streak model.
- **Timesheet**: A safe space to log everything else life throws at you, without affecting your streaks.

The goal is **progress over perfection**: you succeed on a day if you complete **≥ 70% of your planned blocks**, and your streak reflects that momentum.

---

## Core Concepts

This section is written for someone considering actually using Phaseflow.

### Phase

A **phase** is a focused period (usually 30–90 days) where you commit to a specific intention.

- **Name** – e.g. "Morning Focus", "Health Reset".
- **Duration** – number of days.
- **Start / End dates** – automatically calculated from duration.
- **Why** – your motivation (used in copy around the app).
- **Outcome** – what success looks like.
- **One active phase at a time** – by design; this project optimizes for focus, not juggling.
- **Streaks** – `currentStreak` and `longestStreak` are tracked per phase.

### Routine Block

The **routine** is defined as a set of **blocks** inside a phase.

- **Template blocks** – high‑level structure of your ideal day:
  - `isTemplate: true`, `date: null`.
  - Created/edited in the Routine Builder.
  - Stored once per phase.
- **Dated blocks** – concrete blocks scheduled on specific days:
  - `isTemplate: false`, `date: Date`.
  - Created by cloning templates across the phase (all days / weekdays / custom selection).
- Each block has **start time**, **end time**, **title**, optional **note**, and a **category** (e.g. Fitness, Work, Self Care).

### Execution

An **execution** is what actually happened for a block on a given day.

- Status is **DONE** or **SKIPPED**.
- There is **at most one** execution per block per date.
- Changing an execution automatically **recalculates phase streaks**.

### Timesheet

The **timesheet** is where you log ad‑hoc life events that are **not part of the routine**.

- Each entry has **date**, **time range**, **title**, optional **note**, and **priority** (`HIGH`, `MEDIUM`, `LOW`).
- Timesheet entries are grouped by day and summarized (e.g. "today's total").
- **Does not affect streaks** – this is intentional.

### Streak

Streaks are calculated at the **day level**, not per block.

- A day is **successful** if **≥ 70%** of that day's blocks are marked DONE.
- `currentStreak` – count of consecutive successful days up to today.
- `longestStreak` – best streak ever in this phase (never decreases).
- Timesheet activity has **zero impact** on streaks.

---

## User Journeys

### 1. Starting a New Phase

1. Sign up / log in.
2. Go to **Create Phase**.
3. Fill in:
   - Name, duration, start date.
   - Why this matters and what you want as an outcome.
4. When you create a phase:
   - Any previous active phase is automatically archived.
   - This new phase becomes the **one active phase**.

You can also start from a **predefined template** (see `lib/phase-templates.ts`) to get a suggested routine out of the box.

### 2. Designing Your Routine

1. Go to **Routine Builder** for your active phase.
2. Add template blocks: time ranges, titles, categories, notes.
3. The app validates that blocks **don’t overlap**.
4. Save – template blocks are stored without dates.
5. Use **Clone Routine** to apply templates to:
   - All days in the phase,
   - Weekdays only, or
   - Custom days.

This generates **dated blocks** that you’ll see on the **Today** page.

### 3. Daily Flow (Today Page)

1. Open **Today**.
2. See all blocks scheduled for **today** with friendly colors and microcopy.
3. Click **Done** or **Skip** on each block:
   - The UI updates optimistically.
   - The backend records an execution and recomputes your streak.
4. At any time, you can **edit today's blocks** (move things, adjust times, etc.).

The focus here is: *"show up and mark what actually happened"*, not being perfect.

### 4. Logging Life in Timesheet

1. Go to **Timesheet**.
2. For anything that came up (call, errand, event), add an entry:
   - Date, time range, title.
   - Optional note and priority.
3. See **today's total** time, broken down by entries.
4. View a **history** of entries grouped by date.
5. Use this as a **reality check** alongside your routine: what actually fills your days.

Again: Timesheet is **guilt‑free**. It’s there to record reality, not judge it.

### 5. Reviewing Insights

1. Go to **Analytics / Insights**.
2. See:
   - **Current Momentum** – current streak.
   - **Best Run** – longest streak in this phase.
   - **Rhythm** – % of days where you hit the 70% threshold.
   - **Balance** – share of time from planned routine vs timesheet.
3. Optionally inspect how much time you spent on high / medium / low priority timesheet items.

The copy in this section is intentionally **gentle** – trends over single days.

---

## What This Project Demonstrates

This section is written for **recruiters, hiring managers, and other reviewers**.

### Product Thinking

- **Clear problem framing** – the gap between strict habit apps and raw time trackers.
- **Opinionated constraints** – one active phase, 70% success threshold, timesheet not affecting streaks.
- **Gentle UX** – copy and flows emphasize self‑compassion and realistic progress.
- **Dual systems** – planned routine vs ad‑hoc timesheet, with analytics that respect both.

### Engineering Skills

- **Modern Next.js App Router** with both server and client components.
- **Authentication** built with NextAuth (credentials provider, JWT sessions, protected routes).
- **Data modeling** with Prisma and PostgreSQL around:
  - Users, Phases, Routine Blocks, Executions, Timesheet Entries, Categories.
- **Derived metrics**:
  - Streaks and adherence computed from raw executions.
  - Planned vs unplanned time breakdown.
  - Priority‑based timesheet analytics.
- **Separation of concerns**:
  - UI components in `components/`.
  - Business logic in `lib/` (e.g. `streak.ts`, `phase-templates.ts`).
  - Persistence in `prisma/schema.prisma`.

### Code Quality

- **TypeScript everywhere** – strict typing across frontend, backend, and database.
- **Prisma client** with typed queries and relations.
- **Consistent UI system** built with Tailwind + headless UI patterns.
- **App Router best practices** – layout, route handlers in `app/api/*`, middleware for auth.

For a deep dive, see **`docs/ARCHITECTURE.md`**, which explains the system as if you’re joining the team.

---

## Highlights of the Implementation

- **Next.js App Router** for a unified full‑stack experience (pages + API routes).
- **NextAuth** credential‑based auth with middleware‑enforced protected routes.
- **Prisma + PostgreSQL** with:
  - Connection pooling (`@prisma/adapter-pg`).
  - Migrations checked into `prisma/migrations`.
- **Streak engine** in `lib/streak.ts`:
  - Recomputes streaks idempotently after any execution change.
  - Uses date‑range iteration and success threshold logic.
- **Routine system**:
  - Template/dated block pattern.
  - Clone‑routine endpoint to generate dated blocks across the phase.
  - Overlap validation for template blocks.
- **Timesheet system**:
  - Monthly view, grouped by date.
  - Editable entries with delete/confirm flows.
  - Analytics integration for planned vs unplanned time.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Frontend**:
  - React (client/server components)
  - Tailwind CSS 4 + `tailwind-merge` + `tailwindcss-animate`
  - `lucide-react` for icons
  - `framer-motion` for animations
- **Backend**:
  - Next.js API routes in `app/api/*`
  - NextAuth (credentials provider)
- **Database**:
  - PostgreSQL
  - Prisma ORM (`@prisma/client`, `@prisma/adapter-pg`)
- **Auth & Security**:
  - JWT session strategy
  - Middleware‑based route protection
- **Date & Time**:
  - `date-fns` for date calculations
- **Deployment**:
  - Designed for **Vercel** (serverless + edge‑friendly).

---

## Project Structure

High‑level layout (simplified):

```text
Phaseflow/
  app/
    api/                 # Backend endpoints (phases, today, timesheet, etc.)
    today/               # Today view
    timesheet/           # Timesheet view
    analytics/           # Insights & metrics
    phases/              # Phase list and management
    create-phase/        # Phase creation flow
    routine-builder/     # Routine template builder
    login/, register/    # Auth pages
    layout.tsx           # Root layout & providers
    page.tsx             # Landing page

  components/
    layout/              # App shell, bottom nav, user menu
    landing/             # Marketing/landing page
    phases/, routine/    # Domain components (modals, forms)
    analytics/           # Stat cards, charts
    ui/                  # Buttons, cards, switches, etc.

  lib/
    auth.ts              # NextAuth config
    db.ts                # Prisma client setup
    streak.ts            # Streak calculation logic
    phase-templates.ts   # Predefined phase templates
    motion.ts            # Framer-motion variants
    block-colors.ts      # Color mapping for blocks

  prisma/
    schema.prisma        # Database schema
    migrations/          # Generated SQL migrations

  docs/
    ARCHITECTURE.md      # In-depth architecture notes
```

---

## Running the Project Locally

### 1. Clone the Repo

```bash
git clone <your-repo-url>
cd Phaseflow
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Set Up the Database

Phaseflow uses **PostgreSQL**. You can use any provider (local Postgres, Docker, Neon, Supabase, etc.).

- Create a new Postgres database.
- Grab the connection string, e.g.:

```bash
postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"

NEXTAUTH_SECRET="your-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

- You can generate `NEXTAUTH_SECRET` with something like:

```bash
openssl rand -base64 32
```

### 5. Apply Migrations

```bash
npm run db:migrate
# or: npx prisma migrate dev
```

This will apply all migrations and generate the Prisma client.

### 6. Run the Dev Server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

- Visit `/register` to create an account.
- After logging in, you’ll be redirected into the app.

### 7. Production Build (Optional)

```bash
npm run build
npm start
```

> On Vercel, `npm run build` is run automatically; the build script is configured to run Prisma migrations before building.

---

## Environment Variables

Summary of environment variables used:

- **`DATABASE_URL`** – PostgreSQL connection string (required).
- **`NEXTAUTH_SECRET`** – secret key used by NextAuth to sign JWTs (required).
- **`NEXTAUTH_URL`** – base URL of the app (used by NextAuth; set appropriately in production).

In production (e.g. Vercel), configure these in the dashboard.

---

## Database & Migrations

- **Schema** is defined in `prisma/schema.prisma`.
- **Migrations** live under `prisma/migrations/*` and capture the evolution of the models.

Key models:
- **User** – account information.
- **Phase** – one active per user at a time, with streak fields.
- **RoutineBlock** – template and dated blocks.
- **RoutineExecution** – per‑day execution status for a block.
- **TimesheetEntry** – ad‑hoc life events with priority.
- **Category** – user‑specific categories for blocks.

You can explore and debug the data visually using:

```bash
npm run db:studio
# Opens Prisma Studio
```

---

## Key Flows (Architecture-Level)

For more depth, see `docs/ARCHITECTURE.md`. At a glance:

- **Create Phase** → `POST /api/phases`  
  Archives any existing active phase, creates a new one, and normalizes dates.

- **Build Routine** → `POST /api/phases/[id]/routine-blocks`  
  Validates overlaps, stores template blocks, creates/updates categories.

- **Clone Routine** → `POST /api/phases/[id]/clone-routine`  
  Deletes old dated blocks, clones templates into dated blocks across selected days.

- **Mark Block Done/Skipped** → `POST /api/today/executions`  
  Upserts a `RoutineExecution`, then recomputes streaks via `lib/streak.ts`.

- **Log Timesheet Entry** → `POST /api/timesheet/entries`  
  Stores an ad‑hoc event for the active phase; used for analytics but not streaks.

- **Analytics** → `GET /api/dashboard/metrics` (and server logic in `app/analytics/page.tsx`)  
  Computes adherence, balance between planned/unplanned time, and timesheet breakdown.

---

## Future Improvements & Ideas

Some directions this project can grow in (and which demonstrate where I’d take it next):

- **Notifications**
  - Daily reminders to review Today / Timesheet.
  - Phase‑end summaries.

- **Richer Analytics**
  - Weekly/monthly adherence trends.
  - Per‑category focus time (e.g. total minutes in "Fitness").

- **Customization**
  - User‑configurable success threshold (e.g. 60–80%).
  - Multiple concurrent phases as a premium/advanced mode.

- **Monetization (if turned into a product)**
  - Subscription tiers unlocking multiple phases, advanced analytics, export.

- **Team / Shared Phases**
  - Share a phase template with a partner or small team.

---

If you’re a **recruiter** or **engineering leader** reading this:  
I’d be happy to walk through the codebase, the trade‑offs, and what I’d build next on top of Phaseflow.

