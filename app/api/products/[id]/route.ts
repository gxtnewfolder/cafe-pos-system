import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...body,
        price: body.price ? Number(body.price) : undefined, // แปลงเป็นเลขถ้ามีการส่งมา
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Soft Delete: แค่ปิด is_active ไม่ลบข้อมูลจริง (เพื่อรักษาประวัติออเดอร์เก่า)
    await prisma.product.update({
      where: { id: params.id },
      data: { is_active: false }, 
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}