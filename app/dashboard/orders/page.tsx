"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

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
    const filtered = orders.filter((order) => 
      order.id.toLowerCase().includes(lowerSearch) ||
      order.customer?.name?.toLowerCase().includes(lowerSearch) ||
      order.customer?.phone?.includes(lowerSearch)
    );
    setFilteredOrders(filtered);
  }, [search, orders]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ประวัติการขาย</h2>
          <p className="text-slate-500 text-sm mt-1">ดูรายการขายทั้งหมด</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ค้นหา Order ID, ชื่อลูกค้า หรือเบอร์โทร..."
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
           <span>สถานะ:</span>
           <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">ทั้งหมด</Badge>
           <Badge variant="secondary" className="bg-transparent text-slate-400 font-normal hover:bg-slate-50">วันนี้</Badge>
        </div>
      </div>

      <Card className="shadow-smooth border-0 bg-white overflow-hidden rounded-xl">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <CardTitle className="text-base text-slate-700 font-bold flex items-center gap-2">
            <div className="w-2 h-6 bg-slate-800 rounded-full"></div>
            รายการออเดอร์ล่าสุด
          </CardTitle>
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            {filteredOrders.length} รายการ
          </Badge>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow className="hover:bg-slate-50/50">
                <TableHead className="w-[120px] font-semibold text-slate-700">Order ID</TableHead>
                <TableHead className="font-semibold text-slate-700">Date/Time</TableHead>
                <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                <TableHead className="font-semibold text-slate-700">Items</TableHead>
                <TableHead className="font-semibold text-slate-700">Total</TableHead>
                <TableHead className="font-semibold text-slate-700">Payment</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 border-0">
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 w-full">
                      <Search className="w-10 h-10 mb-2 opacity-20" />
                      <span>ไม่พบข้อมูลออเดอร์ที่ค้นหา</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                      #{order.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs md:text-sm">
                        <span className="font-medium text-slate-700">{format(new Date(order.createdAt), "d MMM yyyy", { locale: th })}</span>
                        <span className="text-slate-400 text-[10px]">{format(new Date(order.createdAt), "HH:mm น.", { locale: th })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.customer ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-slate-700">{order.customer.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-tight">{order.customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">- Guest -</span>
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
                            +{order.items.length - 2} items more...
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
      </Card>
    </div>
  );
}
