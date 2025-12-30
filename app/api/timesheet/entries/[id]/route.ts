import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseISO, startOfDay } from "date-fns";

// PUT: Update timesheet entry
export async function PUT(
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

    const { id } = await params;
    const body = await request.json();
    const { date, startTime, endTime, title, note, priority } = body;

    // Validation
    if (!date || !startTime || !endTime || !title || !priority) {
      return NextResponse.json(
        { error: "date, startTime, endTime, title, and priority are required" },
        { status: 400 }
      );
    }

    if (!["HIGH", "MEDIUM", "LOW"].includes(priority)) {
      return NextResponse.json(
        { error: "Priority must be HIGH, MEDIUM, or LOW" },
        { status: 400 }
      );
    }

    // Validate time range
    const startMinutes = startTime.split(":").map(Number).reduce((h: number, m: number) => h * 60 + m);
    const endMinutes = endTime.split(":").map(Number).reduce((h: number, m: number) => h * 60 + m);
    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Verify entry exists and belongs to user's active phase
    const existingEntry = await prisma.timesheetEntry.findFirst({
      where: {
        id,
        phase: {
          userId: session.user.id,
          isActive: true,
        },
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Timesheet entry not found" },
        { status: 404 }
      );
    }

    // Parse date
    const entryDate = startOfDay(parseISO(date));

    // Update entry
    const entry = await prisma.timesheetEntry.update({
      where: { id },
      data: {
        title: title.trim(),
        note: note?.trim() || null,
        startTime,
        endTime,
        priority: priority as "HIGH" | "MEDIUM" | "LOW",
        date: entryDate,
      },
    });

    return NextResponse.json({
      message: "Timesheet entry updated successfully",
      entry: {
        id: entry.id,
        title: entry.title,
        note: entry.note,
        startTime: entry.startTime,
        endTime: entry.endTime,
        priority: entry.priority,
        date: entry.date.toISOString(),
        createdAt: entry.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating timesheet entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete timesheet entry
export async function DELETE(
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

    const { id } = await params;

    // Verify entry exists and belongs to user's active phase
    const existingEntry = await prisma.timesheetEntry.findFirst({
      where: {
        id,
        phase: {
          userId: session.user.id,
          isActive: true,
        },
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Timesheet entry not found" },
        { status: 404 }
      );
    }

    // Delete entry
    await prisma.timesheetEntry.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Timesheet entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timesheet entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

