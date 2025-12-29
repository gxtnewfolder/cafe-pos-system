"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { downloadExcel } from "@/lib/export-excel";
import { downloadPDF } from "@/lib/export-pdf";

export interface ReportData {
  summary: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    dateFrom: string;
    dateTo: string;
  };
  topProducts: { id: string; name: string; quantity: number; revenue: number }[];
  chartData: { date: string; sales: number; orders: number }[];
  paymentBreakdown: Record<string, number>;
  orders: {
    id: string;
    createdAt: string;
    customer: string;
    items: string;
    total: number;
    payment: string;
    status: string;
  }[];
}

// Helper to format date as YYYY-MM-DD
const formatDateInput = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export default function ReportsPage() {
  const [period, setPeriod] = useState("weekly"); // Default to 7 days
  
  // Default dates: yesterday to today
  const [startDate, setStartDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 7);
    return formatDateInput(yesterday);
  });
  const [endDate, setEndDate] = useState(() => {
    return formatDateInput(new Date());
  });
  
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Initial skeleton
  const [isFetching, setIsFetching] = useState(false); // Subtle refetch indicator
  const { t, i18n } = useTranslation();

  const dateLocale = i18n.language === 'th' ? 'th-TH' : 'en-US';

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchReport = async () => {
      // Only show full skeleton on initial load (when data is null)
      if (!data) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }
      try {
        let url = `/api/reports/sales?period=${period}`;
        if (startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        const res = await fetch(url, { signal });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json = await res.json();
        if (!signal.aborted) {
          setData(json);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error("Failed to fetch report:", error);
      toast.error(t("reports.loadError"));
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    };
    fetchReport();

    return () => {
      controller.abort();
    };
  }, [period, startDate, endDate]);

  const handleExportExcel = () => {
    if (!data) return;
    try {
      downloadExcel(data.orders, data.summary, data.topProducts);
      toast.success(t("success"));
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error(t("error"));
    }
  };

  const handleExportPDF = () => {
    if (!data) return;
    try {
      downloadPDF(data);
      toast.success(t("success"));
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error(t("error"));
    }
  };

  // Skeleton Loading
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-slate-100 rounded mt-2 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="h-4 w-20 bg-slate-100 rounded animate-pulse mb-2" />
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="h-[300px] bg-slate-100 rounded-lg animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`h-screen max-h-screen p-4 md:p-6 flex flex-col gap-4 overflow-auto transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
      {/* Loading indicator */}
      {isFetching && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-lg">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {t("loading")}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            {t("reports.title")}
          </h1>
          <p className="text-slate-500 text-sm">
            {new Date(data.summary.dateFrom).toLocaleDateString(dateLocale, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            -{" "}
            {new Date(data.summary.dateTo).toLocaleDateString(dateLocale, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-2"
          >
            <FileText className="w-4 h-4 text-red-500" />
            PDF
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm shrink-0">
        <div className="flex gap-1">
          {[
            { value: "daily", labelKey: "reports.period.daily", days: 0 },
            { value: "weekly", labelKey: "reports.period.weekly", days: 7 },
            { value: "monthly", labelKey: "reports.period.monthly", days: 30 },
          ].map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setPeriod(p.value);
                // Set date range based on period
                const today = new Date();
                const from = new Date();
                from.setDate(today.getDate() - p.days);
                setStartDate(formatDateInput(from));
                setEndDate(formatDateInput(today));
              }}
              className={period === p.value ? "bg-slate-800 h-8" : "h-8"}
            >
              {t(p.labelKey)}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Calendar className="w-4 h-4 text-slate-400 hidden md:block" />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-32 text-sm h-8"
          />
          <span className="text-slate-400">-</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-32 text-sm h-8"
          />
        </div>
      </div>

      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
        {/* Total Sales */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-emerald-900/70">{t("reports.totalSales")}</CardTitle>
            <div className="p-1.5 rounded-md bg-emerald-100/50 text-emerald-700">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold text-emerald-700">
              ฿{data.summary.totalSales.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-blue-900/70">{t("reports.totalOrders")}</CardTitle>
            <div className="p-1.5 rounded-md bg-blue-100/50 text-blue-700">
              <ShoppingBag className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold text-blue-700">{data.summary.totalOrders}</div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-violet-100 bg-gradient-to-br from-white to-violet-50/30">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-violet-900/70">{t("reports.avgOrderValue")}</CardTitle>
            <div className="p-1.5 rounded-md bg-violet-100/50 text-violet-700">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold text-violet-700">
              ฿{data.summary.averageOrderValue.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        {/* Top Product */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-orange-100 bg-gradient-to-br from-white to-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-orange-900/70">{t("reports.topProduct")}</CardTitle>
            <div className="p-1.5 rounded-md bg-orange-100/50 text-orange-700">
              <Package className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-sm font-bold text-orange-700 truncate">
              {data.topProducts[0]?.name || "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sales Chart */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-base font-semibold text-slate-800">
                {t("reports.salesChart")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              {data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.chartData}>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString(dateLocale, {
                          day: "numeric",
                          month: "short",
                        })
                      }
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                      tickFormatter={(value) => 
                        value >= 1000 
                          ? `฿${(value / 1000).toFixed(0)}k` 
                          : `฿${value}`
                      }
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '13px'
                      }}
                      formatter={(value) => [`฿${Number(value).toLocaleString()}`, t("dashboard.sales")]}
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString(dateLocale, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })
                      }
                    />
                    <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-slate-400">
                  {t("reports.noDataInPeriod")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="shadow-smooth border-white/50 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 flex items-center gap-2 text-base">
                <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                {t("reports.top5Products")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-3">
                {data.topProducts.length > 0 ? (
                  data.topProducts.map((product, index) => {
                    // Colors for Ranking
                    let rankColor = "bg-slate-100 text-slate-600";
                    let rankIcon: string | null = null;
                    if (index === 0) { rankColor = "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-100 ring-offset-1"; rankIcon = "🥇"; }
                    if (index === 1) { rankColor = "bg-slate-200 text-slate-600"; rankIcon = "🥈"; }
                    if (index === 2) { rankColor = "bg-orange-100 text-orange-700"; rankIcon = "🥉"; }

                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between text-sm p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${rankColor}`}>
                            {rankIcon || index + 1}
                          </span>
                          <div>
                            <span className="text-slate-700 font-medium">{product.name}</span>
                            <p className="text-xs text-slate-400">{product.quantity} {t("reports.units")}</p>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs">
                          ฿{product.revenue.toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-slate-400 text-sm">
                    {t("reports.noData")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
      {/* Orders Table */}
      <Card className="shadow-smooth border-0 bg-white overflow-hidden rounded-xl lg:col-span-3 gap-0 py-0">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <CardTitle className="text-base text-slate-700 font-bold flex items-center gap-2">
              <div className="w-2 h-6 bg-slate-800 rounded-full"></div>
              {t("reports.orderDetails")}
            </CardTitle>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {data.orders.length} {t("items")}
            </Badge>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-100">
                  <TableRow className="hover:bg-slate-50/50">
                    <TableHead className="w-[100px] font-semibold text-slate-700">{t("orderId")}</TableHead>
                    <TableHead className="font-semibold text-slate-700">{t("datetime")}</TableHead>
                    <TableHead className="font-semibold text-slate-700">{t("customer")}</TableHead>
                    <TableHead className="font-semibold text-slate-700">{t("items")}</TableHead>
                    <TableHead className="font-semibold text-slate-700">{t("total")}</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">{t("payment")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.orders.length > 0 ? (
                    data.orders.slice(0, 8).map((order) => (
                      <TableRow key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-slate-700">
                              {new Date(order.createdAt).toLocaleDateString(dateLocale, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {new Date(order.createdAt).toLocaleTimeString(dateLocale, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.customer !== "Guest" ? (
                            <span className="font-medium text-sm text-slate-700">{order.customer}</span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">- {t("guest")} -</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 max-w-[180px] truncate">
                          {order.items}
                        </TableCell>
                        <TableCell className="font-bold text-slate-800">
                          ฿{order.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`font-normal text-[10px] capitalize px-2 py-0.5 border ${
                              order.payment === "QR"
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {order.payment}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-slate-400"
                      >
                        {t("reports.noOrders")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {data.orders.length > 8 && (
                <div className="p-3 text-center text-xs text-slate-500 border-t bg-slate-50">
                  {t("reports.showingCount", { count: 8, total: data.orders.length })} -{" "}
                  <button 
                    type="button"
                    className="text-blue-600 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                    onClick={handleExportExcel}
                    aria-label="Export all orders to Excel"
                  >
                    {t("reports.viewAllExcel")}
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
