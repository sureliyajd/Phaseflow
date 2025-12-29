import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, eachDayOfInterval, isBefore, isAfter, subDays } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get active phase
    const activePhase = await prisma.phase.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!activePhase) {
      return NextResponse.json({
        streak: 0,
        adherence: null,
        todayBlocks: {
          total: 0,
          completed: 0,
        },
      });
    }

    // Get today's blocks
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const todayBlocks = await prisma.routineBlock.findMany({
      where: {
        phaseId: activePhase.id,
        isTemplate: false,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const todayExecutions = await prisma.routineExecution.findMany({
      where: {
        phaseId: activePhase.id,
        routineBlockId: {
          in: todayBlocks.map((b) => b.id),
        },
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "DONE",
      },
    });

    // Calculate adherence (percentage of days with >= 70% completion)
    // Optimize: Fetch all blocks and executions at once, then group by date
    const phaseStart = startOfDay(new Date(activePhase.startDate));
    const phaseEnd = startOfDay(new Date(activePhase.endDate));
    const todayDate = startOfDay(today);
    const calculationEnd = isAfter(phaseEnd, todayDate) ? todayDate : phaseEnd;

    // Fetch all blocks and executions for the phase period
    const allBlocks = await prisma.routineBlock.findMany({
      where: {
        phaseId: activePhase.id,
        isTemplate: false,
        date: {
          gte: phaseStart,
          lte: calculationEnd,
        },
      },
    });

    const allExecutions = await prisma.routineExecution.findMany({
      where: {
        phaseId: activePhase.id,
        routineBlockId: {
          in: allBlocks.map((b) => b.id),
        },
        date: {
          gte: phaseStart,
          lte: calculationEnd,
        },
        status: "DONE",
      },
    });

    // Group blocks and executions by date
    const blocksByDate = new Map<string, typeof allBlocks>();
    const executionsByDate = new Map<string, typeof allExecutions>();

    allBlocks.forEach((block) => {
      if (block.date) {
        const dateKey = block.date.toISOString().split("T")[0];
        if (!blocksByDate.has(dateKey)) {
          blocksByDate.set(dateKey, []);
        }
        blocksByDate.get(dateKey)!.push(block);
      }
    });

    allExecutions.forEach((exec) => {
      const dateKey = exec.date.toISOString().split("T")[0];
      if (!executionsByDate.has(dateKey)) {
        executionsByDate.set(dateKey, []);
      }
      executionsByDate.get(dateKey)!.push(exec);
    });

    // Calculate adherence
    let successfulDays = 0;
    let daysWithBlocks = 0;

    blocksByDate.forEach((blocks, dateKey) => {
      if (blocks.length === 0) return;
      daysWithBlocks++;

      const executions = executionsByDate.get(dateKey) || [];
      const doneCount = executions.length;
      const successThreshold = 0.7;
      if (doneCount / blocks.length >= successThreshold) {
        successfulDays++;
      }
    });

    const adherence = daysWithBlocks > 0 
      ? Math.round((successfulDays / daysWithBlocks) * 100)
      : null;

    // Check recent days (last 5 days) for mostly skipped pattern
    const recentDaysStart = startOfDay(subDays(today, 4)); // Last 5 days including today
    const recentDaysEnd = endOfDay(today);
    
    const recentBlocks = await prisma.routineBlock.findMany({
      where: {
        phaseId: activePhase.id,
        isTemplate: false,
        date: {
          gte: recentDaysStart,
          lte: recentDaysEnd,
        },
      },
    });

    const recentExecutions = await prisma.routineExecution.findMany({
      where: {
        phaseId: activePhase.id,
        routineBlockId: {
          in: recentBlocks.map((b) => b.id),
        },
        date: {
          gte: recentDaysStart,
          lte: recentDaysEnd,
        },
      },
    });

    // Group recent executions by date
    const recentExecutionsByDate = new Map<string, typeof recentExecutions>();
    recentExecutions.forEach((exec) => {
      const dateKey = exec.date.toISOString().split("T")[0];
      if (!recentExecutionsByDate.has(dateKey)) {
        recentExecutionsByDate.set(dateKey, []);
      }
      recentExecutionsByDate.get(dateKey)!.push(exec);
    });

    // Group recent blocks by date
    const recentBlocksByDate = new Map<string, typeof recentBlocks>();
    recentBlocks.forEach((block) => {
      if (block.date) {
        const dateKey = block.date.toISOString().split("T")[0];
        if (!recentBlocksByDate.has(dateKey)) {
          recentBlocksByDate.set(dateKey, []);
        }
        recentBlocksByDate.get(dateKey)!.push(block);
      }
    });

    // Count days with mostly skipped blocks (less than 30% done)
    let mostlySkippedDays = 0;
    recentBlocksByDate.forEach((blocks, dateKey) => {
      if (blocks.length === 0) return;
      const executions = recentExecutionsByDate.get(dateKey) || [];
      const doneCount = executions.filter((e) => e.status === "DONE").length;
      const skippedCount = executions.filter((e) => e.status === "SKIPPED").length;
      const totalExecutions = executions.length;
      
      // If most executions are skipped or very few are done, count as mostly skipped
      if (totalExecutions > 0 && (doneCount / blocks.length < 0.3 || skippedCount / totalExecutions > 0.7)) {
        mostlySkippedDays++;
      } else if (totalExecutions === 0 && blocks.length > 0) {
        // No executions but blocks exist - could be skipped
        mostlySkippedDays++;
      }
    });

    const hasRecentSkippedPattern = mostlySkippedDays >= 3; // 3+ out of last 5 days

    return NextResponse.json({
      streak: (activePhase as any)?.currentStreak || 0,
      adherence,
      todayBlocks: {
        total: todayBlocks.length,
        completed: todayExecutions.length,
      },
      phaseMotivation: {
        why: activePhase.why,
        outcome: activePhase.outcome,
      },
      hasRecentSkippedPattern,
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

