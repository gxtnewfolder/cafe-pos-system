import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { validateProductUpdate, validateProductPatch } from "@/lib/validation";

// ✅ 1. แก้ Type ตรงนี้: params เป็น Promise
type Props = {
  params: Promise<{ id: string }>;
};

// PUT: แก้ไขสินค้า
export async function PUT(
  req: Request,
  props: Props
) {
export async function PUT(req: Request, props: Props) {
  try {
    const params = await props.params;
    const id = params.id;
    
    const body = await req.json();

    // ✅ Validation: Required fields
    const requiredFields = ['name', 'code', 'price', 'category', 'stock'];
    const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null || body[field] === '');
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // ✅ Validation: Valid categories (case-insensitive)
    const validCategoriesLower = ['coffee', 'non-coffee', 'bakery'];
    const categoryLower = String(body.category).toLowerCase();
    if (!validCategoriesLower.includes(categoryLower)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategoriesLower.join(', ')}` },
        { status: 400 }
      );
    }

    // ✅ Validation: Price is numeric and non-negative
    const price = Number(body.price);
    if (isNaN(price)) {
      return NextResponse.json(
        { error: "Price must be a valid number" },
        { status: 400 }
      );
    }
    if (price < 0) {
      return NextResponse.json(
        { error: "Price cannot be negative" },
        { status: 400 }
      );
    // ✅ Use centralized validation service
    const validation = validateProductUpdate(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // ✅ Validation: Stock is numeric and non-negative
    const stock = Number(body.stock);
    if (!Number.isInteger(stock)) {
      return NextResponse.json(
        { error: "Stock must be a valid integer" },
        { status: 400 }
      );
    }
    if (stock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    // ✅ Validation: Name and code are non-empty strings
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: "Name must be a non-empty string" },
        { status: 400 }
      );
    }

    if (typeof body.code !== 'string' || body.code.trim() === '') {
      return NextResponse.json(
        { error: "Code must be a non-empty string" },
        { status: 400 }
      );
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: body.name.trim(),
        code: body.code.trim(),
        price: price,
        category: categoryLower,
        image_url: body.image_url || null,
        stock: stock,
        is_active: typeof body.is_active === 'boolean' ? body.is_active : true,
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
    // ✅ 2. ต้อง await params ก่อนใช้งาน
    const params = await props.params;
    const id = params.id;

    const body = await req.json();

    // ✅ Use centralized validation service
    const validation = validateProductPatch(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // ✅ Validation: Stock if provided
    if (body.stock !== undefined && body.stock !== null) {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock)) {
        return NextResponse.json(
          { error: "Stock must be a valid integer" },
          { status: 400 }
        );
      }
      if (stock < 0) {
        return NextResponse.json(
          { error: "Stock cannot be negative" },
          { status: 400 }
        );
      }
    }

    // ✅ Validation: Name if provided
    if (body.name !== undefined && body.name !== null) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
    }

    // ✅ Validation: Code if provided
    if (body.code !== undefined && body.code !== null) {
      if (typeof body.code !== 'string' || body.code.trim() === '') {
        return NextResponse.json(
          { error: "Code must be a non-empty string" },
          { status: 400 }
        );
      }
    }

    // Build update data with validated values
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.code !== undefined) updateData.code = body.code.trim();
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.stock !== undefined) updateData.stock = Number(body.stock);
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
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

export async function DELETE(req: Request, props: Props) {
  try {
    // ✅ 2. ต้อง await params ก่อนใช้งานเช่นกัน
    const params = await props.params;
    const id = params.id;

    await prisma.product.update({
      where: { id },
      data: { is_active: false },
    });
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}