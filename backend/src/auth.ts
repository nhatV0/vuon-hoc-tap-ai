import { betterAuth } from "better-auth";
import { db } from "./db/client";

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        required: false
      },
      assigned_classes: {
        type: "string",
        defaultValue: "[]",
        required: false
      },
      assigned_subject: {
        type: "string",
        defaultValue: "Toán học",
        required: false
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7 // 7 days
  }
});

export type Auth = typeof auth;
