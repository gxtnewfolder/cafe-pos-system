import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// 1. ค้นหาลูกค้าด้วยเบอร์โทร
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { phone },
    });
    
    // ถ้าไม่เจอ ส่ง null กลับไป (Frontend จะได้รู้ว่าต้องสมัครใหม่)
    return NextResponse.json(customer || null);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// 2. สมัครสมาชิกใหม่
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, name } = body;

    // เช็คว่ามีเบอร์นี้หรือยัง (กันเหนียว)
    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: "Customer already exists" }, { status: 400 });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        phone,
        name: name || "คุณลูกค้า", // ถ้าไม่ใส่ชื่อ ให้ default ไว้
        points: 0,
        total_spent: 0,
      },
    });

    return NextResponse.json(newCustomer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}