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

    const focusChapter = dto.selected_chapters[(dto.question_index - 1) % dto.selected_chapters.length] || dto.subject;
    const prompt = `Bạn là Trợ Lý Gia Sư Tranh Luận môn ${dto.subject} THPT.
Chủ đề trọng tâm: ${focusChapter}.
Câu số ${dto.question_index}/10.${prevText}

YÊU CẦU:
1. Đặt 1 câu hỏi TỰ LUẬN phản biện RÕ RÀNG, CỤ THỂ về kiến thức chuyên môn của chủ đề "${focusChapter}".
2. KHÔNG hỏi chung chung ("bản chất lý thuyết là gì?"). Hãy đưa ra 1 tình huống, so sánh 2 khái niệm hoặc 1 mệnh đề gây tranh cãi (ví dụ: "Có ý kiến cho rằng X luôn đúng trong Y, theo bạn đúng hay sai? Vì sao?").
3. Độ dài câu hỏi: từ 15 đến 35 từ. Bọc công thức trong $...$.
4. Trả về JSON thuần túy:
{
  "question": "Nội dung câu hỏi cụ thể và rõ ràng",
  "sample_answer": "Đáp án mẫu ngắn gọn nêu rõ căn cứ lý thuyết",
  "topic_hint": "${focusChapter}"
}`;

    const messages: ChatMessage[] = [
      { role: "system", content: "Chỉ trả về JSON hợp lệ." },
      { role: "user", content: prompt }
    ];

    try {
      const raw = await callAiModel({ messages, temperature: 0.4, maxTokens: 400 });
      const match = raw.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      return {
        question_number: dto.question_index,
        question: parsed.question || `Trong phần ${focusChapter}, vì sao việc xác định đúng bản chất khái niệm lại quyết định tính chính xác của bài toán?`,
        sample_answer: parsed.sample_answer || "Nắm vững bản chất giúp tránh các ngộ nhận và áp dụng đúng điều kiện ràng buộc.",
        key_points: Array.isArray(parsed.key_points) ? parsed.key_points : ["Khái niệm chính xác", "Điều kiện ràng buộc"],
        topic_hint: parsed.topic_hint || focusChapter
      };
    } catch {
      return {
        question_number: dto.question_index,
        question: `Trong ${focusChapter}, nếu một giả thiết bị lược bỏ thì kết luận có còn đúng không? Hãy giải thích ngắn gọn vì sao.`,
        sample_answer: "Không còn đúng vì các định lý và tính chất luôn đòi hỏi giả thiết đầy đủ.",
        key_points: ["Vai trò của giả thiết", "Tính chặt chẽ"],
        topic_hint: focusChapter
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
