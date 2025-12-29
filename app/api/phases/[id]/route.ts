import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    const { id } = await params;
    const phase = await prisma.phase.findFirst({
      where: {
        id,
        userId: session.user.id,
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
        completedAt: true,
      },
    });

    if (!phase) {
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ phase });
  } catch (error) {
    console.error("Error fetching phase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { name, why, outcome } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Phase name is required" },
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

    // Check if phase exists and belongs to user
    const existingPhase = await prisma.phase.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingPhase) {
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 }
      );
    }

    // Update phase
    const updatedPhase = await prisma.phase.update({
      where: { id },
      data: {
        name: name.trim(),
        why: why.trim(),
        outcome: outcome.trim(),
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

    return NextResponse.json({
      message: "Phase updated successfully",
      phase: updatedPhase,
    });
  } catch (error) {
    console.error("Error updating phase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

