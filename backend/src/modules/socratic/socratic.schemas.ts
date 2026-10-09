import { z } from "zod";

export const SocraticChatSchema = z.object({
  student_id: z.string().min(1),
  subject: z.string().min(1).default("Toán học"),
  message: z.string().trim().min(1).max(2000),
  history: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string()
    })
  ).optional().default([])
});

export type SocraticChatDto = z.infer<typeof SocraticChatSchema>;
