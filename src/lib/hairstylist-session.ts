import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "hairstylist_session";
const SECRET = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "fallback-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface HairstylistSessionPayload {
  id: number;
  email: string;
  iat: number;
}

function sign(payload: Omit<HairstylistSessionPayload, "iat">): string {
  const data = JSON.stringify({ ...payload, iat: Date.now() });
  const signature = createHmac("sha256", SECRET).update(data).digest("hex");
  return Buffer.from(JSON.stringify({ data, sig: signature })).toString("base64url");
}

function verify(token: string): HairstylistSessionPayload | null {
  try {
    const raw = JSON.parse(Buffer.from(token, "base64url").toString());
    const expected = createHmac("sha256", SECRET).update(raw.data).digest("hex");
    const a = Buffer.from(raw.sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(raw.data) as HairstylistSessionPayload;
    if (!parsed.id || !parsed.email) return null;
    if (parsed.iat && Date.now() - parsed.iat > MAX_AGE * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getHairstylistSessionToken(payload: Omit<HairstylistSessionPayload, "iat">): string {
  return sign(payload);
}

export function parseHairstylistSessionToken(token: string): HairstylistSessionPayload | null {
  return verify(token);
}

export async function getHairstylistSessionFromCookie(): Promise<HairstylistSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return parseHairstylistSessionToken(token);
}

/** Read hairstylist session from request Cookie header (use in Route Handlers for reliable cookie access) */
export function getHairstylistSessionFromRequest(request: Request): HairstylistSessionPayload | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = new RegExp(`${COOKIE_NAME}=([^;]+)`).exec(cookieHeader);
  let token = match?.[1]?.trim();
  if (!token) return null;
  try {
    token = decodeURIComponent(token);
  } catch {
    // token may not be encoded
  }
  return parseHairstylistSessionToken(token);
}

export function getHairstylistCookieName(): string {
  return COOKIE_NAME;
}

export function getHairstylistCookieMaxAge(): number {
  return MAX_AGE;
}
