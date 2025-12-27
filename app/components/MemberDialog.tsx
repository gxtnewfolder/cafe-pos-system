'use client';

import { useState } from "react";
import { User, Search, UserPlus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Customer } from "@/app/generated/prisma/client"; // เช็ค import path ดีๆ นะครับ

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
        toast.success(`ยินดีต้อนรับ คุณ${data.name}`);
        handleClose();
      } else {
        // ไม่เจอ -> เข้าโหมดสมัครสมาชิก
        setIsRegisterMode(true);
        // toast.info("ไม่พบข้อมูล กรุณาสมัครสมาชิกใหม่");
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
      toast.success("สมัครสมาชิกสำเร็จ!");
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-2xl shadow-smooth-lg border-0">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-slate-800">
            {isRegisterMode ? "สมัครสมาชิกใหม่" : "ระบุเบอร์โทรศัพท์"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
           {/* ช่องโชว์เบอร์ */}
           <div className="text-center p-5 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl text-3xl font-bold tracking-[0.2em] text-slate-700 min-h-[80px] flex items-center justify-center border border-slate-200/50 shadow-sm">
              {phone || <span className="text-slate-300 tracking-wider">0XX-XXX-XXXX</span>}
           </div>

           {isRegisterMode ? (
             <div className="space-y-4 animate-in fade-in zoom-in">
               <Input 
                 placeholder="ชื่อเล่น / ชื่อลูกค้า" 
                 value={newName} 
                 onChange={(e) => setNewName(e.target.value)}
                 className="text-lg text-center h-14 border-2 border-slate-200 focus:border-slate-400 rounded-xl"
               />
               <Button className="w-full h-14 text-lg bg-slate-800 hover:bg-slate-900 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]" onClick={handleRegister} disabled={isLoading}>
                 <UserPlus className="mr-2" /> ยืนยันการสมัคร
               </Button>
               <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-700" onClick={() => setIsRegisterMode(false)}>
                 กลับไปหน้าค้นหา
               </Button>
             </div>
           ) : (
             <>
               {/* Numpad Grid */}
               <div className="grid grid-cols-3 gap-3">
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                   <Button key={num} variant="outline" className="h-16 text-2xl font-semibold border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.95] transition-all rounded-xl" onClick={() => addDigit(num.toString())}>
                     {num}
                   </Button>
                 ))}
                 <Button variant="outline" className="h-16 text-lg font-bold bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 border-2 border-red-200 rounded-xl active:scale-[0.95] transition-all" onClick={() => setPhone("")}>C</Button>
                 <Button variant="outline" className="h-16 text-2xl font-semibold border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.95] transition-all rounded-xl" onClick={() => addDigit("0")}>0</Button>
                 <Button variant="outline" className="h-16 bg-slate-50 border-2 border-slate-200 rounded-xl active:scale-[0.95] transition-all" onClick={backspace}>
                   <X className="w-6 h-6" />
                 </Button>
               </div>
               
               <Button 
                 className={`w-full h-16 text-xl mt-2 shadow-lg transition-all active:scale-[0.98] rounded-xl ${
                   phone.length === 10 
                     ? 'bg-slate-800 hover:bg-slate-900 hover:shadow-xl' 
                     : 'bg-slate-300 text-slate-500'
                 }`} 
                 onClick={handleSearch} 
                 disabled={isLoading || phone.length < 10}
               >
                  {isLoading ? "กำลังค้นหา..." : "ตกลง"}
               </Button>
             </>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}