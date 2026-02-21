import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, totalAmount, paymentType, customerId, orderType, discount } = body;

    const discountAmount = Number(discount) || 0;
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // 1. คำนวณแต้มที่จะได้
    const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const pointsEarned = totalItems;

    const result = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;

      // ---------------------------------------------------------
      // 2. วนลูปเช็คสต็อกและคำนวณราคาจริง
      // ---------------------------------------------------------
      for (const item of items) {
        const productId = item.product.id;
        const quantity = item.quantity;

        const productInDb = await tx.product.findUnique({
          where: { id: productId }
        });

        if (!productInDb) {
          throw new Error(`ไม่พบสินค้า ID: ${productId} ในระบบ`);
        }

        if (productInDb.stock < quantity) {
          throw new Error(`สินค้า "${productInDb.name}" ของหมด! (เหลือ ${productInDb.stock})`);
        }

        // สะสมราคาที่แท้จริงจาก Database
        calculatedTotal += Number(productInDb.price) * quantity;

        // ตัดสต็อก
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } }
        });
      }

      // คำนวณราคาสุทธิจริงๆ ป้องกันการส่ง totalAmount ปลอมมา
      const finalPrice = Math.max(0, calculatedTotal - discountAmount);

      // ---------------------------------------------------------
      // 3. สร้าง Order
      // ---------------------------------------------------------
      const newOrder = await tx.order.create({
        data: {
          total_amount: finalPrice,
          payment_type: paymentType || "QR",
          status: "PAID",
          order_type: orderType === "TAKE_AWAY" ? "TAKE_AWAY" : "DINE_IN",
          
          customer_id: customerId || null,
          
          items: {
            create: items.map((item: any) => ({
              product_id: item.product.id,
              name: item.product.name,
              price: item.product.price, // บันทึกราคา ณ วันที่ขาย
              quantity: item.quantity,
              options: item.options ? JSON.stringify(item.options) : undefined
            }))
          }
        }
      });

      // ---------------------------------------------------------
      // 4. อัปเดตแต้มลูกค้า
      // ---------------------------------------------------------
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            points: { increment: pointsEarned },      
            total_spent: { increment: finalPrice },  
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