"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSiteState } from "../components/SiteState";

type AccountData = {
  profile: { displayName: string; email: string };
  enquiries: { id: string; garment: string; status: string; createdAt: string; neededBy: string }[];
  newsletterSubscribed: boolean;
};

const formatDate = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

export default function AccountDashboard({ initialName, initialEmail }: { initialName: string; initialEmail: string }) {
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
  return <main className="account-page">
    <header className="account-header"><Link href="/" className="account-wordmark">NAROK DESIGN</Link><nav><Link href="/shop">Shop</Link><Link href="/custom-orders">Custom orders</Link><a href="/signout-with-chatgpt?return_to=%2F">Sign out</a></nav></header>
    <section className="account-hero"><div><p>CLIENT ACCOUNT · ADDIS ABABA</p><h1>Welcome, {name.split(" ")[0]}.</h1><span>Your pieces, enquiries and atelier relationship in one private place.</span></div><div className="account-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div></section>
    {error && <p className="account-error" role="alert">{error}</p>}
    <section className="account-grid">
      <article className="account-card profile-card"><p className="account-kicker">PROFILE</p><h2>{name}</h2><span>{email}</span><dl><div><dt>Account</dt><dd>ChatGPT verified</dd></div><div><dt>Newsletter</dt><dd>{data ? data.newsletterSubscribed ? "Subscribed" : "Not subscribed" : "Checking…"}</dd></div></dl></article>
      <article className="account-card account-summary"><p className="account-kicker">YOUR NAROK</p><div><strong>{saved.length}</strong><span>Saved pieces</span></div><div><strong>{data?.enquiries.length ?? 0}</strong><span>Bespoke enquiries</span></div></article>
    </section>
    <section className="account-section"><div className="account-section-title"><div><p className="account-kicker">SAVED COLLECTION</p><h2>Pieces you love</h2></div><Link href="/shop">Explore the collection →</Link></div>{saved.length ? <div className="saved-grid">{saved.map((product) => <article key={product.id}><div><Image src={product.image} alt={product.name.en} fill sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "cover", objectPosition: product.imagePosition === "right" ? "75% center" : "25% center" }} /></div><h3>{product.name.en}</h3><p>{product.etb.toLocaleString()} ETB · ${product.usd} USD</p><button onClick={() => toggleWishlist(product.id)}>Remove from saved</button></article>)}</div> : <div className="account-empty"><span>♡</span><h3>No saved pieces yet</h3><p>Use the heart on any catalogue piece to keep it here on this device.</p><Link href="/shop">Browse pieces</Link></div>}</section>
    <section className="account-section enquiries-section"><div className="account-section-title"><div><p className="account-kicker">ATELIER REQUESTS</p><h2>Your bespoke enquiries</h2></div><Link href="/custom-orders">Start an enquiry →</Link></div>{data?.enquiries.length ? <div className="enquiry-list">{data.enquiries.map((item) => <article key={item.id}><span>{formatDate(item.createdAt)}</span><div><h3>{item.garment}</h3><p>Reference {item.id.slice(0, 8).toUpperCase()}{item.neededBy ? ` · Needed ${item.neededBy}` : ""}</p></div><strong>{item.status.replace("_", " ")}</strong></article>)}</div> : <div className="account-empty compact"><span>✂</span><h3>No matching enquiries yet</h3><p>Enquiries submitted with {email} will appear here.</p></div>}</section>
    <footer className="account-footer"><span>NAROK DESIGN</span><p>Ethiopian heritage, made for the world.</p><Link href="/">Return to storefront</Link></footer>
  </main>;
}
