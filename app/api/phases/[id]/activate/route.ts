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
    const userId = session.user.id;

    // Check if phase exists and belongs to user
    const existingPhase = await prisma.phase.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingPhase) {
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 }
      );
    }

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

    // Activate the selected phase
    const activatedPhase = await prisma.phase.update({
      where: { id },
      data: {
        isActive: true,
        completedAt: null, // Clear completedAt if it was set
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        completedAt: true,
      },
    });

    return NextResponse.json({
      message: "Phase activated successfully",
      phase: activatedPhase,
    });
  } catch (error) {
    console.error("Error activating phase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

