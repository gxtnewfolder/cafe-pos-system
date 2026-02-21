"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, RefreshCw, MessageSquareQuote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AISummary() {
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
      setSummary("ขออภัยครับ วันนี้เพื่อน AI ติดธุระนิดหน่อย ลองกดดเรียกใหม่อีกครั้งนะครับ");
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

  return (
    <Card className="overflow-hidden border-0 shadow-sm relative bg-gradient-to-br from-slate-50 to-blue-50/20 group">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
         <Sparkles className="w-24 h-24 text-blue-600" />
      </div>

      <CardContent className="p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
            {loading || isRefreshing ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-white" />
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  AI Cafe Companion
                  <span className="hidden md:inline-block px-1.5 py-0.5 rounded-md bg-blue-100 text-[10px] text-blue-700 font-bold border border-blue-200">
                    BETA
                  </span>
               </h3>
               <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-full"
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
               >
                 <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
               </Button>
            </div>

            {loading ? (
              <div className="space-y-2 py-1">
                <div className="h-4 w-[90%] bg-blue-100/50 rounded-full animate-pulse" />
                <div className="h-4 w-[75%] bg-blue-100/50 rounded-full animate-pulse" />
              </div>
            ) : (
              <div className="relative">
                <p className="text-sm md:text-base leading-relaxed text-slate-600 pr-4 font-medium italic">
                  "{summary}"
                </p>
                <div className="absolute -left-1.5 -top-1 opacity-10">
                   <MessageSquareQuote className="w-4 h-4 text-blue-800" />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
