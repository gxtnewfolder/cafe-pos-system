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
  X,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useFeatures } from "@/lib/features";
import { useStore } from "@/lib/store";
import { StoreSettings, FeatureFlag } from "@/app/generated/prisma/client";
import { calculateDependentUpdates } from "@/lib/feature-dependencies";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Global contexts for real-time sync
  const { refresh: refreshGlobalFeatures } = useFeatures();
  const { refresh: refreshGlobalStore } = useStore();
  const { t } = useTranslation();

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

      if (!settingsRes.ok) {
        throw new Error(`Settings API error: ${settingsRes.status} ${settingsRes.statusText}`);
      }
      if (!featuresRes.ok) {
        throw new Error(`Features API error: ${featuresRes.status} ${featuresRes.statusText}`);
      }

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
        toast.success(t("settings.saveSuccess"));
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error(t("settings.saveError"));
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
      toast.error(t("settings.fileTypeError"));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("settings.fileSizeError"));
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
        toast.success(t("settings.uploadSuccess"));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error(t("settings.uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleFeature = async (featureId: string, enabled: boolean) => {
    try {
      // Calculate calculated updates via shared logic (centralized dependency resolution)
      // Note: We cast features to the type expected if needed, or ensure compatibility
      const featuresToUpdate = calculateDependentUpdates(features, featureId, enabled);
      
      // Batch update on server
      const res = await fetch("/api/settings/features/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: featuresToUpdate })
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      // Update local state based on the atomic updates we calculated
      // Ideally we could use the response if it returns the updated records, 
      // but for optimistic-like speed (after await) reusing the calculated list is fine.
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
        toast.success(t("settings.featuresUpdated", { count: featuresToUpdate.length }));
      } else {
        toast.success(enabled ? t("settings.featureEnabled") : t("settings.featureDisabled"));
      }
    } catch (error) {
      toast.error(t("settings.featureUpdateError"));
    }
  };

  if (isLoading) return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
       <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-slate-100 rounded-lg animate-pulse" />
          <div className="space-y-2">
             <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
             <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
          </div>
       </div>

       <div className="grid gap-6 lg:grid-cols-2">
          {/* Store Info Skeleton */}
          <Card className="shadow-smooth border-slate-100">
             <CardHeader className="pb-2">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
             </CardHeader>
             <CardContent className="space-y-6 pt-4">
                <div className="space-y-2">
                   <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                   <div className="h-10 w-full bg-slate-50 rounded-lg animate-pulse" />
                </div>
                <div className="space-y-2">
                   <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                   <div className="h-24 w-full bg-slate-50 rounded-xl animate-pulse border-2 border-slate-100 border-dashed" />
                </div>
                {[1, 2, 3].map(i => (
                   <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                      <div className="h-10 w-full bg-slate-50 rounded-lg animate-pulse" />
                   </div>
                ))}
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse mt-4" />
             </CardContent>
          </Card>

          {/* Features Skeleton */}
          <Card className="shadow-smooth border-slate-100">
             <CardHeader className="py-2">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
             </CardHeader>
             <CardContent className="space-y-3 pt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                   <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between">
                      <div className="space-y-2">
                         <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                         <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
                      </div>
                      <div className="h-6 w-10 bg-slate-200 rounded-full animate-pulse" />
                   </div>
                ))}
             </CardContent>
          </Card>
       </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Settings className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">{t("settings.title")}</h1>
          <p className="text-sm text-slate-500">{t("settings.subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Store Information */}
        <Card className="shadow-smooth border-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="w-5 h-5 text-slate-600" />
              {t("settings.storeInfo")}
            </CardTitle>
            <CardDescription>
              {t("settings.storeInfoDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="store_name" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                {t("settings.storeName")}
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
                {t("settings.logo")}
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
                      onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="m6 9 6 6 6-6"/%3E%3C/svg%3E')}
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
                      {t("settings.changeLogo")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStoreLogo("")}
                      className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      {t("delete")}
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
                      <span className="text-sm text-slate-500">{t("settings.uploading")}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="w-8 h-8 text-slate-300" />
                      <span className="text-sm text-slate-500">{t("settings.clickToUpload")}</span>
                      <span className="text-xs text-slate-400">{t("settings.supportedFormats")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                {t("address")}
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
                {t("phone")}
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
                {t("settings.taxId")}
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
              {t("settings.saveButton")}
            </Button>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="shadow-smooth border-0">
          <CardHeader className="py-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-slate-600" />
              {t("settings.featuresTitle")}
            </CardTitle>
            <CardDescription>
              {t("settings.featuresDesc")}
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
                  className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                    feature.enabled 
                      ? "bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200 shadow-sm hover:shadow-md ring-1 ring-emerald-100/50" 
                      : isDependencyMissing
                        ? "bg-orange-50/30 border-orange-200 opacity-90"
                        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                  }`}
                >
                  
                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-sm md:text-base font-semibold truncate ${feature.enabled ? 'text-emerald-900' : 'text-slate-700'}`}>
                          {feature.name}
                        </span>
                        
                        {feature.is_addon && (
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 shrink-0">
                            PRO
                          </Badge>
                        )}
                        
                        {requiresMembers && (
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-blue-50 text-blue-700 border-blue-200 shrink-0">
                            {t("settings.requiresMember")}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs md:text-sm text-slate-500 leading-snug">
                        {feature.description}
                      </p>
                      
                      {isDependencyMissing && !feature.enabled && (
                        <div className="flex items-center gap-2 mt-2 text-[10px] md:text-xs font-medium text-orange-700 bg-orange-100/50 p-1.5 rounded-lg border border-orange-200/50">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span>{t("settings.requiresMemberHint")}</span>
                        </div>
                      )}
                    </div>
                    
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={(checked) => handleToggleFeature(feature.id, checked)}
                      disabled={isDisabled}
                      className={`scale-90 origin-right ${feature.enabled ? "data-[state=checked]:bg-emerald-600" : ""}`}
                    />
                  </div>
                  
                  {feature.is_addon && !feature.enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full h-8 text-xs text-amber-700 border-amber-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 transition-colors bg-white/50"
                    >
                      <Sparkles className="w-3 h-3 mr-1.5" />
                      {t("settings.unlockFeature")}
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
