# CLAUDE.md - Phaseflow Development Guide

This file provides essential context for Claude Code to work effectively on this codebase.

## Project Overview

**Phaseflow** is a phase-based daily routine companion built with Next.js 16 (App Router). It helps users commit to time-bound phases (e.g., 30 days), design gentle routines, and track progress with non-punitive streaks.

**Philosophy**: Progress over perfection. A day is successful if >= 70% of blocks are completed.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.1 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL + Prisma 7.2.0 |
| Auth | NextAuth 4.24 (JWT, Credentials) |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion 12.23 |
| Icons | Lucide React |
| UI Components | Radix UI (switch, slot) |
| Date Utils | date-fns 4.1 |

## Quick Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production (includes prisma migrate)
npm run lint         # Run ESLint
npm run db:migrate   # Create and apply database migrations
npm run db:push      # Push schema changes directly (dev only)
npm run db:studio    # Open Prisma Studio GUI
```

## Project Structure

```
app/
├── api/                    # Backend API routes
│   ├── auth/[...nextauth]/ # NextAuth endpoints
│   ├── phases/             # Phase CRUD + routine blocks
│   ├── today/              # Today's blocks + executions
│   ├── timesheet/          # Timesheet entries
│   ├── dashboard/          # Metrics endpoint
│   └── register/           # User registration
├── today/                  # Main daily view
├── phases/                 # Phase list
├── phase-board/            # Visual phase board
├── create-phase/           # Phase creation
├── routine-builder/        # Build routine templates
├── timesheet/              # Timesheet page
├── analytics/              # Insights & metrics
├── profile/                # User profile
└── page.tsx                # Landing page

components/
├── ui/                     # Base UI (button, card, switch)
├── layout/                 # AppLayout, BottomNav, UserMenu
├── phases/                 # Phase modals (Edit, Archive)
├── routine/                # Block modals (Edit, Clone, Apply)
├── analytics/              # StatCard, WeeklyChart
├── dashboard/              # ProgressRing
└── landing/                # LandingPage

lib/
├── auth.ts                 # NextAuth config
├── db.ts                   # Prisma client singleton
├── streak.ts               # Streak calculation logic
├── phase-templates.ts      # Predefined phase templates
├── block-colors.ts         # Block color definitions
├── motion.ts               # Framer motion variants
└── utils.ts                # General utilities (cn, etc.)

prisma/
├── schema.prisma           # Database schema
└── migrations/             # Migration history
```

## Database Schema (Key Models)

### User
- `id`, `email` (unique), `passwordHash`, `name`, `bio?`, `timezone?`, `avatarUrl?`

### Phase
- `id`, `userId`, `name`, `durationDays`, `startDate`, `endDate`
- `why` (motivation), `outcome` (expected result)
- `isActive` (only ONE per user), `currentStreak`, `longestStreak`
- Relations: `routineBlocks[]`, `executions[]`, `timesheets[]`

### RoutineBlock
- `id`, `phaseId`, `categoryId`, `title`, `note?`
- `startTime`, `endTime` (HH:MM format)
- `color` (default: "primary")
- `isTemplate` (true = template, false = dated)
- `date?` (null for templates, DateTime for dated blocks)

### RoutineExecution
- `id`, `routineBlockId`, `phaseId`, `date`
- `status`: `DONE` | `SKIPPED`
- Unique constraint: `[routineBlockId, date]`

### TimesheetEntry
- `id`, `phaseId`, `title`, `note?`
- `startTime`, `endTime`, `date`
- `priority`: `HIGH` | `MEDIUM` | `LOW`

### Category
- `id`, `name`, `userId`
- Unique constraint: `[name, userId]`

## Key API Endpoints

### Phases
- `GET /api/phases` - List all phases
- `POST /api/phases` - Create phase (auto-archives previous)
- `GET /api/phases/active` - Get current active phase
- `PUT /api/phases/[id]` - Update phase details
- `POST /api/phases/[id]/archive` - Archive phase
- `GET /api/phases/[id]/routine-blocks` - Get template blocks
- `POST /api/phases/[id]/routine-blocks` - Save template blocks
- `POST /api/phases/[id]/clone-routine` - Clone templates to dates

### Today
- `GET /api/today/blocks?date=YYYY-MM-DD` - Get day's blocks
- `POST /api/today/executions` - Record DONE/SKIPPED

### Timesheet
- `GET /api/timesheet/entries?startDate=&endDate=` - Fetch entries
- `POST /api/timesheet/entries` - Create entry
- `PUT /api/timesheet/entries/[id]` - Update entry
- `DELETE /api/timesheet/entries/[id]` - Delete entry

### Dashboard
- `GET /api/dashboard/metrics` - Streak, adherence, insights

## Core Business Logic

### Streak Calculation (`lib/streak.ts`)
1. Get phase date range (startDate to min(endDate, today))
2. For each day: check if >= 70% of dated blocks are DONE
3. Current streak: consecutive successful days from today backwards
4. Longest streak: max consecutive successful days ever
5. Triggered after each execution change

### Template vs Dated Blocks
- **Template blocks**: `isTemplate: true`, `date: null` - define ideal routine
- **Dated blocks**: `isTemplate: false`, `date: DateTime` - specific instances
- Clone operation copies templates to selected dates

### One Active Phase Rule
- Only one phase can be `isActive: true` per user
- Creating/activating a phase archives all others
- Enforced in application logic (not DB constraint)

## Authentication

- NextAuth with Credentials provider
- JWT session strategy (stateless)
- Passwords hashed with bcryptjs (10 rounds)
- Protected routes via middleware.ts
- Session access: `getServerSession(authOptions)` or `useSession()`

### Protected Routes
All routes protected except:
- `/` (landing), `/login`, `/register`
- `/api/auth/*`, `/api/register`
- Static assets

## Styling Patterns

### Tailwind Custom Theme
```typescript
// Key colors: primary, secondary, accent, calm, success
// Font: Plus Jakarta Sans
// Dark mode: class-based
```

### Block Colors (`lib/block-colors.ts`)
10 colors: teal, coral, blue, yellow, purple, green, orange, pink, indigo, red

### Motion Variants (`lib/motion.ts`)
Respects `prefers-reduced-motion`. Predefined: fadeUp, fade, subtleScale, cardEntrance, pageTransition

## Common Patterns

### API Route Template
```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... logic
}
```

### Date Handling
- All dates stored as DateTime in UTC
- Time fields stored as strings in HH:MM format
- Use date-fns for manipulation
- Normalize dates to start of day for comparisons

## Environment Variables

```bash
DATABASE_URL="postgresql://..."  # PostgreSQL connection
NEXTAUTH_SECRET="..."            # JWT signing secret
NEXTAUTH_URL="http://localhost:3000"  # App URL
```

## Development Notes

### When Adding Features
1. Update `prisma/schema.prisma` if DB changes needed
2. Run `npm run db:migrate` to create migration
3. Create API route in `app/api/[feature]/route.ts`
4. Add page in `app/[feature]/page.tsx`
5. Create components in `components/[feature]/`
6. Add business logic to `lib/` if reusable

### Important Constraints
- One active phase per user (enforced in API)
- Timesheet entries do NOT affect streaks
- Block times validated for overlaps
- 70% threshold for day success is fixed

### File Naming Conventions
- Components: PascalCase (`EditPhaseModal.tsx`)
- Routes: kebab-case folders (`create-phase/`)
- Utilities: camelCase (`phaseTemplates.ts`)

## Phase Templates (lib/phase-templates.ts)

5 predefined templates:
1. Morning Focus (30 days)
2. Work-Life Balance (60 days)
3. Fitness Foundation (30 days)
4. Creative Flow (30 days)
5. Mindful Living (30 days)

Each has predefined blocks with times, categories, and optional notes.

## Testing Considerations

No test framework currently configured. When adding:
- Unit tests for `lib/streak.ts` (core logic)
- API route integration tests
- E2E tests for critical user flows

## Common Issues & Solutions

### Prisma Client Not Found
```bash
npm run postinstall  # or: npx prisma generate
```

### Database Connection Issues
- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- For serverless: use connection pooling

### Auth Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your dev server
- Clear cookies and try again

## Architecture Reference

See `docs/ARCHITECTURE.md` for detailed:
- Data flow diagrams
- Authentication flow
- Phase lifecycle
- Routine system details
- Extension patterns
