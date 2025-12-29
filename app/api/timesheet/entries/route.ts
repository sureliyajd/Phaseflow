import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseISO, startOfDay, endOfDay } from "date-fns";

// GET: Fetch timesheet entries for active phase
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
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Get active phase
    const activePhase = await prisma.phase.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!activePhase) {
      return NextResponse.json({
        entries: [],
        phase: null,
      });
    }

    // Build date filter
    const where: any = {
      phaseId: activePhase.id,
    };

    if (startDateParam && endDateParam) {
      const startDate = startOfDay(parseISO(startDateParam));
      const endDate = endOfDay(parseISO(endDateParam));
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Fetch entries
    const entries = await prisma.timesheetEntry.findMany({
      where,
      orderBy: [
        { date: "desc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json({
      entries: entries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        note: entry.note,
        startTime: entry.startTime,
        endTime: entry.endTime,
        priority: entry.priority,
        date: entry.date.toISOString(),
        createdAt: entry.createdAt.toISOString(),
      })),
      phase: {
        id: activePhase.id,
        name: activePhase.name,
      },
    });
  } catch (error) {
    console.error("Error fetching timesheet entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new timesheet entry
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
    const startMinutes = startTime.split(":").map(Number).reduce((h, m) => h * 60 + m);
    const endMinutes = endTime.split(":").map(Number).reduce((h, m) => h * 60 + m);
    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
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
      return NextResponse.json(
        { error: "No active phase found" },
        { status: 404 }
      );
    }

    // Parse date and set to start of day
    const entryDate = startOfDay(parseISO(date));

    // Create entry
    const entry = await prisma.timesheetEntry.create({
      data: {
        phaseId: activePhase.id,
        title: title.trim(),
        note: note?.trim() || null,
        startTime,
        endTime,
        priority: priority as "HIGH" | "MEDIUM" | "LOW",
        date: entryDate,
      },
    });

    return NextResponse.json({
      message: "Timesheet entry created successfully",
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
    console.error("Error creating timesheet entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

