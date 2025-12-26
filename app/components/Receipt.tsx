'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// ⚠️ หมายเหตุ: การแสดงผลภาษาไทย
// React-PDF ต้องการไฟล์ Font (.ttf) เพื่อแสดงภาษาไทย
// ถ้าต้องการใช้จริง ให้ดาวน์โหลดฟอนต์ (เช่น Sarabun) มาใส่ในโปรเจกต์ public/fonts/
// แล้ว Uncomment บรรทัดข้างล่างนี้ครับ:

// Font.register({
//   family: 'Sarabun',
//   src: '/fonts/Sarabun-Regular.ttf',
// });

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 10, fontFamily: 'Helvetica' }, // ถ้ามี font ไทย ให้เปลี่ยน Helvetica เป็น 'Sarabun'
  header: { textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  meta: { fontSize: 8, color: '#666', marginBottom: 10, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 4 },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 8, color: '#888' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#000' },
  totalText: { fontSize: 12, fontWeight: 'bold' }
});

interface ReceiptProps {
  orderId: string;
  date: Date;
  items: any[];
  total: number;
}

export const Receipt = ({ orderId, date, items, total }: ReceiptProps) => (
  <Document>
    <Page size={[226, 400]} style={styles.page}> {/* ขนาดประมาณกระดาษใบเสร็จ 80mm */}
      <View style={styles.header}>
        <Text style={styles.title}>Pocket Cafe</Text>
        <Text style={styles.meta}>Receipt / Tax Invoice</Text>
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text>Order: {orderId.substring(0, 8)}</Text>
        <Text>Date: {date.toLocaleDateString()} {date.toLocaleTimeString()}</Text>
      </View>

      {/* Items */}
      <View>
        {items.map((item, i) => (
          <View key={i} style={styles.row}>
            {/* ตัดชื่อให้สั้นลงถ้าไม่มี font ไทย */}
            <Text style={{ width: '60%' }}>{item.product.name}</Text> 
            <Text>x{item.quantity}</Text>
            <Text>{(item.product.price * item.quantity).toFixed(0)}</Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalText}>TOTAL</Text>
        <Text style={styles.totalText}>{total.toLocaleString()}</Text>
      </View>

      <Text style={styles.footer}>Thank you! Please come again.</Text>
    </Page>
  </Document>
);