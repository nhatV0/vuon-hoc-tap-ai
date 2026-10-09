import { z } from "zod";

export const VisionScratchpadSchema = z.object({
  student_id: z.string().min(1),
  subject: z.string().min(1).default("Toán học"),
  image_base64: z.string().min(10), // Base64 data string
  problem_description: z.string().optional().default("")
});

export interface ScratchpadAnalysisResult {
  step_by_step: string[];
  error_step_index: number; // 0-based index or -1 if all correct
  error_type: string;
  pedagogical_guidance: string;
  encouragement: string;
  is_ai_analyzed: boolean;
}
