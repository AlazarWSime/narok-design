import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

function decodeHeader(value: string | null) {
  if (!value) return null;
  try { return decodeURIComponent(value); } catch { return value; }
}

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = decodeHeader(requestHeaders.get("oai-authenticated-user-email"));
  if (!userId || !email) return null;
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName = requestHeaders.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8" ? decodeHeader(encodedFullName) : encodedFullName;
  return { userId, email, fullName, displayName: fullName?.trim() || email.split("@")[0] };
}

export function safeRelativeReturnPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/signin-with-chatgpt") || value.startsWith("/signout")) return "/";
  return value;
}

export function chatGPTSignInPath(returnTo = "/admin") {
  return `/signin-with-chatgpt?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function signOutPath(returnTo = "/") {
  return `/signout-with-chatgpt?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export async function requireChatGPTUser(returnTo = "/admin") {
  const user = await getChatGPTUser();
  if (!user) redirect(chatGPTSignInPath(returnTo));
  return user;
}

export function isAdminEmail(email: string) {
  const configured = process.env.ADMIN_EMAILS?.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean) ?? [];
  return configured.length > 0 && configured.includes(email.toLowerCase());
}
