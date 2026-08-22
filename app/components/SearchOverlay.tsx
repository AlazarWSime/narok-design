"use client";

import { FormEvent, useMemo, useRef } from "react";
import Link from "next/link";
import type { Language, Product } from "../data/catalog";
import { usePanelFocus } from "../hooks/usePanelFocus";
import ProductGrid from "./ProductGrid";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  language: Language;
  catalog: Product[];
  loading: boolean;
  query: string;
  setQuery: (query: string) => void;
  storeName: string;
};

const suggestions = {
  en: ["Habesha kemis", "Women", "Men", "Children", "Wedding", "Made to order"],
  am: ["ሐበሻ ቀሚስ", "ሴቶች", "ወንዶች", "ልጆች", "ሰርግ", "በትዕዛዝ"],
};

export default function SearchOverlay({ open, onClose, language, catalog, loading, query, setQuery, storeName }: SearchOverlayProps) {
  const overlayRef = useRef<HTMLElement>(null);
  usePanelFocus(open, overlayRef, onClose);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return catalog;
    return catalog.filter((product) => `${product.name.en} ${product.name.am} ${product.type.en} ${product.type.am} ${product.category} ${product.sku ?? ""}`.toLowerCase().includes(normalized));
  }, [catalog, query]);

  if (!open) return null;
  const resultLabel = query.trim()
    ? language === "en" ? `Results for “${query.trim()}”` : `የ“${query.trim()}” ውጤቶች`
    : language === "en" ? "Explore the catalogue" : "ካታሎጉን ያስሱ";

  return (
    <section ref={overlayRef} className="catalogue-search-overlay" role="dialog" aria-modal="true" aria-labelledby="catalogue-search-title">
      <header className="catalogue-search-header">
        <Link href="/" className="wordmark">{storeName}</Link>
        <button type="button" className="catalogue-search-close" onClick={onClose} aria-label={language === "en" ? "Close search" : "ፍለጋውን ዝጋ"}>×</button>
      </header>
      <div className="catalogue-search-intro">
        <form role="search" onSubmit={(event: FormEvent) => event.preventDefault()}>
          <span className="search-glyph" aria-hidden="true" />
          <label className="visually-hidden" htmlFor="full-catalogue-search">{language === "en" ? "Search the catalogue" : "ካታሎጉን ይፈልጉ"}</label>
          <input data-panel-autofocus id="full-catalogue-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === "en" ? "Search products" : "ልብስ ይፈልጉ"} autoComplete="off" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label={language === "en" ? "Clear search" : "ፍለጋውን አጽዳ"}>×</button>}
        </form>
        <nav aria-label={language === "en" ? "Suggested searches" : "የተጠቆሙ ፍለጋዎች"}>
          <span>{language === "en" ? "Suggested searches" : "የተጠቆሙ ፍለጋዎች"}</span>
          {suggestions[language].map((suggestion) => <button type="button" onClick={() => setQuery(suggestion)} key={suggestion}>{suggestion}</button>)}
        </nav>
      </div>
      <div className="catalogue-search-results">
        <div className="catalogue-search-results-heading"><h2 id="catalogue-search-title">{resultLabel}</h2><span>{filteredProducts.length} {language === "en" ? filteredProducts.length === 1 ? "product" : "products" : "ምርቶች"}</span></div>
        <ProductGrid products={filteredProducts} language={language} addLabel={language === "en" ? "Add to cart" : "ወደ ጋሪ ያክሉ"} sampleLabel={language === "en" ? "Original catalogue image" : "የካታሎግ ምስል"} madeToOrderLabel={language === "en" ? "Made to order" : "በትዕዛዝ"} noResultsLabel={language === "en" ? "No products match your search." : "ከፍለጋዎ ጋር የሚዛመድ ልብስ የለም።"} loading={loading} />
      </div>
    </section>
  );
}
