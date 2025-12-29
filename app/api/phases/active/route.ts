import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { differenceInDays } from "date-fns";

export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Find active phase for the user
    const activePhase = await prisma.phase.findFirst({
      where: {
        userId,
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

    if (!activePhase) {
      return NextResponse.json(
        { phase: null },
        { status: 200 }
      );
    }

    // Calculate current day of phase
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(activePhase.startDate);
    start.setHours(0, 0, 0, 0);
    
    const currentDay = differenceInDays(today, start) + 1;
    const phaseDay = Math.max(1, Math.min(currentDay, activePhase.durationDays));

    return NextResponse.json({
      phase: {
        ...activePhase,
        currentDay: phaseDay,
      },
    });
  } catch (error) {
    console.error("Error fetching active phase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

