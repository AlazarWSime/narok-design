"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- payment radio-card labels contain their controls and visible text */

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useSiteState } from "../components/SiteState";

type Confirmation = { orderNumber: string; totalEtb: number; paymentInstructions: string };

export default function Checkout() {
  const { selection, catalog, addToSelection, removeFromSelection, clearSelection, settings } = useSiteState();
  const [submitting, setSubmitting] = useState(false), [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const items = useMemo(() => {
    const counts = new Map<number, number>();
    for (const id of selection) counts.set(id, (counts.get(id) ?? 0) + 1);
    return [...counts].map(([id, quantity]) => ({ product: catalog.find((product) => product.id === id), quantity })).filter((item): item is { product: NonNullable<typeof item.product>; quantity: number } => Boolean(item.product));
  }, [catalog, selection]);
  const total = items.reduce((sum, item) => sum + item.product.etb * item.quantity, 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })), fullName: form.get("fullName"), email: form.get("email"), phone: form.get("phone"), address: form.get("address"), city: form.get("city"), paymentMethod,
    }) });
    const result = await response.json().catch(() => ({})) as Confirmation & { error?: string };
    if (!response.ok) setError(result.error ?? "Your order could not be placed.");
    else { clearSelection(); setConfirmation(result); }
    setSubmitting(false);
  }

  if (confirmation) return <main className="checkout-page"><header className="checkout-header"><Link href="/">NAROK DESIGN</Link><span>ORDER CONFIRMED</span></header><section className="checkout-confirmation"><span>✓</span><p>ORDER · {confirmation.orderNumber}</p><h1>Thank you. Your order is reserved.</h1><strong>{confirmation.totalEtb.toLocaleString()} ETB</strong><p>{confirmation.paymentInstructions}</p><div><Link href="/account">View account</Link><Link href="/shop">Continue shopping</Link></div></section></main>;
  if (!items.length) return <main className="checkout-page"><header className="checkout-header"><Link href="/">NAROK DESIGN</Link><span>SECURE CHECKOUT</span></header><section className="checkout-empty"><span>◇</span><h1>Your bag is empty.</h1><p>Add a ready-made or made-to-order piece before checking out.</p><Link href="/shop">Shop the collection</Link></section></main>;

  return <main className="checkout-page"><header className="checkout-header"><Link href="/">NAROK DESIGN</Link><span>SECURE CHECKOUT</span><Link href="/shop">Continue shopping</Link></header><div className="checkout-layout"><section className="checkout-summary"><p className="checkout-kicker">YOUR ORDER · {selection.length} ITEM{selection.length === 1 ? "" : "S"}</p><h1>Pieces made with intention.</h1><div className="checkout-items">{items.map(({ product, quantity }) => <article key={product.id}><div><Image src={product.image} alt="" fill sizes="90px" style={{ objectFit: "cover", objectPosition: product.imagePosition === "right" ? "75% center" : "25% center" }} /></div><section><h2>{product.name.en}</h2><p>{product.madeToOrder ? "Made to order" : `${product.stock ?? 0} in stock`} · {product.etb.toLocaleString()} ETB</p><nav><button type="button" onClick={() => { const index = selection.indexOf(product.id); if (index >= 0) removeFromSelection(index); }} aria-label={`Reduce ${product.name.en} quantity`}>−</button><span>{quantity}</span><button type="button" disabled={quantity >= 5 || (!product.madeToOrder && quantity >= (product.stock ?? 0))} onClick={() => addToSelection(product.id)} aria-label={`Increase ${product.name.en} quantity`}>＋</button></nav></section><strong>{(product.etb * quantity).toLocaleString()} ETB</strong></article>)}</div><dl><div><dt>Subtotal</dt><dd>{total.toLocaleString()} ETB</dd></div><div><dt>Delivery</dt><dd>Confirmed by atelier</dd></div><div><dt>Total</dt><dd>{total.toLocaleString()} ETB</dd></div></dl><small>Free-shipping threshold: {settings.shippingThresholdEtb.toLocaleString()} ETB. Final delivery timing and any delivery charge are confirmed before payment.</small></section><form className="checkout-form" onSubmit={submit}><p className="checkout-kicker">DELIVERY DETAILS</p><h2>Where should we send your order?</h2><div className="checkout-fields"><label>Full name<input name="fullName" autoComplete="name" required maxLength={120} /></label><label>Email<input name="email" type="email" autoComplete="email" required maxLength={180} /></label><label>Phone<input name="phone" type="tel" autoComplete="tel" required maxLength={60} /></label><label>City<input name="city" autoComplete="address-level2" required maxLength={100} defaultValue="Addis Ababa" /></label><label className="wide">Delivery address<textarea name="address" autoComplete="street-address" required maxLength={500} /></label></div><fieldset><legend>Payment method</legend><label className={paymentMethod === "telebirr" ? "selected" : ""}><input type="radio" name="paymentMethod" value="telebirr" checked={paymentMethod === "telebirr"} onChange={() => setPaymentMethod("telebirr")} /><span><strong>Telebirr transfer</strong><small>Verified payment details are sent after order review.</small></span></label><label className={paymentMethod === "bank_transfer" ? "selected" : ""}><input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} /><span><strong>Bank transfer</strong><small>Bank details are sent securely after confirmation.</small></span></label><label className={paymentMethod === "cash_on_delivery" ? "selected" : ""}><input type="radio" name="paymentMethod" value="cash_on_delivery" checked={paymentMethod === "cash_on_delivery"} onChange={() => setPaymentMethod("cash_on_delivery")} /><span><strong>Pay on delivery</strong><small>Available after Addis Ababa delivery eligibility is confirmed.</small></span></label></fieldset><p className="payment-safety">No card or mobile-money credentials are collected on this website. Every payment remains pending until the atelier sends verified instructions.</p>{error && <p className="checkout-error" role="alert">{error}</p>}<button className="place-order" disabled={submitting}>{submitting ? "Placing order…" : `Place order · ${total.toLocaleString()} ETB`}</button></form></div></main>;
}
