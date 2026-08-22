"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "../../data/catalog";
import ProfileControl from "../../components/ProfileControl";
import { useSiteState } from "../../components/SiteState";

const sizes = { women: ["XS", "S", "M", "L", "XL", "Made to measure"], men: ["S", "M", "L", "XL", "XXL", "Made to measure"], children: ["4Y", "6Y", "8Y", "10Y", "12Y", "Made to measure"] };
const descriptions = {
  women: "A considered Ethiopian silhouette balancing celebration, comfort and hand-finished detail. Designed in Addis Ababa to honour the language of Habesha clothing in a contemporary wardrobe.",
  men: "A refined Ethiopian ensemble shaped for ceremony and modern occasion wear. Clean proportions allow the woven detail and cultural craft to take the lead.",
  children: "A soft, joyful Ethiopian piece made for family celebrations, portraits and meaningful occasions, with movement and comfort at the centre.",
};

export default function ProductDetail({ product }: { product: Product & { sku: string } }) {
  const { selection, addToSelection, wishlist, toggleWishlist, settings } = useSiteState();
  const [size, setSize] = useState(product.madeToOrder ? "Made to measure" : "");
  const [added, setAdded] = useState(false);
  const available = Boolean(product.madeToOrder || (product.stock ?? 0) > 0);
  const saved = wishlist.includes(product.id);
  function add() { if (!size || !available) return; addToSelection(product.id); setAdded(true); }

  return <main className="product-detail-page">
    <header className="product-detail-header"><div><Link href="/shop" className="detail-menu">☰ <span>Shop</span></Link><Link href="/shop#catalogue" className="detail-search">⌕ <span>Search</span></Link></div><Link href="/" className="detail-wordmark">{settings.storeName}</Link><nav><Link href="/custom-orders">Bespoke</Link><Link href="/checkout" className="detail-cart">Cart <span>{selection.length}</span></Link><ProfileControl language="en" /></nav></header>
    <div className="product-detail-layout">
      <section className="product-gallery" aria-label={`${product.name.en} gallery`}><div className="product-thumb-list"><button className="active" aria-label="View front image"><Image src={product.image} alt="" fill sizes="72px" style={{ objectFit: "cover", objectPosition: product.imagePosition === "right" ? "75% center" : "25% center" }} /></button><button aria-label="View detail image"><Image src={product.image} alt="" fill sizes="72px" style={{ objectFit: "cover", objectPosition: product.imagePosition === "right" ? "45% center" : "55% center" }} /></button></div><div className="product-main-image"><Image src={product.image} alt={product.name.en} fill priority sizes="(max-width: 900px) 100vw, 58vw" style={{ objectFit: "cover", objectPosition: product.imagePosition === "right" ? "72% center" : "28% center" }} /></div></section>
      <aside className="product-purchase-panel"><div className="product-purchase-inner"><div className="product-title-row"><div><p>{product.sku}</p><h1>{product.name.en}</h1><span>{product.type.en}</span></div><button className={saved ? "saved" : ""} onClick={() => toggleWishlist(product.id)} aria-label={`${saved ? "Remove from" : "Add to"} wishlist`} aria-pressed={saved}>{saved ? "♥" : "♡"}</button></div><div className="product-price"><strong>{product.etb.toLocaleString()} ETB</strong><span>${product.usd} USD</span></div><div className="product-availability"><span>{product.madeToOrder ? "Made to order" : available ? `${product.stock} available` : "Out of stock"}</span><small>{product.madeToOrder ? "Approximately 3–6 weeks" : "Dispatches in 2–4 business days"}</small></div><label className="product-size">Select your size<select value={size} onChange={(event) => { setSize(event.target.value); setAdded(false); }}><option value="">Choose a size</option>{sizes[product.category].map((option) => <option key={option}>{option}</option>)}</select></label><Link className="size-guide" href="/custom-orders">Need made-to-measure sizing?</Link><button className="detail-add-cart" disabled={!available || !size} onClick={add}>{!available ? "Out of stock" : added ? "Added to cart ✓" : "Add to cart"}</button>{added && <Link href="/checkout" className="detail-checkout-link">Go to checkout →</Link>}<p className="product-description">{descriptions[product.category]}</p><details><summary>Product care</summary><p>Dry clean with a trusted specialist. Store away from direct sunlight and avoid pulling woven or embroidered details.</p></details><details><summary>Delivery & returns</summary><p>Ready-made pieces may be returned unworn within 14 days. Made-to-order pieces are final sale. Delivery timing is confirmed before payment.</p></details><details><summary>Atelier assistance</summary><p>Contact the Addis Ababa atelier through the bespoke enquiry page for measurements, color guidance or occasion styling.</p></details></div></aside>
    </div>
  </main>;
}
