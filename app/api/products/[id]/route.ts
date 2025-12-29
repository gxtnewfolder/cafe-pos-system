import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { validateProductUpdate, validateProductPatch } from "@/lib/validation";

type Props = {
  params: Promise<{ id: string }>;
};

// PUT: แก้ไขสินค้า (Full Update)
export async function PUT(req: Request, props: Props) {
  try {
    const params = await props.params;
    const id = params.id;
    const body = await req.json();

    // ✅ Use centralized validation service
    const validation = validateProductUpdate(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: validation.data!.name,
        code: validation.data!.code,
        price: validation.data!.price,
        category: validation.data!.category,
        image_url: validation.data!.image_url || null,
        stock: validation.data!.stock,
        is_active: validation.data!.is_active ?? true,
      },
    });

    revalidatePath("/");
    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Code must be unique. This code is already used" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// PATCH: Partial Update
export async function PATCH(req: Request, props: Props) {
  try {
    const params = await props.params;
    const id = params.id;
    const body = await req.json();

    // ✅ Use centralized validation service
    const validation = validateProductPatch(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: validation.data!,
    });

    revalidatePath("/");
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Code must be unique. This code is already used" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE: Soft Delete
// DELETE: Hard Delete
export async function DELETE(req: Request, props: Props) {
  try {
    const params = await props.params;
    const id = params.id;

    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete failed:", error);
    if (error.code === 'P2003') {
       return NextResponse.json({ error: "ไม่สามารถลบสินค้าได้เนื่องจากมีรายการสั่งซื้อที่เกี่ยวข้อง\n(กรุณาใช้วิธีปิดสถานะแทน)" }, { status: 400 });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}