'use client';

import { useState } from 'react';
import { Product } from '@/app/generated/prisma/client';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// รับ Props เป็นสินค้าที่แปลงราคาเป็น number แล้ว
type ProductWithNumber = Omit<Product, 'price'> & { price: number };

type CartItem = {
  product: ProductWithNumber; // ใช้ตัวที่แปลงแล้ว
  quantity: number;
  options?: any;
};

type POSScreenProps = {
  products: ProductWithNumber[];
};

export default function POSScreen({ products }: POSScreenProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ฟังก์ชันเพิ่มของลงตะกร้า
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        // ถ้ามีแล้ว ให้เพิ่มจำนวน
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // ถ้ายังไม่มี ให้เพิ่มใหม่
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  // ฟังก์ชันลบของ/ลดจำนวน
  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      return prev.reduce((acc, item) => {
        if (item.product.id === productId) {
          if (item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
          // ถ้าเหลือ 1 แล้วกดลบ ก็ไม่ต้อง push เข้า acc (คือหายไปเลย)
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as CartItem[]);
    });
  };

  // คำนวณยอดรวม
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* --- LEFT: Product Grid --- */}
      <div className="flex-1 flex flex-col h-full">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            ☕ Pocket Café <Badge variant="secondary">POS</Badge>
          </h1>
          <div className="text-sm text-slate-500">Staff: Admin</div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-2 hover:shadow-md hover:border-blue-400 transition-all cursor-pointer active:scale-95 duration-100 select-none"
              >
                <div className="aspect-square bg-slate-100 rounded-lg mb-2 overflow-hidden relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                  {/* Badge แสดงจำนวนในตะกร้า (ถ้ามี) */}
                  {cart.find((c) => c.product.id === product.id) && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md animate-in zoom-in">
                      {cart.find((c) => c.product.id === product.id)?.quantity}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {product.price.toLocaleString()}.-
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- RIGHT: Cart Sidebar --- */}
      <div className="w-[350px] bg-white border-l shadow-xl flex flex-col h-full shrink-0 z-20">
        <div className="h-16 flex items-center justify-between px-4 border-b bg-slate-50 shrink-0">
          <h2 className="font-semibold text-lg text-slate-700">Current Order</h2>
          <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">
            {cart.reduce((a, b) => a + b.quantity, 0)} Items
          </span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
              <p>เลือกเมนูทางซ้ายได้เลย</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border border-slate-100 animate-in slide-in-from-right-5 fade-in duration-300">
                <div className="flex-1">
                  <div className="text-slate-800 font-medium">{item.product.name}</div>
                  <div className="text-slate-500 text-xs mt-1">
                    {item.product.price} x {item.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-slate-700">
                    {(item.product.price * item.quantity).toLocaleString()}
                  </div>
                  {/* ปุ่มลบ */}
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Payment */}
        <div className="p-4 bg-slate-50 border-t space-y-3 shrink-0">
          <div className="flex justify-between text-slate-600 text-sm">
            <span>Subtotal</span>
            <span>{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-slate-800">
            <span>Total</span>
            <span className="text-blue-600">฿{totalAmount.toLocaleString()}</span>
          </div>

          <button
            disabled={cart.length === 0}
            className={`w-full font-bold py-4 rounded-xl text-lg transition-all shadow-lg ${
              cart.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {cart.length === 0 ? 'Empty Cart' : `Charge ฿${totalAmount.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}