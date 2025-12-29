'use client';

import { SessionProvider } from "next-auth/react";
import { FeatureProvider } from "@/lib/features";
import { StoreProvider } from "@/lib/store";
import { I18nextProvider } from "react-i18next";
import { i18n, initTolgee } from "@/lib/tolgee";
import { useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
  locale?: string;
}

export function Providers({ children, locale }: ProvidersProps) {
  // Initialize Tolgee with server-detected locale
  useState(() => {
    initTolgee(locale);
  });

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