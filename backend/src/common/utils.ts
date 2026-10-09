import { createHash } from "node:crypto";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return hashPassword(plain) === hashed;
}

export function generateToken(userId: string): string {
  const nonce = Math.random().toString(36).substring(2, 10);
  return `tk_${userId}_${nonce}`;
}

export function generateId(prefix: string = "id"): string {
  const rand = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${rand}`;
}

export function parseJsonSafe<T>(val: unknown, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === "object") return val as T;
  try {
    return JSON.parse(String(val)) as T;
  } catch {
    return fallback;
  }
}
