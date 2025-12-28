"use server";

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "daily"; // daily, weekly, monthly
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculate date range based on period
    const now = new Date();
    let dateFrom: Date;
    let dateTo: Date = new Date(now.setHours(23, 59, 59, 999));

    if (startDate && endDate) {
      dateFrom = new Date(startDate);
      dateTo = new Date(endDate);
      dateTo.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case "weekly":
          dateFrom = new Date(now);
          dateFrom.setDate(dateFrom.getDate() - 7);
          break;
        case "monthly":
          dateFrom = new Date(now);
          dateFrom.setMonth(dateFrom.getMonth() - 1);
          break;
        case "daily":
        default:
          dateFrom = new Date(now);
          dateFrom.setHours(0, 0, 0, 0);
          break;
      }
    }

    // Fetch orders within date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
        status: "PAID",
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate summary stats
    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate top products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.product_id;
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += Number(item.price) * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate daily breakdown for chart
    const dailyData: Record<string, { date: string; sales: number; orders: number }> = {};
    orders.forEach((order) => {
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

    // Payment breakdown
    const paymentBreakdown = orders.reduce(
      (acc, order) => {
        const type = order.payment_type || "OTHER";
        acc[type] = (acc[type] || 0) + Number(order.total_amount);
        return acc;
      },
      {} as Record<string, number>
    );

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
    });
  } catch (error) {
    console.error("Sales report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
