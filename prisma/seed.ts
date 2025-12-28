import prisma from '../lib/db'
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Start seeding...')

  // --- 1. สร้างสินค้า (Menu) ---
  const products = [
    // หมวด Coffee
    {
      name: 'Iced Americano',
      code: 'CF001',
      category: 'COFFEE',
      price: 55,
      image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80', // รูปฟรีจาก Unsplash
      is_active: true,
    },
    {
      name: 'Iced Latte',
      code: 'CF002',
      category: 'COFFEE',
      price: 65,
      image_url: 'https://images.unsplash.com/photo-1558500282-5959141b6916?auto=format&fit=crop&w=800&q=80',
      is_active: true,
    },
    {
      name: 'Hot Cappuccino',
      code: 'CF003',
      category: 'COFFEE',
      price: 60,
      image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
      is_active: true,
    },
    // หมวด Non-Coffee
    {
      name: 'Thai Tea (ชาไทย)',
      code: 'NC001',
      category: 'NON_COFFEE',
      price: 50,
      image_url: null, // ไม่มีรูปก็ไม่เป็นไร
      is_active: true,
    },
    {
      name: 'Matcha Latte',
      code: 'NC002',
      category: 'NON_COFFEE',
      price: 75,
      image_url: null,
      is_active: true,
    },
    // หมวด Bakery
    {
      name: 'Croissant Plain',
      code: 'BK001',
      category: 'BAKERY',
      price: 45,
      image_url: null,
      is_active: true,
    },
  ]

  for (const p of products) {
    // Upsert = ถ้ามี code นี้แล้วให้อัพเดท, ถ้าไม่มีให้สร้างใหม่
    await prisma.product.upsert({
      where: { code: p.code! }, // ! เพราะเรามั่นใจว่า code มีค่าใน seed
      update: p,
      create: p,
    })
  }
  console.log(`☕ Created ${products.length} products`)

  // --- 2. สร้างลูกค้าตัวอย่าง (CRM) ---
  const customers = [
    {
      phone: '0812345678',
      name: 'ลูกค้า ขาจร',
      points: 0,
      total_spent: 0,
    },
    {
      phone: '0999999999',
      name: 'สมชาย (VIP)',
      points: 15, // มีแต้มสะสมอยู่แล้ว 15 แต้ม (แลกฟรีได้แล้ว!)
      total_spent: 5600,
    },
  ]

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { phone: c.phone },
      update: c,
      create: c,
    })
  }
  console.log(`👥 Created ${customers.length} customers`)
  // 2. ✅ เพิ่มส่วนสร้าง User (Admin)
  const passwordHash = await bcrypt.hash('123456', 10); // รหัสผ่านคือ 123456
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: passwordHash,
      name: 'Manager',
      role: 'ADMIN',
    },
  });

  console.log({ admin });
  console.log('✅ Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })