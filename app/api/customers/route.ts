import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/customers - ดึงลูกค้าทั้งหมด หรือค้นหาด้วยเบอร์โทร
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const search = searchParams.get("search");

  try {
    // ถ้ามี phone param = ค้นหาลูกค้าเฉพาะเจาะจง
    if (phone) {
      const customer = await prisma.customer.findUnique({
        where: { phone },
        include: {
          _count: { select: { orders: true } }
        }
      });
      return NextResponse.json(customer || null);
    }

    // ดึงลูกค้าทั้งหมด พร้อม filter
    const customers = await prisma.customer.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } }
        ]
      } : undefined,
      include: {
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// POST /api/customers - สมัครสมาชิกใหม่
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, name } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // เช็คว่ามีเบอร์นี้หรือยัง
    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: "Customer already exists" }, { status: 400 });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        phone,
        name: name || "คุณลูกค้า",
        points: 0,
        total_spent: 0,
      },
    });

    return NextResponse.json(newCustomer);
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}

// 3. อัพเดทข้อมูลสมาชิก
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, phone, name, points } = body;

    if (!id) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    // ถ้ามีการเปลี่ยนเบอร์โทร ต้องเช็คว่าเบอร์ใหม่ซ้ำกับคนอื่นหรือไม่
    if (phone) {
      const existingWithPhone = await prisma.customer.findFirst({
        where: {
          phone,
          NOT: { id }, // ไม่รวมตัวเอง
        },
      });

      if (existingWithPhone) {
        return NextResponse.json(
          { error: "เบอร์โทรนี้ถูกใช้งานแล้ว" },
          { status: 400 }
        );
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ...(phone && { phone }),
        ...(name && { name }),
        ...(points !== undefined && { points }),
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error: any) {
    console.error("Failed to update customer:", error);
    // P2025: Record to update not found.
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

// 4. ลบสมาชิก
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
  }

  try {
    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete customer:", error);
    // P2025: Record to delete not found.
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}