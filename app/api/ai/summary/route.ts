import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { AI_CONFIG } from "@/lib/ai-config";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // 1. Get today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfToday, lte: endOfToday },
        status: "PAID"
      },
      include: { items: true }
    });

    const totalSales = todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalOrders = todayOrders.length;

    // 2. Get yesterday's data
    const yesterday = subDays(today, 1);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterdayObj = endOfDay(yesterday);

    const yesterdayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfYesterday, lte: endOfYesterdayObj },
        status: "PAID"
      }
    });

    const totalSalesYesterday = yesterdayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    // 3. Get top products for today
    const productSales: Record<string, number> = {};
    todayOrders.forEach(order => {
        order.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });
    const topProducts = Object.entries(productSales)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3);

    // 4. Time distribution
    const hours = todayOrders.map(o => new Date(o.createdAt).getHours());
    const morningCount = hours.filter(h => h >= 6 && h < 12).length;
    const afternoonCount = hours.filter(h => h >= 12 && h < 17).length;
    const eveningCount = hours.filter(h => h >= 17).length;

    // 5. Prepare AI Prompt from external config
    const prompt = AI_CONFIG.systemPrompt({
      totalSales,
      totalOrders,
      topProducts,
      morningCount,
      afternoonCount,
      eveningCount,
      totalSalesYesterday
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        summary: "ระบบกำลังรอเจ้าของร้านตั้งค่า API Key ในไฟล์ .env ครับ...",
        isReady: false
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.defaultModel}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", result.error?.message);
      return NextResponse.json({ 
        summary: "ขออภัยครับ เพื่อนคู่คิด AI ขัดข้องชั่วคราว ลองกดรีเฟรชอีกสักครู่นะครับ",
        isReady: true
      });
    }

    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      return NextResponse.json({ 
        summary: "วันนี้ AI ยังไม่พรอบระมวลผลข้อมูล ลองกดรีเฟรชอีกครั้งดูนะ",
        isReady: true
      });
    }

    return NextResponse.json({ summary: aiText.trim(), isReady: true });

  } catch (error: any) {
    console.error("AI Summary Critical Error:", error.message);
    return NextResponse.json({ 
      summary: "เกิดข้อผิดพลาดในการเชื่อมต่อระบบวิเคราะห์ข้อมูลครับ", 
      isReady: true
    }, { status: 500 });
  }
}
