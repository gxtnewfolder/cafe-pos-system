import prisma from "@/lib/db";

// Default features (same as in API)
const DEFAULT_FEATURES = [
  { id: "members", name: "ระบบสมาชิก", description: "จัดการข้อมูลสมาชิกและประวัติการสั่งซื้อ", enabled: true, is_addon: false },
  { id: "points", name: "ระบบแต้มสะสม", description: "สะสมแต้มและแลกของรางวัล", enabled: false, is_addon: false },
  { id: "receipts", name: "พิมพ์ใบเสร็จ", description: "ดาวน์โหลดใบเสร็จ PDF", enabled: true, is_addon: false },
  { id: "reports", name: "รายงานยอดขาย", description: "ดูสถิติและรายงานต่างๆ", enabled: true, is_addon: false },
  { id: "multi_branch", name: "หลายสาขา", description: "จัดการหลายสาขาในระบบเดียว", enabled: false, is_addon: true },
  { id: "inventory", name: "คลังสินค้า", description: "จัดการสต็อกและการสั่งซื้อ", enabled: false, is_addon: true },
];

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string | null;
  is_addon: boolean;
}

// Server-side function to get features
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    let features = await prisma.featureFlag.findMany({
      orderBy: { id: 'asc' }
    });

    // If no features exist, create defaults
    if (features.length === 0) {
      await prisma.featureFlag.createMany({
        data: DEFAULT_FEATURES
      });
      features = await prisma.featureFlag.findMany({
        orderBy: { id: 'asc' }
      });
    }

    return features;
  } catch (error) {
    console.error("Failed to fetch features:", error);
    // Return defaults on error
    return DEFAULT_FEATURES;
  }
}

// Helper to check if a feature is enabled
export function isFeatureEnabled(features: FeatureFlag[], featureId: string): boolean {
  const feature = features.find(f => f.id === featureId);
  return feature?.enabled ?? false;
}
