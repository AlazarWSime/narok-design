"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSiteState } from "../components/SiteState";

type AccountData = {
  profile: { displayName: string; fullName: string | null; email: string; userId: string; accountType: "Administrator" | "Customer"; memberSince: string; lastSignedInAt: string };
  enquiries: { id: string; garment: string; status: string; createdAt: string; neededBy: string }[];
  orders: { id: string; orderNumber: string; itemsJson: string; totalEtb: number; paymentMethod: string; paymentStatus: string; status: string; createdAt: string }[];
  newsletterSubscribed: boolean;
};

const formatDate = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const paymentLabel = (value: string) => ({ telebirr: "Telebirr", bank_transfer: "Bank transfer", cash_on_delivery: "Pay on delivery" }[value] ?? value.replaceAll("_", " "));
function orderItems(value: string) { try { const parsed = JSON.parse(value) as { name?: string; quantity?: number }[]; return Array.isArray(parsed) ? parsed.map((item) => `${item.name ?? "Piece"} × ${item.quantity ?? 1}`).join(", ") : "Order items"; } catch { return "Order items"; } }

export default function AccountDashboard({ initialName, initialEmail, initialUserId, initialIsAdmin }: { initialName: string; initialEmail: string; initialUserId: string; initialIsAdmin: boolean }) {
  const { wishlist, catalog, toggleWishlist } = useSiteState();
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState("");
  const saved = catalog.filter((product) => wishlist.includes(product.id));

  useEffect(() => {
    let active = true;
    fetch("/api/account", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Your account could not be loaded.")))
      .then((value: AccountData) => { if (active) setData(value); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Your account could not be loaded."); });
    return () => { active = false; };
  }, []);

  const name = data?.profile.displayName ?? initialName;
  const email = data?.profile.email ?? initialEmail;
  const userId = data?.profile.userId ?? initialUserId;
  const accountType = data?.profile.accountType ?? (initialIsAdmin ? "Administrator" : "Customer");
  return <main className="account-page">
    <aside className="account-sidebar">
      <Link href="/" className="account-brand"><span>ND</span><strong>Narok Design</strong><small>CLIENT ACCOUNT</small></Link>
      <nav aria-label="Account navigation">
        <a href="#profile" className="active"><span>◉</span>Profile overview</a>
        <a href="#saved"><span>♡</span>Saved collection</a>
        <a href="#orders"><span>⌑</span>Purchases</a>
        <a href="#enquiries"><span>✂</span>Bespoke enquiries</a>
        <Link href="/shop"><span>◇</span>Shop collection</Link>
        <Link href="/custom-orders"><span>＋</span>New enquiry</Link>
        {initialIsAdmin && <Link href="/admin"><span>▦</span>Admin dashboard</Link>}
      </nav>
      <div className="account-side-foot"><p>ETHIOPIAN HERITAGE</p><Link href="/">Return to storefront</Link></div>
    </aside>
    <div className="account-main">
      <header className="account-topbar"><Link href="/">Storefront</Link><a href="/signout-with-chatgpt?return_to=%2F">Sign out</a><div className="account-top-profile"><span>{name.slice(0, 1).toUpperCase()}</span><div><strong>{name}</strong><small>{accountType}</small></div></div></header>
      <div className="account-mobile-nav"><strong>Narok Design</strong><Link href="/">Storefront</Link></div>
      <section className="account-content">
        <header className="account-heading"><div><p>CLIENT ACCOUNT · ADDIS ABABA</p><h1>Welcome, {name.split(" ")[0]}.</h1><span>Your pieces, enquiries and atelier relationship in one private place.</span></div><div className="account-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div></header>
        {error && <p className="account-error" role="alert">{error}</p>}
        <section className="account-grid" id="profile">
          <article className="account-card profile-card"><div className="profile-heading"><div><p className="account-kicker">PROFILE DETAILS</p><h2>{data?.profile.fullName || name}</h2><span>{email}</span></div><strong>{accountType}</strong></div><dl><div><dt>Verified identity</dt><dd>ChatGPT verified</dd></div><div><dt>Account type</dt><dd>{accountType}</dd></div><div><dt>Account reference</dt><dd className="account-reference">{userId}</dd></div><div><dt>Member since</dt><dd>{data ? formatDate(data.profile.memberSince) : "Checking…"}</dd></div><div><dt>Latest sign-in</dt><dd>{data ? formatDate(data.profile.lastSignedInAt) : "Checking…"}</dd></div><div><dt>Newsletter</dt><dd>{data ? data.newsletterSubscribed ? "Subscribed" : "Not subscribed" : "Checking…"}</dd></div></dl></article>
          <article className="account-card account-summary"><p className="account-kicker">YOUR NAROK</p><div><strong>{saved.length}</strong><span>Saved pieces</span></div><div><strong>{data?.orders.length ?? 0}</strong><span>Purchases</span></div><div><strong>{data?.enquiries.length ?? 0}</strong><span>Enquiries</span></div></article>
        </section>
        <section className="account-section" id="saved"><div className="account-section-title"><div><p className="account-kicker">SAVED COLLECTION</p><h2>Pieces you love</h2></div><Link href="/shop">Explore the collection →</Link></div>{saved.length ? <div className="saved-grid">{saved.map((product) => <article key={product.id}><div><Image src={product.image} alt={product.name.en} fill sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "cover", objectPosition: product.imagePosition === "right" ? "75% center" : "25% center" }} /></div><h3>{product.name.en}</h3><p>{product.etb.toLocaleString()} ETB · ${product.usd} USD</p><button onClick={() => toggleWishlist(product.id)}>Remove from saved</button></article>)}</div> : <div className="account-empty"><span>♡</span><h3>No saved pieces yet</h3><p>Use the heart on any catalogue piece to keep it here on this device.</p><Link href="/shop">Browse pieces</Link></div>}</section>
        <section className="account-section" id="orders"><div className="account-section-title"><div><p className="account-kicker">PURCHASE HISTORY</p><h2>Your orders</h2></div><Link href="/shop">Shop more pieces →</Link></div>{data?.orders.length ? <div className="purchase-list">{data.orders.map((order) => <article key={order.id}><span>{formatDate(order.createdAt)}</span><div><h3>{order.orderNumber}</h3><p>{orderItems(order.itemsJson)}</p><small>{paymentLabel(order.paymentMethod)} · Payment {order.paymentStatus.replaceAll("_", " ")}</small></div><strong>{order.totalEtb.toLocaleString()} ETB</strong><em>{order.status.replaceAll("_", " ")}</em></article>)}</div> : <div className="account-empty compact"><span>⌑</span><h3>No purchases yet</h3><p>Your authenticated storefront orders will appear here.</p><Link href="/shop">Shop now</Link></div>}</section>
        <section className="account-section enquiries-section" id="enquiries"><div className="account-section-title"><div><p className="account-kicker">ATELIER REQUESTS</p><h2>Your bespoke enquiries</h2></div><Link href="/custom-orders">Start an enquiry →</Link></div>{data?.enquiries.length ? <div className="enquiry-list">{data.enquiries.map((item) => <article key={item.id}><span>{formatDate(item.createdAt)}</span><div><h3>{item.garment}</h3><p>Reference {item.id.slice(0, 8).toUpperCase()}{item.neededBy ? ` · Needed ${item.neededBy}` : ""}</p></div><strong>{item.status.replace("_", " ")}</strong></article>)}</div> : <div className="account-empty compact"><span>✂</span><h3>No matching enquiries yet</h3><p>Enquiries submitted with {email} will appear here.</p></div>}</section>
      </section>
    </div>
  </main>;
}
