import { createAuthClient } from "better-auth/client";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const authClient = createAuthClient({
  baseURL: API_BASE
});
