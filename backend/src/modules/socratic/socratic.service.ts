import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import { SocraticChatDto } from "./socratic.schemas";

export class SocraticService {
  async chat(dto: SocraticChatDto): Promise<{ response: string; question_prompt: string }> {
    const systemPrompt = `Bạn là Trợ Lý Hoa Hướng Dương kiêm Gia Sư Khơi Gợi Socratic (Socratic Inquiry Tutor) dành cho học sinh THPT chương trình GDPT 2018 Việt Nam.
Môn học hiện tại: ${dto.subject}.
NGUYÊN TẮC SƯ PHẠM BẤT DI BẤT DỊCH:
1. TUYỆT ĐỐI KHÔNG giải bài trực tiếp hay đưa ra ngay đáp án số học/kết quả cuối cùng.
2. Hãy chia nhỏ khúc mắc của học sinh thành 1 CÂU HỎI GỢI MỞ DUY NHẤT (Scaffolding question) để học sinh tự suy nghĩ và tự tìm ra hướng giải.
3. Luôn giữ thái độ ân cần, thấu cảm, không phán xét, sử dụng đại từ "bạn" và "trợ lý/thầy cô".
4. Nếu có công thức toán/lý/hóa, hãy bọc trong ký hiệu LaTeX dạng $công_thức$.`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...dto.history.slice(-6),
      { role: "user", content: dto.message }
    ];

    try {
      const reply = await callAiModel({
        messages,
        temperature: 0.7,
        maxTokens: 500
      });
      return {
        response: reply,
        question_prompt: "Hãy thử suy nghĩ câu hỏi gợi ý trên và trả lời cho mình biết nhé!"
      };
    } catch {
      // Pedagogical rule-based fallback
      return {
        response: `Chào bạn! Để giải quyết vấn đề ở môn ${dto.subject}: Bạn hãy quan sát kỹ lại xem đề bài đã cho chúng ta những dữ kiện đại lượng nào ban đầu, và công thức cơ bản nhất liên kết giữa các đại lượng đó là gì nhỉ?`,
        question_prompt: "Hãy liệt kê 1 công thức mà bạn cảm thấy quen thuộc nhất với dạng bài này nhé!"
      };
    }
  }
}
