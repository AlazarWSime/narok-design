import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminEmail, requireChatGPTUser } from "../chatgpt-auth";
import AdminDashboard from "./AdminDashboard";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Atelier — NAROK DESIGN", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (!isAdminEmail(user.email)) redirect("/");
  return <AdminDashboard displayName={user.displayName} />;
}

