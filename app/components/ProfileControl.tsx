"use client";

import { useEffect, useState } from "react";

type Session = { authenticated: boolean; isAdmin: boolean; displayName: string | null };

export default function ProfileControl({ language = "en" }: { language?: "en" | "am" }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/session", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Session unavailable")))
      .then((value: Session) => { if (active) setSession(value); })
      .catch(() => { if (active) setSession({ authenticated: false, isAdmin: false, displayName: null }); });
    return () => { active = false; };
  }, []);

  const adminLabel = language === "am" ? "የአስተዳዳሪ ዳሽቦርድ" : "Admin dashboard";
  const accountLabel = language === "am" ? "የእኔ መለያ" : "My account";
  const signInLabel = language === "am" ? "ይግቡ" : "Sign in";
  const label = session?.isAdmin ? adminLabel : session?.authenticated ? accountLabel : signInLabel;
  const content = <><span className="profile-glyph" aria-hidden="true" /><span className="profile-copy">{label}{session?.authenticated && session.displayName ? <small>{session.displayName}</small> : null}</span></>;

  if (session?.isAdmin) return <a className="profile-control admin-profile-link" href="/admin" aria-label={adminLabel}>{content}</a>;
  if (session?.authenticated) return <a className="profile-control" href="/account" aria-label={accountLabel}>{content}</a>;
  return <a className="profile-control" href="/signin-with-chatgpt?return_to=%2Faccount" aria-label={signInLabel}>{content}</a>;
}
