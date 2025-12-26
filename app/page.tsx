import prisma from "@/lib/db";
import POSScreen from "./components/POSScreen"; // Import ตัวที่เราเพิ่งสร้าง

// ดึงข้อมูลฝั่ง Server
async function getProducts() {
  const products = await prisma.product.findMany({
    where: { is_active: true },
    orderBy: { category: 'desc' },
  });

  return products.map((p) => ({
    ...p,
    price: Number(p.price) 
  }));
}

export default async function Page() {
  const products = await getProducts();

  // ส่งต่อให้ Client Component ทำงาน
  return <POSScreen products={products} />;
}