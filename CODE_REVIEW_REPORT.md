# Phaseflow Code Review Report
**Date:** 2025-01-XX  
**Reviewer:** Senior Full-Stack Engineer  
**Scope:** Full sanity check, architecture review, and optimization pass

---

## PART 1: CODE SANITY CHECK

### ✅ **Architectural Compliance**

#### **Next.js App Router Patterns**
- ✅ **Correct usage**: All pages properly use App Router structure
- ✅ **Server Components**: `app/analytics/page.tsx` correctly uses Server Component (no "use client")
- ✅ **Client Components**: Properly marked with `"use client"` directive where needed
- ✅ **API Routes**: All API routes follow Next.js 13+ App Router conventions

#### **Server vs Client Component Separation**
- ✅ **Good separation**: Server Components used for data fetching (`analytics/page.tsx`)
- ✅ **Client Components**: Used appropriately for interactive UI (`page.tsx`, `today/page.tsx`, `phase-board/page.tsx`)
- ⚠️ **Minor concern**: Dashboard (`app/page.tsx`) is client component but could potentially be partially server-rendered for initial data

#### **Database Access Layer**
- ✅ **Prisma-only**: All database access goes through Prisma (`lib/db.ts`)
- ✅ **No direct DB access**: No raw SQL queries or direct PostgreSQL connections from components
- ✅ **Client isolation**: No Prisma usage in client components (verified via grep)

#### **Data Flow & Mutations**
- ✅ **API routes**: All mutations go through API routes (`/api/*`)
- ✅ **No server actions**: No `"use server"` directives found (which is fine for this architecture)
- ✅ **Consistent pattern**: Client → API Route → Prisma → Response

#### **Authentication Checks**
- ✅ **Consistent auth**: All API routes check `getServerSession(authOptions)`
- ✅ **Middleware protection**: `middleware.ts` protects routes appropriately
- ✅ **User ownership**: All phase/routine operations verify `userId` matches session

### ⚠️ **Architectural Violations**

**None found** - Architecture is clean and follows Next.js App Router best practices.

### 📝 **Anti-Patterns & Inconsistencies**

1. **Date normalization inconsistency**
   - Some places use `startOfDay()` from `date-fns`, others manually set hours
   - **Location**: Mixed usage across API routes
   - **Impact**: Low, but could cause subtle timezone/date boundary issues

2. **Error handling inconsistency**
   - Some routes return detailed errors, others generic "Internal server error"
   - **Example**: `app/api/phases/[id]/route.ts` vs `app/api/today/executions/route.ts`
   - **Impact**: Low, but makes debugging harder

---

## PART 2: PRODUCT-SCOPE VERIFICATION

### ✅ **Core Features Verification**

#### **Single Active Phase Enforcement**
- ✅ **Enforced correctly**: `POST /api/phases` archives existing active phases before creating new one
- ✅ **Activation logic**: `PATCH /api/phases/[id]/activate` deactivates all others
- ✅ **Database constraint**: Index on `[userId, isActive]` supports efficient queries
- ⚠️ **Race condition risk**: Two simultaneous phase creations could result in multiple active phases (see Part 3)

#### **Phase Creation → Core Routine Onboarding**
- ✅ **Flow exists**: `create-phase/page.tsx` redirects to `/routine-builder` after phase creation
- ✅ **Template creation**: `POST /api/phases/[id]/routine-blocks` saves templates (`isTemplate: true`)
- ⚠️ **Not enforced**: No validation that phase must have template blocks before cloning
- ⚠️ **Missing guard**: User can skip routine builder and proceed without templates

#### **Routine Templates**
- ✅ **Stored correctly**: Templates have `isTemplate: true` and `date: null`
- ✅ **Query separation**: GET endpoints correctly filter `isTemplate: true` for templates
- ✅ **Cloning logic**: `POST /api/phases/[id]/clone-routine` creates dated blocks from templates

#### **Cloned Routines**
- ✅ **Date-specific**: Cloned blocks have `isTemplate: false` and specific `date` values
- ✅ **Date range**: Cloning respects phase `startDate` and `endDate`
- ✅ **Options**: Supports "all", "weekdays", and "custom" with excluded dates

#### **Day-Level Routine Edits**
- ❌ **NOT IMPLEMENTED**: No API endpoint for editing individual day blocks
- ❌ **Missing feature**: `ApplyChangesDialog` component exists but no backend support
- ❌ **No scope handling**: No endpoints for "only this day", "this & future", or "selected dates"
- **Impact**: High - This is a core product requirement that's missing

#### **Today View**
- ✅ **Reads correctly**: `GET /api/today/blocks` reads from dated `RoutineBlocks`
- ✅ **Execution status**: Correctly fetches `RoutineExecution` records
- ✅ **Date filtering**: Uses `startOfDay`/`endOfDay` for proper date boundaries

#### **RoutineExecution Idempotency**
- ✅ **Unique constraint**: Schema has `@@unique([routineBlockId, date])`
- ✅ **Upsert pattern**: `POST /api/today/executions` uses `upsert` correctly
- ✅ **One per block per day**: Constraint enforces idempotency

#### **Timesheet Independence**
- ✅ **Separate model**: `TimesheetEntry` is separate from `RoutineExecution`
- ✅ **No streak impact**: `lib/streak.ts` only considers `RoutineExecution`, not timesheet
- ✅ **Correct separation**: Analytics correctly separates planned vs unplanned time

#### **Analytics Data Source**
- ✅ **Real data**: `app/analytics/page.tsx` queries actual Prisma data
- ✅ **Server Component**: Correctly uses Server Component for data fetching
- ✅ **Calculations**: Adherence, streaks, and timesheet stats use persisted data

### ❌ **Missing Edge-Case Handling**

1. **Phase without templates**
   - User can create phase but never create template blocks
   - Today view will show empty (handled gracefully)
   - **Recommendation**: Add validation or onboarding flow enforcement

2. **Cloning without templates**
   - `clone-routine` endpoint checks for templates, but user can delete them after cloning
   - **Current behavior**: Returns 400 error (acceptable)

3. **Execution for non-existent blocks**
   - `POST /api/today/executions` verifies block exists, but doesn't check if block is for that date
   - **Risk**: Could create execution for wrong date if blockId is valid but date doesn't match

4. **Phase date boundaries**
   - No validation that execution dates are within phase `startDate`/`endDate`
   - **Risk**: Executions could be created for dates outside phase range

5. **Archive/delete orphaned data**
   - When phase is archived, related `RoutineBlock`, `RoutineExecution`, `TimesheetEntry` remain
   - **Current behavior**: Data remains (may be intentional for historical records)

---

## PART 3: DATA INTEGRITY & EDGE CASE REVIEW

### 🔴 **Critical Issues**

#### **1. Race Condition: Multiple Active Phases**
**Location**: `app/api/phases/route.ts` (POST), `app/api/phases/[id]/activate/route.ts`

**Issue**: 
```typescript
// Step 1: Archive existing active phases
await prisma.phase.updateMany({
  where: { userId, isActive: true },
  data: { isActive: false },
});

// Step 2: Create/activate new phase
await prisma.phase.create({ data: { isActive: true, ... } });
```

**Problem**: Between steps 1 and 2, another request could create/activate a phase, resulting in multiple active phases.

**Fix**: Use database transaction or add unique constraint:
```prisma
// In schema.prisma
@@unique([userId, isActive], where: { isActive: true })
```
Note: Prisma doesn't support partial unique constraints. Alternative: Use application-level lock or transaction.

#### **2. Execution Date Validation Missing**
**Location**: `app/api/today/executions/route.ts`

**Issue**: 
- Verifies block exists and belongs to active phase
- Does NOT verify that the execution `date` matches the block's `date`
- Does NOT verify that execution date is within phase date range

**Risk**: 
- User could create execution for block on wrong date
- Executions could be created for dates outside phase range

**Fix**: Add validation:
```typescript
// Verify block date matches execution date
if (routineBlock.date && format(routineBlock.date, 'yyyy-MM-dd') !== dateParam) {
  return NextResponse.json(
    { error: "Execution date does not match block date" },
    { status: 400 }
  );
}

// Verify date is within phase range
const phase = routineBlock.phase;
if (executionDate < startOfDay(phase.startDate) || executionDate > endOfDay(phase.endDate)) {
  return NextResponse.json(
    { error: "Execution date is outside phase date range" },
    { status: 400 }
  );
}
```

#### **3. Duplicate RoutineBlocks Possible**
**Location**: `app/api/phases/[id]/clone-routine/route.ts`

**Issue**: 
- Deletes all existing dated blocks before cloning
- But if cloning fails partway through, some blocks may be created while others aren't
- No transaction wrapping the delete + create operations

**Risk**: Partial clone state if error occurs mid-operation.

**Fix**: Wrap in transaction:
```typescript
await prisma.$transaction(async (tx) => {
  await tx.routineExecution.deleteMany({ ... });
  await tx.routineBlock.deleteMany({ ... });
  // Create blocks...
});
```

### ⚠️ **Moderate Issues**

#### **4. Timezone Assumptions**
**Location**: Multiple files using `date-fns` functions

**Issue**: 
- Uses `startOfDay()`, `endOfDay()` which operate in server timezone
- No explicit timezone handling
- Client sends dates as ISO strings, server processes in its timezone

**Risk**: 
- Date boundaries could shift based on server timezone
- User in different timezone might see different "today"

**Recommendation**: 
- Document timezone behavior
- Consider storing dates as UTC and converting for display
- Or use explicit timezone library (e.g., `date-fns-tz`)

#### **5. Orphaned Records on Phase Archive**
**Location**: `app/api/phases/[id]/archive/route.ts`

**Current behavior**: 
- Only sets `isActive: false` and `completedAt`
- Does NOT delete or cascade related records

**Impact**: 
- `RoutineBlock`, `RoutineExecution`, `TimesheetEntry` remain linked to archived phase
- May be intentional for historical records

**Recommendation**: 
- Document this behavior
- Consider soft-delete pattern if intentional
- Or add cleanup if not needed

#### **6. Category Orphaning**
**Location**: `app/api/phases/[id]/routine-blocks/route.ts`

**Issue**: 
- Categories are user-scoped (`@@unique([name, userId])`)
- When blocks are deleted, categories remain
- No cleanup of unused categories

**Impact**: Low - categories are reusable across phases
**Recommendation**: Consider cleanup job or leave as-is (categories are reusable)

#### **7. Streak Calculation Performance**
**Location**: `lib/streak.ts`

**Issue**: 
- `updatePhaseStreak()` queries database for EACH day in phase
- For 90-day phase, makes 90+ database queries
- Called after EVERY execution update

**Impact**: 
- N+1 query problem
- Could be slow for long phases
- Called synchronously in execution endpoint (blocks response)

**Fix**: Batch queries:
```typescript
// Fetch all blocks and executions in one query each
const allBlocks = await prisma.routineBlock.findMany({
  where: { phaseId, isTemplate: false, date: { gte: startDate, lte: endDate } }
});

const allExecutions = await prisma.routineExecution.findMany({
  where: { phaseId, date: { gte: startDate, lte: endDate } }
});

// Then calculate in memory
```

#### **8. Date Boundary Edge Cases**
**Location**: `lib/streak.ts`, `app/api/phases/[id]/days/route.ts`

**Issue**: 
- `isDaySuccessful()` uses `startOfDay()`/`endOfDay()` for date filtering
- But `RoutineBlock.date` is stored as full DateTime
- Time component could cause boundary issues

**Current behavior**: Seems to work, but relies on consistent date normalization
**Recommendation**: Ensure all date storage uses normalized dates (time = 00:00:00)

### 📝 **Minor Issues**

#### **9. Missing Indexes**
**Location**: `prisma/schema.prisma`

**Current indexes**:
- `Phase`: `@@index([userId, isActive])`
- `RoutineBlock`: None
- `RoutineExecution`: `@@unique([routineBlockId, date])` (implicit index)

**Recommendations**:
```prisma
model RoutineBlock {
  // ... fields
  @@index([phaseId, date]) // For day queries
  @@index([phaseId, isTemplate]) // For template queries
}

model RoutineExecution {
  // ... fields
  @@index([phaseId, date]) // For streak calculations
}
```

#### **10. Validation Gaps**
- No validation that `startTime < endTime` in some endpoints
- No validation that times are in valid format (HH:MM)
- No validation that `durationDays > 0` in some places

---

## PART 4: PERFORMANCE & MAINTAINABILITY

### 🔴 **Performance Issues**

#### **1. N+1 Query in Streak Calculation**
**Severity**: High  
**Location**: `lib/streak.ts:updatePhaseStreak()`

**Problem**: 
```typescript
for (const day of allDays) {
  const isSuccessful = await isDaySuccessful(phaseId, day); // DB query per day
}
```

**Impact**: 
- 90-day phase = 90+ queries
- Blocks execution endpoint response
- Scales poorly

**Fix**: Batch all queries upfront (see Part 3, Issue #7)

#### **2. Synchronous Streak Recalculation**
**Location**: `app/api/today/executions/route.ts`

**Problem**: 
```typescript
await recalculateStreakAfterExecution(routineBlock.phaseId);
```

**Impact**: 
- Execution endpoint waits for full streak recalculation
- Adds latency to user action
- Could timeout on long phases

**Recommendation**: 
- Move to background job (e.g., queue)
- Or make async/non-blocking
- Or optimize streak calculation (see #1)

#### **3. Over-fetching in Some Queries**
**Location**: Multiple API routes

**Examples**:
- `GET /api/phases` selects all fields even if not needed
- `GET /api/today/blocks` includes full category objects when only name needed

**Impact**: Low - but adds unnecessary data transfer

**Recommendation**: Use `select` to fetch only needed fields

### ⚠️ **Maintainability Issues**

#### **4. Code Duplication**
**Locations**: 
- Date normalization logic repeated across files
- Auth check pattern repeated (could use helper)
- Phase ownership verification repeated

**Recommendation**: 
- Create `lib/date-utils.ts` for date helpers
- Create `lib/api-helpers.ts` for common API patterns:
  ```typescript
  export async function requireAuth() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    return session.user.id;
  }
  
  export async function requirePhaseOwnership(phaseId: string, userId: string) {
    const phase = await prisma.phase.findFirst({
      where: { id: phaseId, userId }
    });
    if (!phase) throw new Error("Phase not found");
    return phase;
  }
  ```

#### **5. Error Handling Inconsistency**
**Issue**: 
- Some routes return detailed errors
- Others return generic "Internal server error"
- Error logging inconsistent

**Recommendation**: 
- Standardize error response format
- Use error logging service (e.g., Sentry) in production
- Return user-friendly errors, log detailed errors server-side

#### **6. Type Safety**
**Issue**: 
- Some API responses use `any` types
- Client components infer types from API responses
- No shared type definitions

**Recommendation**: 
- Create `types/api.ts` with shared types
- Use TypeScript strict mode
- Consider tRPC or Zod for runtime validation + types

#### **7. Missing Input Validation**
**Locations**: Multiple API routes

**Examples**:
- No validation that `startTime`/`endTime` are valid HH:MM format
- No validation that dates are valid ISO strings
- No max length validation on text fields

**Recommendation**: 
- Use Zod for request validation
- Create validation middleware
- Add schema validation for all inputs

### 📝 **Code Quality Improvements**

#### **8. Magic Numbers**
**Location**: `lib/streak.ts`

```typescript
const successThreshold = 0.7; // Should be constant
```

**Recommendation**: 
```typescript
const SUCCESS_THRESHOLD = 0.7;
export const ROUTINE_SUCCESS_THRESHOLD = SUCCESS_THRESHOLD;
```

#### **9. Hardcoded Strings**
**Locations**: Multiple files

**Examples**:
- `"Uncategorized"` category name hardcoded
- `"DONE"`, `"SKIPPED"` status strings
- Error messages

**Recommendation**: 
- Use constants/enums
- Consider i18n for user-facing strings

#### **10. Missing Documentation**
**Issue**: 
- No JSDoc comments on complex functions
- No README explaining architecture
- No API documentation

**Recommendation**: 
- Add JSDoc to public functions
- Document API endpoints
- Add architecture decision records (ADRs)

---

## SUMMARY & PRIORITIES

### 🔴 **Critical (Fix Immediately)**
1. **Race condition in phase activation** (Part 3, Issue #1)
2. **Missing execution date validation** (Part 3, Issue #2)
3. **N+1 queries in streak calculation** (Part 4, Issue #1)

### ⚠️ **High Priority (Fix Soon)**
4. **Transaction wrapping for clone-routine** (Part 3, Issue #3)
5. **Async streak recalculation** (Part 4, Issue #2)
6. **Missing day-level edit endpoints** (Part 2 - Missing Feature)

### 📝 **Medium Priority (Improve Over Time)**
7. **Add database indexes** (Part 3, Issue #9)
8. **Reduce code duplication** (Part 4, Issue #4)
9. **Standardize error handling** (Part 4, Issue #5)
10. **Add input validation** (Part 4, Issue #7)

### 💡 **Low Priority (Nice to Have)**
11. **Timezone documentation** (Part 3, Issue #4)
12. **Type safety improvements** (Part 4, Issue #6)
13. **Code documentation** (Part 4, Issue #10)

---

## RECOMMENDATIONS

### **Immediate Actions**
1. Fix race condition in phase activation (use transaction or application lock)
2. Add execution date validation
3. Optimize streak calculation (batch queries)
4. Add missing day-level edit API endpoints

### **Short-term Improvements**
1. Add database indexes for performance
2. Wrap clone-routine in transaction
3. Make streak recalculation async
4. Add input validation with Zod

### **Long-term Enhancements**
1. Refactor common patterns into helpers
2. Improve type safety with shared types
3. Add comprehensive error logging
4. Document architecture and API

---

**End of Report**

