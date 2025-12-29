'use client';

import { SessionProvider } from "next-auth/react";
import { FeatureProvider } from "@/lib/features";
import { StoreProvider } from "@/lib/store";
import { I18nextProvider } from "react-i18next";
import { i18n } from "@/lib/tolgee";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <FeatureProvider>
        <StoreProvider>
          <I18nextProvider i18n={i18n}>
            {children}
          </I18nextProvider>
        </StoreProvider>
      </FeatureProvider>
    </SessionProvider>
  );
}