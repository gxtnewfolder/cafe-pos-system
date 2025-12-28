"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string | null;
  is_addon: boolean;
}

interface FeatureContextType {
  features: FeatureFlag[];
  isLoading: boolean;
  isEnabled: (featureId: string) => boolean;
  refresh: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      const res = await fetch("/api/settings/features");
      if (res.ok) {
        const data = await res.json();
        setFeatures(data);
      }
    } catch (error) {
      console.error("Failed to fetch features:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const isEnabled = (featureId: string): boolean => {
    const feature = features.find(f => f.id === featureId);
    return feature?.enabled ?? false;
  };

  const refresh = async () => {
    await fetchFeatures();
  };

  return (
    <FeatureContext.Provider value={{ features, isLoading, isEnabled, refresh }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error("useFeatures must be used within a FeatureProvider");
  }
  return context;
}

// Simple hook for checking if a feature is enabled
export function useFeatureEnabled(featureId: string): boolean {
  const { isEnabled, isLoading } = useFeatures();
  // Return true while loading to prevent flash of hidden content
  if (isLoading) return true;
  return isEnabled(featureId);
}
