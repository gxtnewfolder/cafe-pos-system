"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Type Definition
interface DashboardData {
  stats: {
    totalSales: number;
    totalOrders: number;
  };
  topProducts: { name: string; qty: number }[];
  salesChartData: { date: string; sales: number }[];
  lowStockItems: { id: string; name: string; stock: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (isLoading) return <div className="p-8">Loading Dashboard...</div>;
  if (!data || !data.stats) {
    console.log("Dashboard Data Error:", data); // ดู Log ใน Console Browser ว่า API ส่งอะไรมา
    return (
      <div className="p-8 text-red-500">
        ไม่สามารถโหลดข้อมูลได้ (กรุณาเช็ค Console)
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">
          Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/products">
            <Button variant="outline" className="gap-2">
              <Package className="w-4 h-4" /> จัดการสินค้า
            </Button>
          </Link>
          <Link href="/">
            <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4" /> กลับหน้าขาย (POS)
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดขายวันนี้</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{data.stats.totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+จากเมื่อวาน (Demo)</p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนออเดอร์</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">บิลวันนี้</p>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card
          className={
            data.lowStockItems.length > 0 ? "border-red-200 bg-red-50" : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              สินค้าใกล้หมด
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {data.lowStockItems.length}
            </div>
            <p className="text-xs text-red-600/80">รายการที่ต้องเติมสต็อก</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 2. Chart (กินพื้นที่ 4 ส่วน) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>ภาพรวมรายได้ (7 วันล่าสุด)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `฿${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="#0f172a"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Top Products & Low Stock List (กินพื้นที่ 3 ส่วน) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>สินค้าขายดี & ต้องเติม</CardTitle>
            <CardDescription>สรุปรายการสำคัญวันนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Top Products */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> ขายดีวันนี้
                </h4>
                <div className="space-y-2">
                  {data.topProducts.length === 0 && (
                    <p className="text-sm text-slate-400">ยังไม่มีรายการขาย</p>
                  )}
                  {data.topProducts.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-600">
                        {i + 1}. {p.name}
                      </span>
                      <span className="font-bold">{p.qty} แก้ว</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              {/* Low Stock */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" /> สต็อกวิกฤต (&lt;10)
                </h4>
                <div className="space-y-2">
                  {data.lowStockItems.length === 0 && (
                    <p className="text-sm text-green-600">
                      สต็อกปลอดภัยทุกรายการ
                    </p>
                  )}
                  {data.lowStockItems.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-sm bg-red-50 p-2 rounded border border-red-100"
                    >
                      <span className="text-red-700">{p.name}</span>
                      <span className="font-bold text-red-700">
                        เหลือ {p.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
