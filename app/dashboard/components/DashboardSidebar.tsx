"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Coffee,
  Users,
  Settings,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StoreSettings, FeatureFlag } from "@/app/generated/prisma/client";
import { useFeatures } from "@/lib/features";
import { useStore } from "@/lib/store";

interface DashboardSidebarProps {
  initialFeatures: FeatureFlag[];
  initialSettings: StoreSettings | null;
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
  {
    title: "รายงานยอดขาย",
    href: "/dashboard/reports",
    icon: BarChart3,
    featureFlag: "reports",
  },
];

export default function DashboardSidebar({ initialFeatures, initialSettings }: DashboardSidebarProps) {
  const pathname = usePathname();
  
  // Feature Flags Context
  const { features: contextFeatures, isLoading: isFeaturesLoading } = useFeatures();
  const features = isFeaturesLoading ? initialFeatures : contextFeatures;
  
  // Store Settings Context
  const { settings: contextSettings, isLoading: isStoreLoading } = useStore();
  const settings = isStoreLoading || !contextSettings ? initialSettings : contextSettings;
  
  const isEnabled = (featureId: string): boolean => {
    const feature = features.find(f => f.id === featureId);
    return feature?.enabled ?? false;
  };
  
  const showMembersMenu = isEnabled("members");

  return (
    <aside className="w-16 lg:w-64 bg-white border-r border-slate-200/50 shadow-smooth flex flex-col shrink-0 transition-all duration-300">
      {/* Logo Area */}
      <div className="h-18 flex items-center gap-3 px-3 lg:px-5 border-b border-slate-100 justify-center lg:justify-start">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shrink-0 overflow-hidden relative">
           {settings?.store_logo ? (
              <img src={settings.store_logo} alt="Logo" className="w-full h-full object-cover" />
           ) : (
              <Coffee className="w-5 h-5 text-white" />
           )}
        </div>
        <div className="hidden lg:block truncate max-w-[150px]">
          <h1 className="font-bold text-slate-800 text-lg leading-tight truncate" title={settings?.store_name || "Pocket Café"}>
            {settings?.store_name || "Pocket Café"}
          </h1>
          <span className="text-xs text-slate-500">Admin Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <div className="px-2 lg:px-3 space-y-1">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:block">
            เมนูหลัก
          </p>
          {sidebarLinks.map((link) => {
            // Check if link requires a feature flag
            if (link.featureFlag) {
              const flag = features.find((f) => f.id === link.featureFlag);
              if (!flag?.enabled) return null;
            }

            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-center lg:justify-start gap-3 h-11 px-3 transition-all duration-200 ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  title={link.title}
                >
                  <link.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-slate-800" : "text-slate-500"}`} />
                  <span className="hidden lg:inline">{link.title}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-400 hidden lg:block" />}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="px-2 lg:px-3 mt-6 space-y-1">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:block">
            การตั้งค่า
          </p>
          {showMembersMenu && (
            <Link href="/dashboard/members">
              <Button
                variant="ghost"
                className={`w-full justify-center lg:justify-start gap-3 h-11 px-3 transition-all duration-200 ${
                  pathname === "/dashboard/members"
                    ? "bg-slate-800 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                title="สมาชิก"
              >
                <Users className={`w-5 h-5 shrink-0 ${pathname === "/dashboard/members" ? "text-white" : "text-slate-500"}`} />
                <span className="hidden lg:inline">สมาชิก</span>
                {pathname === "/dashboard/members" && <ChevronRight className="w-4 h-4 ml-auto text-slate-300 hidden lg:block" />}
              </Button>
            </Link>
          )}
          <Link href="/dashboard/settings">
            <Button
              variant="ghost"
              className={`w-full justify-center lg:justify-start gap-3 h-11 px-3 transition-all duration-200 ${
                pathname === "/dashboard/settings"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="ตั้งค่าระบบ"
            >
              <Settings className={`w-5 h-5 shrink-0 ${pathname === "/dashboard/settings" ? "text-white" : "text-slate-500"}`} />
              <span className="hidden lg:inline">ตั้งค่าระบบ</span>
              {pathname === "/dashboard/settings" && <ChevronRight className="w-4 h-4 ml-auto text-slate-300 hidden lg:block" />}
            </Button>
          </Link>
        </div>
      </ScrollArea>

      {/* Back to POS Button */}
      <div className="p-2 lg:p-4 border-t border-slate-100">
        <Link href="/">
          <Button
            className="w-full h-10 lg:h-12 bg-slate-800 hover:bg-slate-900 text-white shadow-lg hover:shadow-xl transition-all gap-2 font-semibold"
            title="กลับหน้าขาย (POS)"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline">กลับหน้าขาย (POS)</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
