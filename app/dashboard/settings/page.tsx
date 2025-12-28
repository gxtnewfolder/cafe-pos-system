"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  Store, 
  Upload, 
  Save, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  Loader2,
  Check,
  Building2,
  Phone,
  MapPin,
  FileText,
  ImagePlus,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useFeatures } from "@/lib/features";
import { useStore } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface StoreSettings {
  id: string;
  store_name: string;
  store_logo: string | null;
  address: string | null;
  phone: string | null;
  tax_id: string | null;
}

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string | null;
  is_addon: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Global contexts for real-time sync
  const { refresh: refreshGlobalFeatures } = useFeatures();
  const { refresh: refreshGlobalStore } = useStore();

  // Form state
  const [storeName, setStoreName] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [taxId, setTaxId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, featuresRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/settings/features")
      ]);

      const settingsData = await settingsRes.json();
      const featuresData = await featuresRes.json();

      setSettings(settingsData);
      setFeatures(featuresData);

      // Set form values
      setStoreName(settingsData.store_name || "");
      setStoreLogo(settingsData.store_logo || "");
      setAddress(settingsData.address || "");
      setPhone(settingsData.phone || "");
      setTaxId(settingsData.tax_id || "");
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: storeName,
          store_logo: storeLogo,
          address,
          phone,
          tax_id: taxId
        })
      });

      if (res.ok) {
        // Refresh global store settings for real-time sync
        await refreshGlobalStore();
        toast.success("บันทึกการตั้งค่าเรียบร้อย");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("รองรับเฉพาะ JPEG, PNG, GIF, WebP");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ไฟล์ใหญ่เกินไป (สูงสุด 2MB)");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setStoreLogo(data.url);
        toast.success("อัพโหลดโลโก้สำเร็จ");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("อัพโหลดไม่สำเร็จ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleFeature = async (featureId: string, enabled: boolean) => {
    try {
      // Cascade disable dependent features when parent is disabled
      const dependentFeatures: Record<string, string[]> = {
        members: ["points"], // ถ้าปิด members -> ปิด points ด้วย
      };
      
      const featuresToUpdate = [{ id: featureId, enabled }];
      
      // ถ้าปิด feature ที่มี dependent features
      if (!enabled && dependentFeatures[featureId]) {
        dependentFeatures[featureId].forEach(depId => {
          const depFeature = features.find(f => f.id === depId);
          if (depFeature?.enabled) {
            featuresToUpdate.push({ id: depId, enabled: false });
          }
        });
      }
      
      // Update all features
      for (const update of featuresToUpdate) {
        await fetch("/api/settings/features", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: update.id, enabled: update.enabled })
        });
      }
      
      // Update local state
      setFeatures(prev => 
        prev.map(f => {
          const update = featuresToUpdate.find(u => u.id === f.id);
          return update ? { ...f, enabled: update.enabled } : f;
        })
      );
      
      // Refresh global feature state for real-time sync
      await refreshGlobalFeatures();
      
      // Show appropriate toast message
      if (featuresToUpdate.length > 1) {
        toast.success(`ปิดใช้งาน ${featuresToUpdate.length} features (รวม features ที่ต้องพึ่งพา)`);
      } else {
        toast.success(enabled ? "เปิดใช้งาน Feature" : "ปิดใช้งาน Feature");
      }
    } catch (error) {
      toast.error("อัพเดทไม่สำเร็จ");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Settings className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500">ตั้งค่าร้านและจัดการ Features</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Store Information */}
        <Card className="shadow-smooth border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="w-5 h-5 text-slate-600" />
              ข้อมูลร้าน
            </CardTitle>
            <CardDescription>
              ข้อมูลจะแสดงบนใบเสร็จและหน้าร้าน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="store_name" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                ชื่อร้าน
              </Label>
              <Input
                id="store_name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Pocket Café"
                className="bg-slate-50 border-slate-200"
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-slate-400" />
                โลโก้ร้าน
              </Label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
              />
              
              {storeLogo ? (
                <div className="relative inline-block">
                  <div className="p-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                    <img 
                      src={storeLogo} 
                      alt="Store Logo" 
                      className="h-20 w-auto object-contain"
                      onError={(e) => (e.currentTarget.src = '/placeholder-logo.png')}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-xs"
                    >
                      {isUploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
                      เปลี่ยนรูป
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStoreLogo("")}
                      className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      ลบ
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                      <span className="text-sm text-slate-500">กำลังอัพโหลด...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="w-8 h-8 text-slate-300" />
                      <span className="text-sm text-slate-500">คลิกเพื่ออัพโหลดโลโก้</span>
                      <span className="text-xs text-slate-400">รองรับ JPEG, PNG, GIF, WebP (สูงสุด 2MB)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                ที่อยู่
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Coffee Street, Bangkok"
                className="bg-slate-50 border-slate-200"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                เบอร์โทร
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="02-123-4567"
                className="bg-slate-50 border-slate-200"
              />
            </div>

            {/* Tax ID */}
            <div className="space-y-2">
              <Label htmlFor="tax_id" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                เลขประจำตัวผู้เสียภาษี
              </Label>
              <Input
                id="tax_id"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="0-0000-00000-00-0"
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <Separator className="my-4" />

            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full bg-slate-800 hover:bg-slate-900"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              บันทึกการตั้งค่า
            </Button>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="shadow-smooth border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-slate-600" />
              Features
            </CardTitle>
            <CardDescription>
              เปิด/ปิด features ตามความต้องการ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {features.map((feature) => {
              // Feature dependencies
              const membersEnabled = features.find(f => f.id === "members")?.enabled ?? false;
              const requiresMembers = feature.id === "points";
              const isDependencyMissing = requiresMembers && !membersEnabled;
              
              // Determine if switch should be disabled
              const isDisabled = 
                (feature.is_addon && !feature.enabled) || // Addon not purchased
                (isDependencyMissing && !feature.enabled); // Dependency not met
              
              return (
                <div
                  key={feature.id}
                  className={`p-4 rounded-xl border transition-all ${
                    feature.enabled 
                      ? "bg-green-50/50 border-green-200" 
                      : isDependencyMissing
                        ? "bg-orange-50/50 border-orange-200"
                        : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-800">
                          {feature.name}
                        </span>
                        {feature.is_addon && (
                          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                            Addon
                          </Badge>
                        )}
                        {requiresMembers && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            ต้องเปิด "สมาชิก" ก่อน
                          </Badge>
                        )}
                        {feature.enabled && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {feature.description}
                      </p>
                      {isDependencyMissing && !feature.enabled && (
                        <p className="text-xs text-orange-600 mt-2">
                          ⚠️ ต้องเปิดใช้งาน "ระบบสมาชิก" ก่อนถึงจะเปิด feature นี้ได้
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={(checked) => handleToggleFeature(feature.id, checked)}
                      disabled={isDisabled}
                    />
                  </div>
                  {feature.is_addon && !feature.enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full text-amber-700 border-amber-300 hover:bg-amber-50"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      ซื้อ Addon นี้
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
