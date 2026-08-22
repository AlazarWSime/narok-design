import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminEmail, requireChatGPTUser } from "../../chatgpt-auth";
import AdminDashboard, { type AdminSection } from "../AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Atelier — NAROK DESIGN", robots: { index: false, follow: false } };

const sections: Record<string, AdminSection> = {
  products: "products",
  orders: "orders",
  bespoke: "bespoke",
  analytics: "analytics",
  "ai-studio": "ai",
  settings: "settings",
};

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const selected = sections[section];
  if (!selected) redirect("/admin");
  const returnTo = `/admin/${section}`;
  const user = await requireChatGPTUser(returnTo);
  if (!isAdminEmail(user.email)) redirect("/");
  return <AdminDashboard displayName={user.displayName} section={selected} />;
}
