"use client";

import Image from "next/image";
import Link from "next/link";
import type { Language, Product } from "../data/catalog";
import { useSiteState } from "./SiteState";

type ProductGridProps = {
  products: Product[];
  language: Language;
  addLabel: string;
  madeToOrderLabel: string;
  noResultsLabel: string;
  showWishlist?: boolean;
  loading?: boolean;
};

export default function ProductGrid({
  products,
  language,
  addLabel,
  madeToOrderLabel,
  noResultsLabel,
  showWishlist = true,
  loading = false,
}: ProductGridProps) {
  const { addToSelection, wishlist, toggleWishlist, settings } = useSiteState();

  if (loading) return <p className="no-results" role="status">Loading catalogue…</p>;
  if (!products.length) return <p className="no-results" role="status">{noResultsLabel}</p>;

  return (
    <div className="product-grid">
      {products.map((product) => {
        const saved = wishlist.includes(product.id);
        const available = Boolean(product.madeToOrder || (product.stock ?? 0) > 0);
        return (
          <article className="product-card" key={product.id}>
            <div className="product-image">
              <Link className="product-image-link" href={`/products/${product.id}`} aria-label={`View ${product.name[language]} details`} />
              <Image
                src={product.image}
                alt={product.name[language]}
                fill
                sizes="(max-width: 720px) 84vw, (max-width: 980px) 50vw, 33vw"
                style={{ objectFit: "cover", objectPosition: product.imagePosition === "left" ? "25% center" : "75% center" }}
              />
              {product.madeToOrder && <span className="order-badge">{madeToOrderLabel}</span>}
              {showWishlist && (
                <button
                  className={`heart ${saved ? "saved" : ""}`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={`${saved ? "Remove from" : "Add to"} wishlist: ${product.name[language]}`}
                  aria-pressed={saved}
                >
                  {saved ? "♥" : "♡"}
                </button>
              )}
              <button
                className="quick-add"
                onClick={() => addToSelection(product.id)}
                aria-label={`${addLabel}: ${product.name[language]}`}
                disabled={!available}
              >
                {available ? <span aria-hidden="true">🛒</span> : "×"}
              </button>
            </div>
            <div className="product-info">
              <div><h3><Link href={`/products/${product.id}`}>{product.name[language]}</Link></h3><p>{product.type[language]}</p></div>
              <p>{settings.currency === "USD" ? <><strong>${product.usd} USD</strong><br />{product.etb.toLocaleString()} ETB</> : <><strong>{product.etb.toLocaleString()} ETB</strong><br />${product.usd} USD</>}</p>
            </div>
            <button className="product-buy" disabled={!available} onClick={() => addToSelection(product.id)}>{available ? addLabel : language === "en" ? "Out of stock" : "አልቋል"}</button>
          </article>
        );
      })}
    </div>
  );
}

