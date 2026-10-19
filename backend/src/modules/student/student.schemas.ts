import { z } from "zod";

export const StudentCreateSchema = z.object({
  user_id: z.string().optional().nullable(),
  name: z.string().min(1),
  grade: z.string().min(1),
  target_subject: z.string().min(1).default("Toán học"),
  target_subjects: z.array(z.string()).optional().default(["Toán học"]),
  emotion_scale: z.number().min(1).max(7).optional().default(4),
  weakness: z.string().optional().default(""),
  long_term_goal: z.string().min(1, "Mục tiêu cá nhân không được để trống"),
  target_date: z.string().optional().default(""),
  timeframe: z.string().optional().default(""),
  learning_style: z.string().optional().default("visual"),
  selected_flower: z.string().optional().default("sunflower"),
  diagnostic_answers: z.record(z.string(), z.string()).optional().default({})
});

export type StudentCreateDto = z.infer<typeof StudentCreateSchema>;
