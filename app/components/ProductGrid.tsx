"use client";

import Image from "next/image";
import type { Language, Product } from "../data/catalog";
import { useSiteState } from "./SiteState";

type ProductGridProps = {
  products: Product[];
  language: Language;
  addLabel: string;
  sampleLabel: string;
  madeToOrderLabel: string;
  noResultsLabel: string;
  showWishlist?: boolean;
};

export default function ProductGrid({
  products,
  language,
  addLabel,
  sampleLabel,
  madeToOrderLabel,
  noResultsLabel,
  showWishlist = true,
}: ProductGridProps) {
  const { addToSelection, wishlist, toggleWishlist } = useSiteState();

  if (!products.length) return <p className="no-results" role="status">{noResultsLabel}</p>;

  return (
    <div className="product-grid">
      {products.map((product) => {
        const saved = wishlist.includes(product.id);
        return (
          <article className="product-card" key={product.id}>
            <div className="product-image">
              <Image
                src={product.image}
                alt={`${product.name[language]} — ${sampleLabel}`}
                fill
                sizes="(max-width: 720px) 84vw, (max-width: 980px) 50vw, 33vw"
                style={{ objectFit: "cover", objectPosition: product.imagePosition === "left" ? "25% center" : "75% center" }}
              />
              <span className="sample-badge">{sampleLabel}</span>
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
              >
                +
              </button>
            </div>
            <div className="product-info">
              <div><h3>{product.name[language]}</h3><p>{product.type[language]}</p></div>
              <p>${product.usd} USD<br />{product.etb.toLocaleString()} ETB</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

