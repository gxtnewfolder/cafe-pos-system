import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { startOfDay, endOfDay, subDays } from "date-fns";

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

    // 4. Time distribution (Simple)
    const hours = todayOrders.map(o => new Date(o.createdAt).getHours());
    const morningCount = hours.filter(h => h >= 6 && h < 12).length;
    const afternoonCount = hours.filter(h => h >= 12 && h < 17).length;
    const eveningCount = hours.filter(h => h >= 17).length;

    // 5. Prepare AI Prompt
    const prompt = `
      คุณคือ "AI เพื่อนคู่คิด" ของร้านคาเฟ่เล็กๆ ในครอบครัว
      ภารกิจ: สรุปภาพรวมวันนี้ด้วยน้ำเสียง อบอุ่น ให้กำลังใจ และเป็นกันเอง (แบบครอบครัว)
      
      ข้อมูลวันนี้:
      - ยอดขาย: ${totalSales.toLocaleString()} บาท (${totalOrders} ออเดอร์)
      - สินค้าขายดี: ${topProducts.length > 0 ? topProducts.map(p => `${p.name} (${p.qty})`).join(", ") : "ยังไม่มีออเดอร์"}
      - คนเยอะช่วง: เช้า(${morningCount}), บ่าย(${afternoonCount}), เย็น(${eveningCount})
      
      ข้อมูลเมื่อวาน:
      - ยอดขาย: ${totalSalesYesterday.toLocaleString()} บาท
      
      กฎเหล็ก:
      1. ต้องพูดภาษาไทยที่อบอุ่นเหมือนลูกหลานคุยกับเจ้าของร้าน
      2. ต้องเปรียบเทียบกับเมื่อวานเสมอ (เช่น ดีขึ้น หรือ ให้กำลังใจถ้าลดลง)
      3. ห้ามตัดจบกลางคั้น! ต้องแน่ใจว่าประโยคสุดท้ายจบสมบูรณ์ (มีจุดทศนิยมหรือลงท้ายด้วย ครับ/นะครับ)
      4. ความยาวไม่เกิน 3-4 ประโยคสั้นๆ แต่ต้องได้ใจความ
      5. หากเป็นช่วงเช้าที่ยังไม่มีขาย ให้เน้นให้กำลังใจ "ขอให้วันนี้เป็นวันที่ดี"
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        summary: "ระบบกำลังรอการตั้งค่า API Key เพื่อเปิดใช้งาน AI สรุปข้อมูลอัจฉริยะครับ...",
        isReady: false
      });
    }

    // ใช้ gemini-3.0-flash ตามที่แนะนำ (เวอร์ชันล่าสุดที่แรงและเสถียร)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024, // เพิ่มโควต้าตัวอักษรให้เยอะขึ้น
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Response:", result);
      return NextResponse.json({ 
        summary: `AI ขัดข้องชั่วคราว (${result.error?.message || response.statusText})`,
        isReady: true,
        debug: result.error
      });
    }

    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      console.warn("Gemini API No Candidates:", result);
      return NextResponse.json({ 
        summary: "AI ไม่สามารถสรุปได้ในขณะนี้ (อาจติดกรองความปลอดภัย) ลองกดรีเฟรชอีกครั้งดูนะ",
        isReady: true,
        debug: result
      });
    }

    return NextResponse.json({ summary: aiText.trim(), isReady: true });

  } catch (error: any) {
    console.error("AI Summary API Catch:", error);
    return NextResponse.json({ 
      summary: "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ครับ", 
      isReady: true,
      error: error.message 
    }, { status: 500 });
  }
}
