"use client";

import { jsPDF } from "jspdf";
import { ReportData } from "@/app/dashboard/reports/page";

// Color palette
const colors = {
  primary: { r: 37, g: 99, b: 235 },      // blue-600
  emerald: { r: 16, g: 185, b: 129 },      // emerald-500
  slate800: { r: 30, g: 41, b: 59 },
  slate600: { r: 71, g: 85, b: 105 },
  slate500: { r: 100, g: 116, b: 139 },
  slate400: { r: 148, g: 163, b: 184 },
  slate100: { r: 241, g: 245, b: 249 },
  slate50: { r: 248, g: 250, b: 252 },
  white: { r: 255, g: 255, b: 255 },
  orange: { r: 249, g: 115, b: 22 },
  violet: { r: 139, g: 92, b: 246 },
};

export function generateSalesPDF(data: ReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // ============ HEADER SECTION ============
  // Header background
  doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Title
  doc.setFontSize(24);
  doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
  doc.text("SALES REPORT", pageWidth / 2, 22, { align: "center" });

  // Date Range subtitle
  doc.setFontSize(11);
  const dateFrom = new Date(data.summary.dateFrom).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateTo = new Date(data.summary.dateTo).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`${dateFrom} - ${dateTo}`, pageWidth / 2, 35, { align: "center" });

  y = 60;

  // ============ SUMMARY CARDS SECTION ============
  const cardWidth = (pageWidth - margin * 2 - 10) / 3;
  const cardHeight = 30;
  const cardY = y;

  // Card 1: Total Sales
  doc.setFillColor(colors.emerald.r, colors.emerald.g, colors.emerald.b);
  doc.roundedRect(margin, cardY, cardWidth, cardHeight, 3, 3, "F");
  doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
  doc.setFontSize(9);
  doc.text("TOTAL SALES", margin + cardWidth / 2, cardY + 10, { align: "center" });
  doc.setFontSize(16);
  doc.text(`${data.summary.totalSales.toLocaleString()} THB`, margin + cardWidth / 2, cardY + 22, { align: "center" });

  // Card 2: Total Orders
  const card2X = margin + cardWidth + 5;
  doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 3, 3, "F");
  doc.setFontSize(9);
  doc.text("TOTAL ORDERS", card2X + cardWidth / 2, cardY + 10, { align: "center" });
  doc.setFontSize(16);
  doc.text(data.summary.totalOrders.toString(), card2X + cardWidth / 2, cardY + 22, { align: "center" });

  // Card 3: Average Order Value
  const card3X = margin + (cardWidth + 5) * 2;
  doc.setFillColor(colors.violet.r, colors.violet.g, colors.violet.b);
  doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 3, 3, "F");
  doc.setFontSize(9);
  doc.text("AVG ORDER VALUE", card3X + cardWidth / 2, cardY + 10, { align: "center" });
  doc.setFontSize(16);
  doc.text(`${data.summary.averageOrderValue.toFixed(0)} THB`, card3X + cardWidth / 2, cardY + 22, { align: "center" });

  y = cardY + cardHeight + 15;

  // ============ TOP PRODUCTS SECTION ============
  // Section header with accent bar
  doc.setFillColor(colors.orange.r, colors.orange.g, colors.orange.b);
  doc.rect(margin, y, 3, 12, "F");
  doc.setFontSize(13);
  doc.setTextColor(colors.slate800.r, colors.slate800.g, colors.slate800.b);
  doc.text("Top 5 Best Selling Products", margin + 8, y + 8);
  y += 18;

  if (data.topProducts.length > 0) {
    data.topProducts.forEach((product, index) => {
      // Rank badge colors
      const rankColors = [
        { r: 234, g: 179, b: 8 },    // gold (yellow-500)
        { r: 156, g: 163, b: 175 },   // silver (gray-400)
        { r: 234, g: 88, b: 12 },     // bronze (orange-600)
        { r: 226, g: 232, b: 240 },   // slate-200
        { r: 226, g: 232, b: 240 },   // slate-200
      ];
      const rankColor = rankColors[index] || rankColors[4];
      
      // Rank badge (small rounded rectangle)
      doc.setFillColor(rankColor.r, rankColor.g, rankColor.b);
      doc.roundedRect(margin + 3, y - 4, 12, 8, 2, 2, "F");
      
      // Rank number
      doc.setTextColor(index < 3 ? 255 : colors.slate600.r, index < 3 ? 255 : colors.slate600.g, index < 3 ? 255 : colors.slate600.b);
      doc.setFontSize(9);
      doc.text((index + 1).toString(), margin + 9, y + 1, { align: "center" });

      // Product name
      doc.setTextColor(colors.slate800.r, colors.slate800.g, colors.slate800.b);
      doc.setFontSize(10);
      doc.text(product.name, margin + 22, y + 1);

      // Quantity & Revenue
      doc.setTextColor(colors.slate500.r, colors.slate500.g, colors.slate500.b);
      doc.text(`${product.quantity} pcs`, 110, y + 1);
      doc.setTextColor(colors.emerald.r, colors.emerald.g, colors.emerald.b);
      doc.text(`${product.revenue.toLocaleString()} THB`, 150, y + 1);

      y += 12;
    });
  } else {
    doc.setTextColor(colors.slate400.r, colors.slate400.g, colors.slate400.b);
    doc.setFontSize(10);
    doc.text("No data available", margin + 20, y + 3);
    y += 10;
  }

  y += 10;

  // ============ ORDERS TABLE SECTION ============
  // Section header with accent bar
  doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.rect(margin, y, 3, 12, "F");
  doc.setFontSize(13);
  doc.setTextColor(colors.slate800.r, colors.slate800.g, colors.slate800.b);
  doc.text("Order Details", margin + 8, y + 8);
  y += 18;

  // Table Header
  const tableWidth = pageWidth - margin * 2;
  doc.setFillColor(colors.slate800.r, colors.slate800.g, colors.slate800.b);
  doc.roundedRect(margin, y - 5, tableWidth, 10, 2, 2, "F");
  
  doc.setFontSize(8);
  doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
  doc.text("Order ID", margin + 5, y + 1);
  doc.text("Date", margin + 35, y + 1);
  doc.text("Customer", margin + 65, y + 1);
  doc.text("Items", margin + 100, y + 1);
  doc.text("Total", margin + 140, y + 1);
  doc.text("Payment", margin + 165, y + 1);
  y += 10;

  // Table Rows
  doc.setFontSize(8);
  const maxRows = Math.min(data.orders.length, 20);

  for (let i = 0; i < maxRows; i++) {
    const order = data.orders[i];

    // Alternate row background
    if (i % 2 === 0) {
      doc.setFillColor(colors.slate50.r, colors.slate50.g, colors.slate50.b);
      doc.rect(margin, y - 4, tableWidth, 8, "F");
    }

    doc.setTextColor(colors.slate600.r, colors.slate600.g, colors.slate600.b);
    doc.text(`#${order.id.slice(0, 8)}`, margin + 5, y);
    doc.text(
      new Date(order.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      }),
      margin + 35,
      y
    );
    doc.text(order.customer.length > 10 ? order.customer.slice(0, 10) + ".." : order.customer, margin + 65, y);
    doc.text(order.items.length > 15 ? order.items.slice(0, 15) + ".." : order.items, margin + 100, y);
    
    doc.setTextColor(colors.emerald.r, colors.emerald.g, colors.emerald.b);
    doc.text(`${order.total.toLocaleString()}`, margin + 140, y);
    
    doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.text(order.payment, margin + 165, y);
    
    y += 8;

    // Check for page break
    if (y > 265) {
      doc.addPage();
      y = margin;
      doc.setFillColor(colors.slate800.r, colors.slate800.g, colors.slate800.b);
      doc.roundedRect(margin, y - 5, tableWidth, 10, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(colors.white.r, colors.white.g, colors.white.b);
      doc.text("Order ID", margin + 5, y + 1);
      doc.text("Date", margin + 35, y + 1);
      doc.text("Customer", margin + 65, y + 1);
      doc.text("Items", margin + 100, y + 1);
      doc.text("Total", margin + 140, y + 1);
      doc.text("Payment", margin + 165, y + 1);
      y += 10;
    }
  }

  if (data.orders.length > maxRows) {
    y += 5;
    doc.setFillColor(colors.slate100.r, colors.slate100.g, colors.slate100.b);
    doc.roundedRect(margin, y - 4, tableWidth, 10, 2, 2, "F");
    doc.setFontSize(9);
    doc.setTextColor(colors.slate500.r, colors.slate500.g, colors.slate500.b);
    doc.text(
      `Showing ${maxRows} of ${data.orders.length} orders. Export to Excel for complete data.`,
      pageWidth / 2,
      y + 2,
      { align: "center" }
    );
  }

  // ============ FOOTER ============
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(colors.slate100.r, colors.slate100.g, colors.slate100.b);
    doc.setLineWidth(0.5);
    doc.line(margin, 282, pageWidth - margin, 282);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(colors.slate400.r, colors.slate400.g, colors.slate400.b);
    doc.text(
      `Generated: ${new Date().toLocaleString("en-US")}`,
      margin,
      288
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      288,
      { align: "right" }
    );
  }

  // Save the PDF
  const filename = `sales-report-${dateFrom.replace(/[\s,]/g, "-")}-to-${dateTo.replace(/[\s,]/g, "-")}.pdf`;
  doc.save(filename);
}

export function downloadPDF(data: ReportData): void {
  try {
    generateSalesPDF(data);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
