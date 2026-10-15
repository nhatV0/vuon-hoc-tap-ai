import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import { SocraticChatDto } from "./socratic.schemas";

export class SocraticService {
  async chat(dto: SocraticChatDto): Promise<{ response: string; question_prompt: string }> {
    const isSolver = dto.mode === "solver";
    const subjectSkills: Record<string, string> = {
      "Toán học": "Đại số & Giải tích (hàm số, đạo hàm, tích phân, số phức), Hình học không gian (Oxyz, tọa độ, thể tích), Xác suất thống kê GDPT 2018.",
      "Vật lí": "Dao động cơ, Sóng cơ - Sóng ánh sáng, Điện xoay chiều, Vật lí hạt nhân, Nhiệt học và Khí lý tưởng.",
      "Hóa học": "Cân bằng hóa học, Điện hóa & Oxi hóa khử, Hóa học hữu cơ (ester, lipid, carbohydrate, amine, amino acid, polymer), Phức chất.",
      "Sinh học": "Di truyền phân tử, Quy luật di truyền Mendel & liên kết gen, Sinh thái học và Tiến hóa.",
      "Tin học": "Lập trình Python/C++, Cấu trúc dữ liệu & Thuật toán, Cơ sở dữ liệu quan hệ SQL.",
      "Ngữ văn": "Nghị luận văn học, Nghị luận xã hội, Đọc hiểu văn bản và phân tích biện pháp tu từ theo GDPT 2018.",
      "Tiếng Anh": "Ngữ pháp tiếng Anh THPT, Phân tích bài đọc điền từ, Đọc hiểu, Tìm lỗi sai, Viết lại câu và Từ vựng IELTS/THPTQG."
    };

    const currentSkill = subjectSkills[dto.subject] || "Kiến thức trọng tâm chương trình GDPT 2018 Việt Nam";

    const solverPrompt = `Bạn là Trợ Lý Hoa Hướng Dương kiêm Chuyên Gia Giải Bài Tập Toàn Diện môn ${dto.subject} THPT.
BỘ KỸ NĂNG XỬ LÝ MỌI DẠNG BÀI TẬP:
1. NHẬN DIỆN & TÓM TẮT: Xác định ngay dạng bài, giả thiết (cho gì) và kết luận (tìm gì). Đặt điều kiện có nghĩa.
2. CÔNG THỨC & PHƯƠNG PHÁP: BẮT BUỘC BỌC MỌI CÔNG THỨC TOÁN/LÝ/HÓA TRONG KÝ HIỆU $ (hoặc $$ cho công thức độc lập). TUYỆT ĐỐI KHÔNG VIẾT LỆNH LATEX TRẦN NHƯ \\text{...}, \\sum, \\rightarrow MÀ KHÔNG CÓ DẤU $.
3. LỜI GIẢI CHI TIẾT & LOGIC: Trình bày từng bước có căn cứ rõ ràng, xuống dòng thoáng, có gạch đầu dòng rõ ràng.
4. ĐÁP SỐ CHÍNH XÁC: Ghi rõ kết quả, đơn vị đo hoặc tập nghiệm $S$.
5. BẪY PHÒNG THI & MẸO NHANH: Chỉ ra 1 lỗi sai học sinh hay gặp và mẹo tính nhanh nếu có.
Nếu học sinh hỏi lý thuyết hoặc nói 'quên công thức': Tóm tắt ngay bản chất lý thuyết, công thức then chốt kèm 1 ví dụ áp dụng ngắn gọn, dễ nhớ nhất.`;

    const socraticPrompt = `Bạn là Trợ Lý Hoa Hướng Dương kiêm Gia Sư Khơi Gợi Socratic môn ${dto.subject}.
Chuyên môn: ${currentSkill}.
BỘ KỸ NĂNG SƯ PHẠM KHƠI GỢI:
1. KHÔNG giải trực tiếp hoặc đưa ngay đáp án số học.
2. Thấu hiểu và động viên khi học sinh nói 'quên kiến thức' hoặc 'không hiểu'.
3. GỢI Ý ĐÚNG 1 BƯỚC DUY NHẤT: Đặt 1 câu hỏi gợi mở hoặc nhắc lại gợi ý công thức nền tảng để học sinh tự làm bước tiếp theo.
4. Công thức bọc trong ký hiệu LaTeX dạng $...$.`;

    const systemPrompt = isSolver ? solverPrompt : socraticPrompt;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...dto.history.slice(-8),
      { role: "user", content: dto.message }
    ];

    try {
      const reply = await callAiModel({
        messages,
        temperature: isSolver ? 0.2 : 0.7,
        maxTokens: isSolver ? 3500 : 2000
      });
      return {
        response: reply,
        question_prompt: isSolver
          ? "Bạn có muốn mình giải thích kỹ hơn bước nào hoặc làm thêm bài tương tự không?"
          : "Hãy thử suy nghĩ câu hỏi gợi ý trên và trả lời cho mình biết nhé!"
      };
    } catch (err) {
      console.warn("[SocraticService] AI call error, applying intelligent contextual response:", err);
      // Generate dynamic contextual guidance so it never repeats the same static answer
      const lowerMsg = dto.message.toLowerCase();
      let customAdvice = "";
      let customPrompt = "";

      if (lowerMsg.includes("oxi") || lowerMsg.includes("khử") || lowerMsg.includes("redox")) {
        customAdvice = "Với phản ứng oxi hóa – khử: Bạn hãy nhớ quy tắc 'Khử cho - O nhận' ($e$). Hãy xác định chất nào có số oxi hóa tăng (chất khử) và chất nào giảm (chất oxi hóa).";
        customPrompt = "Bạn có thể cho mình biết cụ thể công thức phản ứng bạn đang làm không?";
      } else if (lowerMsg.includes("phương trình") || lowerMsg.includes("nghiệm") || lowerMsg.includes("toán")) {
        customAdvice = "Để tìm nghiệm của phương trình, trước hết hãy đưa về dạng tích hoặc chuyển vế để xét các giá trị khả dĩ của biến số.";
        customPrompt = "Đề bài cụ thể của bạn là gì?";
      } else {
        customAdvice = `Đối với môn ${dto.subject}, mình đã ghi nhận câu hỏi của bạn: "${dto.message.slice(0, 50)}".`;
        customPrompt = "Bạn hãy chia sẻ rõ hơn đề bài hoặc bước tính mà bạn đang băn khoăn để chúng ta giải quyết nhé!";
      }

      return {
        response: customAdvice,
        question_prompt: customPrompt
      };
    }
  }
}
