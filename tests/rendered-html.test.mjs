import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
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

for (const [pathname, expected] of [
  ["/", "Ethiopian Heritage, Made for the World"],
  ["/shop", "Clothing made to carry Ethiopian heritage forward"],
  ["/collection", "A wardrobe shaped by place, memory and celebration"],
  ["/custom-orders", "Made around your measurements, color and occasion"],
  ["/about", "Ethiopian design, created in Addis Ababa for the world"],
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
  const [catalogue, hosting, layout, home, inner] = await Promise.all([
    readFile(new URL("app/data/catalog.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/InnerPage.tsx", root), "utf8"),
  ]);
  assert.doesNotMatch(catalogue, /https?:\/\//);
  assert.match(catalogue, /narok-women\.png/);
  assert.equal(JSON.parse(hosting).d1, "DB");
  assert.doesNotMatch(layout, /x-forwarded-host|headers\(\)/);
  assert.match(home, /role="dialog"/);
  assert.match(inner, /role="dialog"/);
});

test("protects the private admin workspace and exposes all requested sections", async () => {
  const response = await request("/admin");
  assert.ok([301, 302, 303, 307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /signin-with-chatgpt/i);
  const [page, dashboard, auth] = await Promise.all([
    readFile(new URL("app/admin/AdminDashboard.tsx", root), "utf8"),
    readFile(new URL("app/api/admin/dashboard/route.ts", root), "utf8"),
    readFile(new URL("app/chatgpt-auth.ts", root), "utf8"),
  ]);
  for (const section of ["Overview", "Products", "Orders", "Bespoke", "Analytics", "AI Studio", "Settings"]) assert.match(page, new RegExp(section));
  assert.match(dashboard, /getChatGPTUser/);
  assert.match(auth, /ADMIN_EMAILS/);
});

test("exposes the admin-aware profile session without trusting the client", async () => {
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
  assert.match(control, /Admin dashboard/);
  assert.match(control, /href="\/admin"/);
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
