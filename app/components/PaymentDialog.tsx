"use client";

import { useState, useEffect } from "react";
import generatePayload from "promptpay-qr";
import { QRCodeCanvas } from "qrcode.react";
import { Loader2, CheckCircle2, Printer } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Receipt } from "./Receipt";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirm: () => void;
  isProcessing: boolean;
  successData?: {
    orderId: string;
    items: any[];
    date: Date;
  } | null;
}

export default function PaymentDialog({
  isOpen,
  onClose,
  totalAmount,
  onConfirm,
  isProcessing,
  successData,
}: PaymentDialogProps) {
  const PROMPTPAY_ID = "0812345678"; // ใส่เบอร์จริงของคุณ
  const [qrCodePayload, setQrCodePayload] = useState("");

  const isSuccess = !!successData;

  useEffect(() => {
    if (isOpen && totalAmount > 0 && !isSuccess) {
      const payload = generatePayload(PROMPTPAY_ID, { amount: totalAmount });
      setQrCodePayload(payload);
    }
  }, [isOpen, totalAmount, isSuccess]);

  const handleClose = () => {
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-md rounded-2xl max-h-[90vh] overflow-y-auto gap-6">
        {/* --- 1. หน้า Success (แสดงหลังจ่ายเงิน) --- */}
        {isSuccess && successData ? (
          <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-300">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-green-700 mb-2">
              Payment Successful!
            </DialogTitle>
            <p className="text-slate-500 mb-6">บันทึกยอดขายเรียบร้อยแล้ว</p>

            <div className="flex flex-col gap-3 w-full">
              {/* ปุ่ม Download PDF */}
              <PDFDownloadLink
                document={
                  <Receipt
                    orderId={successData.orderId}
                    date={successData.date}
                    items={successData.items}
                    total={totalAmount}
                  />
                }
                fileName={`receipt-${successData.orderId.substring(0, 8)}.pdf`}
                className="w-full"
              >
                {/* @ts-ignore */}
                {({ loading }) => (
                  <Button
                    className="w-full h-12 text-lg gap-2"
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Printer className="w-5 h-5" />
                    )}
                    {loading ? "Generating..." : "Print / Download Receipt"}
                  </Button>
                )}
              </PDFDownloadLink>

              <Button
                onClick={handleClose}
                className="w-full h-12 text-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                ปิดหน้าต่าง (Next Order)
              </Button>
            </div>
          </div>
        ) : (
          /* --- 2. หน้า QR Code (ปกติ) --- */
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl sm:text-2xl font-bold">
                Payment
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                สแกน QR Code เพื่อชำระเงิน
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center space-y-6">
              {/* กรอบ QR Code */}
              <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-center">
                {qrCodePayload && (
                  <QRCodeCanvas
                    value={qrCodePayload}
                    size={200} // ขนาด 200px กำลังดีกับมือถือส่วนใหญ่
                    level={"L"}
                    className="w-full h-auto max-w-[200px]" // Responsive QR
                  />
                )}
              </div>

              <div className="text-center space-y-1">
                <p className="text-slate-500 text-sm">ยอดชำระทั้งหมด</p>
                <p className="text-4xl font-bold text-blue-600">
                  ฿{totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  PromptPay: {PROMPTPAY_ID}
                </p>
              </div>
            </div>

            {/* ✅ แก้ไขจุดที่ 2: ปุ่มกด
          - flex-col: เรียงแนวตั้งเสมอ (ทั้งมือถือและคอม) เพื่อให้ปุ่มใหญ่ กดง่าย
          - gap-3: เว้นระยะห่างปุ่ม
        */}
            <DialogFooter className="flex flex-col gap-3 sm:flex-col sm:space-x-0 w-full">
              <Button
                className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-md active:scale-[0.98] transition-all"
                onClick={onConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-6 w-6" />
                    ยืนยันการชำระเงิน (Paid)
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 text-base border-slate-300 hover:bg-slate-50 text-slate-600"
                onClick={onClose}
                disabled={isProcessing}
              >
                ยกเลิก
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
