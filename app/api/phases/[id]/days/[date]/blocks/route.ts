import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseISO, startOfDay, endOfDay, isAfter, eachDayOfInterval } from "date-fns";

// GET: Fetch blocks for a specific day
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; date: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: phaseId, date: dateStr } = await params;

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

    const targetDate = parseISO(dateStr);
    const dateStart = startOfDay(targetDate);
    const dateEnd = endOfDay(targetDate);

    // Get blocks for this day
    const blocks = await prisma.routineBlock.findMany({
      where: {
        phaseId,
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

    return NextResponse.json({ blocks });
  } catch (error) {
    console.error("Error fetching day blocks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update blocks for a day with scope options
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; date: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: phaseId, date: dateStr } = await params;
    const body = await request.json();
    const { blocks, scope, selectedDates } = body;

    // Validate scope
    if (!["day", "future", "selected"].includes(scope)) {
      return NextResponse.json(
        { error: "Invalid scope. Must be 'day', 'future', or 'selected'" },
        { status: 400 }
      );
    }

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

    const targetDate = parseISO(dateStr);
    const dateStart = startOfDay(targetDate);
    const dateEnd = endOfDay(targetDate);

    // Determine which dates to update
    let datesToUpdate: Date[] = [];

    if (scope === "day") {
      datesToUpdate = [dateStart];
    } else if (scope === "future") {
      const phaseEnd = startOfDay(new Date(phase.endDate));
      const allDates = eachDayOfInterval({
        start: dateStart,
        end: phaseEnd,
      });
      datesToUpdate = allDates;
    } else if (scope === "selected") {
      if (!selectedDates || !Array.isArray(selectedDates) || selectedDates.length === 0) {
        return NextResponse.json(
          { error: "selectedDates array is required for 'selected' scope" },
          { status: 400 }
        );
      }
      datesToUpdate = selectedDates.map((d: string) => startOfDay(parseISO(d)));
    }

    // Validate blocks don't overlap
    const validateNoOverlaps = (blocks: any[]) => {
      for (let i = 0; i < blocks.length; i++) {
        for (let j = i + 1; j < blocks.length; j++) {
          const a = blocks[i];
          const b = blocks[j];
          const aStart = a.startTime.split(":").map(Number);
          const aEnd = a.endTime.split(":").map(Number);
          const bStart = b.startTime.split(":").map(Number);
          const bEnd = b.endTime.split(":").map(Number);

          const aStartMinutes = aStart[0] * 60 + aStart[1];
          const aEndMinutes = aEnd[0] * 60 + aEnd[1];
          const bStartMinutes = bStart[0] * 60 + bStart[1];
          const bEndMinutes = bEnd[0] * 60 + bEnd[1];

          if (
            (aStartMinutes < bEndMinutes && aEndMinutes > bStartMinutes) ||
            (bStartMinutes < aEndMinutes && bEndMinutes > aStartMinutes)
          ) {
            return false;
          }
        }
      }
      return true;
    };

    if (!validateNoOverlaps(blocks)) {
      return NextResponse.json(
        { error: "Routine blocks cannot overlap in time" },
        { status: 400 }
      );
    }

    // Delete existing blocks for target dates
    // First, delete associated RoutineExecution records to avoid foreign key constraint violations
    for (const date of datesToUpdate) {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // Get blocks that will be deleted
      const blocksToDelete = await prisma.routineBlock.findMany({
        where: {
          phaseId,
          isTemplate: false,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        select: {
          id: true,
        },
      });

      // Delete associated executions first
      if (blocksToDelete.length > 0) {
        await prisma.routineExecution.deleteMany({
          where: {
            phaseId,
            routineBlockId: {
              in: blocksToDelete.map((b) => b.id),
            },
            date: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });
      }

      // Now delete the blocks
      await prisma.routineBlock.deleteMany({
        where: {
          phaseId,
          isTemplate: false,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });
    }

    // Create new blocks for each date
    const createdBlocks = [];
    for (const date of datesToUpdate) {
      for (const block of blocks) {
        // Find or create category
        let category = await prisma.category.findFirst({
          where: {
            name: block.category,
            userId: session.user.id,
          },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: block.category,
              userId: session.user.id,
            },
          });
        }

        const newBlock = await prisma.routineBlock.create({
          data: {
            phaseId,
            categoryId: category.id,
            title: block.title,
            note: block.note || null,
            startTime: block.startTime,
            endTime: block.endTime,
            isTemplate: false,
            date: startOfDay(date),
          },
        });

        createdBlocks.push(newBlock);
      }
    }

    return NextResponse.json({
      message: "Blocks updated successfully",
      blocks: createdBlocks,
    });
  } catch (error) {
    console.error("Error updating day blocks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

