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
    const theoryExtract = getTheoryContent(dto.subject, focusChapter).slice(0, 1000);

    const prompt = `Bạn là Trợ Lý Gia Sư Tranh Luận môn ${dto.subject} THPT.
Chủ đề: "${focusChapter}".
TÀI LIỆU LÝ THUYẾT NGUỒN:
"""
${theoryExtract}
"""

YÊU CẦU:
1. Đặt 1 câu hỏi TỰ LUẬN ngắn (15-30 từ) hỏi ĐÚNG VÀO khái niệm, thuật toán, định luật, cơ chế có trong TÀI LIỆU LÝ THUYẾT trên.
2. Câu hỏi có tính phản biện/tình huống thực tế (ví dụ: so sánh hiệu năng, phân tích đúng/sai của một nhận định).
3. TUYỆT ĐỐI không hỏi triết lý ("nếu lược bỏ giả thiết thì sao") hay câu hỏi chung chung.
4. Trả về JSON:
{
  "question": "Nội dung câu hỏi tự luận ngắn cụ thể",
  "sample_answer": "Đáp án chuẩn súc tích (1-2 câu)",
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
      return {
        question_number: dto.question_index,
        question: parsed.question || `Trong phần ${focusChapter}, hãy giải thích ngắn gọn điểm khác biệt cốt lõi giữa các cơ chế lý thuyết và ứng dụng thực tế?`,
        sample_answer: parsed.sample_answer || "Nắm vững bản chất lý thuyết giúp áp dụng chính xác nguyên lý và giải quyết bài toán.",
        key_points: Array.isArray(parsed.key_points) ? parsed.key_points : ["Khái niệm chính xác"],
        topic_hint: parsed.topic_hint || focusChapter
      };
    } catch {
      return {
        question_number: dto.question_index,
        question: `Trong ${focusChapter}, hãy chỉ ra một điểm khác biệt then chốt giữa hai khái niệm cơ bản và giải thích ngắn gọn vì sao?`,
        sample_answer: "Các khái niệm khác nhau về cấu trúc, phạm vi ứng dụng và điều kiện ràng buộc lý thuyết.",
        key_points: ["Điểm khác biệt", "Căn cứ lý thuyết"],
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
