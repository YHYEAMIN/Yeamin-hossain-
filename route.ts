import { NextResponse } from "next/server";
import { checkPassword, createSession, isAuthed } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!checkPassword(String(body.password ?? ""))) {
    return NextResponse.json({ error: "পাসওয়ার্ড ভুল হয়েছে" }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ authed: await isAuthed() });
}
