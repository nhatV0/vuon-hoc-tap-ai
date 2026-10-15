import { createAuthClient } from "better-auth/client";

export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? `${window.location.protocol}//${window.location.host}`
    : "http://localhost:8000");

export const authClient = createAuthClient({
  baseURL: API_BASE
});

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem("sunflower_token");
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = getAuthHeaders((init?.headers as Record<string, string>) || {});
  return fetch(url, {
    ...init,
    headers
  });
}
