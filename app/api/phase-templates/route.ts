import { NextResponse } from "next/server";
import { getAllTemplates } from "@/lib/phase-templates";

/**
 * GET /api/phase-templates
 * Returns all available phase templates
 */
export async function GET() {
  try {
    const templates = getAllTemplates();
    
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

