import { z } from "zod";

export const DebateSyllabusQuerySchema = z.object({
  subject: z.string().optional()
});

export const DebateGenerateQuestionSchema = z.object({
  student_id: z.string().min(1),
  subject: z.string().min(1).default("Toán học"),
  selected_chapters: z.array(z.string()).min(1, "Hãy chọn ít nhất 1 đề mục/chương kiến thức"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  history: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string()
    })
  ).optional().default([])
});

export const DebateEvaluateAnswerSchema = z.object({
  student_id: z.string().min(1),
  subject: z.string().min(1).default("Toán học"),
  selected_chapters: z.array(z.string()).min(1),
  question: z.string().min(1),
  student_answer: z.string().trim().min(1, "Câu trả lời không được để trống"),
  history: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string()
    })
  ).optional().default([])
});

export const SocraticChatSchema = z.object({
  student_id: z.string().min(1),
  subject: z.string().min(1).default("Toán học"),
  mode: z.enum(["debate", "socratic", "solver"]).optional().default("debate"),
  message: z.string().trim().min(1).max(2000),
  history: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string()
    })
  ).optional().default([]),
  selected_chapters: z.array(z.string()).optional().default([])
});

export type DebateGenerateQuestionDto = z.infer<typeof DebateGenerateQuestionSchema>;
export type DebateEvaluateAnswerDto = z.infer<typeof DebateEvaluateAnswerSchema>;
export type SocraticChatDto = z.infer<typeof SocraticChatSchema>;
