import { getChatGPTUser, isAdminEmail } from "../../chatgpt-auth";

export async function GET() {
  const user = await getChatGPTUser();
  return Response.json(user ? {
    authenticated: true,
    isAdmin: isAdminEmail(user.email),
    displayName: user.displayName,
  } : {
    authenticated: false,
    isAdmin: false,
    displayName: null,
  }, { headers: { "cache-control": "private, no-store" } });
}

