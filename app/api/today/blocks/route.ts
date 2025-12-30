import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseISO, startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const selectedDate = parseISO(dateParam);
    const dateStart = startOfDay(selectedDate);
    const dateEnd = endOfDay(selectedDate);

    // Get active phase
    const activePhase = await prisma.phase.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!activePhase) {
      return NextResponse.json({
        blocks: [],
        phase: null,
      });
    }

    // Get routine blocks for this date (non-template blocks)
    const routineBlocks = await prisma.routineBlock.findMany({
      where: {
        phaseId: activePhase.id,
        isTemplate: false,
        date: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Get execution statuses for these blocks
    const executionStatuses = await prisma.routineExecution.findMany({
      where: {
        phaseId: activePhase.id,
        routineBlockId: {
          in: routineBlocks.map((b) => b.id),
        },
        date: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
    });

    // Create a map of blockId -> execution status
    const statusMap = new Map<string, "DONE" | "SKIPPED">();
    executionStatuses.forEach((exec) => {
      statusMap.set(exec.routineBlockId, exec.status);
    });

    // Format blocks with execution status
    const blocks = routineBlocks.map((block) => ({
      id: block.id,
      title: block.title,
      note: block.note,
      startTime: block.startTime,
      endTime: block.endTime,
      category: block.category?.name || null,
      color: block.color || "primary",
      executionStatus: statusMap.get(block.id) || ("PENDING" as const),
    }));

    return NextResponse.json({
      blocks,
      phase: {
        id: activePhase.id,
        name: activePhase.name,
        why: activePhase.why,
        outcome: activePhase.outcome,
      },
      date: dateParam,
    });
  } catch (error) {
    console.error("Error fetching today's blocks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

