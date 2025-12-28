"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function MembersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const calculateItems = () => {
      const vh = window.innerHeight;
      const availableHeight = vh - 260; 
      const rowHeight = 60; 
      const items = Math.floor(availableHeight / rowHeight);
      setItemsPerPage(Math.max(5, items));
    }
    calculateItems();
    window.addEventListener('resize', calculateItems);
    return () => window.removeEventListener('resize', calculateItems);
  }, []);

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const paginatedCustomers = customers.slice(
     (currentPage - 1) * itemsPerPage,
     currentPage * itemsPerPage
  );
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

  // Search timeout ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      fetchCustomers(value);
    }, 300);
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

  if (isLoading) return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
       <div className="h-24 w-full bg-slate-100 rounded-2xl animate-pulse" />
       
       <div className="max-w-md">
         <div className="h-11 w-full bg-slate-100 rounded-xl animate-pulse" />
       </div>

       <Card className="shadow-smooth border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TableHead key={i}>
                    <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                       <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                       <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                       <div className="h-4 w-8 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse ml-auto" /></TableCell>
                  <TableCell>
                     <div className="flex justify-center gap-2">
                        <div className="h-8 w-8 bg-slate-100 rounded-lg animate-pulse" />
                        <div className="h-8 w-8 bg-slate-100 rounded-lg animate-pulse" />
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="h-screen max-h-screen p-4 md:p-6 lg:p-8 flex flex-col gap-4">
      {/* Header with Gradient */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-sky-100/50 to-blue-50/50 p-6 rounded-2xl border border-sky-100 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 -mt-4 -mr-4 w-24 h-24 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-sky-100">
            <Users className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">สมาชิก (Members)</h1>
            <p className="text-sm text-slate-500 mt-1">จัดการข้อมูลสมาชิกและแต้มสะสมทั้งหมด ({customers.length} คน)</p>
          </div>
        </div>

        <Button 
          onClick={openAddDialog} 
          className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-md border-0 relative z-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มสมาชิกใหม่
        </Button>
      </div>

      {/* Search Bar - Floating Style */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <Input
          placeholder="ค้นหาด้วยชื่อ หรือเบอร์โทรศัพท์..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-11 bg-white border-slate-200 focus:border-sky-300 focus:ring-sky-100 rounded-xl transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <Card className="shadow-smooth border-0 bg-white overflow-hidden rounded-xl gap-0 flex flex-col min-h-0 flex-1 pt-4 pb-2">
        <div className="flex-1 overflow-auto p-0 px-1">
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
                paginatedCustomers.map((customer) => (
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
                      <Badge variant="secondary" className="bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm px-3 py-1">
                        <Gift className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                        <span className="font-semibold">{customer.points.toLocaleString()}</span>
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

      {/* Pagination Controls */}
      {customers.length > 0 && (
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
