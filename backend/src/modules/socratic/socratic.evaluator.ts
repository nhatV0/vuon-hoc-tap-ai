import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import { DebateEvaluateAnswerDto, DebateOptionSchema } from "./socratic.schemas";

export interface DebateEvaluationResult {
  is_correct: boolean;
  verdict: "chính_xác" | "chưa_chính_xác";
  correct_option: string;
  explanation: string;
  feedback: string;
  debate_rebuttal: string;
}

export async function evaluateDebateAnswer(dto: DebateEvaluateAnswerDto): Promise<DebateEvaluationResult> {
  const rawAnswer = dto.student_answer.trim().toUpperCase();
  const matchedKey = ["A", "B", "C", "D"].find(
    (k) => rawAnswer === k || rawAnswer.startsWith(`${k}.`) || rawAnswer.startsWith(`${k}:`)
  );

  if (dto.correct_option && matchedKey) {
    const isCorrect = matchedKey === dto.correct_option.toUpperCase();
    return {
      is_correct: isCorrect,
      verdict: isCorrect ? "chính_xác" : "chưa_chính_xác",
      correct_option: dto.correct_option,
      explanation: isCorrect
        ? `Chính xác! Đáp án ${dto.correct_option} là lựa chọn đúng.`
        : `Chưa chính xác! Bạn đã chọn ${matchedKey}, trong khi đáp án đúng là ${dto.correct_option}.`,
      feedback: isCorrect
        ? "Bạn đã nắm vững luận điểm và không bị mắc bẫy khái niệm!"
        : "Hãy chú ý đến các chi tiết bẫy và điều kiện loại trừ.",
      debate_rebuttal: isCorrect
        ? "Luận điểm của bạn rất vững chắc. Sẵn sàng cho câu tiếp theo!"
        : `Đáp án ${dto.correct_option} chuẩn xác vì đã bao hàm đầy đủ cơ sở lý thuyết.`
    };
  }

  const prompt = `Bạn là Trọng Tài kiêm Gia Sư Tranh Luận môn ${dto.subject}.
Câu hỏi: "${dto.question}"
Các lựa chọn: ${JSON.stringify(dto.options || [])}
Đáp án chuẩn: "${dto.correct_option || "B"}"
Học sinh gõ trả lời: "${dto.student_answer}"

Nhiệm vụ: Kiểm tra xem câu trả lời là ĐÚNG hay SAI. Giải thích súc tích dưới 60 từ.
Định dạng JSON:
{
  "is_correct": boolean,
  "verdict": "chính_xác" | "chưa_chính_xác",
  "correct_option": "${dto.correct_option || "B"}",
  "explanation": "Giải thích vì sao đúng hoặc sai",
  "feedback": "Nhận xét ngắn gọn",
  "debate_rebuttal": "Luận điểm phản biện then chốt"
}`;

  const messages: ChatMessage[] = [
    { role: "system", content: "Chỉ trả về JSON hợp lệ." },
    { role: "user", content: prompt }
  ];

  try {
    const raw = await callAiModel({ messages, temperature: 0.3, maxTokens: 800 });
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);
    return {
      is_correct: Boolean(parsed.is_correct),
      verdict: parsed.is_correct ? "chính_xác" : "chưa_chính_xác",
      correct_option: parsed.correct_option || dto.correct_option || "B",
      explanation: parsed.explanation || "Cần đối chiếu với lý thuyết cốt lõi.",
      feedback: parsed.feedback || "AI đã ghi nhận câu trả lời của bạn.",
      debate_rebuttal: parsed.debate_rebuttal || "Hãy ghi nhớ luận điểm này cho các câu hỏi sau."
    };
  } catch {
    const fallbackCorrect = dto.correct_option ? rawAnswer.includes(dto.correct_option) : rawAnswer.length > 0;
    return {
      is_correct: fallbackCorrect,
      verdict: fallbackCorrect ? "chính_xác" : "chưa_chính_xác",
      correct_option: dto.correct_option || "B",
      explanation: fallbackCorrect
        ? "Bạn đã đưa ra câu trả lời chuẩn xác."
        : `Đáp án chuẩn là ${dto.correct_option || "B"}. Hãy chú ý điều kiện cần và đủ.`,
      feedback: "Đã ghi nhận kết quả câu hỏi.",
      debate_rebuttal: "Chuyển tiếp câu hỏi kế tiếp trong chuỗi 10 câu."
    };
  }
}
