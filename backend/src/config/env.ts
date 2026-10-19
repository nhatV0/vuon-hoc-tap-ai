import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().default("garden.db"),
  PROJECT_NAME: z.string().default("Sunflower Mentor & Emotional Garden"),
  AI_BASE_URL: z.string().default(process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai"),
  AI_API_KEY: z.string().default(process.env.OPENAI_API_KEY || process.env.AI_API_KEY || ""),
  AI_MODEL: z.string().default(process.env.AI_MODEL || "gemini-3-flash-preview")
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
