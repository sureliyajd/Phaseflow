import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addDays, isWeekend, parseISO, format, eachDayOfInterval } from "date-fns";

export async function POST(
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
    const body = await request.json();
    const { option, excludedDates = [] } = body;

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

    // Get template blocks
    const templateBlocks = await prisma.routineBlock.findMany({
      where: {
        phaseId,
        isTemplate: true,
        date: null,
      },
      include: {
        category: true,
      },
    });

    if (templateBlocks.length === 0) {
      return NextResponse.json(
        { error: "No template blocks found. Please create routine blocks first." },
        { status: 400 }
      );
    }

    // Calculate dates to clone to
    const startDate = new Date(phase.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(phase.endDate);
    endDate.setHours(23, 59, 59, 999);

    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    let datesToClone: Date[] = [];

    if (option === "all") {
      datesToClone = allDates;
    } else if (option === "weekdays") {
      datesToClone = allDates.filter((date) => !isWeekend(date));
    } else if (option === "custom") {
      datesToClone = allDates.filter((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return !excludedDates.includes(dateStr);
      });
    }

    // Remove excluded dates from any option
    datesToClone = datesToClone.filter((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return !excludedDates.includes(dateStr);
    });

    if (datesToClone.length === 0) {
      return NextResponse.json(
        { error: "No dates to clone to. Please adjust your selection." },
        { status: 400 }
      );
    }

    // Delete existing dated blocks for this phase (optional - you might want to keep them)
    // For now, we'll delete and recreate to ensure consistency
    await prisma.routineExecution.deleteMany({
      where: {
        phaseId,
        routineBlock: {
          phaseId,
          isTemplate: false,
        },
      },
    });

    await prisma.routineBlock.deleteMany({
      where: {
        phaseId,
        isTemplate: false,
      },
    });

    // Clone blocks for each date
    const createdBlocks = [];
    for (const date of datesToClone) {
      for (const template of templateBlocks) {
        // Set date to beginning of day
        const blockDate = new Date(date);
        blockDate.setHours(0, 0, 0, 0);

        // Ensure categoryId exists (should always exist from template)
        if (!template.categoryId) {
          // Create default category if somehow missing
          const defaultCategory = await prisma.category.upsert({
            where: {
              name_userId: {
                name: "Uncategorized",
                userId: session.user.id,
              },
            },
            create: {
              name: "Uncategorized",
              userId: session.user.id,
            },
            update: {},
          });
          template.categoryId = defaultCategory.id;
        }

        const createdBlock = await prisma.routineBlock.create({
          data: {
            phaseId,
            categoryId: template.categoryId,
            title: template.title,
            note: template.note,
            startTime: template.startTime,
            endTime: template.endTime,
            color: template.color || "primary",
            isTemplate: false,
            date: blockDate,
          },
        });

        createdBlocks.push(createdBlock);
      }
    }

    return NextResponse.json({
      message: "Routine cloned successfully",
      blocksCreated: createdBlocks.length,
      datesCloned: datesToClone.length,
    });
  } catch (error) {
    console.error("Error cloning routine:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

