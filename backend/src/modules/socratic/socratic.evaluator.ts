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

Nhiệm vụ: Chấm và phản biện câu trả lời tự luận của học sinh một cách công tâm, giáo dục.
ĐẶC BIỆT CHÚ Ý TRƯỜNG HỢP "ĐÚNG NHƯNG CHƯA ĐẦY ĐỦ":
- Học sinh thường đưa ra ý cốt lõi đúng (ví dụ: phán đoán đúng/sai chuẩn, nêu được 1 ý then chốt) nhưng chưa liệt kê đủ các nguyên nhân, bối cảnh hoặc luận cứ khoa học. Trong trường hợp này, TUYỆT ĐỐI KHÔNG đánh trượt hoặc chấm "chưa_chính_xác", mà PHẢI XẾP VÀO "bán_phần".

Quy tắc phân loại:
1. "chính_xác": Trả lời đúng bản chất và đủ các ý chính quan trọng.
2. "bán_phần": Trả lời ĐÚNG HƯỚNG hoặc ĐÚNG 1 PHẦN nhưng CHƯA ĐẦY ĐỦ / còn thiếu ý bổ trợ.
3. "chưa_chính_xác": Sai hoàn toàn bản chất lý thuyết, ngộ nhận hoặc thoái thác/không trả lời ("không biết", "chịu").

- is_correct: true nếu verdict là "chính_xác" HOẶC "bán_phần" (vẫn được tính điểm đạt/tiếp thu), false nếu "chưa_chính_xác".
- explanation: Lời giải thích (40-60 từ): Ghi nhận rõ ý học sinh đã nói đúng, đồng thời chỉ ra chính xác các ý/luận cứ còn thiếu để câu trả lời hoàn thiện nhất.
- feedback: Lời nhận xét động viên tinh thần lập luận và hướng dẫn cách bổ sung ý khoa học.
- debate_rebuttal: Góc nhìn phản biện sâu rộng tiếp theo hoặc bài học mở rộng.

Định dạng JSON duy nhất:
{
  "is_correct": boolean,
  "verdict": "chính_xác" | "chưa_chính_xác" | "bán_phần",
  "explanation": "Ghi nhận ý đúng và nêu rõ ý còn thiếu...",
  "feedback": "Nhận xét gợi ý hoàn thiện...",
  "debate_rebuttal": "Góc nhìn phản biện mở rộng..."
}`;

  const messages: ChatMessage[] = [
    { role: "system", content: "Chỉ trả về JSON hợp lệ." },
    { role: "user", content: prompt }
  ];

  try {
    const raw = await callAiModel({ messages, temperature: 0.2, maxTokens: 400 });
    const match = raw.match(/\{[\s\S]*\}/);
    const jsonStr = match ? match[0] : raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);
    return {
      is_correct: Boolean(parsed.is_correct),
      verdict: parsed.verdict || (parsed.is_correct ? "chính_xác" : "chưa_chính_xác"),
      sample_answer: dto.sample_answer || "Cần bám sát định nghĩa lý thuyết cốt lõi.",
      explanation: parsed.explanation || "Đã phân tích lập luận của bạn dựa trên cơ sở khoa học.",
      feedback: parsed.feedback || "Luận điểm của bạn đã được ghi nhận.",
      debate_rebuttal: parsed.debate_rebuttal || "Hãy sẵn sàng cho câu hỏi phản biện tiếp theo!"
    };
  } catch {
    const lower = dto.student_answer.trim().toLowerCase();
    const isEvading = lower.includes("không biết") || lower.includes("chưa biết") || lower.includes("chịu") || lower.length < 10;
    return {
      is_correct: !isEvading,
      verdict: isEvading ? "chưa_chính_xác" : "bán_phần",
      sample_answer: dto.sample_answer || "Cần bám sát định nghĩa lý thuyết cốt lõi.",
      explanation: isEvading
        ? "Câu trả lời chưa đưa ra được thông tin hoặc luận điểm giải thích cho câu hỏi phản biện."
        : "Câu trả lời đã đề cập đến vấn đề nhưng cần làm rõ thêm các căn cứ khoa học cụ thể.",
      feedback: isEvading ? "Đừng ngần ngại thử suy đoán hoặc đưa ra ý kiến cá nhân nhé!" : "Ghi nhận nỗ lực trả lời của bạn.",
      debate_rebuttal: "Hãy đối chiếu với đáp án chuẩn để tích lũy thêm kiến thức cho các câu tiếp theo."
    };
  }
}
