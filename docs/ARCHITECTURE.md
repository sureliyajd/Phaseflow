# Phaseflow Architecture Documentation

## 1. Product Overview

### What Phaseflow Is

Phaseflow is a daily routine tracking application that helps users build consistency through focused time periods called "Phases." Unlike generic habit trackers, Phaseflow emphasizes intentional, time-bound commitments with clear purpose and outcomes.

### Core Problem It Solves

Many people struggle with maintaining daily routines because:
- They lack clear boundaries and timeframes
- They don't have a system to track both structured routines and ad-hoc activities
- They need motivation through streaks but don't want punitive tracking
- They want flexibility without losing accountability

Phaseflow solves this by providing:
- **Phases**: Time-bound commitments (e.g., "30-day morning routine")
- **Routine Blocks**: Scheduled activities with specific times
- **Timesheet Entries**: Ad-hoc activities that complement routines
- **Streak Tracking**: Automatic calculation based on routine completion
- **One Active Phase**: Focus enforcement to prevent overwhelm

### Key Concepts

#### Phase
A time-bound commitment with:
- **Name**: What you're committing to (e.g., "Morning Focus")
- **Duration**: Number of days (e.g., 30 days)
- **Start/End Dates**: Calculated automatically from duration
- **Why**: Your motivation for this phase
- **Outcome**: What success looks like
- **isActive**: Only one phase can be active at a time
- **Streaks**: `currentStreak` and `longestStreak` (calculated automatically)

#### Routine Block
A scheduled activity within a phase:
- **Template Blocks** (`isTemplate: true, date: null`): Reusable patterns that define your ideal routine
- **Dated Blocks** (`isTemplate: false, date: DateTime`): Specific instances cloned from templates to specific dates
- **Time Range**: `startTime` and `endTime` in HH:MM format
- **Category**: User-defined categories (e.g., "Fitness", "Work", "Self Care")
- **Note**: Optional context or instructions

#### Execution
A record of completing or skipping a routine block on a specific date:
- **Status**: `DONE` or `SKIPPED`
- **Date**: The day the execution occurred
- **Unique Constraint**: One execution per block per date (`routineBlockId_date`)

#### Timesheet
Ad-hoc activities logged outside the routine structure:
- **Purpose**: Track activities that don't fit into a recurring routine
- **Priority**: `HIGH`, `MEDIUM`, or `LOW`
- **Time Range**: `startTime` and `endTime`
- **Date**: When the activity occurred
- **Note**: Optional details

**Important**: Timesheet entries do NOT affect streak calculations. Only routine block executions affect streaks.

#### Streak
Automatic calculation of consecutive successful days:
- **Current Streak**: Days in a row from today backwards
- **Longest Streak**: Maximum consecutive days achieved (never decreases)
- **Success Threshold**: A day is successful if ≥70% of scheduled routine blocks are marked DONE
- **Recalculation**: Streaks recalculate after every execution change

---

## 2. High-Level Architecture

### Frontend / Backend / Database Roles

```
┌─────────────────┐
│   Next.js App   │  ← Single codebase (full-stack)
│   Router (App)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ Pages │ │ API     │  ← Server Components & API Routes
│ (UI)  │ │ Routes  │
└───┬───┘ └──┬──────┘
    │        │
    │   ┌────▼────┐
    │   │ Prisma │  ← ORM Layer
    │   └────┬────┘
    │        │
    └────────┼────────┐
             │        │
        ┌────▼────┐   │
        │PostgreSQL│  ← Database
        └─────────┘
```

**Frontend (Next.js App Router)**:
- Server Components for initial page loads
- Client Components for interactivity (forms, animations)
- Route handlers in `app/api/` for backend logic
- Middleware for authentication

**Backend (API Routes)**:
- RESTful endpoints in `app/api/`
- Session-based authentication via NextAuth
- Business logic in API routes (not separate service layer)
- Direct Prisma queries (no repository pattern)

**Database (PostgreSQL + Prisma)**:
- PostgreSQL for relational data
- Prisma as ORM for type-safe queries
- Migrations for schema versioning
- Connection pooling via `@prisma/adapter-pg`

### Why Next.js App Router Was Chosen

1. **Unified Stack**: Frontend and backend in one codebase reduces context switching
2. **Server Components**: Initial page loads are server-rendered (better SEO, faster)
3. **API Routes**: Built-in backend endpoints without separate server
4. **File-based Routing**: Intuitive URL structure matches folder structure
5. **Vercel Optimization**: Native deployment optimizations for Next.js
6. **TypeScript**: Full type safety across frontend and backend

### Why Prisma + PostgreSQL Was Chosen

**Prisma**:
- Type-safe database queries (prevents runtime errors)
- Auto-generated TypeScript types from schema
- Migration system for schema changes
- Developer-friendly query API
- Connection pooling support for serverless

**PostgreSQL**:
- Relational data model (users, phases, blocks, executions)
- ACID compliance for data integrity
- JSON support if needed later
- Mature ecosystem and hosting options
- Better than NoSQL for structured, query-heavy workloads

---

## 3. Folder Structure Explanation

```
Phaseflow/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API routes
│   │   ├── auth/          # NextAuth configuration
│   │   ├── phases/        # Phase CRUD operations
│   │   ├── today/         # Today's blocks and executions
│   │   ├── timesheet/     # Timesheet entries
│   │   └── ...
│   ├── today/             # Today page (client component)
│   ├── phases/            # Phases list page
│   ├── create-phase/      # Phase creation page
│   ├── routine-builder/   # Routine template builder
│   ├── timesheet/         # Timesheet page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── layout.tsx         # Root layout (providers, fonts)
│   └── page.tsx           # Landing page
│
├── components/            # Reusable React components
│   ├── ui/                # Base UI components (buttons, cards)
│   ├── phases/            # Phase-related components
│   ├── routine/           # Routine block components
│   ├── layout/            # Layout components (nav, menu)
│   └── providers.tsx      # React context providers
│
├── lib/                   # Shared utilities and business logic
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client instance
│   ├── streak.ts          # Streak calculation logic
│   ├── phase-templates.ts # Predefined phase templates
│   ├── block-colors.ts    # Color mapping for categories
│   └── utils.ts           # General utilities
│
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema definition
│   └── migrations/        # Migration history
│
├── public/                # Static assets (images, icons)
├── middleware.ts          # Route protection middleware
└── types/                 # TypeScript type definitions
```

### `app/` Directory

Next.js App Router convention:
- **Folders = Routes**: `app/today/page.tsx` → `/today`
- **API Routes**: `app/api/phases/route.ts` → `/api/phases`
- **Layouts**: `app/layout.tsx` wraps all pages
- **Server Components by Default**: Use `"use client"` only when needed

**Key Pages**:
- `app/page.tsx`: Landing page (public)
- `app/today/page.tsx`: Main dashboard showing today's blocks
- `app/phases/page.tsx`: List of all phases
- `app/create-phase/page.tsx`: Phase creation form
- `app/routine-builder/page.tsx`: Build routine templates

### `components/` Directory

Reusable React components organized by feature:
- **UI Components**: Base design system (buttons, cards, switches)
- **Feature Components**: Domain-specific (phase modals, routine blocks)
- **Layout Components**: Navigation, menus, app shell

### `lib/` Directory

Shared business logic and utilities:
- **`db.ts`**: Prisma client singleton (prevents multiple connections)
- **`auth.ts`**: NextAuth configuration
- **`streak.ts`**: Core streak calculation algorithm
- **`phase-templates.ts`**: Predefined templates users can choose from

**Why separate from `app/api/`?**
- Reusable across API routes and server components
- Testable in isolation
- Clear separation of concerns

### `prisma/` Directory

Database schema and migrations:
- **`schema.prisma`**: Single source of truth for database structure
- **`migrations/`**: Versioned SQL migrations
- **Generated Client**: `@prisma/client` auto-generated from schema

**Migration Workflow**:
1. Edit `schema.prisma`
2. Run `npm run db:migrate` (creates migration file)
3. Migration applied to database
4. Prisma Client regenerated with new types

---

## 4. Authentication Flow

### Registration

```
User → POST /api/register
  ├─ Validates: email, password (min 6 chars), name
  ├─ Checks: email uniqueness
  ├─ Hashes: password with bcrypt (10 rounds)
  └─ Creates: User record in database
```

**Route**: `app/api/register/route.ts`
- Public endpoint (no auth required)
- Returns user object (without passwordHash)
- Status 201 on success

### Login

```
User → POST /api/auth/signin (NextAuth)
  ├─ Credentials Provider validates email/password
  ├─ Looks up user by email
  ├─ Compares password hash with bcrypt
  ├─ Creates JWT session token
  └─ Returns session with user.id, email, name
```

**Configuration**: `lib/auth.ts`
- Uses NextAuth Credentials Provider
- JWT session strategy (stateless)
- Session stored in HTTP-only cookie

### Session Handling

**JWT Flow**:
1. User logs in → NextAuth creates JWT
2. JWT stored in HTTP-only cookie (`next-auth.session-token`)
3. Each request includes cookie
4. NextAuth middleware validates JWT
5. Session available via `getServerSession(authOptions)`

**Session Access**:
- **API Routes**: `getServerSession(authOptions)` from `next-auth`
- **Server Components**: `getServerSession(authOptions)`
- **Client Components**: `useSession()` from `next-auth/react`

### Route Protection

**Middleware**: `middleware.ts`

```typescript
// Protects all routes except:
- / (landing page)
- /login
- /register
- /api/auth/* (NextAuth endpoints)
- /api/register (registration endpoint)
- Static assets (_next/static, images)
```

**How It Works**:
1. `withAuth` from NextAuth checks for valid token
2. If no token → redirects to `/login`
3. If token exists → allows request through
4. Root path (`/`) handled by page component (shows landing or redirects)

**API Route Protection**:
Each API route manually checks session:
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## 5. Phase Lifecycle

### Creating a Phase

**Flow**:
```
1. User fills form: name, duration, startDate, why, outcome
2. POST /api/phases
3. Server validates input
4. Calculates endDate = startDate + (durationDays - 1)
5. Archives any existing active phases (isActive = false)
6. Creates new phase with isActive = true
7. Returns phase object
```

**Key Logic** (`app/api/phases/route.ts`):
- **One Active Phase**: Before creating, all existing active phases are archived
- **Date Normalization**: Start date set to 00:00:00, end date to 23:59:59.999
- **Validation**: Name, why, outcome must be non-empty; duration ≥ 1 day

**From Template**:
- `POST /api/phases/from-template` creates phase + template blocks in one call
- Template blocks are created with `isTemplate: true, date: null`
- Optionally clones blocks to dates based on weekend handling

### Enforcing One Active Phase

**Enforcement Points**:
1. **Phase Creation** (`POST /api/phases`): Archives all active phases before creating
2. **Phase Activation** (`PATCH /api/phases/[id]/activate`): Archives all active phases before activating
3. **Database Constraint**: No unique constraint (enforced in application logic)

**Why Application-Level?**
- Allows flexibility (could add "pause" feature later)
- Simpler than database triggers
- Clear error messages possible

### Completing / Archiving a Phase

**Archive Flow**:
```
1. User clicks "Archive Phase"
2. PATCH /api/phases/[id]/archive
3. Sets isActive = false
4. Sets completedAt = now()
5. Phase remains in database (historical data)
```

**Completion vs Archive**:
- **Archive**: User manually ends phase early
- **Completion**: Phase naturally ends when `endDate` passes (handled in UI, not automatic)

**Data Retention**:
- Phases are never deleted (for analytics, history)
- `isActive` flag distinguishes current vs past phases
- All related data (blocks, executions, timesheets) remain linked

---

## 6. Routine System

### Core Routine Templates

**Template Blocks** (`isTemplate: true, date: null`):
- Define the "ideal" routine structure
- Created in Routine Builder page
- Stored once per phase
- Used as source for cloning

**Creation Flow**:
```
1. User builds routine in Routine Builder
2. POST /api/phases/[id]/routine-blocks
3. Validates time overlaps (blocks can't overlap)
4. Deletes existing template blocks for phase
5. Creates new template blocks with isTemplate: true
6. Categories created/upserted as needed
```

**Time Overlap Validation**:
- Blocks sorted by startTime
- Each block's endTime must be ≤ next block's startTime
- Prevents scheduling conflicts

### Cloned Routine Blocks

**Cloning Process**:
```
1. User selects clone option: "all days", "weekdays only", or "custom"
2. POST /api/phases/[id]/clone-routine
3. Gets all template blocks (isTemplate: true)
4. Calculates dates to clone to (based on option)
5. Deletes existing dated blocks (isTemplate: false)
6. Creates new dated blocks for each date × template block
```

**Dated Blocks** (`isTemplate: false, date: DateTime`):
- Specific instances for specific dates
- Created by cloning templates
- Can be edited individually (via Edit Day Blocks modal)
- Used for execution tracking

**Why Delete and Recreate?**
- Ensures consistency (no orphaned blocks)
- Simpler than diffing and updating
- Acceptable performance for typical phase durations (30-90 days)

### Execution Tracking

**Marking Done/Skipped**:
```
1. User clicks block on Today page
2. POST /api/today/executions
3. Body: { routineBlockId, date, status: "DONE" | "SKIPPED" }
4. Upserts execution (unique on routineBlockId + date)
5. Recalculates streak for phase
6. Returns execution object
```

**Execution Model**:
- One execution per block per date (unique constraint)
- Status: `DONE` or `SKIPPED`
- Date normalized to start of day (00:00:00)

**Streak Recalculation**:
- Triggered after every execution change
- Idempotent (can run multiple times safely)
- See Streak Logic section for details

---

## 7. Streak Logic

### How Streaks Are Calculated

**Algorithm** (`lib/streak.ts`):

1. **Get Phase Date Range**: From `startDate` to `endDate` (or today, whichever is earlier)
2. **For Each Day**: Determine if day is "successful"
3. **Calculate Current Streak**: Count consecutive successful days from today backwards
4. **Calculate Longest Streak**: Find maximum consecutive successful days in entire range
5. **Update Phase**: Store `currentStreak` and `longestStreak`

**Day Success Criteria**:
- Get all dated blocks (`isTemplate: false`) for that day
- Get all executions for those blocks on that day
- Count `DONE` executions
- Day is successful if: `(DONE count / total blocks) ≥ 0.7` (70% threshold)

**Why 70%?**
- Allows flexibility (life happens)
- Still requires majority completion
- Prevents single missed block from breaking streak

### What Affects Streaks

**Affects Streaks**:
- ✅ Routine block executions (DONE/SKIPPED)
- ✅ Adding/removing dated blocks (changes denominator)
- ✅ Editing execution status

**Does NOT Affect Streaks**:
- ❌ Timesheet entries (completely separate system)
- ❌ Template blocks (only dated blocks matter)
- ❌ Phase metadata (name, why, outcome)

### What Does Not (Timesheet)

**Timesheet Independence**:
- Timesheet entries are logged separately
- They don't have "executions" or completion status
- They're for tracking ad-hoc activities
- Streak calculation ignores timesheet entirely

**Why Separate?**
- Routines = commitments (affect streaks)
- Timesheet = observations (don't affect streaks)
- Allows flexible tracking without pressure

---

## 8. Timesheet System

### Purpose

Timesheet entries track ad-hoc activities that:
- Don't fit into a recurring routine structure
- Are one-off or irregular
- Need to be logged but aren't commitments
- Complement routine tracking

**Example Use Cases**:
- "Worked on side project 2-4pm" (not a routine)
- "Doctor appointment 10-11am" (one-time)
- "Met with friend 7-9pm" (irregular)

### Priority Levels

**Priorities**: `HIGH`, `MEDIUM`, `LOW`

**Usage**:
- Visual distinction in UI (color coding)
- Filtering/sorting capabilities
- Helps users prioritize what to log

**Not Used For**:
- Streak calculations
- Routine scheduling
- Automatic reminders

### How It Complements Routines

**Routines vs Timesheet**:
- **Routines**: Structured, recurring, commitment-based (affect streaks)
- **Timesheet**: Flexible, ad-hoc, observation-based (don't affect streaks)

**Together They Provide**:
- Complete picture of daily activities
- Flexibility without breaking structure
- No pressure to make everything a "routine"

**UI Integration**:
- Today page shows both routine blocks and timesheet entries
- Timesheet page shows full history
- "Timesheet-heavy" detection: If today has ≥3 timesheet entries and ≤1 routine block, UI may adjust

---

## 9. Data Flow Examples

### Creating a Phase

```
User Action: Fill form and submit
  ↓
Frontend: POST /api/phases
  {
    name: "Morning Focus",
    durationDays: 30,
    startDate: "2024-01-01",
    why: "Build consistency",
    outcome: "Feel more energized"
  }
  ↓
API Route: app/api/phases/route.ts
  1. Validate input
  2. Calculate endDate = startDate + 29 days
  3. Archive existing active phases
  4. Create Phase record
  ↓
Database: INSERT INTO Phase
  ↓
Response: { phase: {...} }
  ↓
Frontend: Redirect to routine builder
```

### Marking a Routine Block Done

```
User Action: Click "Done" on routine block
  ↓
Frontend: POST /api/today/executions
  {
    routineBlockId: "abc123",
    date: "2024-01-15",
    status: "DONE"
  }
  ↓
API Route: app/api/today/executions/route.ts
  1. Verify block belongs to user's active phase
  2. Upsert RoutineExecution
  3. Call recalculateStreakAfterExecution()
  ↓
Streak Calculation: lib/streak.ts
  1. Get all days in phase range
  2. For each day, check if ≥70% blocks are DONE
  3. Calculate current and longest streak
  4. Update Phase.currentStreak and Phase.longestStreak
  ↓
Database: 
  - UPSERT RoutineExecution
  - UPDATE Phase (streak fields)
  ↓
Response: { execution: {...} }
  ↓
Frontend: Update UI (block marked done, streak updated)
```

### Logging a Timesheet Entry

```
User Action: Fill timesheet form and submit
  ↓
Frontend: POST /api/timesheet/entries
  {
    date: "2024-01-15",
    startTime: "14:00",
    endTime: "16:00",
    title: "Side Project Work",
    note: "Built new feature",
    priority: "HIGH"
  }
  ↓
API Route: app/api/timesheet/entries/route.ts
  1. Validate input (time range, priority)
  2. Get user's active phase
  3. Create TimesheetEntry
  ↓
Database: INSERT INTO TimesheetEntry
  ↓
Response: { entry: {...} }
  ↓
Frontend: Add entry to timesheet list
  (Note: Streak NOT recalculated)
```

---

## 10. Deployment Overview

### Vercel

**Platform**: Vercel (Next.js-optimized hosting)

**Why Vercel**:
- Zero-config deployment for Next.js
- Automatic serverless function scaling
- Edge network for fast global access
- Built-in CI/CD from Git

**Deployment Process**:
1. Push to Git repository
2. Vercel detects changes
3. Builds Next.js app (`next build`)
4. Deploys to production
5. Environment variables configured in Vercel dashboard

**Serverless Functions**:
- API routes become serverless functions
- Auto-scales based on traffic
- Cold starts possible but minimal for Next.js

### Database Hosting

**PostgreSQL Options**:
- **Vercel Postgres**: Integrated option (if using Vercel)
- **Neon**: Serverless Postgres (good for serverless apps)
- **Supabase**: PostgreSQL with additional features
- **Railway/Render**: Traditional managed Postgres

**Connection String**:
- Stored in `DATABASE_URL` environment variable
- Prisma uses this for connection pooling
- `@prisma/adapter-pg` handles connection management

### Environment Variables

**Required Variables**:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="random-secret-key-for-jwt-signing"
NEXTAUTH_URL="https://yourdomain.com"  # Production URL
```

**Development**:
- Stored in `.env.local` (git-ignored)
- Loaded automatically by Next.js

**Production**:
- Set in Vercel dashboard (Settings → Environment Variables)
- Available to all serverless functions
- Never commit secrets to Git

**Security**:
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `DATABASE_URL`: Use connection pooling URL if available
- Rotate secrets periodically

---

## 11. How to Extend Phaseflow

### Adding Notifications

**Approach**:

1. **Database Schema**:
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String   // "reminder", "streak", "phase_end"
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}
```

2. **Notification Service** (`lib/notifications.ts`):
   - Create notification records
   - Send emails (Resend, SendGrid)
   - Send push notifications (if PWA)

3. **Triggers**:
   - **Reminders**: Cron job (Vercel Cron) checks upcoming blocks
   - **Streak Milestones**: After streak recalculation
   - **Phase End**: Scheduled job checks `endDate`

4. **API Route**: `app/api/notifications/route.ts`
   - GET: Fetch user's notifications
   - PATCH: Mark as read

### Adding Analytics

**Approach**:

1. **Analytics Dashboard** (`app/analytics/page.tsx`):
   - Already exists (basic structure)
   - Extend with more charts

2. **Metrics to Track**:
   - Completion rate by category
   - Average streak length
   - Most productive times of day
   - Phase success rate

3. **Data Aggregation**:
   - Create API route: `app/api/analytics/metrics/route.ts`
   - Query executions, phases, timesheets
   - Calculate aggregates (Prisma aggregations)
   - Cache results (Redis or in-memory)

4. **Visualization**:
   - Use charting library (Recharts, Chart.js)
   - Weekly/monthly views
   - Export to CSV

### Adding Paid Features

**Approach**:

1. **User Model Extension**:
```prisma
model User {
  // ... existing fields
  subscriptionTier String @default("free") // "free", "pro", "premium"
  subscriptionEnds DateTime?
}
```

2. **Feature Gating**:
   - Middleware or API route checks `subscriptionTier`
   - Return 403 if feature not available
   - UI shows upgrade prompts

3. **Payment Integration**:
   - **Stripe**: Most common for SaaS
   - **Paddle**: Alternative with tax handling
   - Webhook handlers for subscription events

4. **Premium Features Ideas**:
   - Multiple active phases
   - Advanced analytics
   - Custom phase templates
   - Export data
   - API access

5. **Implementation**:
   - Create `lib/subscription.ts` for tier checks
   - Add `checkSubscription()` helper
   - Protect premium routes/features

### General Extension Patterns

**Adding New Features**:

1. **Database First**: Update `schema.prisma`, migrate
2. **API Route**: Create `app/api/[feature]/route.ts`
3. **Frontend Page**: Create `app/[feature]/page.tsx`
4. **Components**: Add to `components/[feature]/`
5. **Business Logic**: Add to `lib/[feature].ts` if reusable

**Testing Strategy**:
- Unit tests for business logic (`lib/streak.ts`)
- Integration tests for API routes
- E2E tests for critical flows (Playwright, Cypress)

**Performance Considerations**:
- Index frequently queried fields (`@@index` in Prisma)
- Paginate large lists (phases, timesheet entries)
- Cache expensive calculations (streaks, analytics)
- Use Prisma `select` to limit fields returned

---

## Appendix: Key Design Decisions

### Why One Active Phase?

**Decision**: Only one phase can be active at a time.

**Reasoning**:
- Prevents overwhelm (focus on one commitment)
- Simpler UI (clear "today" view)
- Easier streak calculation (one source of truth)
- Aligns with product philosophy (focused periods)

**Trade-off**: Users can't track multiple routines simultaneously. If needed later, can add "multiple phases" as premium feature.

### Why Template + Clone Pattern?

**Decision**: Separate template blocks from dated blocks.

**Reasoning**:
- Templates = reusable structure (edit once, apply many)
- Dated blocks = specific instances (can be edited individually)
- Allows "clone routine" feature (apply to all days/weekdays)
- Clear separation of concerns

**Trade-off**: More complex data model. Alternative would be single block type with recurrence rules, but that's harder to query and edit.

### Why 70% Success Threshold?

**Decision**: Day is successful if ≥70% of blocks are DONE.

**Reasoning**:
- Allows flexibility (life happens, not all-or-nothing)
- Still requires majority completion (not too lenient)
- Prevents single missed block from breaking streak
- Empirically feels fair to users

**Trade-off**: Could be configurable per phase, but adds complexity. 70% is a good default.

### Why Timesheet Doesn't Affect Streaks?

**Decision**: Timesheet entries are separate from streak calculation.

**Reasoning**:
- Routines = commitments (should affect streaks)
- Timesheet = observations (shouldn't create pressure)
- Clear mental model (commitments vs activities)
- Allows flexible tracking without gamification

**Trade-off**: Users might want "everything" to count, but that blurs the line between commitment and observation.

---

## Conclusion

Phaseflow is designed to be:
- **Focused**: One active phase, clear boundaries
- **Flexible**: Timesheet for ad-hoc activities
- **Motivating**: Streaks without being punitive
- **Extensible**: Clear patterns for adding features

The architecture prioritizes:
- Developer experience (TypeScript, Prisma types)
- User experience (fast, clear, focused)
- Maintainability (clear structure, separation of concerns)
- Scalability (serverless, connection pooling)

For questions or contributions, see the main README or open an issue.

