'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Thai font
Font.register({
  family: 'Sarabun',
  src: '/fonts/Sarabun-Regular.ttf',
});

// Styles for thermal receipt (80mm width)
const styles = StyleSheet.create({
  page: { 
    padding: 16, 
    fontSize: 9, 
    fontFamily: 'Sarabun',
    backgroundColor: '#fff',
  },
  // Header
  header: { 
    textAlign: 'center', 
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'dashed',
  },
  storeName: { 
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 1,
  },
  storeTagline: {
    fontSize: 8,
    color: '#666',
    marginBottom: 6,
  },
  storeInfo: {
    fontSize: 7,
    color: '#444',
    lineHeight: 1.4,
  },
  // Order Info
  orderInfo: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'dashed',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  orderLabel: {
    fontSize: 8,
    color: '#666',
  },
  orderValue: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Items Header
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  itemsHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Items container
  itemsContainer: {
    minHeight: 80,
    marginBottom: 12,
  },
  // Item Row
  itemRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 3,
    alignItems: 'center',
  },
  itemName: {
    width: '50%',
    fontSize: 9,
  },
  itemQty: {
    width: '15%',
    fontSize: 9,
    textAlign: 'center',
  },
  itemPrice: {
    width: '17%',
    fontSize: 8,
    textAlign: 'right',
    color: '#666',
  },
  itemTotal: {
    width: '18%',
    fontSize: 9,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  // Totals Section
  totalsSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'dashed',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: '#444',
  },
  totalValue: {
    fontSize: 9,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Payment Info
  paymentSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    borderTopStyle: 'dashed',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  paymentLabel: {
    fontSize: 8,
    color: '#666',
  },
  paymentValue: {
    fontSize: 8,
  },
  // Footer
  footer: { 
    marginTop: 16, 
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    borderTopStyle: 'dashed',
  },
  thankYou: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 7,
    color: '#888',
    marginBottom: 2,
  },
  starLine: {
    textAlign: 'center',
    fontSize: 8,
    letterSpacing: 2,
    color: '#aaa',
    marginVertical: 4,
  },
});

interface ReceiptProps {
  orderId: string;
  date: Date;
  items: any[];
  total: number;
}

export const Receipt = ({ orderId, date, items }: ReceiptProps) => {
  // Calculate total from items
  const calculatedTotal = items.reduce(
    (sum, item) => sum + (Number(item.product.price) * item.quantity),
    0
  );
  const subtotal = calculatedTotal;
  const grandTotal = subtotal;
  const itemCount = items.reduce((a, b) => a + b.quantity, 0);

  // Calculate dynamic height based on items (base height + per item)
  const baseHeight = 320; // Minimum height for header, totals, footer
  const itemHeight = 18; // Height per item row
  const calculatedHeight = baseHeight + (items.length * itemHeight);

  return (
    <Document>
      {/* Dynamic height - no page breaks */}
      <Page size={[226, calculatedHeight]} style={styles.page} wrap={false}>
        {/* Store Header */}
        <View style={styles.header}>
          <Text style={styles.storeName}>POCKET CAFÉ</Text>
          <Text style={styles.storeTagline}>Premium Coffee & Bakery</Text>
          <Text style={styles.storeInfo}>123 Coffee Street, Bangkok 10110</Text>
          <Text style={styles.storeInfo}>Tel: 02-123-4567</Text>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Receipt No:</Text>
            <Text style={styles.orderValue}>#{orderId.substring(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Date:</Text>
            <Text style={styles.orderValue}>{date.toLocaleDateString('th-TH')}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Time:</Text>
            <Text style={styles.orderValue}>{date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>

        {/* Items Header */}
        <View style={styles.itemsHeader}>
          <Text style={[styles.itemsHeaderText, { width: '50%' }]}>Item</Text>
          <Text style={[styles.itemsHeaderText, { width: '15%', textAlign: 'center' }]}>Qty</Text>
          <Text style={[styles.itemsHeaderText, { width: '17%', textAlign: 'right' }]}>Price</Text>
          <Text style={[styles.itemsHeaderText, { width: '18%', textAlign: 'right' }]}>Total</Text>
        </View>

        {/* Items List */}
        <View style={styles.itemsContainer}>
          {items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemQty}>{item.quantity}</Text>
              <Text style={styles.itemPrice}>{Number(item.product.price).toFixed(0)}</Text>
              <Text style={styles.itemTotal}>{(Number(item.product.price) * item.quantity).toFixed(0)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal ({itemCount} items)</Text>
            <Text style={styles.totalValue}>฿{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT (7%)</Text>
            <Text style={styles.totalValue}>-</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>฿{grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <Text style={styles.paymentValue}>PromptPay QR</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Status:</Text>
            <Text style={[styles.paymentValue, { fontWeight: 'bold' }]}>PAID</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYou}>Thank You!</Text>
          <Text style={styles.footerText}>Please come again</Text>
          <Text style={styles.starLine}>* * * * * * * * * *</Text>
          <Text style={styles.footerText}>Follow us @pocketcafe</Text>
        </View>
      </Page>
    </Document>
  );
};