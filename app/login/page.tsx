'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Coffee, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("เข้าสู่ระบบไม่สำเร็จ", { description: "Username หรือ Password ไม่ถูกต้อง" });
      } else {
        toast.success("ยินดีต้อนรับครับ! ☕");
        router.push('/'); // ไปหน้า POS
        router.refresh();
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-slate-50 [mask-image:linear-gradient(to_bottom,white,transparent)]">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_10%,transparent_100%)]"></div>
      </div>

      <Card className="w-full max-w-sm shadow-xl border-slate-100 bg-white relative z-10">
        <CardHeader className="space-y-1 text-center pt-8 pb-6">
          <div className="flex justify-center mb-6">
             <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Coffee className="h-8 w-8 text-white" />
             </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Pocket Café
          </CardTitle>
          <CardDescription className="text-slate-500">
            ลงชื่อเข้าใช้ระบบ
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-8">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="admin" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                className="h-11 bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-200 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="h-11 bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-200 transition-all"
              />
            </div>
          </CardContent>
          <CardFooter className="px-8 pb-8 pt-2">
            <Button 
              className="w-full h-11 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all rounded-lg" 
              type="submit" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "เข้าสู่ระบบ"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <p className="absolute bottom-6 text-slate-400 text-xs text-center font-medium">
        © 2024 Pocket Café POS System
      </p>
    </div>
  );
}