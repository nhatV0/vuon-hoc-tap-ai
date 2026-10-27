import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import { DebateEvaluateAnswerDto } from "./socratic.schemas";
import { cleanLanguageGlitches } from "@/common/language-sanitizer";

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

  const isEnglish = dto.subject === "Tiếng Anh" || dto.subject.toLowerCase().includes("english");
  const langInstruction = isEnglish
    ? `QUY TẮC BẮT BUỘC VỀ NGÔN NGỮ CHO MÔN TIẾNG ANH:
Toàn bộ nội dung đánh giá: "explanation", "feedback" và "debate_rebuttal" BẮT BUỘC 100% PHẢI ĐƯỢC VIẾT HOÀN TOÀN BẰNG TIẾNG ANH (ENGLISH ONLY). TUYỆT ĐỐI KHÔNG DÙNG TIẾNG VIỆT.`
    : `Viết nhận xét, giải thích và phản biện bằng Tiếng Việt sư phạm chuẩn xác.`;

  const prompt = `Bạn là Trọng Tài kiêm Gia Sư Tranh Luận môn ${dto.subject}.
${langInstruction}
Câu hỏi tự luận: "${dto.question}"
Đáp án chuẩn/Ý chính: "${dto.sample_answer || "Nắm vững định nghĩa và cơ sở khoa học"}"
Học sinh gõ trả lời: "${dto.student_answer}"

Nhiệm vụ: Chấm và phản biện câu trả lời tự luận của học sinh một cách công tâm, giáo dục.
QUY TẮC ĐÁNH GIÁ ĐA DẠNG DẠNG BÀI:
1. "chính_xác":
   - Đối với câu hỏi tranh biện (Đúng/Sai): Trả lời đúng nhận định và nêu rõ căn cứ lý thuyết.
   - Đối với câu hỏi định nghĩa / tên gọi / thuật ngữ / truy ngược: Nêu đúng tên khái niệm hoặc từ khóa chuyên môn cốt lõi.
   - Đối với câu hỏi điền khuyết: Điền đúng từ/thuật ngữ còn thiếu.
   - Đối với câu hỏi sắp xếp thứ tự: Sắp xếp đúng trình tự các bước (ví dụ: B - A - C hoặc 2 - 1 - 3).
2. "bán_phần": Trả lời đúng hướng, nêu được một phần từ khóa nhưng còn thiếu ý quan trọng hoặc chưa giải thích trọn vẹn.
3. "chưa_chính_xác": Sai lệch bản chất, nhầm lẫn khái niệm hoặc thoái thác (ví dụ "không biết", "chịu", "chưa rõ").
- is_correct: true nếu verdict là "chính_xác" HOẶC "bán_phần", false nếu "chưa_chính_xác".
- explanation: Lời giải thích (30-50 từ): Ngắn gọn, súc tích, chỉ ra chính xác điểm học sinh làm đúng và rào cản nhận thức/lỗ hổng cần khắc phục.
- feedback: Lời nhận xét ngắn gọn (1-2 câu), khích lệ sự kiên trì và tư duy phản biện.
- debate_rebuttal: Câu hỏi gợi mở ngắn gọn (1 câu) để học sinh tự đào sâu thêm.
Định dạng JSON duy nhất:
{
  "is_correct": boolean,
  "verdict": "chính_xác" | "chưa_chính_xác" | "bán_phần",
  "explanation": "Lời giải thích ngắn gọn, chính xác...",
  "feedback": "Nhận xét khích lệ...",
  "debate_rebuttal": "Câu hỏi gợi mở tiếp theo..."
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
    const verdict = parsed.verdict || (parsed.is_correct ? "chính_xác" : "chưa_chính_xác");
    const isCorrect = verdict === "chính_xác" || verdict === "bán_phần";
    return {
      is_correct: isCorrect,
      verdict,
      sample_answer: cleanLanguageGlitches(dto.sample_answer || "Cần bám sát định nghĩa lý thuyết cốt lõi."),
      explanation: cleanLanguageGlitches(parsed.explanation || "Đã phân tích lập luận của bạn dựa trên cơ sở khoa học."),
      feedback: cleanLanguageGlitches(parsed.feedback || "Luận điểm của bạn đã được ghi nhận."),
      debate_rebuttal: cleanLanguageGlitches(parsed.debate_rebuttal || "Hãy sẵn sàng cho câu hỏi phản biện tiếp theo!")
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
