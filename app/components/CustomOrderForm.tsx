"use client";

import { FormEvent, useState } from "react";
import type { Language } from "../data/catalog";
import { products } from "../data/catalog";
import { useSiteState } from "./SiteState";

const text = {
  en: {
    name: "Full name", contact: "Email or WhatsApp", garment: "Garment", choose: "Choose a garment",
    garments: ["Women’s Habesha kemis", "Men’s traditional clothing", "Children’s traditional clothing"],
    measurements: "Measurements", measurementsPlaceholder: "Chest, waist, hip, height, shoulder, sleeve length…",
    color: "Preferred color", fabric: "Fabric preference", fabricPlaceholder: "Handwoven cotton, chiffon, or choose for me",
    occasion: "Occasion", deadline: "Needed by", notes: "Additional notes", submit: "Send custom enquiry",
    selected: "Included from your selection", privacy: "Your details are securely stored so the atelier can respond. No payment is taken on this site.",
    sending: "Sending…", success: "Thank you. Your enquiry reference is", error: "We could not save your enquiry. Please check the form and try again.",
  },
  am: {
    name: "ሙሉ ስም", contact: "ኢሜይል ወይም WhatsApp", garment: "ልብስ", choose: "ልብስ ይምረጡ",
    garments: ["የሴቶች ሐበሻ ቀሚስ", "የወንዶች ባህላዊ ልብስ", "የልጆች ባህላዊ ልብስ"],
    measurements: "መጠኖች", measurementsPlaceholder: "ደረት፣ ወገብ፣ ቁመት፣ ትከሻ፣ እጅጌ…",
    color: "የሚፈለግ ቀለም", fabric: "የጨርቅ ምርጫ", fabricPlaceholder: "የእጅ ጥጥ፣ ሺፎን፣ ወይም ምረጡልኝ",
    occasion: "ዝግጅት", deadline: "የሚፈለግበት ቀን", notes: "ተጨማሪ መረጃ", submit: "ብጁ ጥያቄ ይላኩ",
    selected: "ከምርጫዎ የተካተቱ", privacy: "የስፌት ቤቱ ምላሽ እንዲሰጥ መረጃዎ በደህና ይቀመጣል። በዚህ ገጽ ክፍያ አይደረግም።",
    sending: "በመላክ ላይ…", success: "እናመሰግናለን። የጥያቄዎ መለያ", error: "ጥያቄዎን ማስቀመጥ አልቻልንም። ቅጹን ይፈትሹና እንደገና ይሞክሩ።",
  },
};

export default function CustomOrderForm({ language, className = "custom-form" }: { language: Language; className?: string }) {
  const { selection, clearSelection } = useSiteState();
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [reference, setReference] = useState("");
  const t = text[language];
  const selectedProducts = selection.map((id) => products.find((product) => product.id === id)).filter(Boolean);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/custom-orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, language, selectedProductIds: selection }),
    }).catch(() => null);
    if (!response?.ok) {
      setState("error");
      return;
    }
    const result = await response.json() as { reference: string };
    setReference(result.reference);
    setState("success");
    form.reset();
    clearSelection();
  }

  return (
    <form className={className} onSubmit={submit} aria-busy={state === "sending"}>
      <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label>{t.name}<input name="name" autoComplete="name" minLength={2} maxLength={80} required /></label>
      <label>{t.contact}<input name="contact" autoComplete="email" minLength={5} maxLength={120} required /></label>
      <label className="full">{t.garment}<select name="garment" defaultValue="" required><option value="" disabled>{t.choose}</option>{t.garments.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="full">{t.measurements}<textarea name="measurements" placeholder={t.measurementsPlaceholder} minLength={5} maxLength={1200} required /></label>
      <label>{t.color}<input name="color" maxLength={80} required /></label>
      <label>{t.fabric}<input name="fabric" placeholder={t.fabricPlaceholder} maxLength={120} required /></label>
      <label>{t.occasion}<input name="occasion" maxLength={120} /></label>
      <label>{t.deadline}<input name="deadline" type="date" /></label>
      <label className="full">{t.notes}<textarea name="notes" maxLength={1600} /></label>
      {selectedProducts.length > 0 && <div className="selected-products full"><strong>{t.selected}</strong><ul>{selectedProducts.map((product, index) => <li key={`${product!.id}-${index}`}>{product!.name[language]}</li>)}</ul></div>}
      <div className="form-submit full"><button type="submit" disabled={state === "sending"}>{state === "sending" ? t.sending : t.submit} <span aria-hidden="true">→</span></button><small>{t.privacy}</small></div>
      <div className="full form-message" aria-live="polite">
        {state === "success" && <p className="form-success">{t.success} <strong>{reference}</strong>.</p>}
        {state === "error" && <p className="form-error">{t.error}</p>}
      </div>
    </form>
  );
}
