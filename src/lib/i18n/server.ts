import "server-only";
import { cookies } from "next/headers";
import { translations, type Locale } from "./translations";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get("locale")?.value === "fr" ? "fr" : "en";
}

export function getT(locale: Locale) {
  return (key: string) => translations[locale][key] ?? translations.en[key] ?? key;
}
