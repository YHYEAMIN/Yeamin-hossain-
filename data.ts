import { db } from "@/db";
import { count, desc, eq } from "drizzle-orm";
import { couriers, orderEvents, orders, settings } from "@/db/schema";

export const DEFAULT_SETTINGS: Record<string, string> = {
  product_name: "অর্গানিক বিটক্যাম্প ইমিউনিটি ক্যাপসুল",
  product_subtitle: "শক্তি, ইমিউনিটি ও রুগ্নতা কমায় — ১০০% অর্গানিক ভেষজ",
  regular_price: "1450",
  price: "990",
  delivery_charge: "80",
  free_delivery_qty: "3",
  whatsapp: "01700000000",
  offer_text: "🔥 ঈদ অফার — সীমিত সময়ের জন্য",
  cod_only: "true",
};

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  const out: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
}

export async function setManySettings(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) await setSetting(key, value);
}

export function calcTotals(qty: number, unitPrice: number, deliveryCharge: number, freeQty: number) {
  const subtotal = unitPrice * qty;
  const delivery = qty >= freeQty ? 0 : deliveryCharge;
  return { subtotal, delivery, total: subtotal + delivery };
}

export async function nextOrderCode() {
  const [row] = await db.select({ c: count() }).from(orders);
  const next = (row?.c ?? 0) + 1;
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(next).padStart(4, "0")}`;
}

export async function logEvent(orderId: number, event: string, message?: string) {
  await db.insert(orderEvents).values({ orderId, event, message });
}

export async function getPrimaryCourier() {
  const rows = await db.select().from(couriers).where(eq(couriers.isActive, true)).orderBy(couriers.priority);
  return rows[0] ?? null;
}

export async function getCourierById(id: number) {
  const rows = await db.select().from(couriers).where(eq(couriers.id, id));
  return rows[0] ?? null;
}

export async function getDashboardStats() {
  const all = await db.select().from(orders);
  const real = all.filter((o) => !o.isFake);
  const n = (list: typeof all, f: (o: (typeof all)[number]) => boolean) => list.filter(f).length;
  return {
    total: all.length,
    pending: n(real, (o) => o.status === "pending"),
    confirmed: n(real, (o) => o.status === "confirmed" || o.status === "in_transit"),
    delivered: n(real, (o) => o.status === "delivered" || o.status === "partial_delivered"),
    cancelled: n(real, (o) => o.status === "cancelled" || o.status === "returned"),
    incomplete: n(all, (o) => o.isIncomplete),
    fake: n(all, (o) => o.isFake),
    revenue: real
      .filter((o) => o.status === "delivered" || o.status === "partial_delivered")
      .reduce((a, o) => a + o.totalAmount, 0),
  };
}

export async function getCourierStats() {
  const all = await db.select().from(orders);
  const courierRows = await db.select().from(couriers).orderBy(couriers.priority);
  return courierRows.map((c) => {
    const list = all.filter((o) => o.courierId === c.id && !o.isFake);
    return {
      ...c,
      total: list.length,
      sent: list.filter((o) => ["confirmed", "in_transit", "delivered", "partial_delivered"].includes(o.status)).length,
      delivered: list.filter((o) => o.status === "delivered" || o.status === "partial_delivered").length,
      cancelled: list.filter((o) => o.status === "cancelled" || o.status === "returned").length,
      pending: list.filter((o) => o.status === "pending" || o.status === "incomplete").length,
      codValue: list.reduce((a, o) => a + o.totalAmount, 0),
    };
  });
}

export { desc };
