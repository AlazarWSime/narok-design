"use client";

import { FormEvent, useState } from "react";
import type { Language } from "../data/catalog";

export default function NewsletterForm({ language }: { language: Language }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const copy = language === "en"
    ? { label: "Join the NAROK DESIGN list", placeholder: "Your email address", success: "Welcome to NAROK DESIGN.", error: "We could not add you just now. Please try again.", sending: "Joining…" }
    : { label: "የNAROK DESIGN መረጃ ዝርዝር ይቀላቀሉ", placeholder: "የኢሜይል አድራሻዎ", success: "እንኳን ወደ NAROK DESIGN መጡ።", error: "አሁን ማከል አልቻልንም። እንደገና ይሞክሩ።", sending: "በመቀላቀል ላይ…" };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email");
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, language, website: formData.get("website") }),
    }).catch(() => null);
    if (!response?.ok) {
      setStatus("error");
      return;
    }
    form.reset();
    setStatus("success");
  }

  if (status === "success") return <p className="success-message" role="status">{copy.success}</p>;

  return (
    <form onSubmit={submit} aria-busy={status === "sending"}>
      <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label htmlFor="newsletter-email">{copy.label}</label>
      <div><input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder={copy.placeholder} maxLength={254} required /><button disabled={status === "sending"} aria-label={copy.label}>{status === "sending" ? "…" : "→"}</button></div>
      {status === "error" && <p className="newsletter-error" role="status">{copy.error}</p>}
    </form>
  );
}
