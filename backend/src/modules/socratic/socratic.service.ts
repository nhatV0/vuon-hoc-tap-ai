import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import {
  DebateGenerateQuestionDto,
  DebateEvaluateAnswerDto,
  SocraticChatDto
} from "./socratic.schemas";
import { SUBJECT_SYLLABUS_MAP, SyllabusChapter } from "./socratic.syllabus";

export interface DebateQuestionResult {
  question: string;
  topic_hint: string;
  counter_argument: string;
}

export interface DebateEvaluationResult {
  is_correct: boolean;
  verdict: "chính_xác" | "chưa_chính_xác" | "bán_phần";
  feedback: string;
  debate_point: string;
  next_challenge: string;
}

export class SocraticService {
  getSyllabus(subject?: string): Record<string, SyllabusChapter[]> {
    if (subject && SUBJECT_SYLLABUS_MAP[subject]) {
      return { [subject]: SUBJECT_SYLLABUS_MAP[subject] };
    }
    return SUBJECT_SYLLABUS_MAP;
  }

  async generateDebateQuestion(dto: DebateGenerateQuestionDto): Promise<DebateQuestionResult> {
    const chaptersText = dto.selected_chapters.join(", ");
    const prompt = `Bạn là Trợ Lý Gia Sư Tranh Luận môn ${dto.subject} (chuẩn GDPT 2018).
Học sinh đã chọn các đề mục/chương: ${chaptersText}.
Nhiệm vụ: Tạo ra đúng 1 câu hỏi nhanh, mang tính phản biện, khơi dậy tranh luận hoặc làm rõ một ngộ nhận/khái niệm cốt lõi trong các chương trên.
Yêu cầu:
1. Đặt câu hỏi ngắn gọn, rõ ràng (dưới 60 từ).
2. Có thể đưa ra một mệnh đề gây tranh cãi hoặc tình huống bẫy thường gặp để học sinh bảo vệ hoặc bác bỏ quan điểm.
3. Bọc công thức trong $...$.
4. Định dạng trả về đúng JSON:
{
  "question": "Nội dung câu hỏi tranh luận",
  "topic_hint": "Tên chủ đề hoặc gợi ý định hướng",
  "counter_argument": "Góc nhìn phản biện cốt lõi"
}`;

    const messages: ChatMessage[] = [
      { role: "system", content: "Chỉ trả về JSON hợp lệ." },
      { role: "user", content: prompt }
    ];

    try {
      const raw = await callAiModel({ messages, temperature: 0.6, maxTokens: 1000 });
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      return {
        question: parsed.question || `Theo bạn, trong ${chaptersText}, nhận định nào sau đây là chuẩn xác nhất?`,
        topic_hint: parsed.topic_hint || chaptersText,
        counter_argument: parsed.counter_argument || "Hãy phân tích dựa trên định lý và bản chất lý thuyết."
      };
    } catch {
      return {
        question: `Trong phần kiến thức [${chaptersText}], nếu cho rằng một mệnh đề luôn đúng trong mọi trường hợp, bạn sẽ phản biện lại như thế nào?`,
        topic_hint: chaptersText,
        counter_argument: "Nhiều học sinh thường quên điều kiện xác định hoặc giả thiết nghiệm ngoại lai."
      };
    }
  }

  async evaluateStudentAnswer(dto: DebateEvaluateAnswerDto): Promise<DebateEvaluationResult> {
    const chaptersText = dto.selected_chapters.join(", ");
    const prompt = `Bạn là Trọng Tài Trí Tuệ kiêm Gia Sư Tranh Luận môn ${dto.subject}.
Chương/Đề mục: ${chaptersText}
Câu hỏi tranh luận: "${dto.question}"
Câu trả lời của học sinh: "${dto.student_answer}"

Nhiệm vụ:
Kiểm tra câu trả lời của học sinh xem ĐÚNG hay SAI (hoặc đúng một phần).
Tranh luận trực tiếp, chỉ ra lỗ hổng lập luận (nếu sai) hoặc củng cố và nâng tầm góc nhìn (nếu đúng).

Định dạng trả về duy nhất bằng JSON:
{
  "is_correct": boolean,
  "verdict": "chính_xác" | "chưa_chính_xác" | "bán_phần",
  "feedback": "Phân tích vì sao đúng hoặc sai, chỉ ra luận điểm khoa học",
  "debate_point": "Luận điểm tranh luận tiếp theo để thử thách học sinh",
  "next_challenge": "1 câu hỏi nhanh tiếp nối để tiếp tục vòng tranh luận"
}`;

    const messages: ChatMessage[] = [
      { role: "system", content: "Chỉ trả về JSON hợp lệ." },
      { role: "user", content: prompt }
    ];

    try {
      const raw = await callAiModel({ messages, temperature: 0.4, maxTokens: 1500 });
      const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      return {
        is_correct: Boolean(parsed.is_correct),
        verdict: parsed.verdict || (parsed.is_correct ? "chính_xác" : "chưa_chính_xác"),
        feedback: parsed.feedback || "AI đã ghi nhận và kiểm tra luận điểm của bạn.",
        debate_point: parsed.debate_point || "Hãy chú ý đến các trường hợp biên.",
        next_challenge: parsed.next_challenge || "Bạn có muốn tiếp tục một câu hỏi phản biện khác không?"
      };
    } catch {
      const isPositive = dto.student_answer.length > 5;
      return {
        is_correct: isPositive,
        verdict: isPositive ? "chính_xác" : "chưa_chính_xác",
        feedback: `Luận điểm của bạn về môn ${dto.subject} có cơ sở, tuy nhiên cần làm rõ hơn về bản chất cơ chế của ${chaptersText}.`,
        debate_point: "Luận cứ phản biện: cần chứng minh bằng định nghĩa hoặc điều kiện tiên quyết.",
        next_challenge: "Nếu thay đổi điều kiện ban đầu, kết luận của bạn còn giữ nguyên không?"
      };
    }
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
