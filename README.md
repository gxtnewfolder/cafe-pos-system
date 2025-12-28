# ☕ Pocket Café POS

A modern, responsive Point of Sale (POS) system tailored for cafes, built with Next.js, Prisma, and Tailwind CSS.

## ✨ Features

- **Point of Sale (POS)**
  - Beautiful, grid-based interface for products.
  - Categorized menu (Coffee, Non-Coffee, Bakery).
  - Cart management with quick quantity adjustments.
  - Member search and selection.
  - Real-time stock checking.

- **Dashboard**
  - **Overview**: Real-time sales stats, percentage growth, top products, and low stock warnings.
  - **Orders**: Transaction history with status filtering.
  - **Products**: Manage inventory, prices, and availability.
  - **Members**: CRM system to track customer points and spending.
  - **Settings**: Site-wide configuration and feature toggles.

- **Security & Performance**
  - NextAuth.js authentication.
  - Feature Flags for safe rollout of new capabilities.
  - Secure API endpoints with validation.
  - Responsive design optimized for Tablets (iPad) and Desktop.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Prisma ORM)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/cafe-pos-system.git
    cd cafe-pos-system
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Set up Environment Variables:
    Create a `.env` file in the root directory:
    ```env
    # Database (PostgreSQL)
    DATABASE_URL="postgresql://user:password@localhost:5432/cafe_pos?schema=public"

    # NextAuth
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-super-secret-key-change-this"

    # Uploads (if applicable)
    UPLOAD_DIR="public/uploads"
    ```

4.  Initialize Database:
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    # Seed initial data (if seed script exists)
    # npx prisma db seed
    ```

5.  Run the development server:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to start usage.

## 📂 Project Structure

```
├── app/
│   ├── api/             # API Routes
│   ├── components/      # Shared components (POSScreen, etc.)
│   ├── dashboard/       # Dashboard pages (layout, generic stats)
│   ├── login/           # Authentication pages
│   └── layout.tsx       # Root layout including Providers
├── components/
│   └── ui/              # Shadcn UI reusable components
├── lib/
│   ├── db.ts            # Prisma client instance
│   ├── features.tsx     # Feature Flag provider
│   └── store.tsx        # Global store context
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
