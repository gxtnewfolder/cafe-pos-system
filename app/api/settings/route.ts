import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/settings - ดึงการตั้งค่าร้าน
export async function GET() {
  try {
    // ดึงหรือสร้าง default settings
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "default" }
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "default" }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - อัพเดทการตั้งค่าร้าน
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {
        store_name: body.store_name,
        store_logo: body.store_logo,
        address: body.address,
        phone: body.phone,
        tax_id: body.tax_id,
      },
      create: {
        id: "default",
        store_name: body.store_name || "Pocket Café",
        store_logo: body.store_logo,
        address: body.address,
        phone: body.phone,
        tax_id: body.tax_id,
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
