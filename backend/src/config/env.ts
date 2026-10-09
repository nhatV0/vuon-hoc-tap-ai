import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().default("garden.db"),
  PROJECT_NAME: z.string().default("Sunflower Mentor & Emotional Garden"),
  AI_BASE_URL: z.string().default("https://mnrouter.mncuchiinhuttt.dev/v1"),
  AI_API_KEY: z.string().default("mr_WGeBHgNS9wshPVTpxAkoNxBXG7KRHHx4iKGa7mLmjoS"),
  AI_MODEL: z.string().default("gemini-3.8-flash")
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
