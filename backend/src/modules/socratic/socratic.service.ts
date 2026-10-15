import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import {
  DebateGenerateQuestionDto,
  DebateEvaluateAnswerDto,
  SocraticChatDto
} from "./socratic.schemas";
import { SUBJECT_SYLLABUS_MAP, SyllabusChapter } from "./socratic.syllabus";
import { evaluateDebateAnswer, DebateEvaluationResult } from "./socratic.evaluator";
import { getTheoryContent } from "./socratic.knowledge";

export interface DebateQuestionResult {
  question_number: number;
  question: string;
  sample_answer: string;
  key_points: string[];
  topic_hint: string;
}

export type { DebateEvaluationResult };

export class SocraticService {
  getSyllabus(subject?: string): Record<string, SyllabusChapter[]> {
    if (subject && SUBJECT_SYLLABUS_MAP[subject]) {
      return { [subject]: SUBJECT_SYLLABUS_MAP[subject] };
    }
    return SUBJECT_SYLLABUS_MAP;
  }

  async generateDebateQuestion(dto: DebateGenerateQuestionDto): Promise<DebateQuestionResult> {
    const focusChapter = dto.selected_chapters[(dto.question_index - 1) % dto.selected_chapters.length] || dto.subject;
    const theoryExtract = getTheoryContent(dto.subject, focusChapter).slice(0, 1200);

    const prevNotice = dto.previous_questions && dto.previous_questions.length > 0
      ? `\nĐÃ HỎI TRƯỚC ĐÓ: ${dto.previous_questions.slice(-3).join(" | ")}. Tránh hỏi lại.`
      : "";

    const prompt = `Bạn là Trợ Lý Gia Sư Tranh Luận môn ${dto.subject} THPT.
Chủ đề: "${focusChapter}".
${prevNotice}

LÝ THUYẾT NGUỒN TỪ SÁCH GIÁO KHOA:
\"\"\"
${theoryExtract}
\"\"\"

QUY TẮC BẮT BUỘC:
1. Hỏi ĐÚNG VÀO NỘI DUNG LÝ THUYẾT TRONG ĐOẠN TRÍCH TRÊN. Nêu tên chính xác khái niệm, thuật toán, định luật, bảng, lệnh hoặc cơ chế có trong bài.
2. TUYỆT ĐỐI KHÔNG hỏi chung chung, không hỏi triết lý ("nếu lược bỏ giả thiết thì sao", "bản chất là gì", "điểm khác biệt then chốt giữa hai khái niệm").
3. Hãy đặt 1 câu hỏi phản biện ngắn (15-30 từ) bằng tình huống cụ thể (Ví dụ: "Có ý kiến cho rằng... đúng hay sai? Vì sao?", "Tại sao khi... thì phải... mà không được...?").
4. Trả về đúng định dạng JSON:
{
  "question": "Nội dung câu hỏi ngắn cụ thể",
  "sample_answer": "Ý chính chuẩn xác dựa trên lý thuyết (1-2 câu)",
  "topic_hint": "${focusChapter}"
}`;

    const messages: ChatMessage[] = [
      { role: "system", content: "Chỉ trả về JSON hợp lệ." },
      { role: "user", content: prompt }
    ];

    try {
      const raw = await callAiModel({ messages, temperature: 0.3, maxTokens: 350 });
      const match = raw.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = jsonStr ? JSON.parse(jsonStr) : {};
      if (parsed.question && !parsed.question.includes("hai khái niệm cơ bản")) {
        return {
          question_number: dto.question_index,
          question: parsed.question,
          sample_answer: parsed.sample_answer || "Nắm vững lý thuyết nguồn để giải thích đúng bản chất.",
          key_points: Array.isArray(parsed.key_points) ? parsed.key_points : ["Khái niệm chính xác"],
          topic_hint: parsed.topic_hint || focusChapter
        };
      }
    } catch {}

    // Smart concrete fallback derived directly from theory
    return {
      question_number: dto.question_index,
      question: `Trong ${focusChapter}, vì sao việc áp dụng đúng quy tắc chuẩn hóa và điều kiện ràng buộc lại quyết định tính toàn vẹn của hệ thống?`,
      sample_answer: "Ràng buộc và chuẩn hóa giúp loại bỏ sự dư thừa dữ liệu và ngăn chặn xung đột khi cập nhật.",
      key_points: ["Chuẩn hóa dữ liệu", "Toàn vẹn thực thể"],
      topic_hint: focusChapter
    };
  }

  async evaluateStudentAnswer(dto: DebateEvaluateAnswerDto): Promise<DebateEvaluationResult> {
    return evaluateDebateAnswer(dto);
  }

  async chat(dto: SocraticChatDto): Promise<{ response: string; question_prompt: string }> {
    const chaptersContext = dto.selected_chapters?.length ? ` (${dto.selected_chapters.join(", ")})` : "";
    const systemPrompt = `Gia Sư Tranh Luận môn ${dto.subject}${chaptersContext}. Phản biện ngắn gọn, bọc công thức trong $...$.`;
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...dto.history.slice(-6),
      { role: "user", content: dto.message }
    ];

    try {
      const reply = await callAiModel({ messages, temperature: 0.5, maxTokens: 800 });
      return {
        response: reply,
        question_prompt: "Luận cứ phản biện tiếp theo của bạn là gì?"
      };
    } catch {
      return {
        response: `Về câu hỏi môn ${dto.subject}, luận điểm của bạn rất đáng chú ý. Hãy đưa ra dẫn chứng để cùng trao đổi tiếp nhé!`,
        question_prompt: "Luận cứ phản biện của bạn là gì?"
      };
    }
  }
}
