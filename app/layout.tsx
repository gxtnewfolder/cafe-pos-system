import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 👇 1. Import จาก sonner แทน
import { Toaster } from "@/components/ui/sonner"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pocket Café POS",
  description: "POS System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" /> 
      </body>
    </html>
  );
}