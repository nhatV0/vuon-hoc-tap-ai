import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import {
  DebateGenerateQuestionDto,
  DebateEvaluateAnswerDto,
  SocraticChatDto
} from "./socratic.schemas";
import { SUBJECT_SYLLABUS_MAP, SyllabusChapter } from "./socratic.syllabus";
import { evaluateDebateAnswer, DebateEvaluationResult } from "./socratic.evaluator";

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
    const chaptersText = dto.selected_chapters.join(", ");
    const prevText = dto.previous_questions && dto.previous_questions.length > 0
      ? `\nCác câu trước đã hỏi: ${dto.previous_questions.slice(-3).join(" | ")}. TUYỆT ĐỐI không lặp lại.`
      : "";

    const prompt = `Bạn là Trợ Lý Gia Sư Tranh Luận môn ${dto.subject} THPT.
Chủ đề học sinh chọn: ${chaptersText}.
Câu số ${dto.question_index}/10.${prevText}

Nhiệm vụ: Tạo ĐÚNG 1 câu hỏi TỰ LUẬN ngắn gọn (dưới 40 từ), mang tính phản biện, hỏi về bản chất lý thuyết, phân biệt khái niệm hoặc giải thích tại sao một mệnh đề là đúng/sai.
Lưu ý: KHÔNG tạo câu hỏi trắc nghiệm A/B/C/D. Câu hỏi để học sinh gõ văn bản tự luận ngắn để phản biện.
Bọc công thức trong $...$.

Trả về JSON duy nhất:
{
  "question": "Nội dung câu hỏi tự luận ngắn",
  "sample_answer": "Đáp án mẫu chuẩn xác súc tích (1-2 câu)",
  "key_points": ["Ý chính 1", "Ý chính 2"],
  "topic_hint": "Tên đề mục"
}`;

    const messages: ChatMessage[] = [
      { role: "system", content: "Chỉ trả về JSON hợp lệ." },
      { role: "user", content: prompt }
    ];

    try {
      const raw = await callAiModel({ messages, temperature: 0.5, maxTokens: 400 });
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      return {
        question_number: dto.question_index,
        question: parsed.question || `Trong phần ${dto.selected_chapters[0] || dto.subject}, hãy giải thích ngắn gọn tại sao cần xét điều kiện xác định trước khi biến đổi?`,
        sample_answer: parsed.sample_answer || "Cần điều kiện xác định để tránh xuất hiện nghiệm ngoại lai và đảm bảo biểu thức có nghĩa.",
        key_points: Array.isArray(parsed.key_points) ? parsed.key_points : ["Tránh nghiệm ngoại lai", "Biểu thức có nghĩa"],
        topic_hint: parsed.topic_hint || dto.selected_chapters[0] || dto.subject
      };
    } catch {
      return {
        question_number: dto.question_index,
        question: `[Câu ${dto.question_index}/10] Trong kiến thức [${dto.selected_chapters[0] || dto.subject}], hãy nêu ngắn gọn bản chất lý thuyết và điều kiện cần nhớ?`,
        sample_answer: "Cần nắm rõ định nghĩa, tập xác định và quy tắc suy luận logic nền tảng.",
        key_points: ["Định nghĩa chính xác", "Điều kiện tiên quyết"],
        topic_hint: dto.selected_chapters[0] || dto.subject
      };
    }
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
