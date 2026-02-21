import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export const dynamic = 'force-dynamic'; // ห้าม Cache

export async function GET() {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // 1. ยอดขายวันนี้ (Today's Sales)
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfToday, lte: endOfToday },
        status: "PAID"
      },
      include: { items: true }
    });

    const totalSales = todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalOrders = todayOrders.length;

    // 1.5 คำนวณยอดขายเมื่อวาน (Yesterday's Sales) เพื่อหา % Change
    const yesterday = subDays(today, 1);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);

    const yesterdayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfYesterday, lte: endOfYesterday },
        status: "PAID"
      }
    });

    const totalSalesYesterday = yesterdayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    
    // คำนวณ % Change
    let salesChangePercentage = 0;
    if (totalSalesYesterday === 0) {
        salesChangePercentage = totalSales > 0 ? 100 : 0;
    } else {
        salesChangePercentage = ((totalSales - totalSalesYesterday) / totalSalesYesterday) * 100;
    }

    // 2. สินค้าขายดี (Top Products) - คำนวณจาก Order วันนี้
    const productSales: Record<string, number> = {};
    todayOrders.forEach(order => {
        order.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });
    // แปลงเป็น Array แล้ว Sort
    const topProducts = Object.entries(productSales)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3); // เอาแค่ 3 อันดับแรก

    // 3. กราฟยอดขายย้อนหลัง 7 วัน
    const salesChartData = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const start = startOfDay(date);
        const end = endOfDay(date);

        const orders = await prisma.order.findMany({
            where: { createdAt: { gte: start, lte: end }, status: "PAID" }
        });

        const sales = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        salesChartData.push({
            date: format(date, "dd/MM"), // แกน X: วันที่ (เช่น 25/12)
            sales: sales // แกน Y: ยอดขาย
        });
    }

    // 4. สินค้าใกล้หมด (Low Stock) < 10 ชิ้น
    const lowStockItems = await prisma.product.findMany({
        where: { stock: { lte: 10 }, is_active: true },
        orderBy: { stock: 'asc' },
        take: 5
    });

    // 5. Payment breakdown (QR vs CASH)
    const paymentBreakdown = {
      QR: todayOrders.filter(o => o.payment_type === "QR").length,
      CASH: todayOrders.filter(o => o.payment_type === "CASH").length,
    };

    return NextResponse.json({
        stats: { totalSales, totalOrders, salesChangePercentage },
        topProducts,
        salesChartData,
        lowStockItems,
        paymentBreakdown
    });

  } catch (error: any) {
    console.error("🔥 Dashboard API Error Detail:", error);
    return NextResponse.json({ 
        error: "Failed to fetch dashboard data",
    }, { status: 500 });
  }
}