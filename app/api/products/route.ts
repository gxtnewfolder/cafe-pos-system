import { NextResponse } from "next/server";
import prisma from "@/lib/db"; // import จากไฟล์ที่คุณมี

export async function GET() {
  try {
    // ดึงสินค้าทั้งหมดที่ Active อยู่
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        category: 'asc', // เรียงตามหมวดหมู่
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}