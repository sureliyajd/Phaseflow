import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseISO, startOfDay } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { routineBlockId, date, status } = body;

    if (!routineBlockId || !date || !status) {
      return NextResponse.json(
        { error: "routineBlockId, date, and status are required" },
        { status: 400 }
      );
    }

    if (status !== "DONE" && status !== "SKIPPED") {
      return NextResponse.json(
        { error: "Status must be either DONE or SKIPPED" },
        { status: 400 }
      );
    }

    // Parse date and set to start of day
    const executionDate = startOfDay(parseISO(date));

    // Verify routine block exists and belongs to user's active phase
    const routineBlock = await prisma.routineBlock.findFirst({
      where: {
        id: routineBlockId,
        phase: {
          userId: session.user.id,
          isActive: true,
        },
      },
      include: {
        phase: true,
      },
    });

    if (!routineBlock) {
      return NextResponse.json(
        { error: "Routine block not found or does not belong to active phase" },
        { status: 404 }
      );
    }

    // Upsert execution (create or update)
    const execution = await prisma.routineExecution.upsert({
      where: {
        routineBlockId_date: {
          routineBlockId,
          date: executionDate,
        },
      },
      update: {
        status: status as "DONE" | "SKIPPED",
      },
      create: {
        routineBlockId,
        phaseId: routineBlock.phaseId,
        date: executionDate,
        status: status as "DONE" | "SKIPPED",
      },
    });

    return NextResponse.json({
      message: "Execution status updated successfully",
      execution: {
        id: execution.id,
        routineBlockId: execution.routineBlockId,
        date: execution.date,
        status: execution.status,
      },
    });
  } catch (error) {
    console.error("Error updating execution status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

