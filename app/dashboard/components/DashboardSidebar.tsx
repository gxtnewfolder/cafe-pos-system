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
  LogOut,
  Globe,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StoreSettings, FeatureFlag } from "@/app/generated/prisma/client";
import { useFeatures } from "@/lib/features";
import { useStore } from "@/lib/store";
import { useTranslation } from "react-i18next";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlagIcon } from "@/components/FlagIcons";
import { setStoredLanguage } from "@/lib/tolgee";

interface DashboardSidebarProps {
  initialFeatures: FeatureFlag[];
  initialSettings: StoreSettings | null;
}

const sidebarLinks = [
  {
    titleKey: "dashboard.overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    titleKey: "dashboard.products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    titleKey: "dashboard.orders",
    href: "/dashboard/orders",
    icon: Receipt,
  },
  {
    titleKey: "dashboard.reports",
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
  const { t, i18n } = useTranslation();
  const { data: session } = useSession();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setStoredLanguage(lang);
  };

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
            {t("sidebar.mainMenu")}
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
                  title={t(link.titleKey)}
                >
                  <link.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-slate-800" : "text-slate-500"}`} />
                  <span className="hidden lg:inline">{t(link.titleKey)}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-400 hidden lg:block" />}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="px-2 lg:px-3 mt-6 space-y-1">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:block">
            {t("sidebar.settings")}
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
                title={t("dashboard.members")}
              >
                <Users className={`w-5 h-5 shrink-0 ${pathname === "/dashboard/members" ? "text-white" : "text-slate-500"}`} />
                <span className="hidden lg:inline">{t("dashboard.members")}</span>
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
              title={t("dashboard.settings")}
            >
              <Settings className={`w-5 h-5 shrink-0 ${pathname === "/dashboard/settings" ? "text-white" : "text-slate-500"}`} />
              <span className="hidden lg:inline">{t("dashboard.settings")}</span>
              {pathname === "/dashboard/settings" && <ChevronRight className="w-4 h-4 ml-auto text-slate-300 hidden lg:block" />}
            </Button>
          </Link>
        </div>
      </ScrollArea>

      {/* Footer - Profile Dropdown & Back to POS */}
      <div className="p-2 lg:p-4 border-t border-slate-100 space-y-2">
        {/* Profile Dropdown with Language */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-center lg:justify-start gap-3 h-11 px-3 hover:bg-slate-50"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {session?.user?.name?.[0]?.toUpperCase() || 'M'}
              </div>
              <div className="hidden lg:flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-medium text-slate-700 truncate">
                  {session?.user?.name || 'Manager'}
                </span>
                <FlagIcon language={i18n.language} className="w-4 h-4 rounded-sm" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{session?.user?.name || 'Manager'}</p>
                <p className="text-xs text-slate-500">{session?.user?.email || 'Admin'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-slate-400 uppercase">
              {t("language.title")}
            </DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => changeLanguage('th')}
              className="cursor-pointer"
            >
              <FlagIcon language="th" className="w-5 h-5 rounded-sm mr-2" />
              {t("language.thai")}
              {i18n.language === 'th' && <Check className="w-4 h-4 ml-auto text-emerald-500" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => changeLanguage('en')}
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

        <Link href="/">
          <Button
            className="w-full h-10 lg:h-12 bg-slate-800 hover:bg-slate-900 text-white shadow-lg hover:shadow-xl transition-all gap-2 font-semibold"
            title={t("sidebar.backToPOS")}
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline">{t("sidebar.backToPOS")}</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
