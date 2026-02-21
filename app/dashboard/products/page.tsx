"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  CheckCircle,
  XCircle,
  Minus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  DialogTrigger,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Product } from "@/app/generated/prisma/client";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Helper to format category for display
const formatCategory = (cat: string) => {
  const map: Record<string, string> = {
    'COFFEE': 'Coffee',
    'NON_COFFEE': 'Non-Coffee', 
    'BAKERY': 'Bakery',
    'coffee': 'Coffee',
    'non-coffee': 'Non-Coffee',
    'bakery': 'Bakery',
  };
  return map[cat] || cat;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Derived: filtered products
  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === "ALL" || p.category.toUpperCase() === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.code || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  useEffect(() => {
    const calculateItems = () => {
      const vh = window.innerHeight;
      const availableHeight = vh - 80; 
      const rowHeight = 75; // Approx row height with taller images
      const items = Math.floor(availableHeight / rowHeight);
      setItemsPerPage(Math.max(4, items));
    }
    calculateItems();
    window.addEventListener('resize', calculateItems);
    return () => window.removeEventListener('resize', calculateItems);
  }, []);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
     (currentPage - 1) * itemsPerPage,
     currentPage * itemsPerPage
  );

  // Form State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    price: "",
    category: "COFFEE",
    image_url: "",
    stock: 0,
    is_active: true,
  });

  // Stock Dialog State
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [stockProductId, setStockProductId] = useState<string | null>(null);
  const [stockToAdd, setStockToAdd] = useState<number>(0);

  // Delete Dialog State
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);

  // 1. Fetch Products
  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 1.5 Handle Image Upload
  const [isUploading, setIsUploading] = useState(false);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side Validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      toast.error(t("settings.uploadError"), { 
        description: "อนุญาตเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้นครับ" 
      });
      return;
    }

    if (file.size > maxSize) {
      toast.error(t("settings.uploadError"), { 
        description: "ขนาดไฟล์ต้องไม่เกิน 2MB นะครับ" 
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, image_url: data.url }));
        toast.success(t("settings.uploadSuccess"));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(t("settings.uploadError"), { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Handle Submit (Create/Update)
  const handleSubmit = async () => {
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/products/${formData.id}` : "/api/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        }),
      });

      if (!res.ok) throw new Error();

      toast.success(isEditing ? t("products.editSuccess") : t("products.addSuccess"));
      setIsOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(t("products.addError"));
    }
  };

  // 3. Handle Delete (Hard Delete)
  const handleDelete = async (id: string) => {
    // Confirmation handled by Dialog
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("products.deleteError"));
      }

      toast.success(t("products.deleteSuccess"));
      fetchProducts();
    } catch (e: any) {
      toast.error(e.message || t("products.deleteError"));
    }
  };

  // 4. Handle Quick Stock Update
  const openStockDialog = (p: Product) => {
    setStockProductId(p.id);
    setStockToAdd(0);
    setIsStockOpen(true);
  };

  const handleStockUpdate = async () => {
    if (!stockProductId) return;
    try {
      // Fetch current product to get latest stock first (safer)
      // But for Quick Add, we can just PATCH with new absolute value?
      // Or we can just calculate client side. Let's calculate client side for simplicity
      const product = products.find(p => p.id === stockProductId);
      if (!product) return;

      const newStock = product.stock + stockToAdd;
      if (newStock < 0) {
        toast.error(t("products.stockNegativeError"));
        return;
      }

      const res = await fetch(`/api/products/${stockProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!res.ok) throw new Error();

      toast.success(t("products.stockUpdateSuccess"));
      setIsStockOpen(false);
      fetchProducts();
    } catch (e) {
      toast.error(t("products.stockUpdateError"));
    }
  };

  const openAdd = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      name: "",
      code: "",
      price: "",
      category: "COFFEE",
      image_url: "",
      stock: 0,
      is_active: true,
    });
    setIsOpen(true);
  };

  const openEdit = (p: Product) => {
    setIsEditing(true);
    setFormData({
      id: p.id,
      name: p.name,
      code: p.code || "",
      price: String(p.price),
      category: p.category,
      image_url: p.image_url || "",
      stock: p.stock,
      is_active: p.is_active,
    });
    setIsOpen(true);
  };

  return (
    <div className="h-screen max-h-screen p-4 md:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-4 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">{t("products.title")}</h2>
          <p className="text-slate-500 text-sm mt-1">{t("products.subtitle")}</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-slate-800 hover:bg-slate-900 shadow-lg">
          <Plus className="w-4 h-4" /> {t("products.addProduct")}
        </Button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t("products.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-1">
          {["ALL", "COFFEE", "NON_COFFEE", "BAKERY"].map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 ${
                categoryFilter === cat
                  ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat === "ALL" ? t("products.filterAll") : formatCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      <Card className="shadow-smooth border-0 bg-white overflow-hidden rounded-xl gap-0 flex flex-col min-h-0 flex-1 pt-4 pb-2">
        <div className="flex-1 overflow-auto p-0 px-1">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-100">
            <TableRow className="hover:bg-slate-50/50">
              <TableHead className="w-[80px] font-semibold text-slate-700">{t("image")}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t("products.code")}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t("name")}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t("category")}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t("price")}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t("stock")}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t("status")}</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 pr-6">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Loading State
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-12 bg-slate-100 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-10 bg-slate-100 rounded-full animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
                       <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
                       <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-60 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Search className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-lg font-medium">{t("products.noProducts")}</p>
                    <p className="text-sm">{searchQuery ? t("pos.tryOtherSearch") : t("products.clickToAdd")}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((p) => (
                <TableRow
                  key={p.id}
                  className={`group transition-colors ${!p.is_active ? "opacity-60 bg-slate-50/50" : "hover:bg-slate-50/50"}`}
                >
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200/50">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{p.code || "-"}</TableCell>
                  <TableCell className="font-medium text-slate-700">{p.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                      {formatCategory(p.category)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">฿{Number(p.price).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                        p.stock <= 5 
                          ? "bg-red-50 text-red-600 border border-red-100" 
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                      {p.stock}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.is_active ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full w-fit border border-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                        Inactive
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1 pr-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => openStockDialog(p)}
                      title="Add Stock"
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeletePendingId(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>

      {/* Pagination Controls */}
      {products.length > 0 && (
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

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl rounded-2xl shadow-smooth-lg border-0 bg-white">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {isEditing ? <Pencil className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-emerald-600" />}
              {isEditing ? t("products.editProduct") : t("products.addProduct")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 pt-4">
             {/* Left Column: Image Preview */}
             <div className="col-span-2 md:col-span-2 space-y-4">
               <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative group">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                     <Label>{t("products.imageUrl")}</Label>
                     <div className="flex gap-2">
                       <Input
                         value={formData.image_url}
                         onChange={(e) =>
                           setFormData({ ...formData, image_url: e.target.value })
                         }
                         placeholder="https://..."
                         className="font-mono text-xs bg-slate-50 flex-1"
                       />
                       <div className="relative">
                         <input
                           type="file"
                           accept="image/*"
                           onChange={handleFileUpload}
                           className="hidden"
                           id="product-image-upload"
                           disabled={isUploading}
                         />
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           className="h-9 px-2 text-[10px] shrink-0"
                           disabled={isUploading}
                           asChild
                         >
                           <label htmlFor="product-image-upload" className="cursor-pointer flex items-center gap-1">
                             {isUploading ? (
                               <Loader2 className="w-3 h-3 animate-spin" />
                             ) : (
                               <Plus className="w-3 h-3" />
                             )}
                             {t("settings.uploadLogo")}
                           </label>
                         </Button>
                       </div>
                     </div>
                     <p className="text-[10px] text-slate-400">{t("products.imageUrlPlaceholder")}</p>
                  </div>
               </div>
             </div>

             {/* Form Fields - Compact Grid */}
             <div className="space-y-2">
                <Label>{t("products.productCode")}</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="font-mono bg-slate-50"
                  placeholder="EX: A001"
                />
             </div>

             <div className="space-y-2">
               <Label>{t("category")}</Label>
               <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COFFEE">Coffee</SelectItem>
                    <SelectItem value="NON_COFFEE">Non-Coffee</SelectItem>
                    <SelectItem value="BAKERY">Bakery</SelectItem>
                  </SelectContent>
                </Select>
             </div>

             <div className="col-span-2 md:col-span-2 space-y-2">
               <Label>{t("products.productName")}</Label>
               <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("products.productNamePlaceholder")}
                  className="text-lg font-medium bg-slate-50"
               />
             </div>

             <div className="space-y-2">
               <Label>{t("products.basePrice")}</Label>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
                 <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="text-right font-bold pl-8 bg-slate-50"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <Label>{t("products.initialStock")}</Label>
               <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="text-right bg-slate-50"
               />
             </div>

             <div className="col-span-2 flex items-center justify-between border border-slate-200 p-3 rounded-xl bg-slate-50/50 mt-2">
               <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-slate-700">{t("products.saleStatus")}</Label>
                  <p className="text-xs text-slate-500">{t("products.saleStatusHint")}</p>
               </div>
               <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
               />
             </div>
          </div>
          <DialogFooter className="pt-6 mt-2 border-t border-slate-100 flex gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="hover:bg-slate-100">{t("cancel")}</Button>
            <Button onClick={handleSubmit} className="bg-slate-800 hover:bg-slate-900 min-w-[120px] shadow-lg hover:shadow-xl transition-all">
              {isEditing ? t("products.confirmEdit") : t("products.confirmSave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Quick Stock Dialog */}
      <Dialog open={isStockOpen} onOpenChange={setIsStockOpen}>
        <DialogContent className="max-w-sm rounded-2xl shadow-smooth border-0 bg-white">
           <DialogHeader>
             <DialogTitle className="text-center pb-4 border-b border-slate-100 text-slate-800">{t("products.stockDialogTitle")}</DialogTitle>
           </DialogHeader>
           <div className="space-y-6 py-2">
             <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-6">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-slate-200 hover:bg-slate-50" onClick={() => setStockToAdd(prev => prev - 1)}>
                    <Minus className="w-6 h-6 text-slate-600" />
                  </Button>
                  <div className="text-center w-24">
                     <div className={`text-4xl font-bold ${stockToAdd > 0 ? "text-emerald-600" : stockToAdd < 0 ? "text-red-600" : "text-slate-800"}`}>
                       {stockToAdd > 0 ? `+${stockToAdd}` : stockToAdd}
                     </div>
                     <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Change</p>
                  </div>
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-slate-200 hover:bg-slate-50" onClick={() => setStockToAdd(prev => prev + 1)}>
                    <Plus className="w-6 h-6 text-slate-600" />
                  </Button>
                </div>
             </div>
             
             <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map(num => (
                  <Button key={num} variant="outline" size="sm" className="rounded-full text-xs font-medium hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" onClick={() => setStockToAdd(num)}>
                    +{num}
                  </Button>
                ))}
             </div>

             <div className="bg-slate-50 p-4 rounded-xl text-center text-sm border border-slate-100 flex items-center justify-between px-6 shadow-inner">
                <div className="flex flex-col items-start">
                   <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Current</span>
                   <span className="font-bold text-lg text-slate-700">{products.find(p => p.id === stockProductId)?.stock || 0}</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
                <div className="flex flex-col items-end">
                   <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">New</span>
                   <span className="font-bold text-lg text-blue-600">{(products.find(p => p.id === stockProductId)?.stock || 0) + stockToAdd}</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="ghost" onClick={() => setIsStockOpen(false)} className="hover:bg-slate-100">{t("cancel")}</Button>
                <Button onClick={handleStockUpdate} className="bg-slate-800 hover:bg-slate-900 shadow-md">
                  {t("confirm")}
                </Button>
             </div>
           </div>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePendingId} onOpenChange={(open) => !open && setDeletePendingId(null)}>
        <AlertDialogContent className="bg-white rounded-xl shadow-smooth border-0">
           <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> {t("products.confirmDelete")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              {t("products.deleteWarning")}
              <br/>
              <span className="text-xs text-slate-400 mt-1 block">{t("products.deleteOrderedWarning")}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-0 hover:bg-slate-50">{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deletePendingId) handleDelete(deletePendingId);
                setDeletePendingId(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg border-0"
            >
              {t("products.confirmDeleteBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
