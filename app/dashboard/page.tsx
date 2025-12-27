"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  RefreshCw,
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

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading Dashboard...</p>
      </div>
    </div>
  );
  if (!data || !data.stats) {
    console.log("Dashboard Data Error:", data);
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-smooth p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">ไม่สามารถโหลดข้อมูลได้</h3>
          <p className="text-slate-500">กรุณาเช็ค Console หรือลองอีกครั้ง</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            ภาพรวม
          </h2>
          <p className="text-slate-500 mt-1">สรุปยอดขายและสินค้าวันนี้</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-slate-500"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-4 h-4" />
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* 1. Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <Card className="shadow-smooth hover-lift border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">ยอดขายวันนี้</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{data.stats.totalSales.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <p className="text-xs text-green-600">+12% จากเมื่อวาน</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="shadow-smooth hover-lift border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">จำนวนออเดอร์</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{data.stats.totalOrders}</div>
            <p className="text-xs text-slate-400 mt-1">บิลวันนี้</p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="shadow-smooth hover-lift border-0 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">ยอดเฉลี่ย/บิล</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ฿{data.stats.totalOrders > 0 ? Math.round(data.stats.totalSales / data.stats.totalOrders).toLocaleString() : 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Average Order Value</p>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card
          className={`shadow-smooth hover-lift border-0 ${
            data.lowStockItems.length > 0 ? "bg-gradient-to-br from-red-50 to-orange-50" : "bg-white"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${data.lowStockItems.length > 0 ? 'text-red-700' : 'text-slate-600'}`}>
              สินค้าใกล้หมด
            </CardTitle>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.lowStockItems.length > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
              <AlertTriangle className={`h-5 w-5 ${data.lowStockItems.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.lowStockItems.length > 0 ? 'text-red-700' : 'text-slate-800'}`}>
              {data.lowStockItems.length}
            </div>
            <p className={`text-xs mt-1 ${data.lowStockItems.length > 0 ? 'text-red-600/80' : 'text-slate-400'}`}>รายการที่ต้องเติมสต็อก</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 2. Chart (กินพื้นที่ 4 ส่วน) */}
        <Card className="col-span-4 shadow-smooth border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800">ภาพรวมรายได้ (7 วันล่าสุด)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `฿${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      padding: "12px 16px",
                    }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="#1e293b"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Top Products & Low Stock List (กินพื้นที่ 3 ส่วน) */}
        <Card className="col-span-3 shadow-smooth border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800">สินค้าขายดี & ต้องเติม</CardTitle>
            <CardDescription>สรุปรายการสำคัญวันนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Top Products */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-700">
                  <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  ขายดีวันนี้
                </h4>
                <div className="space-y-2">
                  {data.topProducts.length === 0 && (
                    <p className="text-sm text-slate-400">ยังไม่มีรายการขาย</p>
                  )}
                  {data.topProducts.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {i + 1}
                        </span>
                        <span className="text-slate-700 font-medium">{p.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{p.qty} แก้ว</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              {/* Low Stock */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-600">
                  <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  สต็อกวิกฤต (&lt;10)
                </h4>
                <div className="space-y-2">
                  {data.lowStockItems.length === 0 && (
                    <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        ✓
                      </div>
                      สต็อกปลอดภัยทุกรายการ
                    </div>
                  )}
                  {data.lowStockItems.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-sm bg-red-50 p-3 rounded-xl border border-red-100"
                    >
                      <span className="text-red-700 font-medium">{p.name}</span>
                      <span className="font-bold text-red-700 bg-red-100 px-2 py-1 rounded-lg text-xs">
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
