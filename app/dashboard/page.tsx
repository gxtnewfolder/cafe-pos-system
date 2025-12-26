export const dynamic = 'force-dynamic';
import prisma from "@/lib/db";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { th } from "date-fns/locale"; // ใช้ภาษาไทย
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Users,
  ShoppingBag,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OverviewChart } from "./components/OverviewChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ฟังก์ชันดึงข้อมูล (รันฝั่ง Server)
async function getDashboardData() {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  // 1. ดึงยอดขายวันนี้
  const todaysOrders = await prisma.order.findMany({
    where: {
      createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      status: "PAID",
    },
    include: { items: true },
  });

  const totalSalesToday = todaysOrders.reduce(
    (sum, order) => sum + Number(order.total_amount),
    0
  );
  const totalOrdersToday = todaysOrders.length;

  // 2. ดึงยอด 7 วันย้อนหลัง (สำหรับกราฟ)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const start = startOfDay(date);
    const end = endOfDay(date);

    // ดึง Aggregate ยอดขายของวันนั้น
    const result = await prisma.order.aggregate({
      _sum: { total_amount: true },
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: "PAID",
      },
    });

    last7Days.push({
      name: format(date, "dd MMM", { locale: th }), // แปลงเป็น "27 ธ.ค."
      total: Number(result._sum?.total_amount ?? 0),
    });
  }

  // 3. ดึงออเดอร์ล่าสุด 5 รายการ
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return {
    totalSalesToday,
    totalOrdersToday,
    graphData: last7Days,
    recentOrders,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">
          Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          {/* ปุ่มไปหน้าจัดการสินค้า */}
          <Link href="/dashboard/products">
            <Button variant="outline" className="gap-2">
              <Package className="w-4 h-4" />
              จัดการสินค้า
            </Button>
          </Link>

          {/* ปุ่มกลับหน้า POS */}
          <Link href="/">
            <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4" /> 
              กลับหน้าขาย (POS)
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Stats Cards (Grid 4 ช่อง) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card: ยอดขายวันนี้ */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดขายวันนี้</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{data.totalSalesToday.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              สรุปยอดเฉพาะที่จ่ายเงินแล้ว
            </p>
          </CardContent>
        </Card>

        {/* Card: จำนวนออเดอร์ */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ออเดอร์วันนี้</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.totalOrdersToday}</div>
            <p className="text-xs text-muted-foreground">รายการ</p>
          </CardContent>
        </Card>

        {/* Card: ลูกค้า (Placeholder) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เฉลี่ยต่อบิล</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿
              {(data.totalOrdersToday > 0
                ? data.totalSalesToday / data.totalOrdersToday
                : 0
              ).toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้าทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">ระบบ CRM เร็วๆ นี้</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Content: Graph + Recent Sales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart (กินพื้นที่ 4/7) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={data.graphData} />
          </CardContent>
        </Card>

        {/* Recent Orders (กินพื้นที่ 3/7) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <p className="text-sm text-muted-foreground">
              รายการขายล่าสุด 5 รายการ
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {order.customer ? order.customer.name : "ลูกค้าทั่วไป"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "HH:mm น.")} •{" "}
                      {order.payment_type}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    +฿{Number(order.total_amount).toLocaleString()}
                  </div>
                </div>
              ))}

              {data.recentOrders.length === 0 && (
                <p className="text-center text-slate-400 py-4">
                  ยังไม่มีรายการขาย
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
