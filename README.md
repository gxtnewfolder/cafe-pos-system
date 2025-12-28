# ☕ Pocket Café POS

ระบบ Point of Sale สำหรับร้านกาแฟยุคใหม่ ออกแบบมาเพื่อใช้งานบน Tablet และ Desktop พัฒนาด้วย Next.js 16, Prisma ORM และ Tailwind CSS

---

## ✨ Features ทั้งหมด

### 🛒 Point of Sale (POS)
| Feature | คำอธิบาย |
|---------|----------|
| **Product Grid** | แสดงสินค้าเป็น Grid พร้อมรูปภาพ, ราคา และสถานะ Stock |
| **Category Tabs** | กรองสินค้าตามหมวดหมู่ (Coffee / Non-Coffee / Bakery) |
| **Smart Search** | ค้นหาสินค้าแบบ Real-time ด้วยชื่อ |
| **Cart Management** | เพิ่ม/ลด/ลบสินค้าในตะกร้า พร้อมสรุปยอดอัตโนมัติ |
| **Member Lookup** | ค้นหาสมาชิกด้วยเบอร์โทร เพื่อสะสมแต้มและยอดใช้จ่าย |
| **Stock Checking** | เช็คสต็อกแบบ Real-time ป้องกันขายสินค้าหมด |
| **Payment Dialog** | รองรับการชำระเงิน QR (PromptPay) และเงินสด พร้อมคำนวณเงินทอน |
| **Auto Receipt** | ออกใบเสร็จอัตโนมัติหลังชำระเงิน (QR Code) |

---

### 📊 Dashboard

#### Overview (หน้าแรก)
- **Stats Cards**: ยอดขายวันนี้, จำนวนออเดอร์, ยอดเฉลี่ยต่อบิล, เปรียบเทียบกับเมื่อวาน
- **Sales Chart**: กราฟยอดขายรายวัน (Recharts)
- **Top Products**: สินค้าขายดี
- **Low Stock Alerts**: แจ้งเตือนสินค้าใกล้หมด

#### Orders (ประวัติการขาย)
- **Order History**: ดูประวัติออเดอร์ทั้งหมด พร้อมรายละเอียดสินค้า
- **Status Filter**: กรองตามสถานะ (ทั้งหมด / วันนี้)
- **Search**: ค้นหาด้วย Order ID, ชื่อลูกค้า หรือ เบอร์โทร
- **Pagination**: แบ่งหน้าอัตโนมัติ ปรับจำนวนรายการตามขนาดหน้าจอ

#### Products (จัดการสินค้า)
- **Product List**: ดูรายการสินค้าทั้งหมดพร้อมรูปภาพและราคา
- **CRUD Operations**: เพิ่ม / แก้ไข / ลบสินค้า
- **Stock Management**: ปรับสต็อกง่ายๆ ด้วย Quick Dialog (+5, +10, +20, +50)
- **Toggle Active**: เปิด/ปิดการแสดงสินค้าในหน้า POS
- **Dynamic Pagination**: คำนวณรายการต่อหน้าตามขนาดหน้าจออัตโนมัติ

#### Members (สมาชิก / CRM)
- **Customer List**: ดูรายชื่อสมาชิกทั้งหมด พร้อมแต้มสะสมและยอดใช้จ่าย
- **Add/Edit/Delete**: จัดการข้อมูลสมาชิก
- **Points System**: ระบบแต้มสะสมอัตโนมัติ
- **Order Count**: ดูจำนวนออเดอร์ของสมาชิกแต่ละคน
- **Search**: ค้นหาด้วยชื่อหรือเบอร์โทร

#### Settings (ตั้งค่า)
- **Store Info**: ตั้งค่าชื่อร้าน, ที่อยู่, เบอร์โทร, Tax ID
- **Logo Upload**: อัปโหลดและแสดงผลโลโก้ร้าน
- **Feature Flags**: เปิด/ปิด Features ต่างๆ ของระบบ (สำหรับ Addon)

#### Reports (รายงานยอดขาย) 🆕
- **Sales Summary**: สรุปยอดขาย, จำนวนออเดอร์, ยอดเฉลี่ยต่อบิล
- **Period Filters**: กรองตามช่วงเวลา (วันนี้ / 7 วัน / 30 วัน)
- **Custom Date Range**: เลือกช่วงวันที่ต้องการเอง
- **Sales Chart**: กราฟยอดขายรายวัน (Recharts)
- **Top Products**: สินค้าขายดี Top 5 พร้อมยอดรายได้
- **Orders Table**: ตารางออเดอร์พร้อม Pagination
- **Excel Export**: ส่งออกรายงานเป็น Excel (.xlsx)
- **PDF Export**: ส่งออกรายงานเป็น PDF พร้อม Styling

---

### 🔐 Security & Authentication
| Feature | คำอธิบาย |
|---------|----------|
| **NextAuth.js** | ระบบ Login ด้วย Username/Password (Bcrypt Hash) |
| **Protected Routes** | Middleware ป้องกันเข้าถึงหน้า Dashboard โดยไม่ Login |
| **Role-Based** | รองรับ Role: ADMIN และ STAFF |
| **Secure API** | API Routes ตรวจสอบ Session ก่อนดำเนินการ |

---

### 🎨 UI/UX
- **Responsive Design**: ออกแบบมาสำหรับ iPad และ Desktop โดยเฉพาะ
- **Skeleton Loading**: แสดง Loading State สวยงามขณะโหลดข้อมูล
- **Toast Notifications**: แจ้งเตือนผลการทำงานด้วย Sonner
- **Modern Styling**: ใช้ Tailwind CSS 4 และ Shadcn UI
- **Dynamic Tables**: ตารางยืดหยุ่นเต็มหน้าจอ พร้อม Pagination อัตโนมัติ

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma 7](https://www.prisma.io/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **QR Code** | promptpay-qr, qrcode.react |
| **PDF** | jsPDF |
| **Excel** | xlsx |
| **Toast** | Sonner |

---

## 📂 Project Structure

```
cafe-pos-system/
├── app/
│   ├── api/                  # API Routes
│   │   ├── auth/             # NextAuth.js endpoints
│   │   ├── customers/        # Customer CRUD
│   │   ├── dashboard/        # Dashboard stats
│   │   ├── orders/           # Order management
│   │   ├── products/         # Product CRUD
│   │   ├── reports/          # Sales reports API
│   │   ├── settings/         # Store settings
│   │   └── upload/           # File upload
│   ├── components/           # App-specific components
│   │   └── POSScreen.tsx     # Main POS interface
│   ├── dashboard/            # Dashboard pages
│   │   ├── page.tsx          # Overview
│   │   ├── orders/           # Orders management
│   │   ├── products/         # Products management
│   │   ├── members/          # Members/CRM
│   │   ├── reports/          # Sales reports
│   │   └── settings/         # Settings
│   ├── login/                # Login page
│   └── layout.tsx            # Root layout
├── components/
│   └── ui/                   # Shadcn UI components
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── features.tsx          # Feature Flags provider
│   ├── store.tsx             # Global store context
│   ├── export-excel.ts       # Excel export utility
│   └── export-pdf.ts         # PDF export utility
├── prisma/
│   └── schema.prisma         # Database schema
└── public/                   # Static assets & uploads
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/cafe-pos-system.git
cd cafe-pos-system

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Initialize database
npx prisma generate
npx prisma migrate dev --name init

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the system.

---

## 🗃️ Database Schema

| Model | คำอธิบาย |
|-------|----------|
| `Product` | สินค้า/เมนู พร้อม Category, Price, Stock |
| `Customer` | สมาชิก พร้อมแต้มสะสมและยอดใช้จ่าย |
| `Order` | หัวบิล พร้อมสถานะ, ประเภทชำระเงิน |
| `OrderItem` | รายการสินค้าในบิล (Snapshot ราคา) |
| `User` | ผู้ใช้งานระบบ (Admin/Staff) |
| `StoreSettings` | ข้อมูลร้าน (ชื่อ, โลโก้, ที่อยู่) |
| `FeatureFlag` | เปิด/ปิด Features |

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for Café Owners
</p>
