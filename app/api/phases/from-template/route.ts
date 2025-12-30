import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addDays, isWeekend, eachDayOfInterval } from "date-fns";
import { getTemplateById } from "@/lib/phase-templates";

/**
 * POST /api/phases/from-template
 * Creates a new phase from a template
 */
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
    const { templateId, name, durationDays, startDate, why, outcome } = body;

    // Validation
    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

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

    // Get template
    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = addDays(start, durationDays - 1);
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
    });

    // Create default category if needed
    const defaultCategory = await prisma.category.upsert({
      where: {
        name_userId: {
          name: "Uncategorized",
          userId,
        },
      },
      create: {
        name: "Uncategorized",
        userId,
      },
      update: {},
    });

    // Create template blocks (isTemplate = true, date = null)
    const templateBlocks = [];
    for (const block of template.blocks) {
      // Find or create category
      const category = await prisma.category.upsert({
        where: {
          name_userId: {
            name: block.category,
            userId,
          },
        },
        create: {
          name: block.category,
          userId,
        },
        update: {},
      });

      const createdBlock = await prisma.routineBlock.create({
        data: {
          phaseId: phase.id,
          categoryId: category.id,
          title: block.title,
          note: block.note || null,
          startTime: block.startTime,
          endTime: block.endTime,
          color: (block as any).color || "primary",
          isTemplate: true,
          date: null,
        },
        include: {
          category: true,
        },
      });

      templateBlocks.push(createdBlock);
    }

    // Calculate dates to clone to based on weekend handling
    const allDates = eachDayOfInterval({ start, end });
    let datesToClone = allDates;

    if (template.weekendHandling === "exclude") {
      datesToClone = allDates.filter((date) => !isWeekend(date));
    }

    // Clone template blocks to all dates
    const createdBlocks = [];
    for (const date of datesToClone) {
      for (const templateBlock of templateBlocks) {
        const blockDate = new Date(date);
        blockDate.setHours(0, 0, 0, 0);

        const createdBlock = await prisma.routineBlock.create({
          data: {
            phaseId: phase.id,
            categoryId: templateBlock.categoryId,
            title: templateBlock.title,
            note: templateBlock.note,
            startTime: templateBlock.startTime,
            endTime: templateBlock.endTime,
            color: templateBlock.color || "primary",
            isTemplate: false,
            date: blockDate,
          },
        });

        createdBlocks.push(createdBlock);
      }
    }

    return NextResponse.json(
      {
        message: "Phase created from template successfully",
        phase: {
          id: phase.id,
          name: phase.name,
          durationDays: phase.durationDays,
          startDate: phase.startDate,
          endDate: phase.endDate,
          why: phase.why,
          outcome: phase.outcome,
          isActive: phase.isActive,
          createdAt: phase.createdAt,
        },
        blocksCreated: createdBlocks.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating phase from template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

