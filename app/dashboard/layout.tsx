"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  ArrowLeft,
  Coffee,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarLinks = [
  {
    title: "ภาพรวม",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "สินค้า",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "ประวัติการขาย",
    href: "/dashboard/orders",
    icon: Receipt,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gradient-subtle overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/50 shadow-smooth flex flex-col shrink-0">
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-none">Pocket Café</h1>
            <span className="text-xs text-slate-500">Admin Dashboard</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <div className="px-3 space-y-1">
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              เมนูหลัก
            </p>
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-11 px-3 transition-all duration-200 ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-semibold shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <link.icon className={`w-5 h-5 ${isActive ? "text-slate-800" : "text-slate-500"}`} />
                    {link.title}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="px-3 mt-6 space-y-1">
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              การตั้งค่า
            </p>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
            >
              <Users className="w-5 h-5 text-slate-500" />
              สมาชิก
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
            >
              <Settings className="w-5 h-5 text-slate-500" />
              ตั้งค่าระบบ
            </Button>
          </div>
        </ScrollArea>

        {/* Back to POS Button */}
        <div className="p-4 border-t border-slate-100">
          <Link href="/">
            <Button
              className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white shadow-lg hover:shadow-xl transition-all gap-2 font-semibold"
            >
              <ShoppingCart className="w-4 h-4" />
              กลับหน้าขาย (POS)
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
