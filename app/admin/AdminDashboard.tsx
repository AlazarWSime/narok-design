"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Section = "overview" | "products" | "orders" | "bespoke" | "analytics" | "ai" | "settings";
type ProductRow = { id: number; sku: string; nameEn: string; nameAm: string; typeEn: string; typeAm: string; category: string; usd: number; etb: number; stock: number; image: string; imagePosition: string; madeToOrder: number; status: string; updatedAt: string };
type BespokeRow = { id: string; fullName: string; contact: string; garment: string; measurements: string; color: string; fabric: string; occasion: string; neededBy: string; notes: string; selectedProductIds: string; status: string; createdAt: string };
type OrderRow = { id: string; orderNumber: string; clientName: string; clientContact: string; itemsJson: string; totalEtb: number; status: string; createdAt: string };
type DashboardData = { products: ProductRow[]; bespoke: BespokeRow[]; orders: OrderRow[]; subscriberCount: number; settings: Record<string, string> };

const nav: { id: Section; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "◫" }, { id: "products", label: "Products", icon: "◇" },
  { id: "orders", label: "Orders", icon: "⌑" }, { id: "bespoke", label: "Bespoke", icon: "✂" },
  { id: "analytics", label: "Analytics", icon: "⌁" }, { id: "ai", label: "AI Studio", icon: "✦" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const sectionCopy: Record<Section, [string, string]> = {
  overview: ["Overview", "A clear view of your atelier, catalogue and client requests."],
  products: ["Product Catalogue", "Publish, pause and keep stock accurate across the storefront."],
  orders: ["Client Orders", "Track confirmed purchases and fulfilment in one place."],
  bespoke: ["Bespoke Tailoring", "Review measurements, deadlines and conversations with clients."],
  analytics: ["Atelier Analytics", "Useful signals from enquiries, inventory and your audience."],
  ai: ["AI Studio", "Create thoughtful first drafts while keeping every decision human."],
  settings: ["Store Settings", "Manage the storefront details clients see first."],
};

const money = (value: number) => new Intl.NumberFormat("en-US").format(value);
const date = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

export default function AdminDashboard({ displayName }: { displayName: string }) {
  const [section, setSection] = useState<Section>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [productOpen, setProductOpen] = useState(false);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load the admin workspace.");
      setData(await response.json() as DashboardData);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load the admin workspace."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, [refresh]);

  async function act(payload: Record<string, unknown>, success: string) {
    setError(""); setNotice("");
    const response = await fetch("/api/admin/actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) { setError(result.error ?? "That change could not be saved."); return false; }
    setNotice(success); await refresh(); return true;
  }

  const [title, subtitle] = sectionCopy[section];
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/"><span>NAROK</span><strong>DESIGN</strong><small>ATELIER ADMIN</small></Link>
        <nav aria-label="Admin sections">{nav.map((item) => <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}</nav>
        <div className="admin-side-foot"><p>Owner workspace</p><a href="/signout-with-chatgpt?return_to=%2F">Sign out</a></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <Link href="/">View storefront <span aria-hidden="true">↗</span></Link>
          <div className="admin-profile"><span>{displayName.slice(0, 1).toUpperCase()}</span><div><strong>{displayName}</strong><small>Administrator</small></div></div>
        </header>
        <div className="admin-mobile-nav"><label htmlFor="admin-section">Workspace</label><select id="admin-section" value={section} onChange={(event) => setSection(event.target.value as Section)}>{nav.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
        <section className="admin-content">
          <div className="admin-heading"><div><p>NAROK DESIGN · ADDIS ABABA</p><h1>{title}</h1><span>{subtitle}</span></div><div className="heading-mark" aria-hidden="true">ND</div></div>
          {error && <p className="admin-alert error" role="alert">{error}</p>}
          {notice && <p className="admin-alert success" role="status">{notice}</p>}
          {loading ? <Loading /> : data ? <SectionContent section={section} data={data} setSection={setSection} act={act} openProduct={() => setProductOpen(true)} /> : null}
        </section>
      </main>
      {productOpen && <ProductModal close={() => setProductOpen(false)} act={act} />}
    </div>
  );
}

function Loading() { return <div className="admin-loading" role="status"><span /><p>Preparing your atelier workspace…</p></div>; }

function SectionContent({ section, data, setSection, act, openProduct }: { section: Section; data: DashboardData; setSection: (section: Section) => void; act: (payload: Record<string, unknown>, success: string) => Promise<boolean>; openProduct: () => void }) {
  if (section === "overview") return <Overview data={data} setSection={setSection} openProduct={openProduct} />;
  if (section === "products") return <Products data={data} act={act} openProduct={openProduct} />;
  if (section === "orders") return <Orders rows={data.orders} act={act} />;
  if (section === "bespoke") return <Bespoke rows={data.bespoke} act={act} />;
  if (section === "analytics") return <Analytics data={data} />;
  if (section === "ai") return <AIStudio products={data.products} />;
  return <Settings settings={data.settings} act={act} />;
}

function Overview({ data, setSection, openProduct }: { data: DashboardData; setSection: (section: Section) => void; openProduct: () => void }) {
  const activeOrders = data.orders.filter((item) => !["complete", "refunded"].includes(item.status)).length;
  const pendingBespoke = data.bespoke.filter((item) => !["complete", "declined"].includes(item.status)).length;
  const lowStock = data.products.filter((item) => item.status === "active" && !item.madeToOrder && item.stock < 3).length;
  const revenue = data.orders.filter((item) => !["refunded"].includes(item.status)).reduce((sum, item) => sum + item.totalEtb, 0);
  return <>
    <div className="metric-grid">
      <Metric icon="↗" label="Gross revenue" value={`${money(revenue)} ETB`} note="Recorded client orders" />
      <Metric icon="⌑" label="Active orders" value={String(activeOrders)} note="Awaiting completion" />
      <Metric icon="✂" label="Pending bespoke" value={String(pendingBespoke)} note="Needs atelier attention" />
      <Metric icon="!" label="Low stock" value={String(lowStock)} note="Ready-made pieces under 3" warn={lowStock > 0} />
    </div>
    <div className="overview-grid">
      <article className="overview-intro"><p className="card-kicker">TODAY AT NAROK</p><h2>Craft has a rhythm.<br />Keep it visible.</h2><p>Your catalogue, requests and audience signals live together here—quietly organised so the atelier can focus on the work.</p><div><span>{data.products.filter((item) => item.status === "active").length}<small>Live pieces</small></span><span>{data.subscriberCount}<small>Subscribers</small></span></div></article>
      <div className="quick-actions"><button onClick={openProduct}><span>01</span><strong>Add a product</strong><small>Create a catalogue draft and set its stock.</small></button><button onClick={() => setSection("bespoke")}><span>02</span><strong>Review bespoke</strong><small>Open measurements and client deadlines.</small></button><button onClick={() => setSection("ai")}><span>03</span><strong>Draft product copy</strong><small>Shape a refined first draft in AI Studio.</small></button></div>
    </div>
  </>;
}

function Metric({ icon, label, value, note, warn = false }: { icon: string; label: string; value: string; note: string; warn?: boolean }) { return <article className={`metric ${warn ? "warn" : ""}`}><span aria-hidden="true">{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{note}</small></div></article>; }

function Products({ data, act, openProduct }: { data: DashboardData; act: (payload: Record<string, unknown>, success: string) => Promise<boolean>; openProduct: () => void }) {
  const [query, setQuery] = useState("");
  const [edits, setEdits] = useState<Record<number, Partial<ProductRow>>>({});
  const rows = data.products.map((item) => ({ ...item, ...edits[item.id] }));
  const filtered = rows.filter((item) => `${item.nameEn} ${item.sku} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-card table-card"><div className="table-toolbar"><label><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search garments or SKU" aria-label="Search products" /></label><button className="primary-button" onClick={openProduct}>＋ Add garment</button></div>
    <div className="table-scroll"><table><thead><tr><th>Garment</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><div className="product-cell"><span><Image src={item.image} alt="" fill sizes="48px" style={{ objectFit: "cover", objectPosition: item.imagePosition === "right" ? "75% center" : "25% center" }} /></span><div><strong>{item.nameEn}</strong><small>{item.madeToOrder ? "Made to order" : item.typeEn}</small></div></div></td><td>{item.sku}</td><td className="capitalize">{item.category}</td><td>{money(item.etb)} ETB<small>${item.usd} USD</small></td><td><input className="mini-input" type="number" min="0" value={item.stock} aria-label={`Stock for ${item.nameEn}`} onChange={(event) => setEdits((current) => ({ ...current, [item.id]: { ...current[item.id], stock: Number(event.target.value) } }))} /></td><td><select className="mini-select" value={item.status} aria-label={`Status for ${item.nameEn}`} onChange={(event) => setEdits((current) => ({ ...current, [item.id]: { ...current[item.id], status: event.target.value } }))}><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></td><td><button className="text-button" onClick={() => void act({ action: "product.update", id: item.id, stock: item.stock, status: item.status }, `${item.nameEn} updated.`).then((saved) => { if (saved) setEdits((current) => { const next = { ...current }; delete next[item.id]; return next; }); })}>Save</button></td></tr>)}</tbody></table></div>
    {!filtered.length && <Empty icon="◇" title="No garments found" body="Try another search, or add a new catalogue piece." />}
  </div>;
}

function Orders({ rows, act }: { rows: OrderRow[]; act: (payload: Record<string, unknown>, success: string) => Promise<boolean> }) {
  const [query, setQuery] = useState("");
  const visible = rows.filter((item) => `${item.orderNumber} ${item.clientName}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-card table-card"><div className="table-toolbar"><label><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders" aria-label="Search orders" /></label></div><div className="table-scroll"><table><thead><tr><th>Order</th><th>Client</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td><strong>{item.orderNumber}</strong></td><td>{item.clientName}<small>{item.clientContact}</small></td><td>{readItemCount(item.itemsJson)}</td><td>{money(item.totalEtb)} ETB</td><td>{date(item.createdAt)}</td><td><select className="mini-select" value={item.status} onChange={(event) => void act({ action: "order.update", id: item.id, status: event.target.value }, `Order ${item.orderNumber} updated.`)}><option value="new">New</option><option value="confirmed">Confirmed</option><option value="in_progress">In progress</option><option value="shipped">Shipped</option><option value="complete">Complete</option><option value="refunded">Refunded</option></select></td></tr>)}</tbody></table></div>{!visible.length && <Empty icon="⌑" title="No client orders yet" body="Confirmed purchases will appear here. The public site currently sends custom enquiries without taking payment." />}</div>;
}

function readItemCount(value: string) { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? `${parsed.length} item${parsed.length === 1 ? "" : "s"}` : "—"; } catch { return "—"; } }

function Bespoke({ rows, act }: { rows: BespokeRow[]; act: (payload: Record<string, unknown>, success: string) => Promise<boolean> }) {
  if (!rows.length) return <div className="admin-card"><Empty icon="✂" title="No bespoke requests yet" body="Custom tailoring enquiries will appear here as soon as a client submits one." /></div>;
  return <div className="bespoke-grid">{rows.map((item) => <article className="bespoke-card" key={item.id}><div className="bespoke-top"><span>{item.fullName.slice(0, 1).toUpperCase()}</span><div><p>REQUEST · {item.id.slice(0, 8).toUpperCase()}</p><h2>{item.fullName}</h2><small>{date(item.createdAt)} · {item.contact}</small></div><select value={item.status} aria-label={`Status for ${item.fullName}`} onChange={(event) => void act({ action: "bespoke.update", id: item.id, status: event.target.value }, `${item.fullName}'s request updated.`)}><option value="new">New</option><option value="contacted">Contacted</option><option value="in_progress">In progress</option><option value="complete">Complete</option><option value="declined">Declined</option></select></div><dl><div><dt>Garment</dt><dd>{item.garment}</dd></div><div><dt>Needed by</dt><dd>{item.neededBy || "Flexible"}</dd></div><div><dt>Colour & fabric</dt><dd>{item.color} · {item.fabric}</dd></div><div><dt>Occasion</dt><dd>{item.occasion || "Not specified"}</dd></div><div className="wide"><dt>Measurements</dt><dd>{item.measurements}</dd></div>{item.notes && <div className="wide"><dt>Atelier notes from client</dt><dd>{item.notes}</dd></div>}</dl></article>)}</div>;
}

function Analytics({ data }: { data: DashboardData }) {
  const categories = ["women", "men", "children"].map((name) => ({ name, count: data.products.filter((item) => item.category === name && item.status === "active").length }));
  const max = Math.max(1, ...categories.map((item) => item.count));
  const statuses = ["new", "contacted", "in_progress", "complete"].map((name) => ({ name, count: data.bespoke.filter((item) => item.status === name).length }));
  return <div className="analytics-layout"><article className="admin-card analytics-lead"><div><p className="card-kicker">ATELIER PULSE</p><h2>{data.bespoke.length} client conversations</h2><span>All-time bespoke requests received through the storefront.</span></div><div className="analytics-number">{data.subscriberCount}<small>Newsletter audience</small></div></article><article className="admin-card chart-card"><p className="card-kicker">LIVE CATALOGUE BY CATEGORY</p><div className="bar-chart">{categories.map((item) => <div key={item.name}><span style={{ height: `${22 + (item.count / max) * 70}%` }}><b>{item.count}</b></span><small>{item.name}</small></div>)}</div></article><article className="admin-card status-card"><p className="card-kicker">BESPOKE PIPELINE</p>{statuses.map((item) => <div key={item.name}><span className={`status-dot ${item.name}`} /><p>{item.name.replace("_", " ")}</p><strong>{item.count}</strong></div>)}</article><article className="admin-card inventory-card"><p className="card-kicker">INVENTORY SIGNAL</p><strong>{data.products.reduce((sum, item) => sum + item.stock, 0)}</strong><h3>Ready pieces recorded</h3><p>{data.products.filter((item) => item.status === "active" && !item.madeToOrder && item.stock < 3).length} active styles need a stock review.</p></article></div>;
}

function AIStudio({ products }: { products: ProductRow[] }) {
  const [form, setForm] = useState({ product: products[0]?.nameEn ?? "Handwoven Kemis", tone: "refined, warm and editorial", materials: "hand-spun Ethiopian cotton with artisanal woven detail", audience: "clients seeking meaningful occasion wear", notes: "Keep it concise and faithful to NAROK DESIGN craftsmanship." });
  const [draft, setDraft] = useState("");
  function generate(event: FormEvent) { event.preventDefault(); setDraft(`${form.product} brings ${form.materials} into a considered contemporary silhouette. Created in Addis Ababa for ${form.audience}, the piece honours Ethiopian making through patient detail and an ease designed for celebration. ${form.notes}\n\nSuggested SEO title: ${form.product} | Ethiopian Occasion Wear by NAROK DESIGN`); }
  return <><section className="ai-hero"><p>✦ GUIDED DRAFT STUDIO</p><h2>Draft with speed.<br />Publish with judgement.</h2><span>This workspace creates structured first drafts from your inputs. Nothing is published or changed automatically.</span><div><small>MODE<strong>Human approved</strong></small><small>SCOPE<strong>Copy only</strong></small></div></section><div className="ai-grid"><form className="admin-card ai-form" onSubmit={generate}><div className="card-title"><p>PRODUCT COPY</p><span>FIRST DRAFT</span></div><label>Product<input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} /></label><label>Tone<input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} /></label><label className="wide">Materials<textarea value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} /></label><label className="wide">Audience<textarea value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></label><label className="wide">Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label><button className="primary-button wide" type="submit">✦ Generate draft</button></form><div className="ai-side"><article className="admin-card"><p className="card-kicker">REVIEW GUARDRAILS</p><ul><li>Drafts stay inside this screen until you copy them.</li><li>Prices, stock and client records are never modified.</li><li>Check cultural details and claims before publishing.</li></ul></article><article className="admin-card draft-output" aria-live="polite"><p className="card-kicker">DRAFT OUTPUT</p>{draft ? <><p>{draft}</p><button className="text-button" onClick={() => void navigator.clipboard.writeText(draft)}>Copy draft</button></> : <Empty icon="✦" title="Ready when you are" body="Add your product details and generate a reviewable first draft." />}</article></div></div></>;
}

function Settings({ settings, act }: { settings: Record<string, string>; act: (payload: Record<string, unknown>, success: string) => Promise<boolean> }) {
  const [form, setForm] = useState({ storeName: settings.storeName ?? "NAROK DESIGN", announcement: settings.announcement ?? "Designed in Addis Ababa · Worldwide delivery", shippingThresholdEtb: settings.shippingThresholdEtb ?? "30000", currency: settings.currency ?? "ETB" });
  return <div className="settings-layout"><article className="settings-note"><p className="card-kicker">STOREFRONT DETAILS</p><h2>Small details set the tone.</h2><p>Keep public-facing store information clear, current and consistent. These values are persisted for future storefront integrations.</p></article><form className="admin-card settings-form" onSubmit={(event) => { event.preventDefault(); void act({ action: "settings.update", ...form }, "Store settings saved."); }}><label>Store name<input value={form.storeName} onChange={(event) => setForm({ ...form, storeName: event.target.value })} /></label><label>Announcement<textarea value={form.announcement} onChange={(event) => setForm({ ...form, announcement: event.target.value })} /></label><div><label>Shipping threshold (ETB)<input inputMode="numeric" value={form.shippingThresholdEtb} onChange={(event) => setForm({ ...form, shippingThresholdEtb: event.target.value })} /></label><label>Primary currency<select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}><option>ETB</option><option>USD</option></select></label></div><button className="primary-button" type="submit">Save settings</button></form></div>;
}

function ProductModal({ close, act }: { close: () => void; act: (payload: Record<string, unknown>, success: string) => Promise<boolean> }) {
  const [form, setForm] = useState({ sku: "", nameEn: "", nameAm: "", typeEn: "", typeAm: "", category: "women", usd: "", etb: "", stock: "0", imagePosition: "left", madeToOrder: false, status: "draft" });
  async function submit(event: FormEvent) { event.preventDefault(); const saved = await act({ action: "product.create", ...form, usd: Number(form.usd), etb: Number(form.etb), stock: Number(form.stock) }, `${form.nameEn} added to the catalogue.`); if (saved) close(); }
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><button className="modal-close" onClick={close} aria-label="Close">×</button><p className="card-kicker">CATALOGUE ENTRY</p><h2 id="product-modal-title">Add a garment</h2><p>Create it as a draft, then publish when every detail is ready.</p><form onSubmit={submit}><label>Product name (English)<input required value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></label><label>Product name (Amharic)<input value={form.nameAm} onChange={(e) => setForm({ ...form, nameAm: e.target.value })} /></label><label>SKU<input required placeholder="ND-W-003" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="women">Women</option><option value="men">Men</option><option value="children">Children</option></select></label><label>Type / material (English)<input required value={form.typeEn} onChange={(e) => setForm({ ...form, typeEn: e.target.value })} /></label><label>Type / material (Amharic)<input value={form.typeAm} onChange={(e) => setForm({ ...form, typeAm: e.target.value })} /></label><label>Price (ETB)<input required min="0" type="number" value={form.etb} onChange={(e) => setForm({ ...form, etb: e.target.value })} /></label><label>Price (USD)<input required min="0" type="number" value={form.usd} onChange={(e) => setForm({ ...form, usd: e.target.value })} /></label><label>Stock<input required min="0" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="active">Active</option></select></label><label className="check-label"><input type="checkbox" checked={form.madeToOrder} onChange={(e) => setForm({ ...form, madeToOrder: e.target.checked })} /> Made to order</label><button className="primary-button" type="submit">Add garment</button></form></section></div>;
}

function Empty({ icon, title, body }: { icon: string; title: string; body: string }) { return <div className="admin-empty"><span aria-hidden="true">{icon}</span><h3>{title}</h3><p>{body}</p></div>; }
