import { NextResponse } from "next/server";
import prisma from "@/lib/db";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Invalid updates format. Expected non-empty array." },
        { status: 400 }
      );
    }

    // Apply updates transactionally
    const results = await prisma.$transaction(
        updates.map((update: { id: string; enabled: boolean }) =>
            prisma.featureFlag.update({
                where: { id: update.id },
                data: { enabled: update.enabled },
            })
        )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to batch update features:", error);
    return NextResponse.json(
      { error: "Failed to update features" },
      { status: 500 }
    );
  }
}
