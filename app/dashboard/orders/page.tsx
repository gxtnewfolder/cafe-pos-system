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

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="ค้นหา Order ID หรือ ชื่อลูกค้า..."
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-smooth border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-800">รายการออเดอร์ทั้งหมด ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>วัน-เวลา</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>รายการสินค้า</TableHead>
                <TableHead>ยอดรวม</TableHead>
                <TableHead>การชำระเงิน</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-slate-500">
                    ไม่พบข้อมูลออเดอร์
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "d MMM yyyy HH:mm", { locale: th })}
                    </TableCell>
                    <TableCell>
                      {order.customer ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{order.customer.name}</span>
                          <span className="text-xs text-slate-500">{order.customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx}>
                             {item.quantity}x {item.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-xs text-slate-400">
                            +{order.items.length - 2} รายการอื่นๆ
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      ฿{Number(order.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.payment_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={order.status === 'PAID' ? 'bg-green-600' : 'bg-slate-500'}>
                        {order.status}
                      </Badge>
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
