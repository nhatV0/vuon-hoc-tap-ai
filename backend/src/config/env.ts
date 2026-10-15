import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().default("garden.db"),
  PROJECT_NAME: z.string().default("Sunflower Mentor & Emotional Garden"),
  AI_BASE_URL: z.string().default(process.env.OPENAI_BASE_URL || "https://mnrouter.mncuchiinhuttt.dev/v1"),
  AI_API_KEY: z.string().default(process.env.OPENAI_API_KEY || process.env.AI_API_KEY || "mr_GCqCyo396xixUtgcgSbzpGyMbh3rMsbzyQIHCXxNbZ1"),
  AI_MODEL: z.string().default("gemini-3.8-flash")
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
