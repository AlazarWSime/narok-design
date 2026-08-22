import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { normalizeNewsletterEmail, validateCustomOrder } from "../app/lib/submissionValidation.ts";

const root = new URL("../", import.meta.url);

async function getWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

async function request(pathname, init = {}) {
  const worker = await getWorker();
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html", ...init.headers }, ...init }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

let miniflare;
async function getMiniflare() {
  if (!miniflare) {
    const serverRoot = fileURLToPath(new URL("../dist/server/", import.meta.url));
    const modulePaths = (await readdir(serverRoot, { recursive: true })).filter((name) => name.endsWith(".js"));
    const modules = Object.fromEntries(await Promise.all(modulePaths.map(async (name) => [name.replaceAll("\\", "/"), { type: "esm", contents: await readFile(new URL(`../dist/server/${name.replaceAll("\\", "/")}`, import.meta.url), "utf8") }])));
    miniflare = new Miniflare({ workers: [{ config: {
      name: "narok-integration",
      type: "worker",
      compatibilityDate: "2026-08-21",
      compatibilityFlags: ["nodejs_compat"],
      manifest: { mainModule: "index.js", modulesRoot: serverRoot, modules },
      env: {
        DB: { type: "d1", name: "narok-integration" },
        ADMIN_EMAILS: { type: "text", value: "owner@example.com" },
        CUSTOM_ORDER_RETENTION_DAYS: { type: "text", value: "730" },
        SITE_URL: { type: "text", value: "http://localhost" },
      },
    } }] });
    await miniflare.ready;
  }
  return miniflare;
}

async function api(pathname, init = {}) {
  const runtime = await getMiniflare();
  return runtime.dispatchFetch(`http://localhost${pathname}`, {
    ...init,
    headers: { accept: "application/json", ...init.headers },
  });
}

after(async () => { if (miniflare) await miniflare.dispose(); });

for (const [pathname, expected] of [
  ["/", "Ethiopian Heritage, Made for the World"],
  ["/shop", "Clothing made to carry Ethiopian heritage forward"],
  ["/collection", "A wardrobe shaped by place, memory and celebration"],
  ["/custom-orders", "Made around your measurements, color and occasion"],
  ["/about", "Ethiopian design, created in Addis Ababa for the world"],
  ["/checkout", "Your bag is empty"],
]) {
  test(`server-renders ${pathname}`, async () => {
    const response = await request(pathname);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    const html = await response.text();
    assert.match(html, /NAROK DESIGN/);
    assert.match(html, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    assert.doesNotMatch(html, /Your site is taking shape|Building your site|codex-preview/i);
  });
}

test("publishes complete trusted social metadata", async () => {
  const response = await request("/");
  const html = await response.text();
  assert.match(html, /<title>NAROK DESIGN — Ethiopian Heritage, Made for the World<\/title>/i);
  assert.match(html, /og-narok\.png/i);
  assert.doesNotMatch(html, /x-forwarded-host/i);
});

test("validates and normalizes public submissions", () => {
  assert.equal(validateCustomOrder({ name: "A" }).ok, false);
  const valid = validateCustomOrder({ name: " Tigist ", contact: "hello@example.com", garment: "Habesha kemis", measurements: "Height 170", color: "Ivory", fabric: "Cotton", selectedProductIds: [1, "2", 3] });
  assert.equal(valid.ok, true);
  assert.deepEqual(valid.ok ? valid.order.selectedProductIds : [], [1, 3]);
  assert.equal(normalizeNewsletterEmail("  HELLO@EXAMPLE.COM "), "hello@example.com");
  assert.equal(normalizeNewsletterEmail("not-an-email"), null);
});

test("uses owned catalogue assets and enables D1 persistence", async () => {
  const [catalogue, runtime, hosting, layout, home, inner] = await Promise.all([
    readFile(new URL("app/data/catalog.ts", root), "utf8"),
    readFile(new URL("db/runtime.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/InnerPage.tsx", root), "utf8"),
  ]);
  assert.doesNotMatch(catalogue, /https?:\/\//);
  assert.match(runtime, /narok-women\.png/);
  assert.equal(JSON.parse(hosting).d1, "DB");
  assert.doesNotMatch(layout, /x-forwarded-host|headers\(\)/);
  assert.match(home, /role="dialog"/);
  assert.match(inner, /role="dialog"/);
});

test("protects the private admin workspace and exposes all requested sections", async () => {
  for (const pathname of ["/admin", "/admin/products", "/admin/orders", "/admin/bespoke", "/admin/analytics", "/admin/ai-studio", "/admin/settings"]) {
    const response = await request(pathname);
    assert.ok([301, 302, 303, 307, 308].includes(response.status), `${pathname} must redirect anonymous visitors`);
    assert.match(response.headers.get("location") ?? "", /signin-with-chatgpt/i);
  }
  const [page, dashboard, sectionPage, auth] = await Promise.all([
    readFile(new URL("app/admin/AdminDashboard.tsx", root), "utf8"),
    readFile(new URL("app/api/admin/dashboard/route.ts", root), "utf8"),
    readFile(new URL("app/admin/[section]/page.tsx", root), "utf8"),
    readFile(new URL("app/chatgpt-auth.ts", root), "utf8"),
  ]);
  for (const section of ["Overview", "Products", "Orders", "Bespoke", "Analytics", "AI Studio", "Settings"]) assert.match(page, new RegExp(section));
  for (const pathname of ["/admin/products", "/admin/orders", "/admin/bespoke", "/admin/analytics", "/admin/ai-studio", "/admin/settings"]) assert.match(page, new RegExp(pathname.replaceAll("/", "\\/")));
  assert.match(sectionPage, /requireChatGPTUser/);
  assert.match(page, /REVENUE TREND/);
  assert.match(page, /WEEKLY BRIEF/);
  assert.match(dashboard, /getChatGPTUser/);
  assert.match(auth, /ADMIN_EMAILS/);
});

test("keeps the profile control account-focused while exposing server-authorized admin state", async () => {
  const previousAdminEmails = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = "owner@example.com";
  const response = await request("/api/session", { headers: {
    "oai-authenticated-user-id": "test-owner",
    "oai-authenticated-user-email": "owner@example.com",
    "oai-authenticated-user-full-name": "Narok%20Admin",
    "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
  } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { authenticated: true, isAdmin: true, displayName: "Narok Admin" });
  if (previousAdminEmails === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = previousAdminEmails;
  const [home, inner, control] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/InnerPage.tsx", root), "utf8"),
    readFile(new URL("app/components/ProfileControl.tsx", root), "utf8"),
  ]);
  assert.match(home, /ProfileControl/);
  assert.match(inner, /ProfileControl/);
  assert.match(control, /My account/);
  assert.match(control, /href="\/account"/);
  assert.doesNotMatch(control, /admin-profile-link|Admin dashboard/);
});

test("includes a distinct admin section in every burger menu", async () => {
  const [home, inner, styles] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/InnerPage.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  for (const menu of [home, inner]) {
    assert.match(menu, /"\/admin"/);
    assert.match(menu, /menu-admin-entry/);
    assert.match(menu, /አስተዳዳሪ/);
  }
  assert.match(styles, /\.menu-panel nav a\.menu-admin-entry/);
});

test("provides a working catalogue search bar beside every burger menu", async () => {
  const [home, inner, styles] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/InnerPage.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  assert.match(home, /className="header-left"><button className="header-action menu-trigger"[\s\S]*?<form className="header-search-bar" role="search" onSubmit=\{runSearch\}/);
  assert.match(inner, /className="header-left"><button className="header-action menu-trigger"[\s\S]*?<form className="header-search-bar" role="search" onSubmit=\{runSearch\}/);
  assert.match(home, /product\.sku \?\? ""/);
  assert.match(inner, /<ShopContent[\s\S]*?query=\{query\}/);
  assert.match(inner, /product\.name\.en[\s\S]*?product\.type\.am[\s\S]*?product\.sku/);
  for (const source of [home, inner]) assert.doesNotMatch(source, /header-search-trigger/);
  assert.match(styles, /\.header-search-bar \{/);
  assert.match(styles, /\.search-glyph::after/);
});

test("opens a full-screen live catalogue from every search icon", async () => {
  const [home, inner, overlay, focusHook, styles] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/InnerPage.tsx", root), "utf8"),
    readFile(new URL("app/components/SearchOverlay.tsx", root), "utf8"),
    readFile(new URL("app/hooks/usePanelFocus.ts", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  for (const source of [home, inner]) {
    assert.match(source, /className="header-search-launch" onClick=\{\(\) => setSearchOpen\(true\)\}/);
    assert.match(source, /<SearchOverlay open=\{searchOpen\}/);
  }
  assert.match(overlay, /className="catalogue-search-overlay" role="dialog" aria-modal="true"/);
  assert.match(overlay, /Suggested searches/);
  assert.match(overlay, /filteredProducts/);
  assert.match(overlay, /<ProductGrid products=\{filteredProducts\}/);
  assert.match(overlay, /data-panel-autofocus/);
  assert.match(focusHook, /data-panel-autofocus/);
  assert.match(styles, /\.catalogue-search-overlay \{/);
  assert.match(styles, /body:has\(\.catalogue-search-overlay\)/);
});

test("removes the announcement strip from every public storefront layout", async () => {
  const [home, inner, styles] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/InnerPage.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  for (const source of [home, inner]) assert.doesNotMatch(source, /className="announcement"/);
  assert.doesNotMatch(styles, /\.announcement\s*\{/);
});

test("keeps the storefront public while protecting customer account pages", async () => {
  const anonymousHome = await request("/");
  assert.equal(anonymousHome.status, 200);
  const anonymousSession = await request("/api/session");
  assert.deepEqual(await anonymousSession.json(), { authenticated: false, isAdmin: false, displayName: null });
  const anonymousAccount = await request("/account");
  assert.ok([301, 302, 303, 307, 308].includes(anonymousAccount.status));
  assert.match(anonymousAccount.headers.get("location") ?? "", /signin-with-chatgpt/i);
  const customerAccount = await request("/account", { headers: {
    "oai-authenticated-user-id": "customer-1",
    "oai-authenticated-user-email": "customer@example.com",
    "oai-authenticated-user-full-name": "Aster%20Bekele",
    "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
  } });
  assert.equal(customerAccount.status, 200);
  assert.match(await customerAccount.text(), /Aster Bekele/i);
});

test("uses the admin dashboard visual system for the customer profile", async () => {
  const [account, accountStyles, adminStyles] = await Promise.all([
    readFile(new URL("../app/account/AccountDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/account/account.css", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/admin.css", import.meta.url), "utf8"),
  ]);
  assert.match(account, /account-sidebar/);
  assert.match(account, /account-topbar/);
  for (const color of ["#003f31", "#f7f5f0", "#fcfbf8", "#b74d24", "#d9eee4"]) {
    assert.match(accountStyles, new RegExp(color));
    assert.match(adminStyles, new RegExp(color));
  }
});

test("renders a buyable catalogue and safe payment choices", async () => {
  const [home, inner, checkout, orders] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/InnerPage.tsx", root), "utf8"),
    readFile(new URL("app/checkout/Checkout.tsx", root), "utf8"),
    readFile(new URL("app/api/orders/route.ts", root), "utf8"),
  ]);
  for (const storefront of [home, inner]) assert.match(storefront, /\/checkout/);
  for (const storefront of [home, inner]) assert.match(storefront, /Cart|Add to cart/);
  assert.match(await readFile(new URL("app/components/ProductGrid.tsx", root), "utf8"), /🛒/);
  for (const method of ["telebirr", "bank_transfer", "cash_on_delivery"]) {
    assert.match(checkout, new RegExp(method));
    assert.match(orders, new RegExp(method));
  }
  assert.match(checkout, /No card or mobile-money credentials are collected/);
  assert.match(orders, /SELECT id, sku, name_en AS name, etb, stock/);
});

test("opens a D1-backed product detail page from every catalogue card", async () => {
  const [grid, detail, page, styles] = await Promise.all([
    readFile(new URL("app/components/ProductGrid.tsx", root), "utf8"),
    readFile(new URL("app/products/[id]/ProductDetail.tsx", root), "utf8"),
    readFile(new URL("app/products/[id]/page.tsx", root), "utf8"),
    readFile(new URL("app/products/[id]/product.css", root), "utf8"),
  ]);
  assert.match(grid, /href={`\/products\/\$\{product\.id\}`}/);
  assert.match(grid, /product-image-link/);
  assert.match(detail, /product-detail-layout/);
  assert.match(detail, /Select your size/);
  assert.match(detail, /Add to cart/);
  assert.match(page, /generateMetadata/);
  assert.match(page, /catalog_products WHERE id = \? AND status = 'active'/);
  assert.match(styles, /grid-template-columns: 58% 42%/);
  const response = await api("/products/1", { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Addis Tibeb Kemis/);
  assert.match(html, /Addis Tibeb Kemis \| NAROK DESIGN/);
});

const customerHeaders = {
  "content-type": "application/json",
  "oai-authenticated-user-id": "integration-customer",
  "oai-authenticated-user-email": "integration@example.com",
  "oai-authenticated-user-full-name": "Integration%20Customer",
  "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
};
const adminHeaders = {
  "content-type": "application/json",
  "oai-authenticated-user-id": "integration-owner",
  "oai-authenticated-user-email": "owner@example.com",
  "oai-authenticated-user-full-name": "Narok%20Owner",
  "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
};
const validOrder = {
  name: "Integration Customer",
  contact: "+251900000000",
  garment: "Women’s Habesha kemis",
  measurements: "Height 170, chest 92",
  color: "Ivory",
  fabric: "Handwoven cotton",
  selectedProductIds: [1, 2],
};

test("persists newsletter and public/authenticated enquiries in D1", async () => {
  const runtime = await getMiniflare();
  const db = await runtime.getD1Database("DB");
  const newsletter = await api("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "D1@example.com", language: "am" }) });
  assert.equal(newsletter.status, 201);
  assert.deepEqual(await db.prepare("SELECT email, language FROM newsletter_subscribers WHERE email = ?").bind("d1@example.com").first(), { email: "d1@example.com", language: "am" });

  const publicEnquiry = await api("/api/custom-orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...validOrder, name: "Public Customer", contact: "public@example.com" }) });
  assert.equal(publicEnquiry.status, 201);
  assert.equal((await publicEnquiry.json()).ownership, "public");
  const authenticatedEnquiry = await api("/api/custom-orders", { method: "POST", headers: customerHeaders, body: JSON.stringify(validOrder) });
  assert.equal(authenticatedEnquiry.status, 201);
  assert.equal((await authenticatedEnquiry.json()).ownership, "account");
  const owned = await db.prepare("SELECT user_id AS userId, contact FROM custom_orders WHERE user_id = ?").bind("integration-customer").first();
  assert.deepEqual(owned, { userId: "integration-customer", contact: "+251900000000" });

  const account = await api("/api/account", { headers: customerHeaders });
  assert.equal(account.status, 200);
  const accountData = await account.json();
  assert.equal(accountData.enquiries.length, 1);
  assert.equal(accountData.profile.userId, "integration-customer");
  assert.equal(accountData.profile.accountType, "Customer");
  assert.equal(accountData.profile.email, "integration@example.com");
  assert.ok(accountData.profile.memberSince);
});

test("creates price-verified public and authenticated storefront orders", async () => {
  const runtime = await getMiniflare();
  const db = await runtime.getD1Database("DB");
  assert.equal((await api("/api/orders")).status, 401);
  const delivery = { fullName: "Storefront Buyer", email: "buyer@example.com", phone: "+251911111111", address: "Bole Road", city: "Addis Ababa" };
  const publicOrder = await api("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...delivery, paymentMethod: "cash_on_delivery", items: [{ productId: 1, quantity: 1 }], totalEtb: 1 }) });
  assert.equal(publicOrder.status, 201);
  const publicResult = await publicOrder.json();
  assert.equal(publicResult.ownership, "public");
  assert.equal(publicResult.totalEtb, 31000);
  const publicRow = await db.prepare("SELECT user_id AS userId, total_etb AS totalEtb, payment_method AS paymentMethod, payment_status AS paymentStatus FROM client_orders WHERE order_number = ?").bind(publicResult.orderNumber).first();
  assert.deepEqual(publicRow, { userId: null, totalEtb: 31000, paymentMethod: "cash_on_delivery", paymentStatus: "pending" });
  assert.equal(await db.prepare("SELECT stock FROM catalog_products WHERE id = 1").first("stock"), 3);

  const authenticatedOrder = await api("/api/orders", { method: "POST", headers: customerHeaders, body: JSON.stringify({ ...delivery, fullName: "Integration Customer", email: "integration@example.com", paymentMethod: "telebirr", items: [{ productId: 5, quantity: 2 }] }) });
  assert.equal(authenticatedOrder.status, 201);
  const authenticatedResult = await authenticatedOrder.json();
  assert.equal(authenticatedResult.ownership, "account");
  assert.equal(authenticatedResult.totalEtb, 27000);
  const owned = await db.prepare("SELECT user_id AS userId FROM client_orders WHERE order_number = ?").bind(authenticatedResult.orderNumber).first();
  assert.deepEqual(owned, { userId: "integration-customer" });
  const history = await api("/api/orders", { headers: customerHeaders });
  assert.equal(history.status, 200);
  assert.ok((await history.json()).orders.some((order) => order.orderNumber === authenticatedResult.orderNumber));
  const account = await api("/api/account", { headers: customerHeaders });
  assert.ok((await account.json()).orders.some((order) => order.orderNumber === authenticatedResult.orderNumber));
  const unavailable = await api("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...delivery, paymentMethod: "bank_transfer", items: [{ productId: 999, quantity: 1 }] }) });
  assert.equal(unavailable.status, 409);
});

test("enforces and cleans D1-backed submission rate limits", async () => {
  const runtime = await getMiniflare();
  const db = await runtime.getD1Database("DB");
  await db.prepare("DELETE FROM submission_rate_limits").run();
  await db.prepare("INSERT INTO submission_rate_limits (key, attempts, reset_at) VALUES ('expired:test', 99, 1)").run();
  const statuses = [];
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await api("/api/custom-orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...validOrder, name: `Rate Test ${attempt}` }) });
    statuses.push(response.status);
  }
  assert.deepEqual(statuses, [201, 201, 201, 201, 201, 429]);
  assert.equal(await db.prepare("SELECT COUNT(*) AS count FROM submission_rate_limits WHERE key = 'expired:test'").first("count"), 0);
});

test("enforces admin authorization and applies catalogue settings", async () => {
  assert.equal((await api("/api/admin/dashboard")).status, 401);
  assert.equal((await api("/api/admin/dashboard", { headers: customerHeaders })).status, 403);
  assert.equal((await api("/api/admin/dashboard", { headers: adminHeaders })).status, 200);

  const update = await api("/api/admin/actions", { method: "POST", headers: adminHeaders, body: JSON.stringify({ action: "settings.update", storeName: "NAROK TEST", announcement: "Integration announcement", shippingThresholdEtb: "45000", currency: "USD" }) });
  assert.equal(update.status, 200);
  const catalog = await api("/api/catalog");
  assert.equal(catalog.status, 200);
  assert.deepEqual((await catalog.json()).settings, { storeName: "NAROK TEST", announcement: "Integration announcement", shippingThresholdEtb: 45000, currency: "USD" });
});

test("converts an owned bespoke enquiry into a client order with product snapshots", async () => {
  const runtime = await getMiniflare();
  const db = await runtime.getD1Database("DB");
  await db.prepare("DELETE FROM submission_rate_limits").run();
  const enquiryResponse = await api("/api/custom-orders", { method: "POST", headers: customerHeaders, body: JSON.stringify({ ...validOrder, name: "Order Conversion" }) });
  assert.equal(enquiryResponse.status, 201);
  const enquiry = await db.prepare("SELECT id FROM custom_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").bind("integration-customer").first();
  const conversion = await api("/api/admin/actions", { method: "POST", headers: adminHeaders, body: JSON.stringify({ action: "bespoke.convert", id: enquiry.id, totalEtb: 55555 }) });
  assert.equal(conversion.status, 201);
  const order = await db.prepare("SELECT source_enquiry_id AS sourceEnquiryId, total_etb AS totalEtb, items_json AS itemsJson FROM client_orders WHERE source_enquiry_id = ?").bind(enquiry.id).first();
  assert.equal(order.sourceEnquiryId, enquiry.id);
  assert.equal(order.totalEtb, 55555);
  assert.deepEqual(JSON.parse(order.itemsJson).map((item) => item.sku), ["ND-W-001", "ND-W-002"]);
});
