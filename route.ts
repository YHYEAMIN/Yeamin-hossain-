import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { couriers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const key of ["name", "provider", "baseUrl", "apiKey", "secretKey", "priority", "isActive", "note"]) {
    if (body[key] !== undefined) patch[key] = body[key];
  }
  // keep existing secrets when masked value submitted
  if (patch.apiKey === "••••" || patch.secretKey === "••••") delete patch.apiKey;
  if (patch.secretKey === "••••") delete patch.secretKey;
  await db.update(couriers).set(patch).where(eq(couriers.id, parseInt(id, 10)));
  const [row] = await db.select().from(couriers).where(eq(couriers.id, parseInt(id, 10)));
  return NextResponse.json({ courier: row });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(couriers).where(eq(couriers.id, parseInt(id, 10)));
  return NextResponse.json({ ok: true });
}
