import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCourierStats, getDashboardStats } from "@/lib/data";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ stats: await getDashboardStats(), couriers: await getCourierStats() });
}
