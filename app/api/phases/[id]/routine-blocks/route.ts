import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Fetch template blocks for a phase
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

    const { id: phaseId } = await params;

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

    // Get template blocks (isTemplate = true, date = null)
    const templateBlocks = await prisma.routineBlock.findMany({
      where: {
        phaseId,
        isTemplate: true,
        date: null,
      },
      include: {
        category: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json({ blocks: templateBlocks });
  } catch (error) {
    console.error("Error fetching template blocks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Save template blocks
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
    const { blocks } = body;

    if (!Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        { error: "At least one block is required" },
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

    // Validate time overlaps for template blocks
    const sortedBlocks = [...blocks].sort((a, b) => {
      const aStart = a.startTime.split(":").map(Number);
      const bStart = b.startTime.split(":").map(Number);
      return aStart[0] * 60 + aStart[1] - (bStart[0] * 60 + bStart[1]);
    });

    for (let i = 0; i < sortedBlocks.length - 1; i++) {
      const current = sortedBlocks[i];
      const next = sortedBlocks[i + 1];
      const currentEnd = current.endTime.split(":").map(Number);
      const nextStart = next.startTime.split(":").map(Number);
      const currentEndMin = currentEnd[0] * 60 + currentEnd[1];
      const nextStartMin = nextStart[0] * 60 + nextStart[1];

      if (currentEndMin > nextStartMin) {
        return NextResponse.json(
          { error: `Block "${current.title}" overlaps with "${next.title}"` },
          { status: 400 }
        );
      }
    }

    // Delete existing template blocks for this phase
    await prisma.routineBlock.deleteMany({
      where: {
        phaseId,
        isTemplate: true,
        date: null,
      },
    });

    // Create a default category if needed, or use existing
    // Since categoryId is required, we'll create a default "Uncategorized" category
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

    // Create or get categories and create template blocks
    const createdBlocks = [];
    for (const block of blocks) {
      let categoryId = defaultCategory.id;

      if (block.category) {
        // Find or create category
        const category = await prisma.category.upsert({
          where: {
            name_userId: {
              name: block.category,
              userId: session.user.id,
            },
          },
          create: {
            name: block.category,
            userId: session.user.id,
          },
          update: {},
        });
        categoryId = category.id;
      }

      const createdBlock = await prisma.routineBlock.create({
        data: {
          phaseId,
          categoryId,
          title: block.title,
          note: block.note || null,
          startTime: block.startTime,
          endTime: block.endTime,
          color: block.color || "primary",
          isTemplate: true,
          date: null,
        },
        include: {
          category: true,
        },
      });

      createdBlocks.push(createdBlock);
    }

    return NextResponse.json({
      message: "Template blocks saved successfully",
      blocks: createdBlocks,
    });
  } catch (error) {
    console.error("Error saving template blocks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

