import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// ✅ 1. แก้ Type ตรงนี้: params เป็น Promise
type Props = {
  params: Promise<{ id: string }>;
};

// PUT: แก้ไขสินค้า
export async function PUT(
  req: Request,
  props: Props
) {
  try {
    const params = await props.params;
    const id = params.id;
    
    const body = await req.json();
    
    const updatedProduct = await prisma.product.update({
      where: { id }, // ใช้ id ที่ await มาแล้ว
      data: {
        name: body.name,
        code: body.code,
        price: Number(body.price),
        category: body.category,
        image_url: body.image_url,
        stock: Number(body.stock),
        is_active: body.is_active, 
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: Props) {
  try {
    // ✅ 2. ต้อง await params ก่อนใช้งาน
    const params = await props.params;
    const id = params.id;

    const body = await req.json();
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...body,
        price: body.price ? Number(body.price) : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: Props) {
  try {
    // ✅ 2. ต้อง await params ก่อนใช้งานเช่นกัน
    const params = await props.params;
    const id = params.id;

    await prisma.product.update({
      where: { id },
      data: { is_active: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}