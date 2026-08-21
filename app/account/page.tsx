import type { Metadata } from "next";
import { requireChatGPTUser } from "../chatgpt-auth";
import AccountDashboard from "./AccountDashboard";
import "./account.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Account — NAROK DESIGN", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const user = await requireChatGPTUser("/account");
  return <AccountDashboard initialName={user.displayName} initialEmail={user.email} />;
}

