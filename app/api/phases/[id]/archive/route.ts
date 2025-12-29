import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
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

    // Archive the phase (set isActive to false and completedAt to now)
    const archivedPhase = await prisma.phase.update({
      where: { id },
      data: {
        isActive: false,
        completedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        completedAt: true,
      },
    });

    return NextResponse.json({
      message: "Phase archived successfully",
      phase: archivedPhase,
    });
  } catch (error) {
    console.error("Error archiving phase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

