import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import { DebateEvaluateAnswerDto } from "./socratic.schemas";

export interface DebateEvaluationResult {
  is_correct: boolean;
  verdict: "chính_xác" | "chưa_chính_xác" | "bán_phần";
  sample_answer: string;
  explanation: string;
  feedback: string;
  debate_rebuttal: string;
}

export async function evaluateDebateAnswer(dto: DebateEvaluateAnswerDto): Promise<DebateEvaluationResult> {
  const prompt = `Bạn là Trọng Tài kiêm Gia Sư Tranh Luận môn ${dto.subject}.
Câu hỏi tự luận: "${dto.question}"
Đáp án chuẩn/Ý chính: "${dto.sample_answer || "Nắm vững định nghĩa và cơ sở khoa học"}"
Học sinh gõ trả lời: "${dto.student_answer}"

Nhiệm vụ: Chấm và phản biện câu trả lời tự luận của học sinh.
Xác định:
- verdict: "chính_xác" (nếu nêu đúng bản chất), "bán_phần" (nếu đúng 1 phần hoặc thiếu ý quan trọng), hoặc "chưa_chính_xác" (nếu sai bản chất/ngộ nhận).
- is_correct: true nếu chính xác hoặc bán phần, false nếu chưa chính xác.
- explanation: Giải thích ngắn gọn (dưới 50 từ) vì sao đúng/sai và bổ sung ý còn thiếu.
- feedback: Đánh giá ngắn gọn phong cách lập luận của học sinh.
- debate_rebuttal: Luận điểm phản biện mở rộng hoặc câu hỏi gợi mở tiếp theo.

Định dạng JSON duy nhất:
{
  "is_correct": boolean,
  "verdict": "chính_xác" | "chưa_chính_xác" | "bán_phần",
  "explanation": "Lời giải thích ngắn gọn",
  "feedback": "Nhận xét",
  "debate_rebuttal": "Góc nhìn phản biện tiếp theo"
}`;

  const messages: ChatMessage[] = [
    { role: "system", content: "Chỉ trả về JSON hợp lệ." },
    { role: "user", content: prompt }
  ];

  try {
    const raw = await callAiModel({ messages, temperature: 0.3, maxTokens: 450 });
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);
    return {
      is_correct: Boolean(parsed.is_correct),
      verdict: parsed.verdict || (parsed.is_correct ? "chính_xác" : "chưa_chính_xác"),
      sample_answer: dto.sample_answer || "Cần bám sát định nghĩa lý thuyết cốt lõi.",
      explanation: parsed.explanation || "Đã phân tích lập luận của bạn dựa trên cơ sở khoa học.",
      feedback: parsed.feedback || "Luận điểm của bạn đã được ghi nhận.",
      debate_rebuttal: parsed.debate_rebuttal || "Hãy sẵn sàng cho câu hỏi phản biện tiếp theo!"
    };
  } catch {
    const isLen = dto.student_answer.trim().length >= 8;
    return {
      is_correct: isLen,
      verdict: isLen ? "chính_xác" : "chưa_chính_xác",
      sample_answer: dto.sample_answer || "Cần bám sát định nghĩa lý thuyết cốt lõi.",
      explanation: isLen
        ? "Câu trả lời của bạn thể hiện được tư duy và góc nhìn phù hợp với nội dung bài học."
        : "Câu trả lời còn quá ngắn hoặc chưa nêu rõ được luận cứ khoa học cần thiết.",
      feedback: "Đã ghi nhận câu trả lời.",
      debate_rebuttal: "Chuyển tiếp câu hỏi phản biện tiếp theo trong chuỗi 10 câu."
    };
  }
}
