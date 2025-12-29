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
  Globe,
  Check,
} from "lucide-react";
import { Customer } from "@/app/generated/prisma/client";
import { toast } from "sonner";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFeatures } from "@/lib/features";
import { useStore } from "@/lib/store";
import { useTranslation } from "react-i18next";

import { setStoredLanguage } from "@/lib/tolgee";

const changeLanguage = (i18n: any, lang: string) => {
  i18n.changeLanguage(lang);
  setStoredLanguage(lang);
};

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlagIcon } from "@/components/FlagIcons";

// Category options for filter - labels will be translated in component
const CATEGORIES = [
  { id: "ALL", labelKey: "pos.allCategories", icon: Grid3X3 },
  { id: "COFFEE", labelKey: "pos.categories.coffee", icon: Coffee },
  { id: "NON_COFFEE", labelKey: "pos.categories.nonCoffee", icon: Wine },
  { id: "BAKERY", labelKey: "pos.categories.bakery", icon: Cake },
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
  const { isEnabled } = useFeatures();
  const { settings: storeSettings } = useStore();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Filter products based on category and search
  const filteredProducts = products.filter((product) => {
    const normalizedProductCategory = product.category.toLowerCase().replace('_', '-');
    const normalizedSelectedCategory = selectedCategory.toLowerCase().replace('_', '-');

    const matchesCategory = selectedCategory === "ALL" || 
      normalizedProductCategory === normalizedSelectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: ProductWithNumber) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);

      if (existingItem && existingItem.quantity >= product.stock) {
        toast.error(t("pos.outOfStock"), {
          description: t("pos.stockLimit", { count: product.stock }),
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

      toast.success(t("pos.orderSuccess"));
    } catch (error: any) {
      toast.error(t("pos.orderFailed"), { description: error.message });
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
        <span className="mt-4 text-slate-500 font-medium">{t("loading")}</span>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen w-full bg-gradient-subtle overflow-hidden">
      {/* --- LEFT: Product Grid --- */}
      <div className="flex-1 flex flex-col h-full">
        <header className="h-14 lg:h-16 glass border-b border-slate-200/50 px-3 md:px-4 flex items-center justify-between shadow-smooth z-10 shrink-0">
          <h1 className="text-base lg:text-lg font-bold text-slate-800 flex items-center gap-1.5">
            {storeSettings?.store_logo ? (
              <img src={storeSettings.store_logo} alt="Logo" className="h-5 w-auto object-contain" />
            ) : (
              <span className="text-base">☕</span>
            )}
            <span className="text-slate-700 font-medium hidden sm:inline">
              {storeSettings?.store_name || "Pocket Café"}
            </span>
            <Badge variant="secondary" className="ml-1 bg-slate-100 text-slate-700 font-semibold text-[10px]">POS</Badge>
          </h1>

          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-all duration-200 px-2 md:px-3"
            >
              <LayoutDashboard className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">{t("pos.dashboard")}</span>
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            {isEnabled("members") && (
              <>
                {selectedCustomer ? (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-50 to-blue-50 pl-2 pr-1 py-1 rounded-full border border-sky-200/80 animate-in slide-in-from-right shadow-sm">
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {selectedCustomer.name?.charAt(0)?.toUpperCase() || 'ล'}
                    </div>
                    
                    {/* Info */}
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-xs font-semibold text-sky-800">
                        คุณ{selectedCustomer.name}
                      </span>
                      {isEnabled("points") && (
                        <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                          ⭐ {selectedCustomer.points.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    {/* Close Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      <LogOut className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200 text-sky-700 hover:border-sky-300 hover:bg-sky-100 transition-all"
                    onClick={() => setIsMemberOpen(true)}
                  >
                    <User className="w-3.5 h-3.5" /> {t("pos.member")}
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200/50 pl-4 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-slate-100 px-2"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm text-slate-600 font-medium">
                      {session?.user?.name}
                    </span>
                    <FlagIcon language={i18n.language} className="w-4 h-4 rounded-sm" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500">{session?.user?.email || ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-slate-400 uppercase">
                  {t("language.title")}
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => changeLanguage(i18n, 'th')}
                  className="cursor-pointer"
                >
                  <FlagIcon language="th" className="w-5 h-5 rounded-sm mr-2" />
                  {t("language.thai")}
                  {i18n.language === 'th' && <Check className="w-4 h-4 ml-auto text-emerald-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeLanguage(i18n, 'en')}
                  className="cursor-pointer"
                >
                  <FlagIcon language="en" className="w-5 h-5 rounded-sm mr-2" />
                  {t("language.english")}
                  {i18n.language === 'en' && <Check className="w-4 h-4 ml-auto text-emerald-500" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => signOut()}
                title={t("auth.logout")}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
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
                  className={`gap-1 md:gap-2 transition-all duration-200 shrink-0 px-3 md:px-4 py-1.5 h-auto rounded-full font-medium border ${
                    isActive
                      ? "bg-slate-800 text-white shadow-md border-slate-800 hover:bg-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t(cat.labelKey)}</span>
                </Button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-28 sm:w-36 md:w-44 lg:w-52 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t("pos.searchProduct")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-3 md:p-4 lg:p-6 scrollbar-thin bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5 pb-24">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">{t("pos.noProduct")}</p>
                <p className="text-sm">{t("pos.tryOtherSearch")}</p>
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
                  className={`group relative transition-all duration-500 border-2 overflow-hidden pt-2 ${
                    isOutOfStock
                      ? "border-transparent opacity-60 grayscale cursor-not-allowed bg-slate-100"
                      : "cursor-pointer bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] border-transparent"
                  } ${inCart ? "!border-slate-800 shadow-md" : "hover:border-slate-200"}`}
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
                          <span className="text-[10px] font-medium">{t("pos.noImage")}</span>
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
                            {t("pos.soldOut")}
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
            <span className="hidden xl:inline">{t("pos.orderList")}</span>
            <span className="xl:hidden">{t("pos.cart")}</span>
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
                <p className="text-sm font-medium text-slate-400">{t("pos.emptyCart")}</p>
                <p className="text-xs text-slate-300 mt-1">{t("pos.addProductHint")}</p>
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
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200/50">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-5 h-5" /></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div className="text-sm font-semibold text-slate-800 truncate leading-tight">
                          {item.product.name}
                        </div>
                        <div className="font-bold text-slate-800 text-sm whitespace-nowrap">
                          ฿{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs text-slate-500 font-medium">
                          ฿{item.product.price.toLocaleString()}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md border-red-100 text-red-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            {item.quantity === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          </Button>
                          <span className="text-sm font-bold w-6 text-center text-slate-800">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100"
                            onClick={() => addToCart(item.product)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Cart Summary */}
        <div className="p-2 lg:p-5 bg-gradient-to-t from-slate-100 to-slate-50 border-t border-slate-100 space-y-3 lg:space-y-4 shrink-0">
          <div className="space-y-1.5 lg:space-y-2 bg-white rounded-xl p-2 lg:p-4 shadow-sm border border-slate-100">
            <div className="flex justify-between text-slate-500 text-xs lg:text-sm">
              <span>{t("subtotal")}</span>
              <span className="font-medium">฿{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs lg:text-sm">
              <span>{t("tax")}</span>
              <span>-</span>
            </div>
            <Separator className="my-2 lg:my-3" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700 text-xs lg:text-lg">{t("total")}</span>
              <div className="text-right">
                <span className="text-lg lg:text-xl font-bold text-slate-800">
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
            {cart.length === 0 ? t("pos.empty") : t("pos.charge")}
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
