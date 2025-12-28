'use client';

import { SessionProvider } from "next-auth/react";
import { FeatureProvider } from "@/lib/features";
import { StoreProvider } from "@/lib/store";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <FeatureProvider>
        <StoreProvider>
          {children}
        </StoreProvider>
      </FeatureProvider>
    </SessionProvider>
  );
}