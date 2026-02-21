"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { th, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Order {
  id: string;
  createdAt: string;
  total_amount: string;
  payment_type: string;
  status: string;
  customer?: {
    name: string;
    phone: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: string;
  }[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState<"ALL" | "TODAY">("ALL");
  const { t, i18n } = useTranslation();
  
  const dateLocale = i18n.language === 'th' ? th : enUS;

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setFilteredOrders(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");

    const filtered = orders.filter((order) => {
      // 1. Search Filter
      const matchSearch = order.id.toLowerCase().includes(lowerSearch) ||
        order.customer?.name?.toLowerCase().includes(lowerSearch) ||
        order.customer?.phone?.includes(lowerSearch);
      
      if (!matchSearch) return false;

      // 2. Time Filter
      if (timeRange === "TODAY") {
        const orderDate = format(new Date(order.createdAt), "yyyy-MM-dd");
        return orderDate === todayStr;
      }

      return true;
    });

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to page 1 on search or filter change
  }, [search, orders, timeRange]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  useEffect(() => {
    const calculateItems = () => {
      const vh = window.innerHeight;
      // Adjusted reserved space: Header (80) + Filter (80) + CardHeader (60) + Pagination (60) + Padding (40) = ~320
      // Reducing buffer to ensure we fill space
      const availableHeight = vh - 260; 
      const rowHeight = 60; 
      const items = Math.floor(availableHeight / rowHeight);
      setItemsPerPage(Math.max(5, items));
    }
    calculateItems();
    window.addEventListener('resize', calculateItems);
    return () => window.removeEventListener('resize', calculateItems);
  }, []);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
     (currentPage - 1) * itemsPerPage,
     currentPage * itemsPerPage
  );

  if (isLoading) return (
    <div className="h-screen max-h-screen p-4 md:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
           <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2" />
           <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm shrink-0">
        <div className="flex-1 w-full h-10 bg-slate-100 rounded-lg animate-pulse" />
        <div className="w-48 h-10 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      <Card className="shadow-smooth border-slate-100 flex-1 min-h-0 flex flex-col">
        <div className="overflow-hidden border border-slate-100 rounded-xl h-full flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table>
               <TableHeader className="bg-slate-50 sticky top-0 z-10">
                 <TableRow>
                   {['w-[120px]', 'w-32', 'w-28', 'w-40', 'w-24', 'w-20', 'w-24'].map((w, i) => (
                      <TableHead key={i}><div className={`h-4 ${w} bg-slate-200 rounded animate-pulse`} /></TableHead>
                   ))}
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {Array.from({ length: 10 }).map((_, i) => (
                   <TableRow key={i}>
                     <TableCell><div className="h-4 w-20 bg-slate-100 rounded animate-pulse" /></TableCell>
                     <TableCell>
                        <div className="space-y-1.5">
                          <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                          <div className="h-3 w-20 bg-slate-50 rounded animate-pulse" />
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="space-y-1.5">
                          <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                          <div className="h-3 w-20 bg-slate-50 rounded animate-pulse" />
                        </div>
                     </TableCell>
                     <TableCell><div className="h-6 w-32 bg-slate-100 rounded-lg animate-pulse" /></TableCell>
                     <TableCell><div className="h-4 w-20 bg-slate-100 rounded animate-pulse" /></TableCell>
                     <TableCell><div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" /></TableCell>
                     <TableCell className="text-center"><div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse mx-auto" /></TableCell>
                   </TableRow>
                 ))}
               </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="h-screen max-h-screen p-4 md:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t("orders.title")}</h2>
          <p className="text-slate-500 text-sm mt-1">{t("orders.subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm shrink-0">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("orders.searchPlaceholder")}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
           <span>{t("orders.statusFilter")}:</span>
           <Badge 
             variant={timeRange === "ALL" ? "default" : "outline"} 
             className={`cursor-pointer transition-all ${
               timeRange === "ALL" 
                 ? "bg-slate-800 text-white border-slate-800 shadow-sm" 
                 : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
             }`}
             onClick={() => setTimeRange("ALL")}
           >
             {t("orders.filterAll")}
           </Badge>
           <Badge 
             variant={timeRange === "TODAY" ? "secondary" : "outline"} 
             className={`cursor-pointer transition-all ${
               timeRange === "TODAY" 
                 ? "bg-blue-100 text-blue-700 border-blue-200 shadow-sm font-bold" 
                 : "bg-transparent text-slate-400 font-normal hover:bg-slate-50 border-slate-200"
             }`}
             onClick={() => setTimeRange("TODAY")}
           >
             {t("orders.filterToday")}
           </Badge>
        </div>
      </div>

      <Card className="shadow-smooth border-0 bg-white overflow-hidden rounded-xl gap-0 flex flex-col min-h-0 flex-1 pt-4 pb-2">
        <div className="p-4 pt-0 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <CardTitle className="text-base text-slate-700 font-bold flex items-center gap-2">
            <div className="w-2 h-6 bg-slate-800 rounded-full"></div>
            {t("orders.recentOrdersList")}
          </CardTitle>
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            {filteredOrders.length} {t("items")}
          </Badge>
        </div>
        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow className="hover:bg-slate-50/50">
                <TableHead className="w-[120px] font-semibold text-slate-700">{t("orderId")}</TableHead>
                <TableHead className="font-semibold text-slate-700">{t("datetime")}</TableHead>
                <TableHead className="font-semibold text-slate-700">{t("customer")}</TableHead>
                <TableHead className="font-semibold text-slate-700">{t("items")}</TableHead>
                <TableHead className="font-semibold text-slate-700">{t("total")}</TableHead>
                <TableHead className="font-semibold text-slate-700">{t("payment")}</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7} className="h-48 border-0">
                     <div className="flex flex-col items-center justify-center h-full text-slate-400 w-full">
                       <Search className="w-10 h-10 mb-2 opacity-20" />
                       <span>{t("orders.noOrders")}</span>
                     </div>
                   </TableCell>
                 </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                      #{order.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs md:text-sm">
                        <span className="font-medium text-slate-700">{format(new Date(order.createdAt), "d MMM yyyy", { locale: dateLocale })}</span>
                        <span className="text-slate-400 text-[10px]">{format(new Date(order.createdAt), "HH:mm", { locale: dateLocale })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.customer ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-slate-700">{order.customer.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-tight">{order.customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">- {t("guest")} -</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-slate-600 text-xs">
                             <span className="font-bold bg-slate-100 text-slate-600 w-5 h-5 flex items-center justify-center rounded-sm text-[10px]">
                                {item.quantity}
                             </span> 
                             <span className="truncate max-w-[120px]">{item.name}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-[10px] text-slate-400 pl-7 font-medium">
                            +{order.items.length - 2} {t("orders.moreItems")}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-800">
                      ฿{Number(order.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-normal text-[10px] capitalize px-2 py-0.5 border ${
                         order.payment_type === 'QR' 
                           ? 'bg-blue-50 text-blue-600 border-blue-100' 
                           : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {order.payment_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        order.status === 'PAID' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {order.status === 'PAID' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
                        {order.status}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination Controls */}
        {filteredOrders.length > 0 && (
          <div className="py-4 border-t border-slate-100 flex justify-center bg-white shrink-0 mt-auto">
             <Pagination>
                <PaginationContent>
                   <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        href="#"
                      />
                   </PaginationItem>
                   
                   {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                         pNum = currentPage - 2 + i;
                         if (pNum > totalPages) pNum = totalPages - (4 - i);
                      }
                      if (pNum <= 0) return null;

                      return (
                        <PaginationItem key={pNum}>
                           <PaginationLink 
                              isActive={currentPage === pNum} 
                              onClick={() => setCurrentPage(pNum)}
                              href="#"
                           >
                              {pNum}
                           </PaginationLink>
                        </PaginationItem>
                      )
                   })}

                   <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        href="#"
                      />
                   </PaginationItem>
                </PaginationContent>
             </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}
