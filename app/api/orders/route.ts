import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, totalAmount, paymentType, customerId } = body;

    // 1. คำนวณแต้มที่จะได้ (Logic เดิม)
    const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const pointsEarned = totalItems;

    // ✅ ใช้ Transaction: ทำทุกอย่างพร้อมกัน (ตัดของ + สร้างบิล + ให้แต้ม)
    // ถ้าขั้นตอนไหนพัง (เช่น ของหมด) จะ Rollback ทั้งหมด ไม่มีการตัดเงินฟรี
    const result = await prisma.$transaction(async (tx) => {

      // ---------------------------------------------------------
      // 2. (NEW) วนลูปเช็คสต็อกและตัดสต็อกสินค้าทีละตัว
      // ---------------------------------------------------------
      for (const item of items) {
        const productId = item.product.id; // อิงตาม structure เดิมของคุณ
        const quantity = item.quantity;

        // ดึงข้อมูลสินค้าล่าสุดจาก DB (ผ่าน tx)
        const productInDb = await tx.product.findUnique({
          where: { id: productId }
        });

        if (!productInDb) {
          throw new Error(`ไม่พบสินค้า ID: ${productId} ในระบบ`);
        }

        // เช็คว่าพอขายไหม
        if (productInDb.stock < quantity) {
          throw new Error(`สินค้า "${productInDb.name}" ของหมด! (เหลือ ${productInDb.stock})`);
        }

        // ตัดสต็อก
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } }
        });
      }

      // ---------------------------------------------------------
      // 3. สร้าง Order (Logic เดิม แต่เปลี่ยนจาก prisma -> tx)
      // ---------------------------------------------------------
      const newOrder = await tx.order.create({
        data: {
          total_amount: totalAmount,
          payment_type: paymentType || "QR",
          status: "PAID",
          order_type: "DINE_IN",
          
          // เชื่อมลูกค้า (ถ้ามี)
          customer_id: customerId || null,
          
          // สร้าง OrderItems
          items: {
            create: items.map((item: any) => ({
              product_id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              options: item.options ? JSON.stringify(item.options) : undefined
            }))
          }
        }
      });

      // ---------------------------------------------------------
      // 4. อัปเดตแต้มลูกค้า (Logic เดิม แต่เปลี่ยนจาก prisma -> tx)
      // ---------------------------------------------------------
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            points: { increment: pointsEarned },      // เพิ่มแต้ม
            total_spent: { increment: totalAmount },  // เพิ่มยอดสะสม
          }
        });
      }

      return newOrder;
    });
    
    // Revalidate products page (stock updated) and dashboard
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return NextResponse.json({ success: true, orderId: result.id });

  } catch (error: any) {
    console.error("Create Order Error:", error);
    
    // ส่ง Error Message กลับไปหน้าบ้าน (เช่น "สินค้า xx ของหมด")
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 400 } // ใช้ 400 Bad Request แทน 500 เพื่อให้ Frontend รู้ว่าเป็น Error จาก Business Logic
    );
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true, // เพื่อโชว์ชื่อลูกค้า
        items: true     // เพื่อโชว์จำนวนสินค้า
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}