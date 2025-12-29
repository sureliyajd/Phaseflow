import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addDays } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, durationDays, startDate, why, outcome } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Phase name is required" },
        { status: 400 }
      );
    }

    if (!durationDays || durationDays < 1) {
      return NextResponse.json(
        { error: "Duration must be at least 1 day" },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 }
      );
    }

    if (!why || !why.trim()) {
      return NextResponse.json(
        { error: "Why field is required" },
        { status: 400 }
      );
    }

    if (!outcome || !outcome.trim()) {
      return NextResponse.json(
        { error: "Outcome field is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const start = new Date(startDate);
    // Set start date to beginning of day
    start.setHours(0, 0, 0, 0);
    
    // Calculate end date (durationDays - 1 because start date is day 1)
    const end = addDays(start, durationDays - 1);
    // Set end date to end of day (23:59:59.999)
    end.setHours(23, 59, 59, 999);

    // Archive any existing active phases for this user
    await prisma.phase.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create the new phase
    const phase = await prisma.phase.create({
      data: {
        userId,
        name: name.trim(),
        durationDays,
        startDate: start,
        endDate: end,
        why: why.trim(),
        outcome: outcome.trim(),
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        durationDays: true,
        startDate: true,
        endDate: true,
        why: true,
        outcome: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Phase created successfully", phase },
      { status: 201 }
    );
  } catch (error) {
    console.error("Phase creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

