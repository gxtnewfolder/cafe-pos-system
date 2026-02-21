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
  Check,
  MessageSquareQuote,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AISummary } from "../../components/AISummary";
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
import { useTranslation } from "react-i18next";

// Type Definition
interface DashboardData {
  stats: {
    totalSales: number;
    totalOrders: number;
    salesChangePercentage: number;
  };
  topProducts: { name: string; qty: number }[];
  salesChartData: { date: string; sales: number }[];
  lowStockItems: { id: string; name: string; stock: number }[];
  paymentBreakdown: { QR: number; CASH: number };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useTranslation();

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const newData = await res.json();
      setData(newData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(false); // Don't show full page loader, just refresh
  };

  if (isLoading) return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
           <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2" />
           <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex flex-col shadow-sm border-slate-100">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
               <div className="h-8 w-8 bg-slate-100 rounded-lg animate-pulse" />
             </CardHeader>
             <CardContent>
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
             </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
         <Card className="lg:col-span-5 shadow-smooth border-slate-100">
            <CardHeader>
               <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
               <div className="h-[300px] w-full bg-slate-50 rounded-xl animate-pulse" />
            </CardContent>
         </Card>
         <Card className="lg:col-span-2 shadow-smooth border-slate-100">
            <CardHeader>
               <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                     <div key={j} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 bg-slate-100 rounded-lg animate-pulse" />
                           <div className="space-y-1">
                              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                              <div className="h-3 w-16 bg-slate-50 rounded animate-pulse" />
                           </div>
                        </div>
                        <div className="h-4 w-12 bg-slate-100 rounded animate-pulse" />
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
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
          <h3 className="text-lg font-bold text-slate-800 mb-2">{t("dashboard.loadError")}</h3>
          <p className="text-slate-500">{t("dashboard.checkConsole")}</p>
          <Button onClick={() => loadData(true)} className="mt-4 bg-slate-800 text-white">
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  // Calculate percentage display
  const salesChange = data.stats.salesChangePercentage ?? 0;
  const isPositive = salesChange >= 0;
  const percentageDisplay = `${isPositive ? '+' : ''}${salesChange.toFixed(1)}%`;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            {t("dashboard.overview")}
          </h2>
          <p className="text-slate-500 mt-1">{t("dashboard.summaryToday")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-slate-500 hover:text-slate-800 transition-all border-slate-200"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? t("updating") : t("refresh")}
        </Button>
      </div>

      {/* AI Summary Section */}
      <AISummary />

      {/* 1. Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-900/70">{t("dashboard.todaySales")}</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100/50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              ฿{data.stats.totalSales.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
               {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
               <span>{percentageDisplay} {t("dashboard.comparedToYesterday")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-blue-900/70">{t("dashboard.totalOrders")}</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100/50 text-blue-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{data.stats.totalOrders}</div>
            <p className="text-xs text-blue-500 mt-1">{t("dashboard.paidOrdersToday")}</p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-amber-900/70">{t("dashboard.avgOrderValue")}</CardTitle>
            <div className="p-2 rounded-lg bg-amber-100/50 text-amber-700">
              <Target className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              ฿{data.stats.totalOrders > 0 ? Math.round(data.stats.totalSales / data.stats.totalOrders).toLocaleString() : 0}
            </div>
            <p className="text-xs text-amber-500 mt-1">{t("dashboard.avgPerOrder")}</p>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card
          className={`flex flex-col shadow-sm hover:shadow-md transition-shadow border-0 ring-1 ${
            data.lowStockItems.length > 0 
              ? "bg-gradient-to-br from-orange-50/50 to-red-50/50 ring-red-100" 
              : "bg-white ring-slate-100"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-semibold ${data.lowStockItems.length > 0 ? 'text-red-800' : 'text-slate-600'}`}>
              {t("dashboard.lowStockAlert")}
            </CardTitle>
            <div className={`p-2 rounded-lg ${
                data.lowStockItems.length > 0 ? 'bg-red-100/50 text-red-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.lowStockItems.length > 0 ? 'text-red-700' : 'text-slate-700'}`}>
              {data.lowStockItems.length}
            </div>
             <p className={`text-xs mt-1 ${data.lowStockItems.length > 0 ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
              {data.lowStockItems.length > 0 ? t("dashboard.needRestock") : t("dashboard.normalStatus")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 1.5 Payment Breakdown */}
      {(data.paymentBreakdown?.QR > 0 || data.paymentBreakdown?.CASH > 0) && (
        <Card className="shadow-sm border-slate-100 bg-white">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <div className="w-1 h-4 bg-slate-400 rounded-full"></div>
              {t("dashboard.paymentBreakdown")}
              <span className="text-xs font-normal text-slate-400 ml-1">— {t("dashboard.ordersToday")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="grid grid-cols-2 gap-4">
              {/* QR */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                    {t("dashboard.qrPayments")}
                  </span>
                  <span className="text-sm font-bold text-blue-700">{data.paymentBreakdown?.QR ?? 0}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                    style={{
                      width: `${data.stats.totalOrders > 0 ? ((data.paymentBreakdown?.QR ?? 0) / data.stats.totalOrders) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
              {/* CASH */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    {t("dashboard.cashPayments")}
                  </span>
                  <span className="text-sm font-bold text-emerald-700">{data.paymentBreakdown?.CASH ?? 0}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{
                      width: `${data.stats.totalOrders > 0 ? ((data.paymentBreakdown?.CASH ?? 0) / data.stats.totalOrders) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-7">
        {/* 2. Chart (กินพื้นที่ 4 ส่วนใน XL, เต็มจอใน MD/LG) */}
        <Card className="col-span-1 xl:col-span-4 shadow-smooth border-white/50 bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 flex items-center gap-2 text-base">
              <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
              {t("dashboard.revenueChart")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `฿${value}`}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-100 shadow-xl text-sm">
                            <p className="font-semibold text-slate-700 mb-1">{label}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-slate-500">{t("dashboard.sales")}:</span>
                              <span className="font-bold text-blue-600">
                                ฿{Number(payload[0].value).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="url(#barGradient)"
                    radius={[8, 8, 4, 4]}
                    barSize={40}
                    activeBar={false} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Top Products & Low Stock List (กินพื้นที่ 3 ส่วนใน XL, เต็มจอใน MD/LG) */}
        <Card className="col-span-1 xl:col-span-3 shadow-smooth border-white/50 bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 flex items-center gap-2 text-base">
               <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
               {t("dashboard.topProductsAndRestock")}
            </CardTitle>
            <CardDescription className="text-xs">{t("dashboard.importantItemsToday")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Top Products */}
              <div>
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg">
                  <div className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  {t("dashboard.top3Today")}
                </h4>
                <div className="space-y-3">
                  {data.topProducts.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">{t("dashboard.noSalesYet")}</p>
                  )}
                  {data.topProducts.map((p, i) => {
                     // Colors for Ranking
                     let rankColor = "bg-slate-100 text-slate-600";
                     let rankIcon = null;
                     if (i === 0) { rankColor = "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-100 ring-offset-1"; rankIcon = "🥇"; }
                     if (i === 1) { rankColor = "bg-slate-200 text-slate-600"; rankIcon = "🥈"; }
                     if (i === 2) { rankColor = "bg-orange-100 text-orange-700"; rankIcon = "🥉"; }

                     return (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${rankColor}`}>
                            {rankIcon || i + 1}
                          </span>
                          <span className="text-slate-700 font-medium">{p.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-md text-xs">{p.qty} {t("dashboard.cups")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

              {/* Low Stock */}
              <div>
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded-lg border border-red-100">
                  <div className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  {t("dashboard.criticalStock")}
                </h4>
                <div className="space-y-2">
                  {data.lowStockItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 text-emerald-600 text-sm bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 border-dashed">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-1">
                        <Check className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-semibold">{t("dashboard.allStockSafe")}</span>
                    </div>
                  )}
                  {data.lowStockItems.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <span className="text-slate-700 font-medium group-hover:text-red-600 transition-colors">{p.name}</span>
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs border border-red-100">
                        {t("dashboard.remaining")} {p.stock}
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
