'use client';

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Product } from "@/app/generated/prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "", name: "", code: "", price: "", category: "COFFEE", image_url: ""
  });

  // 1. Fetch Products
  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  // 2. Handle Submit (Create/Update)
  const handleSubmit = async () => {
    try {
        const method = isEditing ? 'PATCH' : 'POST';
        const url = isEditing ? `/api/products/${formData.id}` : '/api/products';
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!res.ok) throw new Error();
        
        toast.success(isEditing ? "แก้ไขสำเร็จ" : "เพิ่มสินค้าสำเร็จ");
        setIsOpen(false);
        fetchProducts(); // Refresh list
    } catch (error) {
        toast.error("เกิดข้อผิดพลาด");
    }
  };

  // 3. Handle Delete (Soft Delete)
  const handleDelete = async (id: string) => {
    if(!confirm("ยืนยันการลบ? (สินค้าจะถูกซ่อน)")) return;
    try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        toast.success("ลบสำเร็จ");
        fetchProducts();
    } catch (e) { toast.error("ลบไม่สำเร็จ"); }
  };

  const openAdd = () => {
    setIsEditing(false);
    setFormData({ id: "", name: "", code: "", price: "", category: "COFFEE", image_url: "" });
    setIsOpen(true);
  };

  const openEdit = (p: Product) => {
    setIsEditing(true);
    setFormData({ 
        id: p.id, name: p.name, code: p.code || "", 
        price: String(p.price), category: p.category, image_url: p.image_url || "" 
    });
    setIsOpen(true);
  };

  return (
    <div className="p-8 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Link href="/dashboard"><Button variant="ghost"><ArrowLeft /></Button></Link>
            <h2 className="text-3xl font-bold">จัดการสินค้า</h2>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2" /> เพิ่มสินค้า</Button>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className={!p.is_active ? "opacity-50 bg-slate-50" : ""}>
                <TableCell>
                    {p.image_url && <img src={p.image_url} className="w-10 h-10 rounded object-cover" />}
                </TableCell>
                <TableCell>{p.code}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell><span className="px-2 py-1 rounded bg-slate-100 text-xs">{p.category}</span></TableCell>
                <TableCell>฿{Number(p.price)}</TableCell>
                <TableCell>{p.is_active ? <span className="text-green-600">Active</span> : <span className="text-red-400">Inactive</span>}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isEditing ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>รหัสสินค้า (Code)</Label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} /></div>
                    <div><Label>หมวดหมู่</Label>
                        <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="COFFEE">Coffee</SelectItem>
                                <SelectItem value="NON_COFFEE">Non-Coffee</SelectItem>
                                <SelectItem value="BAKERY">Bakery</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div><Label>ชื่อสินค้า</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div><Label>ราคา (บาท)</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                <div><Label>รูปภาพ URL</Label><Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." /></div>
                <Button className="w-full" onClick={handleSubmit}>บันทึกข้อมูล</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}