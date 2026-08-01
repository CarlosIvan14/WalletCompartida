import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "wallet_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Falta la variable de entorno AUTH_SECRET.");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionCookieValue(): string {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = `authenticated.${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function isValidSessionCookieValue(value: string | undefined): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [tag, expiresStr, signature] = parts;
  if (tag !== "authenticated") return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const expectedSignature = sign(`${tag}.${expiresStr}`);
  const sigBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (sigBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return isValidSessionCookieValue(value);
}

export function checkPin(pin: string): boolean {
  const appPin = process.env.APP_PIN;
  if (!appPin) {
    throw new Error("Falta la variable de entorno APP_PIN.");
  }
  const a = Buffer.from(pin);
  const b = Buffer.from(appPin);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export { COOKIE_NAME, SESSION_DURATION_MS };
