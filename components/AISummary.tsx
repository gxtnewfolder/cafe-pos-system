"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, RefreshCw, MessageSquareQuote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function AISummary() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summary");
      const data = await res.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to fetch AI summary:", error);
      setSummary("ขออภัยครับ วันนี้เพื่อน AI ติดธุระนิดหน่อย ลองกดเรียกใหม่อีกครั้งนะครับ");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    fetchSummary();
  };

  if (!summary && !loading) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/30 border border-blue-100/50 rounded-2xl p-3 md:p-4 shadow-sm group hover:shadow-md hover:border-blue-200/50 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
            {loading || isRefreshing ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="h-4 w-1/2 bg-slate-100 rounded-full animate-pulse" />
            ) : (
              <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">
                {summary}
              </p>
            )}
          </div>

          {!loading && (
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 px-2 text-xs font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t("refresh")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
