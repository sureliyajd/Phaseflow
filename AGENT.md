# AGENT.md - Task Execution Patterns for Phaseflow

This file provides task-oriented guidance for common development workflows.

## Quick Task Reference

### Add a New API Endpoint

1. Create route file: `app/api/[name]/route.ts`
2. Import patterns:
```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
```
3. Always verify session:
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const userId = session.user.id;
```

### Add a New Page

1. Create folder: `app/[name]/page.tsx`
2. Decide: Server Component (default) or Client Component (`"use client"`)
3. Wrap with AppLayout if authenticated page:
```typescript
<AppLayout>
  {/* Page content */}
</AppLayout>
```

### Add a New Component

1. Location: `components/[feature]/ComponentName.tsx`
2. Use Tailwind for styling
3. For interactive components, add `"use client"` directive
4. Import motion variants from `@/lib/motion` for animations

### Modify Database Schema

1. Edit `prisma/schema.prisma`
2. Run: `npm run db:migrate`
3. Name migration descriptively
4. Update related API routes/types
5. Regenerate client: `npx prisma generate` (usually automatic)

---

## Feature Implementation Workflows

### Add New Phase Feature

**Example: Adding a "pause phase" feature**

1. **Schema** (if needed):
```prisma
model Phase {
  // ... existing
  pausedAt DateTime?
  isPaused Boolean @default(false)
}
```

2. **API Route**: `app/api/phases/[id]/pause/route.ts`
```typescript
export async function POST(req, { params }) {
  // Verify ownership, toggle isPaused
}
```

3. **UI**: Add pause button in `components/phases/`

4. **Business logic**: Update streak.ts if pause affects calculations

### Add New Block Feature

**Example: Adding "recurring" blocks**

1. **Schema**:
```prisma
model RoutineBlock {
  // ... existing
  recurrence String? // e.g., "MWF", "daily", "weekends"
}
```

2. **API**: Update `app/api/phases/[id]/routine-blocks/route.ts`

3. **Clone logic**: Update `app/api/phases/[id]/clone-routine/route.ts`

4. **UI**: Update `components/routine/EditBlockModal.tsx`

### Add Analytics Feature

1. **API Route**: `app/api/analytics/[metric]/route.ts`
2. **Query**: Aggregate data with Prisma
3. **Component**: `components/analytics/[Metric]Chart.tsx`
4. **Page integration**: Update `app/analytics/page.tsx`

---

## Code Patterns to Follow

### Date Comparisons
```typescript
import { startOfDay, endOfDay, format } from "date-fns";

// Normalize for comparison
const dayStart = startOfDay(new Date(dateString));

// Format for display
const formatted = format(date, "MMMM d, yyyy");

// Format for API
const apiFormat = format(date, "yyyy-MM-dd");
```

### Prisma Queries

**With relations**:
```typescript
const phase = await prisma.phase.findUnique({
  where: { id },
  include: {
    routineBlocks: {
      where: { isTemplate: true },
      include: { category: true }
    }
  }
});
```

**Upsert pattern**:
```typescript
await prisma.routineExecution.upsert({
  where: {
    routineBlockId_date: { routineBlockId, date }
  },
  update: { status },
  create: { routineBlockId, phaseId, date, status }
});
```

**Select specific fields**:
```typescript
const phases = await prisma.phase.findMany({
  where: { userId },
  select: { id: true, name: true, isActive: true }
});
```

### Animation Patterns
```typescript
import { motion } from "framer-motion";
import { motionVariants } from "@/lib/motion";

<motion.div
  variants={motionVariants.fadeUp}
  initial="hidden"
  animate="visible"
>
  {/* Content */}
</motion.div>
```

### Error Handling
```typescript
try {
  // ... operation
} catch (error) {
  console.error("Operation failed:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

---

## File Locations Reference

| What | Where |
|------|-------|
| Phase CRUD | `app/api/phases/route.ts` |
| Routine blocks | `app/api/phases/[id]/routine-blocks/route.ts` |
| Clone routine | `app/api/phases/[id]/clone-routine/route.ts` |
| Execution tracking | `app/api/today/executions/route.ts` |
| Streak calculation | `lib/streak.ts` |
| Auth config | `lib/auth.ts` |
| DB client | `lib/db.ts` |
| Phase templates | `lib/phase-templates.ts` |
| Block colors | `lib/block-colors.ts` |
| Motion variants | `lib/motion.ts` |
| Edit phase modal | `components/phases/EditPhaseModal.tsx` |
| Edit block modal | `components/routine/EditBlockModal.tsx` |
| Clone routine modal | `components/routine/CloneRoutineModal.tsx` |
| App layout | `components/layout/AppLayout.tsx` |
| Bottom nav | `components/layout/BottomNav.tsx` |

---

## Validation Checklist

Before completing a feature:

- [ ] API returns proper status codes (200, 201, 400, 401, 404, 500)
- [ ] Session validated in protected routes
- [ ] Input validated/sanitized
- [ ] Error handling with try/catch
- [ ] TypeScript types are correct (no `any` unless necessary)
- [ ] Prisma queries use `select` for performance where appropriate
- [ ] Dates normalized consistently
- [ ] UI responsive (mobile-first)
- [ ] Loading states handled
- [ ] Animations respect `prefers-reduced-motion`

---

## Common Bugs & Fixes

### Streak Not Updating
- Check `recalculateStreakAfterExecution()` is called
- Verify dated blocks exist (not just templates)
- Check date normalization

### Blocks Not Showing on Today
- Verify clone-routine was run
- Check blocks have `isTemplate: false` and correct `date`
- Verify phase is active

### Auth Redirect Loop
- Clear cookies
- Check `NEXTAUTH_URL` matches server
- Verify middleware.ts matcher patterns

### Prisma Connection Errors
- Check DATABASE_URL
- Ensure connection pooling for serverless
- Run `npx prisma generate` after schema changes

---

## Performance Notes

### Indexed Fields
- `Phase`: `[userId, isActive]`
- `RoutineExecution`: `[routineBlockId, date]` (unique)
- `Category`: `[name, userId]` (unique)

### Query Optimization
- Use `select` to limit fields
- Paginate large lists
- Batch related queries where possible
- Cache expensive calculations (metrics)

---

## Extension Ideas (From README)

Future features to consider:
1. **Notifications** - Daily reminders, streak milestones
2. **Richer Analytics** - Weekly trends, per-category focus time
3. **Customization** - Configurable success threshold (60-80%)
4. **Multiple Phases** - Premium feature for concurrent phases
5. **Team/Shared Phases** - Share templates with partners
6. **Export** - Download data as CSV/JSON
7. **API Access** - Public API for integrations
