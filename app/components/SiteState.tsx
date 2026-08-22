"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { Language, Product, StorefrontSettings } from "../data/catalog";

type SiteStateValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  selection: number[];
  addToSelection: (productId: number) => void;
  removeFromSelection: (index: number) => void;
  clearSelection: () => void;
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  catalog: Product[];
  catalogLoading: boolean;
  settings: StorefrontSettings;
};

const STORAGE_KEY = "narok-design-preferences-v1";
const defaultSettings: StorefrontSettings = {
  storeName: "NAROK DESIGN",
  announcement: "Designed in Addis Ababa · Worldwide delivery",
  shippingThresholdEtb: 30000,
  currency: "ETB",
};
const SiteStateContext = createContext<SiteStateValue | null>(null);

export function SiteStateProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [selection, setSelection] = useState<number[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [settings, setSettings] = useState<StorefrontSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as
          | { language?: Language; selection?: number[]; wishlist?: number[] }
          | null;
        if (saved?.language === "am" || saved?.language === "en") setLanguage(saved.language);
        if (Array.isArray(saved?.selection)) setSelection(saved.selection.filter(Number.isInteger));
        if (Array.isArray(saved?.wishlist)) setWishlist(saved.wishlist.filter(Number.isInteger));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Catalogue unavailable")))
      .then((payload: { products?: Product[]; settings?: Partial<StorefrontSettings> }) => {
        if (cancelled) return;
        if (Array.isArray(payload.products)) setCatalog(payload.products);
        if (payload.settings) setSettings({ ...defaultSettings, ...payload.settings });
      })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setCatalogLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, selection, wishlist }));
  }, [hydrated, language, selection, wishlist]);

  const value = useMemo<SiteStateValue>(() => ({
    language,
    setLanguage,
    selection,
    addToSelection: (productId) => setSelection((items) => [...items, productId]),
    removeFromSelection: (index) => setSelection((items) => items.filter((_, itemIndex) => itemIndex !== index)),
    clearSelection: () => setSelection([]),
    wishlist,
    toggleWishlist: (productId) => setWishlist((items) =>
      items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId],
    ),
    catalog,
    catalogLoading,
    settings,
  }), [catalog, catalogLoading, language, selection, settings, wishlist]);

  return <SiteStateContext.Provider value={value}>{children}</SiteStateContext.Provider>;
}

export function useSiteState() {
  const value = useContext(SiteStateContext);
  if (!value) throw new Error("useSiteState must be used inside SiteStateProvider");
  return value;
}
