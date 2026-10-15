import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import {
  DebateGenerateQuestionDto,
  DebateEvaluateAnswerDto,
  SocraticChatDto
} from "./socratic.schemas";
import { SUBJECT_SYLLABUS_MAP, SyllabusChapter } from "./socratic.syllabus";
import { evaluateDebateAnswer, type DebateEvaluationResult } from "./socratic.evaluator";

export interface DebateOption {
  key: string;
  text: string;
}

export interface DebateQuestionResult {
  question_number: number;
  question: string;
  options: DebateOption[];
  correct_option: string;
  explanation: string;
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
      ? `\nCác câu hỏi trước ĐÃ HỎI (TUYỆT ĐỐI KHÔNG LẶP LẠI NỘI DUNG/DẠNG BÀI NÀY):\n- ${dto.previous_questions.join("\n- ")}`
      : "";

    const prompt = `Bạn là Trợ Lý Gia Sư Tranh Luận phản biện môn ${dto.subject} (chuẩn GDPT 2018).
Học sinh đã chọn các đề mục/chương: ${chaptersText}.
Đây là CÂU SỐ ${dto.question_index}/10 trong chuỗi thử thách.${prevText}

Nhiệm vụ: Tạo ĐÚNG 1 câu hỏi trắc nghiệm phản biện ngắn, có 4 lựa chọn A, B, C, D rõ ràng để học sinh có thể nhìn các lựa chọn và gõ nhanh câu trả lời (gõ A, B, C, D hoặc từ khóa ngắn).
Yêu cầu:
1. Nội dung ngắn gọn, kích thích tư duy phản biện, làm rõ 1 ngộ nhận hay bẫy lý thuyết phổ biến.
2. 4 phương án trắc nghiệm ngắn gọn (A, B, C, D), trong đó có 1 đáp án chuẩn xác nhất và các đáp án nhiễu dễ gây nhầm lẫn.
3. Bọc công thức trong ký hiệu $...$.
4. Định dạng trả về duy nhất bằng JSON:
{
  "question": "Nội dung câu hỏi ngắn phản biện",
  "options": [
    { "key": "A", "text": "Nội dung phương án A" },
    { "key": "B", "text": "Nội dung phương án B" },
    { "key": "C", "text": "Nội dung phương án C" },
    { "key": "D", "text": "Nội dung phương án D" }
  ],
  "correct_option": "A" hoặc "B" hoặc "C" hoặc "D",
  "explanation": "Giải thích ngắn gọn súc tích vì sao đáp án đó đúng và các đáp án khác sai",
  "topic_hint": "Tên đề mục tương ứng"
}`;

    const messages: ChatMessage[] = [
      { role: "system", content: "Chỉ trả về JSON hợp lệ." },
      { role: "user", content: prompt }
    ];

    try {
      const raw = await callAiModel({ messages, temperature: 0.6, maxTokens: 1200 });
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      return {
        question_number: dto.question_index,
        question: parsed.question || `Trong phần ${chaptersText}, phát biểu nào sau đây là chuẩn xác nhất?`,
        options: Array.isArray(parsed.options) && parsed.options.length === 4
          ? parsed.options
          : [
              { key: "A", text: "Khẳng định A đúng trong mọi trường hợp" },
              { key: "B", text: "Khẳng định B chỉ đúng khi có điều kiện biên" },
              { key: "C", text: "Khẳng định C luôn sai do vi phạm định luật" },
              { key: "D", text: "Cả A và B đều không thỏa mãn" }
            ],
        correct_option: parsed.correct_option || "B",
        explanation: parsed.explanation || "Cần chú ý điều kiện tồn tại và bản chất định nghĩa.",
        topic_hint: parsed.topic_hint || chaptersText
      };
    } catch {
      return {
        question_number: dto.question_index,
        question: `[Câu ${dto.question_index}/10] Trong kiến thức [${chaptersText}], nhận định nào phản ánh đúng bản chất lý thuyết?`,
        options: [
          { key: "A", text: "Luôn đúng với mọi giá trị của biến số" },
          { key: "B", text: "Chỉ đúng khi thỏa mãn các điều kiện xác định ban đầu" },
          { key: "C", text: "Không phụ thuộc vào tính chất của môi trường" },
          { key: "D", text: "Tất cả các khẳng định trên đều sai" }
        ],
        correct_option: "B",
        explanation: "Trong toán học và khoa học tự nhiên, điều kiện xác định là bắt buộc.",
        topic_hint: chaptersText
      };
    }
  }

  async evaluateStudentAnswer(dto: DebateEvaluateAnswerDto): Promise<DebateEvaluationResult> {
    return evaluateDebateAnswer(dto);
  }

  async chat(dto: SocraticChatDto): Promise<{ response: string; question_prompt: string }> {
    const chaptersContext = dto.selected_chapters?.length ? ` (Trọng tâm: ${dto.selected_chapters.join(", ")})` : "";
    const systemPrompt = `Bạn là Trợ Lý Hoa Hướng Dương kiêm Gia Sư Tranh Luận môn ${dto.subject}${chaptersContext}.
Phát triển tư duy phản biện, tranh luận sắc bén và xác thực đúng sai các luận điểm khoa học của học sinh.
Bọc công thức trong ký hiệu $...$.`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...dto.history.slice(-8),
      { role: "user", content: dto.message }
    ];

    try {
      const reply = await callAiModel({ messages, temperature: 0.6, maxTokens: 2000 });
      return {
        response: reply,
        question_prompt: "Bạn có luận cứ nào khác để bảo vệ lập luận của mình không?"
      };
    } catch {
      return {
        response: `Về câu hỏi môn ${dto.subject}, góc nhìn của bạn rất đáng chú ý. Hãy đưa ra dẫn chứng cụ thể hơn để cùng tranh luận nhé!`,
        question_prompt: "Luận điểm kế tiếp của bạn là gì?"
      };
    }
  }
}
