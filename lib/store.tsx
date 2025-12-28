"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface StoreSettings {
  id: string;
  store_name: string;
  store_logo: string | null;
  address: string | null;
  phone: string | null;
  tax_id: string | null;
}

interface StoreContextType {
  settings: StoreSettings | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const defaultSettings: StoreSettings = {
  id: "default",
  store_name: "Pocket Café",
  store_logo: null,
  address: null,
  phone: null,
  tax_id: null,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch store settings:", error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refresh = async () => {
    await fetchSettings();
  };

  return (
    <StoreContext.Provider value={{ settings, isLoading, refresh }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
