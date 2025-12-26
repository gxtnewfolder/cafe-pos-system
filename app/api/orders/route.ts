import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, totalAmount, paymentType } = body;

    // 1. สร้าง Order
    const order = await prisma.order.create({
      data: {
        total_amount: totalAmount,
        payment_type: paymentType || "QR",
        status: "PAID", // ใน PoC สมมติว่าจ่ายแล้วทันที
        order_type: "DINE_IN", 
        
        // 2. สร้าง OrderItems (รายการสินค้าในบิล) พร้อมกันเลย
        items: {
          create: items.map((item: any) => ({
            product_id: item.product.id,
            name: item.product.name,
            price: item.product.price, // บันทึกราคา ณ ตอนขาย
            quantity: item.quantity,
            options: item.options ? JSON.stringify(item.options) : undefined
          }))
        }
      }
    });

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error) {
    console.error("Create Order Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}