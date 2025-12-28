import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "daily"; // daily, weekly, monthly
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    // Pagination params
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // Calculate date range based on period
    const now = new Date();
    let dateFrom: Date;
    let dateTo: Date;

    if (startDate && endDate) {
      dateFrom = new Date(startDate);
      dateFrom.setHours(0, 0, 0, 0);
      dateTo = new Date(endDate);
      dateTo.setHours(23, 59, 59, 999);
    } else {
      // Create dateTo as end of today (clone to avoid mutation)
      dateTo = new Date(now);
      dateTo.setHours(23, 59, 59, 999);
      
      // Create dateFrom based on period (clone to avoid mutation)
      dateFrom = new Date(now);
      switch (period) {
        case "weekly":
          dateFrom.setDate(dateFrom.getDate() - 7);
          break;
        case "monthly":
          dateFrom.setMonth(dateFrom.getMonth() - 1);
          break;
        case "daily":
        default:
          break;
      }
      dateFrom.setHours(0, 0, 0, 0);
    }

    const whereClause = {
      createdAt: { gte: dateFrom, lte: dateTo },
      status: "PAID" as const,
    };

    // 1. Use Prisma aggregate for summary stats (database-level)
    const summaryStats = await prisma.order.aggregate({
      where: whereClause,
      _sum: { total_amount: true },
      _count: { _all: true },
      _avg: { total_amount: true },
    });

    const totalSales = Number(summaryStats._sum.total_amount) || 0;
    const totalOrders = summaryStats._count._all || 0;
    const averageOrderValue = Number(summaryStats._avg.total_amount) || 0;

    // 2. Use Prisma groupBy for top products (database-level)
    // Note: We need to use findMany + manual aggregation for revenue calculation
    // since groupBy doesn't support computed fields (price * quantity)
    const orderItems = await prisma.orderItem.findMany({
      where: { order: whereClause },
      select: {
        product_id: true,
        name: true,
        quantity: true,
        price: true,
      },
    });

    // Aggregate in memory but with minimal data (only needed fields)
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orderItems.forEach((item) => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSales[item.product_id].quantity += item.quantity;
      productSales[item.product_id].revenue += Number(item.price) * item.quantity;
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 3. Use Prisma groupBy for daily chart data (database-level)
    // Note: Prisma doesn't support DATE() grouping directly, use aggregated approach
    const ordersForChart = await prisma.order.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        total_amount: true,
      },
    });

    const dailyData: Record<string, { date: string; sales: number; orders: number }> = {};
    ordersForChart.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, sales: 0, orders: 0 };
      }
      dailyData[dateKey].sales += Number(order.total_amount);
      dailyData[dateKey].orders += 1;
    });

    const chartData = Object.values(dailyData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 4. Use Prisma groupBy for payment breakdown (database-level)
    const paymentBreakdownRaw = await prisma.order.groupBy({
      by: ["payment_type"],
      where: whereClause,
      _sum: { total_amount: true },
    });

    const paymentBreakdown: Record<string, number> = {};
    paymentBreakdownRaw.forEach((item) => {
      paymentBreakdown[item.payment_type] = Number(item._sum.total_amount) || 0;
    });

    // 5. Get total count for pagination
    const ordersCount = await prisma.order.count({ where: whereClause });
    const totalPages = Math.ceil(ordersCount / limit);

    // 6. Fetch paginated orders for display table (only needed fields)
    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        createdAt: true,
        total_amount: true,
        payment_type: true,
        status: true,
        customer: { select: { name: true, phone: true } },
        items: { select: { name: true, quantity: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
      },
      topProducts,
      chartData,
      paymentBreakdown,
      orders: orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        customer: order.customer?.name || order.customer?.phone || "Guest",
        items: order.items.map((i) => `${i.name} x${i.quantity}`).join(", "),
        total: Number(order.total_amount),
        payment: order.payment_type,
        status: order.status,
      })),
      pagination: {
        page,
        limit,
        total: ordersCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Sales report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
