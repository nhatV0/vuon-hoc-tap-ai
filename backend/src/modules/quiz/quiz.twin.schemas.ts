import { z } from "zod";

export const TwinQuizRequestSchema = z.object({
  student_id: z.string().min(1),
  question_id: z.string().min(1),
  selected_wrong_answer: z.string().min(1),
  subject: z.string().optional().default("Toán học")
});

export interface TwinQuizResponse {
  id: string;
  original_question_id: string;
  subject: string;
  cognitive_barrier: string;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  micro_explanation: string;
  growth_mindset_tip: string;
  is_ai_generated: boolean;
}
