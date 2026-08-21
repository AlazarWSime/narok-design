export type CustomOrderInput = {
  name?: unknown;
  contact?: unknown;
  garment?: unknown;
  measurements?: unknown;
  color?: unknown;
  fabric?: unknown;
  occasion?: unknown;
  deadline?: unknown;
  notes?: unknown;
  language?: unknown;
  selectedProductIds?: unknown;
  website?: unknown;
};

const text = (value: unknown, maximum: number) => typeof value === "string" ? value.trim().slice(0, maximum) : "";

export function validateCustomOrder(payload: CustomOrderInput) {
  const order = {
    name: text(payload.name, 80),
    contact: text(payload.contact, 120),
    garment: text(payload.garment, 120),
    measurements: text(payload.measurements, 1200),
    color: text(payload.color, 80),
    fabric: text(payload.fabric, 120),
    occasion: text(payload.occasion, 120),
    deadline: text(payload.deadline, 20),
    notes: text(payload.notes, 1600),
    language: payload.language === "am" ? "am" as const : "en" as const,
    selectedProductIds: Array.isArray(payload.selectedProductIds)
      ? payload.selectedProductIds.filter((id): id is number => Number.isInteger(id) && Number(id) > 0 && Number(id) < 1000).slice(0, 20)
      : [],
  };
  const valid = order.name.length >= 2 && order.contact.length >= 5 && Boolean(order.garment) && order.measurements.length >= 5 && Boolean(order.color) && Boolean(order.fabric);
  return valid ? { ok: true as const, order } : { ok: false as const, error: "Please complete all required fields" };
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNewsletterEmail(value: unknown) {
  const email = typeof value === "string" ? value.trim().toLowerCase().slice(0, 254) : "";
  return emailPattern.test(email) ? email : null;
}

