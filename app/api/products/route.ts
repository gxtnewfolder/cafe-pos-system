import { NextResponse } from "next/server";
import prisma from "@/lib/db"; // import จากไฟล์ที่คุณมี
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    // ดึงสินค้าทั้งหมดที่ Active อยู่
    const products = await prisma.product.findMany({
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, price, category, image_url } = body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        code,
        price: Number(price),
        category,
        image_url,
        is_active: true
      }
    });
    revalidatePath("/");
    return NextResponse.json(newProduct);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}