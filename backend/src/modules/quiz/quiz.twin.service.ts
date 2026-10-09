import { db } from "@/db/client";
import { callAiModel } from "@/modules/ai/ai.client";
import { TwinQuizResponse } from "./quiz.twin.schemas";
import { generateId } from "@/common/utils";

export async function synthesizeTwinQuestion(
  questionId: string,
  wrongAnswer: string,
  subject: string
): Promise<TwinQuizResponse> {
  const q = db.query("SELECT * FROM quiz_questions WHERE id = ?").get(questionId) as {
    id: string;
    question_text: string;
    options: string;
    correct_answer: string;
    micro_explanation: string;
  } | null;

  const originalText = q?.question_text || "Một bài toán trắc nghiệm vi mô THPT";
  const originalOptions = q?.options || "{}";
  const correctAnswer = q?.correct_answer || "A";

  const prompt = `Bạn là Chuyên gia Khảo thí GDPT 2018 Việt Nam.
Học sinh vừa làm sai một câu hỏi trắc nghiệm môn ${subject}.
Câu hỏi gốc: "${originalText}"
Các lựa chọn gốc: ${originalOptions}
Đáp án đúng là: ${correctAnswer}, nhưng học sinh đã chọn nhầm đáp án: ${wrongAnswer}.

Yêu cầu: Hãy sinh 1 câu hỏi "SINH ĐÔI" (Twin Question) giữ nguyên cấu trúc logic và rào cản nhận thức nhưng thay đổi bối cảnh hoặc số liệu để học sinh gỡ điểm ngay lập tức.
Trả về định dạng JSON thuần túy (không markdown) với cấu trúc:
{
  "cognitive_barrier": "Giải thích ngắn về rào cản khiến học sinh chọn nhầm đáp án ${wrongAnswer}",
  "question_text": "Nội dung câu hỏi sinh đôi mới kèm công thức LaTeX dạng $...$",
  "options": {
    "A": "Lựa chọn A",
    "B": "Lựa chọn B",
    "C": "Lựa chọn C",
    "D": "Lựa chọn D"
  },
  "correct_answer": "A",
  "micro_explanation": "Giải thích vi mô 2-3 câu vì sao đáp án này đúng",
  "growth_mindset_tip": "Lời động viên ngắn giúp học sinh tự tin"
}`;

  try {
    const aiText = await callAiModel({
      messages: [
        { role: "system", content: "Bạn là AI khảo thí chuyên sâu chuẩn GDPT 2018. Luôn trả về JSON hợp lệ." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      jsonMode: true
    });

    const parsed = JSON.parse(aiText);
    return {
      id: generateId("twin"),
      original_question_id: questionId,
      subject,
      cognitive_barrier: parsed.cognitive_barrier || "Lỗi nhầm lẫn khái niệm cơ bản",
      question_text: parsed.question_text || `[Biến thể gỡ điểm] ${originalText}`,
      options: parsed.options || { A: "1", B: "2", C: "3", D: "4" },
      correct_answer: parsed.correct_answer || "A",
      micro_explanation: parsed.micro_explanation || "Lời giải chi tiết cho câu hỏi sinh đôi.",
      growth_mindset_tip: parsed.growth_mindset_tip || "Tuyệt vời! Bạn đã vượt qua bẫy đề bài rồi đấy!",
      is_ai_generated: true
    };
  } catch {
    // Graceful deterministic pedagogical fallback
    return {
      id: generateId("twin"),
      original_question_id: questionId,
      subject,
      cognitive_barrier: `Nhầm lẫn giữa phương án ${correctAnswer} và ${wrongAnswer} do áp lực thời gian`,
      question_text: `[Câu hỏi gỡ điểm] Tương tự bài toán vừa rồi: Hãy quan sát kỹ dữ kiện ban đầu của môn ${subject} và xác định khẳng định chính xác nhất:`,
      options: {
        A: "Áp dụng định lý trực tiếp và kiểm tra điều kiện xác định",
        B: "Bỏ qua bước đặt điều kiện và biến đổi tương đương",
        C: "Rút gọn biểu thức mà chưa xét trường hợp bằng 0",
        D: "Thay nghiệm trực tiếp vào phương trình gốc"
      },
      correct_answer: "A",
      micro_explanation: "Khi giải dạng toán này, việc kiểm tra điều kiện xác định là bước tiên quyết để không bị bẫy nghiệm ngoại lai.",
      growth_mindset_tip: "Bình tĩnh đọc kỹ đề từng bước là chìa khóa của 10 điểm!",
      is_ai_generated: false
    };
  }
}
