"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  User,
  Gift,
  ShoppingBag,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Customer {
  id: string;
  phone: string;
  name: string | null;
  points: number;
  total_spent: number;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function MembersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPoints, setFormPoints] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (search?: string) => {
    try {
      const url = search 
        ? `/api/customers?search=${encodeURIComponent(search)}`
        : "/api/customers";
      const res = await fetch(url);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchCustomers(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const openAddDialog = () => {
    setEditingCustomer(null);
    setFormName("");
    setFormPhone("");
    setFormPoints(0);
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormName(customer.name || "");
    setFormPhone(customer.phone);
    setFormPoints(customer.points);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formPhone) {
      toast.error("กรุณากรอกเบอร์โทร");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCustomer) {
        // Update
        const res = await fetch("/api/customers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCustomer.id,
            name: formName,
            phone: formPhone,
            points: formPoints,
          }),
        });

        if (!res.ok) throw new Error("Update failed");
        toast.success("อัพเดทข้อมูลเรียบร้อย");
      } else {
        // Create
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            phone: formPhone,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Create failed");
        }
        toast.success("เพิ่มสมาชิกเรียบร้อย");
      }

      setIsDialogOpen(false);
      fetchCustomers(searchQuery);
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/customers?id=${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("ลบสมาชิกเรียบร้อย");
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchCustomers(searchQuery);
    } catch (error) {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Users className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">Members</h1>
            <p className="text-sm text-slate-500">จัดการข้อมูลสมาชิก ({customers.length} คน)</p>
          </div>
        </div>

        <Button onClick={openAddDialog} className="bg-slate-800 hover:bg-slate-900">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มสมาชิก
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="ค้นหาด้วยชื่อหรือเบอร์โทร..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Table */}
      <Card className="shadow-smooth border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">ชื่อ</TableHead>
                <TableHead className="font-semibold">เบอร์โทร</TableHead>
                <TableHead className="font-semibold text-center">แต้ม</TableHead>
                <TableHead className="font-semibold text-center">ออเดอร์</TableHead>
                <TableHead className="font-semibold text-right">ยอดสะสม</TableHead>
                <TableHead className="font-semibold text-center w-[100px]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                    ไม่พบข้อมูลสมาชิก
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="font-medium text-slate-800">
                          {customer.name || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                        <Gift className="w-3 h-3 mr-1" />
                        {customer.points}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-600">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {customer._count?.orders || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ฿{Number(customer.total_spent).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-800"
                          onClick={() => openEditDialog(customer)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setDeleteTarget(customer);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "แก้ไขข้อมูลสมาชิก" : "เพิ่มสมาชิกใหม่"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อ</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="ชื่อลูกค้า"
              />
            </div>

            <div className="space-y-2">
              <Label>เบอร์โทร *</Label>
              <Input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="0812345678"
                disabled={!!editingCustomer}
              />
            </div>

            {editingCustomer && (
              <div className="space-y-2">
                <Label>แต้มสะสม</Label>
                <Input
                  type="number"
                  value={formPoints}
                  onChange={(e) => setFormPoints(Number(e.target.value))}
                  min={0}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-slate-800 hover:bg-slate-900"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCustomer ? "บันทึก" : "เพิ่มสมาชิก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบข้อมูลของ "{deleteTarget?.name || deleteTarget?.phone}" หรือไม่? 
              การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
