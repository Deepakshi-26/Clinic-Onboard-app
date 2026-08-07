"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { translations, type Locale } from "./translations";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      document.cookie = `locale=${l}; path=/; max-age=31536000`;
      router.refresh();
    },
    [router]
  );

  const t = useCallback(
    (key: string) => translations[locale][key] ?? translations.en[key] ?? key,
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
