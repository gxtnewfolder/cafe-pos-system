import * as XLSX from "xlsx";

interface OrderData {
  id: string;
  createdAt: string;
  customer: string;
  items: string;
  total: number;
  payment: string;
  status: string;
}

interface SummaryData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  dateFrom: string;
  dateTo: string;
}

export function generateExcel(
  orders: OrderData[],
  summary: SummaryData,
  topProducts: { name: string; quantity: number; revenue: number }[]
) {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ["Sales Report Summary"],
    [""],
    ["Period", `${new Date(summary.dateFrom).toLocaleDateString("th-TH")} - ${new Date(summary.dateTo).toLocaleDateString("th-TH")}`],
    ["Total Sales", `฿${summary.totalSales.toLocaleString()}`],
    ["Total Orders", summary.totalOrders],
    ["Average Order Value", `฿${summary.averageOrderValue.toFixed(2)}`],
    [""],
    ["Top Products"],
    ["Product", "Quantity Sold", "Revenue"],
    ...topProducts.map((p) => [p.name, p.quantity, `฿${p.revenue.toLocaleString()}`]),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Orders Sheet
  const ordersData = [
    ["Order ID", "Date/Time", "Customer", "Items", "Total", "Payment", "Status"],
    ...orders.map((order) => [
      order.id.slice(0, 8),
      new Date(order.createdAt).toLocaleString("th-TH"),
      order.customer,
      order.items,
      order.total,
      order.payment,
      order.status,
    ]),
  ];
  const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
  
  // Set column widths
  ordersSheet["!cols"] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 15 },
    { wch: 40 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];
  
  XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

export function downloadExcel(
  orders: OrderData[],
  summary: SummaryData,
  topProducts: { name: string; quantity: number; revenue: number }[]
) {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ["Sales Report Summary"],
    [""],
    ["Period", `${new Date(summary.dateFrom).toLocaleDateString("th-TH")} - ${new Date(summary.dateTo).toLocaleDateString("th-TH")}`],
    ["Total Sales", `฿${summary.totalSales.toLocaleString()}`],
    ["Total Orders", summary.totalOrders],
    ["Average Order Value", `฿${summary.averageOrderValue.toFixed(2)}`],
    [""],
    ["Top Products"],
    ["Product", "Quantity Sold", "Revenue"],
    ...topProducts.map((p) => [p.name, p.quantity, `฿${p.revenue.toLocaleString()}`]),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Orders Sheet
  const ordersData = [
    ["Order ID", "Date/Time", "Customer", "Items", "Total", "Payment", "Status"],
    ...orders.map((order) => [
      order.id.slice(0, 8),
      new Date(order.createdAt).toLocaleString("th-TH"),
      order.customer,
      order.items,
      order.total,
      order.payment,
      order.status,
    ]),
  ];
  const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
  ordersSheet["!cols"] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 15 },
    { wch: 40 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");

  // Trigger download
  XLSX.writeFile(workbook, `sales-report-${new Date().toISOString().split("T")[0]}.xlsx`);
}
