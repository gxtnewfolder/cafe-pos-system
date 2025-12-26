import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, totalAmount, paymentType, customerId } = body;

    // 1. คำนวณแต้มที่จะได้ (สมมติ 1 แก้ว = 1 แต้ม)
    const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const pointsEarned = totalItems;

    // 2. สร้าง Order พร้อมเชื่อม Customer และ Update แต้ม
    const order = await prisma.order.create({
      data: {
        total_amount: totalAmount,
        payment_type: paymentType || "QR",
        status: "PAID", 
        order_type: "DINE_IN", 
        
        // เชื่อมลูกค้า (ถ้ามี)
        customer_id: customerId || null,
        
        // 3. สร้าง OrderItems (รายการสินค้าในบิล) พร้อมกันเลย
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

    // 4. อัปเดตแต้มลูกค้า (Update Transaction)
    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          points: { increment: pointsEarned },      // เพิ่มแต้ม
          total_spent: { increment: totalAmount },  // เพิ่มยอดสะสม
        }
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error) {
    console.error("Create Order Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}