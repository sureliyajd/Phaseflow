import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { eachDayOfInterval, format, isToday, isPast, isFuture } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: phaseId } = await params;

    // Verify phase belongs to user
    const phase = await prisma.phase.findFirst({
      where: {
        id: phaseId,
        userId: session.user.id,
      },
    });

    if (!phase) {
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 }
      );
    }

    // Get all dates in phase
    const startDate = new Date(phase.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(phase.endDate);
    endDate.setHours(23, 59, 59, 999);

    const allDates = eachDayOfInterval({ start: startDate, end: endDate });

    // Get all routine blocks for this phase (dated blocks only, not templates)
    const routineBlocks = await prisma.routineBlock.findMany({
      where: {
        phaseId,
        isTemplate: false,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    });

    // Group blocks by date
    const blocksByDate = new Map<string, typeof routineBlocks>();
    routineBlocks.forEach((block) => {
      if (block.date) {
        const dateKey = format(block.date, "yyyy-MM-dd");
        if (!blocksByDate.has(dateKey)) {
          blocksByDate.set(dateKey, []);
        }
        blocksByDate.get(dateKey)!.push(block);
      }
    });

    // Build days array
    const days = allDates.map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const dateStr = format(date, "yyyy-MM-dd");
      const blocks = blocksByDate.get(dateKey) || [];

      return {
        date: dateStr,
        dateObj: date.toISOString(),
        dayNumber: allDates.indexOf(date) + 1,
        isToday: isToday(date),
        isPast: isPast(date) && !isToday(date),
        isFuture: isFuture(date),
        blocks: blocks.map((b) => ({
          id: b.id,
          title: b.title,
          note: b.note,
          startTime: b.startTime,
          endTime: b.endTime,
          category: b.category?.name || null,
        })),
      };
    });

    return NextResponse.json({
      phase: {
        id: phase.id,
        name: phase.name,
        durationDays: phase.durationDays,
        startDate: phase.startDate,
        endDate: phase.endDate,
        why: phase.why,
        outcome: phase.outcome,
        currentDay: days.findIndex((d) => d.isToday) + 1 || 1,
      },
      days,
    });
  } catch (error) {
    console.error("Error fetching phase days:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

