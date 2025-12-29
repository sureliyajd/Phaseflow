import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/analytics/StatCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { eachDayOfInterval, endOfDay, format, startOfDay } from "date-fns";

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export default async function Analytics() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <AppLayout>
        <div className="min-h-screen pb-8 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Please sign in to view your analytics.
          </p>
        </div>
      </AppLayout>
    );
  }

  const phase = await prisma.phase.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
  });

  if (!phase) {
    return (
      <AppLayout>
        <div className="min-h-screen pb-8 flex flex-col items-center justify-center px-5">
          <h1 className="text-2xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
            Start a phase to see your streaks, adherence, and timesheet
            reflections here.
          </p>
        </div>
      </AppLayout>
    );
  }

  const phaseStart = startOfDay(phase.startDate);
  const phaseEnd = startOfDay(phase.endDate);
  const today = startOfDay(new Date());
  const calculationEnd = phaseEnd > today ? today : phaseEnd;

  let adherencePercentage: number | null = null;
  let plannedMinutes = 0;
  let unplannedMinutes = 0;
  let daysWithBlocks = 0;

  let timesheetByPriority: Record<
    string,
    { count: number; minutes: number }
  > = {};

  if (calculationEnd >= phaseStart) {
    const allDays = eachDayOfInterval({
      start: phaseStart,
      end: calculationEnd,
    });

    // Fetch routine blocks and executions for this phase/date range
    const routineBlocks = await prisma.routineBlock.findMany({
      where: {
        phaseId: phase.id,
        isTemplate: false,
        date: {
          gte: phaseStart,
          lte: endOfDay(calculationEnd),
        },
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
      },
    });

    const executions = await prisma.routineExecution.findMany({
      where: {
        phaseId: phase.id,
        date: {
          gte: phaseStart,
          lte: endOfDay(calculationEnd),
        },
      },
      select: {
        routineBlockId: true,
        date: true,
        status: true,
      },
    });

    // Group blocks and executions by day
    const blocksByDate = new Map<string, typeof routineBlocks>();
    for (const block of routineBlocks) {
      if (!block.date) continue;
      const key = format(block.date, "yyyy-MM-dd");
      if (!blocksByDate.has(key)) {
        blocksByDate.set(key, []);
      }
      blocksByDate.get(key)!.push(block);
      // Planned minutes
      plannedMinutes +=
        parseTimeToMinutes(block.endTime) - parseTimeToMinutes(block.startTime);
    }

    const executionsByDate = new Map<string, typeof executions>();
    for (const exec of executions) {
      const key = format(exec.date, "yyyy-MM-dd");
      if (!executionsByDate.has(key)) {
        executionsByDate.set(key, []);
      }
      executionsByDate.get(key)!.push(exec);
    }

    // Adherence: days with blocks & >= 70% DONE
    let successfulDays = 0;

    for (const day of allDays) {
      const key = format(day, "yyyy-MM-dd");
      const dayBlocks = blocksByDate.get(key) || [];

      if (dayBlocks.length === 0) {
        continue;
      }

      daysWithBlocks++;

      const dayExecutions = executionsByDate.get(key) || [];
      const blockIds = new Set(dayBlocks.map((b) => b.id));
      const doneCount = dayExecutions.filter(
        (e) => blockIds.has(e.routineBlockId) && e.status === "DONE"
      ).length;

      const successThreshold = 0.7;
      if (doneCount / dayBlocks.length >= successThreshold) {
        successfulDays++;
      }
    }

    if (daysWithBlocks > 0) {
      adherencePercentage = Math.round((successfulDays / daysWithBlocks) * 100);
    }

    // Timesheet entries (unplanned time)
    const timesheetEntries = await prisma.timesheetEntry.findMany({
      where: {
        phaseId: phase.id,
        date: {
          gte: phaseStart,
          lte: endOfDay(calculationEnd),
        },
      },
      select: {
        priority: true,
        startTime: true,
        endTime: true,
      },
    });

    timesheetByPriority = {};

    for (const entry of timesheetEntries) {
      const minutes =
        parseTimeToMinutes(entry.endTime) -
        parseTimeToMinutes(entry.startTime);
      unplannedMinutes += minutes;

      const key = entry.priority;
      if (!timesheetByPriority[key]) {
        timesheetByPriority[key] = { count: 0, minutes: 0 };
      }
      timesheetByPriority[key].count += 1;
      timesheetByPriority[key].minutes += minutes;
    }
  }

  const totalTime = plannedMinutes + unplannedMinutes;
  const plannedShare =
    totalTime > 0 ? Math.round((plannedMinutes / totalTime) * 100) : 0;

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            A calm overview of how this phase is going.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="px-5 grid grid-cols-2 gap-4">
          <StatCard
            icon="Flame"
            label="Current Streak"
            value={
              typeof phase.currentStreak === "number" && phase.currentStreak >= 0
                ? `${phase.currentStreak}`
                : "—"
            }
            subtext={
              typeof phase.currentStreak === "number" && phase.currentStreak >= 0
                ? "Consecutive successful days"
                : "Start completing your routine to build a streak"
            }
            color="secondary"
          />
          <StatCard
            icon="Target"
            label="Longest Streak"
            value={
              typeof phase.longestStreak === "number" && phase.longestStreak >= 0
                ? `${phase.longestStreak}`
                : "—"
            }
            subtext={
              typeof phase.longestStreak === "number" && phase.longestStreak >= 0
                ? "Best run this phase"
                : "Complete days to track your longest streak"
            }
            color="calm"
          />
          <StatCard
            icon="CheckCircle2"
            label="Routine Adherence"
            value={
              adherencePercentage !== null && adherencePercentage !== undefined
                ? `${adherencePercentage}%`
                : "—"
            }
            subtext={
              daysWithBlocks > 0
                ? "Days meeting your 70% goal"
                : "Start logging your routine to see adherence"
            }
            color="accent"
          />
          <StatCard
            icon="Clock"
            label="Planned vs Unplanned"
            value={totalTime > 0 ? `${plannedShare}% planned` : "—"}
            subtext={
              totalTime > 0
                ? `Planned ${formatMinutes(
                    plannedMinutes
                  )} · Unplanned ${formatMinutes(unplannedMinutes)}`
                : "No time logged yet"
            }
            color="primary"
          />
        </div>

        {/* Timesheet Breakdown */}
        <div className="px-5 mt-6">
          <div className="card-soft p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Timesheet by Priority
            </h3>
            {Object.keys(timesheetByPriority).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No timesheet entries yet for this phase.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                {(["HIGH", "MEDIUM", "LOW"] as const).map((priority) => {
                  const data = timesheetByPriority[priority];
                  if (!data) return null;
                  return (
                    <div
                      key={priority}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {priority}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.count}{" "}
                        {data.count === 1 ? "entry" : "entries"},{" "}
                        {formatMinutes(data.minutes)}
                      </div>
        </div>
                  );
                })}
        </div>
            )}
        </div>
        </div>
      </div>
    </AppLayout>
  );
}


