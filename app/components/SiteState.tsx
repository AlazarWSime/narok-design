"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { Language } from "../data/catalog";

type SiteStateValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  selection: number[];
  addToSelection: (productId: number) => void;
  removeFromSelection: (index: number) => void;
  clearSelection: () => void;
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
};

const STORAGE_KEY = "narok-design-preferences-v1";
const SiteStateContext = createContext<SiteStateValue | null>(null);

export function SiteStateProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [selection, setSelection] = useState<number[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
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
  }), [language, selection, wishlist]);

  return <SiteStateContext.Provider value={value}>{children}</SiteStateContext.Provider>;
}

export function useSiteState() {
  const value = useContext(SiteStateContext);
  if (!value) throw new Error("useSiteState must be used inside SiteStateProvider");
  return value;
}
