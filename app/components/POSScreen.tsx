"use client";

import { useState, useEffect } from "react";
import PaymentDialog from "./PaymentDialog";
import { Product } from "@/app/generated/prisma/client";
import MemberDialog from "./MemberDialog";
import {
  User,
  LogOut,
  Package,
  LayoutDashboard,
  Loader2,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Search,
  Coffee,
  Cake,
  Wine,
  Grid3X3,
  ShoppingBasket,
} from "lucide-react";
import { Customer } from "@/app/generated/prisma/client";
import { toast } from "sonner";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Category options for filter
const CATEGORIES = [
  { id: "ALL", label: "ทั้งหมด", icon: Grid3X3 },
  { id: "COFFEE", label: "Coffee", icon: Coffee },
  { id: "NON_COFFEE", label: "Non-Coffee", icon: Wine },
  { id: "BAKERY", label: "Bakery", icon: Cake },
];

type ProductWithNumber = Omit<Product, "price"> & {
  price: number;
  stock: number;
};

type CartItem = {
  product: ProductWithNumber;
  quantity: number;
  options?: any;
};

type POSScreenProps = {
  products: ProductWithNumber[];
};

export default function POSScreen({ products: initialProducts }: POSScreenProps) {
  const [products, setProducts] = useState<ProductWithNumber[]>(initialProducts);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{
    orderId: string;
    items: any[];
    date: Date;
  } | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Filter products based on category and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "ALL" || 
      product.category.toLowerCase() === selectedCategory.toLowerCase().replace('_', '-');
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: ProductWithNumber) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);

      if (existingItem && existingItem.quantity >= product.stock) {
        toast.error("สินค้าหมดสต็อก", {
          description: `มีสินค้าเพียง ${product.stock} ชิ้น`,
        });
        return prev;
      }

      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      return prev.reduce((acc, item) => {
        if (item.product.id === productId) {
          if (item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as CartItem[]);
    });
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        const transformed = data
          .filter((p: any) => p.is_active)
          .map((p: any) => ({
            ...p,
            price: Number(p.price),
            stock: Number(p.stock),
          }))
          .sort((a: any, b: any) => b.category.localeCompare(a.category)); // desc order
        setProducts(transformed);
      }
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          totalAmount: totalAmount,
          paymentType: "QR",
          customerId: selectedCustomer?.id,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error);
      }
      const data = await response.json();

      const currentItems = [...cart];
      setSuccessOrder({
        orderId: data.orderId,
        items: currentItems,
        date: new Date(),
      });

      setCart([]);
      setSelectedCustomer(null);
      // refreshProducts();

      toast.success("บันทึกออเดอร์สำเร็จ!");
    } catch (error: any) {
      toast.error("ทำรายการไม่สำเร็จ", { description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePayment = () => {
    setIsPaymentOpen(false);
    setTimeout(() => setSuccessOrder(null), 300);
  };

  if (status === "loading") {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-subtle">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-30">
            <div className="h-16 w-16 rounded-full bg-slate-300" />
          </div>
          <Loader2 className="w-16 h-16 animate-spin text-slate-600 relative z-10" />
        </div>
        <span className="mt-4 text-slate-500 font-medium">กำลังโหลดระบบ...</span>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen w-full bg-gradient-subtle overflow-hidden">
      {/* --- LEFT: Product Grid --- */}
      <div className="flex-1 flex flex-col h-full">
        <header className="h-12 lg:h-14 glass border-b border-slate-200/50 px-3 md:px-4 flex items-center justify-between shadow-smooth z-10 shrink-0">
          <h1 className="text-base lg:text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <span className="text-lg lg:text-xl">☕</span>
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text hidden sm:inline">Pocket Café</span>
            <Badge variant="secondary" className="ml-1 bg-slate-100 text-slate-700 font-semibold text-[10px]">POS</Badge>
          </h1>

          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-all duration-200 px-2 md:px-3"
            >
              <LayoutDashboard className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">หลังบ้าน</span>
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            {selectedCustomer ? (
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-100/80 animate-in slide-in-from-right shadow-sm">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-sm font-bold text-blue-700">
                    {selectedCustomer.name}
                  </span>
                  <span className="text-xs text-blue-500 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-soft"></span>
                    แต้มสะสม: {selectedCustomer.points}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-blue-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="gap-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                onClick={() => setIsMemberOpen(true)}
              >
                <User className="w-4 h-4" /> สมาชิก
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 border-l border-slate-200/50 pl-4 ml-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold">
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-slate-600 font-medium hidden lg:inline">
                {session?.user?.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-200"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="px-2 md:px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center gap-2 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 md:gap-2 flex-1 overflow-x-auto scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`gap-1 md:gap-2 transition-all duration-200 shrink-0 px-2 md:px-3 ${
                    isActive
                      ? "bg-slate-800 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-28 sm:w-36 md:w-44 lg:w-52 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-2 md:p-4 lg:p-5 scrollbar-thin">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 lg:gap-4 pb-20">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">ไม่พบสินค้า</p>
                <p className="text-sm">ลองเปลี่ยนหมวดหรือคำค้นหา</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const inCart = cart.find((c) => c.product.id === product.id);
                const isOutOfStock = product.stock <= 0;

                return (
                <Card
                  key={product.id}
                  onClick={() => {
                    if (!isOutOfStock) addToCart(product);
                  }}
                  className={`transition-all duration-300 border-2 overflow-hidden hover-lift ${
                    isOutOfStock
                      ? "opacity-50 grayscale cursor-not-allowed border-slate-100 bg-slate-50/50"
                      : "cursor-pointer bg-white shadow-smooth hover:shadow-smooth-lg active:scale-[0.98] border-transparent"
                  } ${inCart ? "border-slate-800 ring-2 ring-slate-800/10 shadow-smooth-lg" : ""}`}
                >
                  <CardContent className="p-2 lg:p-3 flex flex-col gap-1.5 lg:gap-2">
                    {/* Image Area - 4:3 ratio instead of square */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden relative group">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1">
                          <Package className="w-6 h-6" />
                          <span className="text-[10px] font-medium">No Image</span>
                        </div>
                      )}

                      {/* Overlay gradient on hover */}
                      {!isOutOfStock && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}

                      {/* ✅ Stock Badge - โชว์เฉพาะตอน Sold Out */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                          <Badge
                            variant="destructive"
                            className="shadow-lg font-bold px-2 py-0.5 text-xs"
                          >
                            Sold Out
                          </Badge>
                        </div>
                      )}

                      {/* Quantity Badge */}
                      {inCart && (
                        <div className="absolute top-1 right-1 animate-in zoom-in duration-200 z-10">
                          <Badge className="h-5 w-5 lg:h-6 lg:w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold shadow-lg ring-1 ring-white bg-slate-800 text-white">
                            {inCart.quantity}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Text Info */}
                    <div className="space-y-0.5">
                      <h3
                        className={`font-semibold line-clamp-1 text-xs lg:text-sm ${
                          isOutOfStock ? "text-slate-400" : "text-slate-700"
                        }`}
                      >
                        {product.name}
                      </h3>
                      <p
                        className={`text-sm lg:text-base font-bold ${
                          isOutOfStock ? "text-slate-400" : "text-slate-800"
                        }`}
                      >
                        ฿{product.price.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                );
              }))}
          </div>
        </ScrollArea>
      </div>

      {/* --- RIGHT: Cart Sidebar --- */}
      <div className="w-[240px] md:w-[270px] lg:w-[300px] xl:w-[360px] 2xl:w-[400px] bg-white border-l border-slate-200/50 shadow-smooth-lg flex flex-col h-full shrink-0 z-20">
        <div className="h-14 lg:h-16 flex items-center justify-between px-3 lg:px-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
          <h2 className="font-bold text-sm lg:text-lg text-slate-800 flex items-center gap-1.5 lg:gap-2.5">
            <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
            </div>
            <span className="hidden xl:inline">Current Order</span>
            <span className="xl:hidden">Order</span>
          </h2>
          <Badge variant="secondary" className="text-slate-700 bg-slate-100 font-semibold px-2 lg:px-3 text-xs">
            {cart.reduce((a, b) => a + b.quantity, 0)}
          </Badge>
        </div>

        <ScrollArea className="flex-1 p-2 lg:p-5 scrollbar-thin">
          {cart.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center text-slate-300 gap-3">
              <div className="p-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 shadow-inner">
                <ShoppingBasket className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-400">No items in cart</p>
                <p className="text-xs text-slate-300 mt-1">Tap products to add</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div
                  key={item.product.id}
                  className="group p-2 lg:p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-all duration-200 animate-in slide-in-from-right-5 fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs lg:text-sm font-semibold text-slate-800 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        ฿{item.product.price.toLocaleString()} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-bold text-slate-800 text-xs lg:text-sm whitespace-nowrap">
                      ฿{(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-0.5 bg-white rounded-lg p-0.5 shadow-sm border border-slate-100 w-fit ml-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                    </Button>
                    <span className="text-xs font-bold w-5 text-center text-slate-700">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      onClick={() => addToCart(item.product)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 lg:p-5 bg-gradient-to-t from-slate-100 to-slate-50 border-t border-slate-100 space-y-3 lg:space-y-4 shrink-0">
          <div className="space-y-1.5 lg:space-y-2 bg-white rounded-xl p-2 lg:p-4 shadow-sm border border-slate-100">
            <div className="flex justify-between text-slate-500 text-xs lg:text-sm">
              <span>Subtotal</span>
              <span className="font-medium">฿{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs lg:text-sm">
              <span>Tax (7%)</span>
              <span>-</span>
            </div>
            <Separator className="my-2 lg:my-3" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700 text-xs lg:text-sm">Total</span>
              <div className="text-right">
                <span className="text-lg lg:text-2xl font-bold text-slate-800">
                  ฿{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <Button
            className={`w-full h-10 lg:h-14 text-sm lg:text-lg font-bold shadow-lg transition-all duration-300 ${
              cart.length === 0 
                ? 'bg-slate-200 text-slate-400' 
                : 'bg-slate-800 hover:bg-slate-900 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
            }`}
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
          >
            {cart.length === 0 ? "Empty" : "Charge →"}
          </Button>
        </div>
      </div>

      <PaymentDialog
        isOpen={isPaymentOpen}
        onClose={handleClosePayment}
        totalAmount={successOrder ? 0 : totalAmount}
        onConfirm={handlePayment}
        isProcessing={isProcessing}
        successData={successOrder}
        onRefresh={refreshProducts}
      />

      <MemberDialog
        isOpen={isMemberOpen}
        onClose={() => setIsMemberOpen(false)}
        onCustomerSelected={setSelectedCustomer}
      />
    </div>
  );
}
