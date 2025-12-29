import { prisma } from "@/lib/db";
import { eachDayOfInterval, startOfDay, endOfDay, isBefore, isAfter } from "date-fns";

/**
 * Calculate if a day is successful based on execution status.
 * A day is successful if >= 70% of RoutineBlocks are DONE.
 */
async function isDaySuccessful(
  phaseId: string,
  date: Date
): Promise<boolean> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  // Get all routine blocks scheduled for this day (non-template blocks)
  const blocksForDay = await prisma.routineBlock.findMany({
    where: {
      phaseId,
      isTemplate: false,
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  // If no blocks scheduled for this day, day is not successful
  if (blocksForDay.length === 0) {
    return false;
  }

  // Get execution statuses for these blocks
  const executions = await prisma.routineExecution.findMany({
    where: {
      phaseId,
      routineBlockId: {
        in: blocksForDay.map((b) => b.id),
      },
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  // Count DONE executions
  const doneCount = executions.filter((e) => e.status === "DONE").length;
  const totalBlocks = blocksForDay.length;

  // Day is successful if >= 70% are DONE
  const successThreshold = 0.7;
  return doneCount / totalBlocks >= successThreshold;
}

/**
 * Calculate and update streak for a phase.
 * This function recalculates the entire streak from scratch to ensure accuracy.
 */
export async function updatePhaseStreak(phaseId: string): Promise<void> {
  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
  });

  if (!phase) {
    throw new Error(`Phase ${phaseId} not found`);
  }

  const startDate = startOfDay(phase.startDate);
  const endDate = startOfDay(phase.endDate);
  const today = startOfDay(new Date());

  // Only calculate streak up to today (can't have streak for future days)
  const calculationEndDate = isAfter(endDate, today) ? today : endDate;

  // Get all days in phase range
  const allDays = eachDayOfInterval({
    start: startDate,
    end: calculationEndDate,
  });

  // Calculate success status for each day
  const dayStatuses: boolean[] = [];
  for (const day of allDays) {
    const isSuccessful = await isDaySuccessful(phaseId, day);
    dayStatuses.push(isSuccessful);
  }

  // Calculate current streak (from most recent day backwards)
  let currentStreak = 0;
  for (let i = dayStatuses.length - 1; i >= 0; i--) {
    if (dayStatuses[i]) {
      currentStreak++;
    } else {
      break; // Streak broken
    }
  }

  // Calculate longest streak (scanning entire array)
  let longestStreak = 0;
  let tempStreak = 0;
  for (const isSuccessful of dayStatuses) {
    if (isSuccessful) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Update phase with new streak values
  // For longestStreak, we preserve the maximum value to never decrease it
  // This ensures that even if we recalculate, we don't lose the historical longest streak
  const finalLongestStreak = Math.max(longestStreak, phase.longestStreak);

  await prisma.phase.update({
    where: { id: phaseId },
    data: {
      currentStreak,
      longestStreak: finalLongestStreak,
    },
  });
}

/**
 * Recalculate streak for a phase after an execution change.
 * This is idempotent - calling it multiple times with the same data yields the same result.
 */
export async function recalculateStreakAfterExecution(
  phaseId: string
): Promise<void> {
  await updatePhaseStreak(phaseId);
}

