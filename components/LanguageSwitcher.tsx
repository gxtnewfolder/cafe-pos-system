"use client";

import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setStoredLanguage } from "@/lib/tolgee";

const languages = [
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || "th";

  const handleLanguageChange = (langCode: string) => {
    setStoredLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  const currentLanguage = languages.find((l) => l.code === currentLang);
  const otherLanguage = languages.find((l) => l.code !== currentLang);

  // Simple toggle button (no dropdown needed)
  return (
    <Button
      variant="ghost"
      size={compact ? "icon" : "default"}
      className={`${compact ? "h-8 w-8" : "h-9 gap-2"} text-slate-600 hover:text-slate-900 hover:bg-slate-100`}
      title={t("language.title", "เปลี่ยนภาษา")}
      onClick={() => otherLanguage && handleLanguageChange(otherLanguage.code)}
    >
      <Globe className="h-4 w-4" />
      {!compact && (
        <span className="text-sm">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
      )}
    </Button>
  );
}
