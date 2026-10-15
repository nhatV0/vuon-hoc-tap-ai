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
  const cleanAns = dto.student_answer.trim().toLowerCase();
  const evadingPatterns = [
    "không biết", "chưa biết", "hông biết", "k biết", "ko biết", "chịu",
    "chưa rõ", "chưa học", "quên rồi", "không nhớ", "ko nhớ", "k nhớ",
    "chịu thôi", "không hiểu", "ko hiểu", "k hiểu"
  ];
  const isEvading = evadingPatterns.some((p) => cleanAns.includes(p)) || cleanAns.length < 5;

  if (isEvading) {
    return {
      is_correct: false,
      verdict: "chưa_chính_xác",
      sample_answer: dto.sample_answer || "Nắm vững định nghĩa lý thuyết cốt lõi.",
      explanation: "Bạn chưa đưa ra được lập luận hoặc phương án giải thích cho câu hỏi phản biện.",
      feedback: "Đừng ngần ngại đưa ra suy đoán ban đầu hoặc quan điểm cá nhân nhé! Việc thử lập luận sẽ giúp bạn ghi nhớ kiến thức sâu hơn.",
      debate_rebuttal: "Hãy quan sát đáp án chuẩn và lý thuyết gợi ý bên dưới để tích lũy thêm kiến thức cho các câu tiếp theo."
    };
  }

  const prompt = `Bạn là Trọng Tài kiêm Gia Sư Tranh Luận môn ${dto.subject}.
Câu hỏi tự luận: "${dto.question}"
Đáp án chuẩn/Ý chính: "${dto.sample_answer || "Nắm vững định nghĩa và cơ sở khoa học"}"
Học sinh gõ trả lời: "${dto.student_answer}"

Nhiệm vụ: Chấm và phản biện câu trả lời tự luận của học sinh một cách công tâm, giáo dục.
QUY TẮC PHÂN LOẠI BẮT BUỘC:
1. "chính_xác": Trả lời đúng nhận định (đúng/sai) và giải thích được bản chất lý thuyết cốt lõi tương đương đáp án chuẩn.
2. "bán_phần": Trả lời ĐÚNG HƯỚNG hoặc chỉ mới nói đúng một nửa/thiếu luận cứ giải thích vì sao.
3. "chưa_chính_xác": Sai hoàn toàn bản chất lý thuyết, ngộ nhận hoặc thoái thác/không trả lời (ví dụ "không biết", "chịu", "chưa rõ").
TUYỆT ĐỐI KHÔNG xếp câu trả lời sai hoặc không biết vào "bán_phần". Chỉ xếp vào "bán_phần" khi học sinh THỰC SỰ ĐÃ NÊU ĐƯỢC MỘT Ý ĐÚNG LIÊN QUAN ĐẾN ĐÁP ÁN.

- is_correct: true nếu verdict là "chính_xác" HOẶC "bán_phần", false nếu "chưa_chính_xác".
- explanation: Lời giải thích (40-60 từ): Ghi nhận rõ ý học sinh đã nói đúng, đồng thời chỉ ra chính xác các ý/luận cứ còn thiếu.
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
