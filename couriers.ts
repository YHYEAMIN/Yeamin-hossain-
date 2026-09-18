export type Courier = {
  id: number;
  name: string;
  provider: string;
  baseUrl: string | null;
  apiKey: string | null;
  secretKey: string | null;
};

export type CourierOrderInput = {
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
  itemDescription?: string;
  alternativePhone?: string | null;
};

export type CourierResult = {
  ok: boolean;
  consignmentId?: string | null;
  trackingCode?: string | null;
  status?: string | null;
  message?: string;
  raw?: unknown;
};

function normalizePhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "").replace(/^\+?88/, "");
  if (/^01\d{9}$/.test(digits)) return "0" + digits.slice(1);
  return digits;
}

async function callJson(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

/** Steadfast Courier (portal.packzy.com / portal.steadfast.com.bd) */
export async function steadfastCreateOrder(courier: Courier, input: CourierOrderInput): Promise<CourierResult> {
  const base = (courier.baseUrl || "https://portal.packzy.com/api/v1").replace(/\/$/, "");
  const body = {
    invoice: input.invoice,
    recipient_name: input.recipientName,
    recipient_phone: normalizePhone(input.recipientPhone),
    recipient_address: input.recipientAddress,
    cod_amount: input.codAmount,
    note: input.note ?? "",
    item_description: input.itemDescription ?? "Health supplement",
  };
  const payload: Record<string, unknown> = { ...body };
  if (input.alternativePhone) payload.alternative_phone = normalizePhone(input.alternativePhone);

  try {
    const { status, data } = await callJson(`${base}/create_order`, {
      method: "POST",
      headers: {
        "Api-Key": courier.apiKey ?? "",
        "Secret-Key": courier.secretKey ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const d = (data ?? {}) as Record<string, unknown>;
    const consignment = (d.consignment ?? {}) as Record<string, unknown>;
    const ok = status >= 200 && status < 300 && (d.status === 200 || d.status === "success");
    const failMessage = typeof d.message === "string" ? d.message : undefined;
    return {
      ok,
      consignmentId: typeof consignment.consignment_id === "string" ? consignment.consignment_id : null,
      trackingCode: typeof consignment.tracking_code === "string" ? consignment.tracking_code : null,
      status: typeof d.delivery_status === "string" ? d.delivery_status : String(status),
      message: ok ? "Steadfast এ অর্ডার পাঠানো হয়েছে" : failMessage || `HTTP ${status}`,
      raw: data,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function steadfastStatusByCid(courier: Courier, cid: string): Promise<CourierResult> {
  const base = (courier.baseUrl || "https://portal.packzy.com/api/v1").replace(/\/$/, "");
  try {
    const { status, data } = await callJson(`${base}/status_by_cid/${encodeURIComponent(cid)}`, {
      method: "GET",
      headers: { "Api-Key": courier.apiKey ?? "", "Secret-Key": courier.secretKey ?? "" },
    });
    const d = (data ?? {}) as Record<string, unknown>;
    const msg = typeof d.delivery_status === "string" ? d.delivery_status : typeof d.message === "string" ? d.message : undefined;
    return {
      ok: status >= 200 && status < 300,
      status: typeof d.delivery_status === "string" ? d.delivery_status : null,
      message: msg,
      raw: data,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function steadfastStatusByTracking(courier: Courier, code: string): Promise<CourierResult> {
  const base = (courier.baseUrl || "https://portal.packzy.com/api/v1").replace(/\/$/, "");
  try {
    const { status, data } = await callJson(`${base}/status_by_trackingcode/${encodeURIComponent(code)}`, {
      method: "GET",
      headers: { "Api-Key": courier.apiKey ?? "", "Secret-Key": courier.secretKey ?? "" },
    });
    const d = (data ?? {}) as Record<string, unknown>;
    const msg = typeof d.delivery_status === "string" ? d.delivery_status : typeof d.message === "string" ? d.message : undefined;
    return {
      ok: status >= 200 && status < 300,
      status: typeof d.delivery_status === "string" ? d.delivery_status : null,
      message: msg,
      raw: data,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function sendToCourier(courier: Courier, input: CourierOrderInput): Promise<CourierResult> {
  if (courier.provider === "steadfast") return steadfastCreateOrder(courier, input);
  return { ok: false, message: `${courier.provider} — শুধু ম্যানুয়াল ট্র্যাকিং সাপোর্ট করে` };
}

export async function checkCourierStatus(courier: Courier, cid?: string | null, tracking?: string | null) {
  if (courier.provider === "steadfast") {
    if (cid) return steadfastStatusByCid(courier, cid);
    if (tracking) return steadfastStatusByTracking(courier, tracking);
  }
  return { ok: false, message: "ট্র্যাকিং আইডি নেই" };
}

export function mapCourierStatusToOrderStatus(courierStatus: string | null | undefined): string | null {
  if (!courierStatus) return null;
  const s = courierStatus.toLowerCase().trim();
  if (s.includes("delivered") && !s.includes("partial")) return "delivered";
  if (s.includes("partial")) return "partial_delivered";
  if (s.includes("cancelled")) return "cancelled";
  if (s.includes("return")) return "returned";
  if (s.includes("transit") || s.includes("in_review") || s.includes("pending")) return "in_transit";
  return null;
}
