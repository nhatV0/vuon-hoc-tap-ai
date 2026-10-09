import { z } from "zod";
import { MoodType } from "@/common/types";

export const CheckinCreateSchema = z.object({
  student_id: z.string().min(1),
  completion_rate: z.number().min(0).max(100),
  subject_difficulty: z.string().optional(),
  action_reflection: z.string().optional(),
  mood: z.nativeEnum(MoodType).default(MoodType.HAPPY),
  emotion_scale: z.number().min(1).max(7).optional().default(4),
  energy_level: z.number().default(70),
  confidence_stars: z.number().min(1).max(5).default(3),
  completed_subjects: z.array(z.string()).optional().default([]),
  micro_wins: z.array(z.string()).optional().default([]),
  bottleneck_key: z.string().optional().default("none"),
  weekday_answer: z.string().optional()
});

export type CheckinCreateDto = z.infer<typeof CheckinCreateSchema>;
