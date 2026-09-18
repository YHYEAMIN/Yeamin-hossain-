import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "admin_session";

function secret() {
  return process.env.ADMIN_SECRET || "dev-admin-secret-change-me";
}

export function makeToken(password: string) {
  const payload = "admin";
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string | undefined) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  return password === expected;
}

export async function createSession() {
  const jar = await cookies();
  jar.set(COOKIE, makeToken("admin"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAuthed() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

export async function requireAdmin() {
  const ok = await isAuthed();
  if (!ok) {
    throw new Error("UNAUTHORIZED");
  }
}
