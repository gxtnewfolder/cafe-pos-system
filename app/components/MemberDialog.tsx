'use client';

import { useState } from "react";
import { User, Search, UserPlus, X, Phone, Sparkles, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Customer } from "@/app/generated/prisma/client";
import { useFeatures } from "@/lib/features";

interface MemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerSelected: (customer: Customer) => void;
}

export default function MemberDialog({ isOpen, onClose, onCustomerSelected }: MemberDialogProps) {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [newName, setNewName] = useState("");
  const { isEnabled } = useFeatures();

  // ฟังก์ชันค้นหาสมาชิก
  const handleSearch = async () => {
    if (phone.length < 10) return toast.error("เบอร์โทรไม่ครบ 10 หลัก");
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers?phone=${phone}`);
      const data = await res.json();

      if (data) {
        // เจอสมาชิก -> เลือกเลย
        onCustomerSelected(data);
        toast.success(`ยินดีต้อนรับ คุณ${data.name}`, {
          icon: '👋',
          description: isEnabled("points") ? `คุณมี ${data.points.toLocaleString()} แต้มสะสม` : undefined
        });
        handleClose();
      } else {
        // ไม่เจอ -> เข้าโหมดสมัครสมาชิก
        setIsRegisterMode(true);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันสมัครสมาชิก
  const handleRegister = async () => {
    if (!newName) return toast.error("กรุณาใส่ชื่อลูกค้า");

    setIsLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name: newName }),
      });
      
      if (!res.ok) throw new Error();

      const newCustomer = await res.json();
      onCustomerSelected(newCustomer);
      toast.success("สมัครสมาชิกสำเร็จ!", {
        icon: '🎉',
        description: "ยินดีต้อนรับสมาชิกใหม่!"
      });
      handleClose();

    } catch (error) {
      toast.error("ไม่สามารถสมัครสมาชิกได้ (เบอร์อาจซ้ำ)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPhone("");
    setNewName("");
    setIsRegisterMode(false);
    onClose();
  };

  // Numpad Logic
  const addDigit = (digit: string) => {
    if (phone.length < 10) setPhone(prev => prev + digit);
  };
  const backspace = () => setPhone(prev => prev.slice(0, -1));

  // Format phone number display
  const formatPhone = (p: string) => {
    if (p.length <= 3) return p;
    if (p.length <= 6) return `${p.slice(0, 3)}-${p.slice(3)}`;
    return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-2xl shadow-smooth-lg border-0 p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>
            {isRegisterMode ? "สมัครสมาชิกใหม่" : "ค้นหาสมาชิก"}
          </DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 p-5 text-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            {isRegisterMode ? (
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-center">
            {isRegisterMode ? "สมัครสมาชิกใหม่" : "ค้นหาสมาชิก"}
          </h2>
          <p className="text-sm text-white/80 text-center mt-1">
            {isRegisterMode 
              ? "กรอกชื่อเพื่อสมัครสมาชิก" 
              : "กรอกเบอร์โทรศัพท์มือถือ"}
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Phone Display */}
          <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl text-2xl font-bold tracking-wider text-slate-700 min-h-[60px] flex items-center justify-center border border-slate-200/50 shadow-inner">
            {phone ? (
              <span className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-slate-400" />
                {formatPhone(phone)}
              </span>
            ) : (
              <span className="text-slate-300 text-lg">กรอกเบอร์โทร 10 หลัก</span>
            )}
          </div>

          {isRegisterMode ? (
            <div className="space-y-4 animate-in fade-in zoom-in">
              {/* Points Banner */}
              {isEnabled("points") && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">สิทธิพิเศษสำหรับสมาชิก</p>
                    <p className="text-xs text-amber-600">สะสมแต้มทุกการสั่งซื้อ</p>
                  </div>
                </div>
              )}
              
              <Input 
                placeholder="ชื่อเล่น / ชื่อลูกค้า" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                className="text-lg text-center h-14 border-2 border-slate-200 focus:border-sky-400 rounded-xl"
                autoFocus
              />
              <Button 
                className="w-full h-14 text-lg bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] rounded-xl" 
                onClick={handleRegister} 
                disabled={isLoading || !newName}
              >
                <Sparkles className="mr-2 w-5 h-5" /> ยืนยันการสมัคร
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-sky-500 hover:text-sky-700" 
                onClick={() => setIsRegisterMode(false)}
              >
                ← กลับไปหน้าค้นหา
              </Button>
            </div>
          ) : (
            <>
              {/* Numpad Grid */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button 
                    key={num} 
                    variant="outline" 
                    className="h-14 text-xl font-semibold border-2 border-slate-200 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 active:scale-[0.95] transition-all rounded-xl" 
                    onClick={() => addDigit(num.toString())}
                  >
                    {num}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  className="h-14 text-lg font-bold bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 border-2 border-red-200 rounded-xl active:scale-[0.95] transition-all" 
                  onClick={() => setPhone("")}
                >
                  C
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 text-xl font-semibold border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.95] transition-all rounded-xl" 
                  onClick={() => addDigit("0")}
                >
                  0
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 bg-slate-50 border-2 border-slate-200 rounded-xl active:scale-[0.95] transition-all hover:bg-slate-100" 
                  onClick={backspace}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <Button 
                className={`w-full h-14 text-lg shadow-lg transition-all active:scale-[0.98] rounded-xl ${
                  phone.length === 10 
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 hover:shadow-xl' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`} 
                onClick={handleSearch} 
                disabled={isLoading || phone.length < 10}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> กำลังค้นหา...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-5 h-5" /> ค้นหาสมาชิก
                  </span>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}