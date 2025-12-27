import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { validateProductCreate } from "@/lib/validation";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        category: 'asc',
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Use centralized validation service
    const validation = validateProductCreate(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: validation.data!.name,
        code: validation.data!.code,
        price: validation.data!.price,
        category: validation.data!.category,
        image_url: validation.data!.image_url || null,
        stock: validation.data!.stock ?? 0,
        is_active: validation.data!.is_active ?? true,
      }
    });
    revalidatePath("/");
    return NextResponse.json(newProduct);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Code must be unique. This code is already used" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}