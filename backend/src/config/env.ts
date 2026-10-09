import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().default("garden.db"),
  PROJECT_NAME: z.string().default("Sunflower Mentor & Emotional Garden"),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default("gemini-1.5-flash")
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
