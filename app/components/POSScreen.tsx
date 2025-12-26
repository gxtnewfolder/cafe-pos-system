"use client";

import { useState } from "react";
import PaymentDialog from "./PaymentDialog";
import { Product } from "@/app/generated/prisma/client";
import MemberDialog from "./MemberDialog";
import { User, LogOut } from "lucide-react";
import { Customer } from "@/app/generated/prisma/client";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type ProductWithNumber = Omit<Product, "price"> & { price: number };

type CartItem = {
  product: ProductWithNumber;
  quantity: number;
  options?: any;
};

type POSScreenProps = {
  products: ProductWithNumber[];
};

export default function POSScreen({ products }: POSScreenProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isMemberOpen, setIsMemberOpen] = useState(false);

  const addToCart = (product: ProductWithNumber) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
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

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. ส่งข้อมูลไป Backend
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
      setSelectedCustomer(null);

      if (!response.ok) throw new Error("Payment failed");

      const data = await response.json();

      // 2. ถ้าสำเร็จ -> เคลียร์ตะกร้า -> ปิด popup
      setCart([]); // ล้างตะกร้า
      setIsPaymentOpen(false); // ปิด popup

      toast.success("บันทึกออเดอร์สำเร็จ!", {
        description: `Order ID: ${data.orderId.substring(0, 8)}...`,
        duration: 3000,
        // ไม่ต้องกำหนดสีเอง Sonner จัดการให้สวยๆ เลย
      });
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถบันทึกออเดอร์ได้ กรุณาลองใหม่",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* --- LEFT: Product Grid --- */}
      <div className="flex-1 flex flex-col h-full">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            ☕ Pocket Café <Badge variant="secondary">POS</Badge>
          </h1>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-900"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              หลังบ้าน
            </Button>
          </Link>
          {/* <div className="text-sm text-slate-500">Staff: Admin</div> */}
          {/* ส่วนแสดงสมาชิก / ปุ่ม Login */}
          <div className="flex items-center gap-3">
            {selectedCustomer ? (
              <div className="flex items-center gap-3 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 animate-in slide-in-from-right">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-sm font-bold text-blue-700">
                    {selectedCustomer.name}
                  </span>
                  <span className="text-xs text-blue-500">
                    แต้มสะสม: {selectedCustomer.points}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-blue-400 hover:text-red-500 hover:bg-red-50"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsMemberOpen(true)}
              >
                <User className="w-4 h-4" /> สมาชิก
              </Button>
            )}
          </div>
        </header>

        {/* ใช้ ScrollArea ของ shadcn แทน div overflow-auto */}
        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {products.map((product) => {
              const inCart = cart.find((c) => c.product.id === product.id);

              return (
                <Card
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`cursor-pointer transition-all hover:shadow-lg active:scale-95 border-2 ${
                    inCart
                      ? "border-primary ring-1 ring-primary/20"
                      : "border-transparent hover:border-slate-200"
                  }`}
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    {/* Image Area */}
                    <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No Image
                        </div>
                      )}

                      {/* Quantity Badge */}
                      {inCart && (
                        <div className="absolute top-2 right-2 animate-in zoom-in duration-200">
                          <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-sm font-bold shadow-md">
                            {inCart.quantity}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Text Info */}
                    <div>
                      <h3 className="font-semibold text-slate-800 line-clamp-1 text-sm md:text-base">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium">
                        ฿{product.price.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* --- RIGHT: Cart Sidebar --- */}
      <div className="w-[380px] bg-white border-l shadow-2xl flex flex-col h-full shrink-0 z-20">
        <div className="h-16 flex items-center justify-between px-6 border-b bg-slate-50 shrink-0">
          <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Current Order
          </h2>
          <Badge variant="outline" className="text-slate-600">
            {cart.reduce((a, b) => a + b.quantity, 0)} Items
          </Badge>
        </div>

        {/* Cart Items List */}
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center text-slate-300 gap-4">
              <ShoppingBasketIcon />
              <p className="text-sm font-medium">No items in cart</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="group flex justify-between items-start gap-3 animate-in slide-in-from-right-5 fade-in duration-300"
                >
                  {/* Item Info */}
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-semibold text-slate-800">
                      {item.product.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      ฿{item.product.price} x {item.quantity}
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="font-bold text-slate-800 text-sm">
                      ฿{(item.product.price * item.quantity).toLocaleString()}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-sm text-red-500 hover:text-red-600 hover:bg-white"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </Button>
                      <span className="text-xs font-medium w-4 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-sm text-blue-600 hover:text-blue-700 hover:bg-white"
                        onClick={() => addToCart(item.product)} // ต้องส่ง product ตัวเต็มกลับไป
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer Payment */}
        <div className="p-6 bg-slate-50 border-t space-y-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Tax (7%)</span>
              <span>-</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-end">
              <span className="font-semibold text-slate-700">Total</span>
              <span className="text-2xl font-bold text-primary">
                ฿{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            className="w-full h-12 text-lg font-bold shadow-lg"
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
          >
            {cart.length === 0 ? "Empty Cart" : "Charge Payment"}
          </Button>
        </div>
      </div>
      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmount={totalAmount}
        onConfirm={handlePayment}
        isProcessing={isProcessing}
      />

      {/* Member Dialog */}
      <MemberDialog
        isOpen={isMemberOpen}
        onClose={() => setIsMemberOpen(false)}
        onCustomerSelected={setSelectedCustomer}
      />
    </div>
  );
}

// Icon component เล็กๆ สำหรับตอนตะกร้าว่าง
function ShoppingBasketIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 11 4-7" />
      <path d="m19 11-4-7" />
      <path d="M2 11h20" />
      <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4" />
      <path d="m9 11 1 9" />
      <path d="m4.5 11 .1 9" />
      <path d="m12 11 2 9" />
      <path d="m20 11-1 9" />
    </svg>
  );
}
