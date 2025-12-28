import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Default features
const DEFAULT_FEATURES = [
  { id: "members", name: "ระบบสมาชิก", description: "จัดการข้อมูลสมาชิกและประวัติการสั่งซื้อ", enabled: true, is_addon: false },
  { id: "points", name: "ระบบแต้มสะสม", description: "สะสมแต้มและแลกของรางวัล", enabled: false, is_addon: false },
  { id: "receipts", name: "พิมพ์ใบเสร็จ", description: "ดาวน์โหลดใบเสร็จ PDF", enabled: true, is_addon: false },
  { id: "reports", name: "รายงานยอดขาย", description: "ดูสถิติและรายงานต่างๆ", enabled: true, is_addon: false },
  { id: "multi_branch", name: "หลายสาขา", description: "จัดการหลายสาขาในระบบเดียว", enabled: false, is_addon: true },
  { id: "inventory", name: "คลังสินค้า", description: "จัดการสต็อกและการสั่งซื้อ", enabled: false, is_addon: true },
];

// GET /api/settings/features - ดึง feature flags
export async function GET() {
  try {
    let features = await prisma.featureFlag.findMany({
      orderBy: { id: 'asc' }
    });

    // ถ้ายังไม่มี features ให้สร้าง default
    if (features.length === 0) {
      await prisma.featureFlag.createMany({
        data: DEFAULT_FEATURES
      });
      features = await prisma.featureFlag.findMany({
        orderBy: { id: 'asc' }
      });
    }

    return NextResponse.json(features);
  } catch (error) {
    console.error("Failed to fetch features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

// PUT /api/settings/features - อัพเดท feature toggle
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, enabled } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Feature ID is required" },
        { status: 400 }
      );
    }

    const feature = await prisma.featureFlag.update({
      where: { id },
      data: { enabled }
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error("Failed to update feature:", error);
    return NextResponse.json(
      { error: "Failed to update feature" },
      { status: 500 }
    );
  }
}
