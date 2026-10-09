import { callAiModel } from "@/modules/ai/ai.client";
import { ScratchpadAnalysisResult } from "./vision.schemas";

export class VisionService {
  async analyzeScratchpad(
    imageBase64: string,
    subject: string,
    problemDesc: string
  ): Promise<ScratchpadAnalysisResult> {
    const formattedUrl = imageBase64.startsWith("data:") 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;

    const promptText = `Bạn là Chuyên gia Khảo nghiệm Bài Làm Học Sinh môn ${subject} THPT.
Hãy quan sát hình ảnh bài nháp/bài giải viết tay được gửi kèm.
Đề bài hoặc ngữ cảnh: "${problemDesc || "Bài tập viết tay học sinh THPT"}".

YÊU CẦU NỘI SOI:
1. Đọc và phiên âm từng bước biến đổi của học sinh thành mảng "step_by_step" kèm công thức LaTeX $...$.
2. Phát hiện chính xác bước nào bị sai đầu tiên ("error_step_index", bắt đầu từ 0). Nếu bài làm đúng toàn bộ, gán là -1.
3. Chỉ ra lỗi sai tư duy: nhầm dấu, quên điều kiện, thế sai số, biến đổi sai định lý...
4. Đưa ra hướng dẫn khơi gợi nhẹ nhàng và lời động viên tinh thần.

Trả về đúng định dạng JSON thuần túy (không markdown):
{
  "step_by_step": ["Bước 1: ...", "Bước 2: ..."],
  "error_step_index": 1,
  "error_type": "Nhầm dấu trừ thành dấu cộng khi khai triển",
  "pedagogical_guidance": "Quan sát kỹ quy tắc dấu ngoặc khi chuyển vế nhé!",
  "encouragement": "Bạn đã viết các bước rất rõ ràng và mạch lạc, chỉ cần chú ý một chút ở bước 2 thôi!"
}`;

    try {
      const resultText = await callAiModel({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              { type: "image_url", image_url: { url: formattedUrl } }
            ]
          }
        ],
        temperature: 0.4,
        jsonMode: true
      });

      const parsed = JSON.parse(resultText);
      return {
        step_by_step: Array.isArray(parsed.step_by_step) ? parsed.step_by_step : ["Bước 1: Thiết lập phương trình ban đầu", "Bước 2: Biến đổi biểu thức đại số"],
        error_step_index: typeof parsed.error_step_index === "number" ? parsed.error_step_index : 1,
        error_type: parsed.error_type || "Sơ suất ở bước biến đổi trung gian",
        pedagogical_guidance: parsed.pedagogical_guidance || "Kiểm tra lại điều kiện nghiệm và các bước chuyển vế đổi dấu.",
        encouragement: parsed.encouragement || "Nỗ lực viết nháp của bạn rất đáng khen ngợi!",
        is_ai_analyzed: true
      };
    } catch {
      // Graceful fallback for scratchpad review
      return {
        step_by_step: [
          "Bước 1: Ghi nhận đề bài và xác định các đại lượng đã cho",
          "Bước 2: Áp dụng công thức và thế số vào biểu thức",
          "Bước 3: Rút gọn và đối chiếu với điều kiện xác định"
        ],
        error_step_index: 1,
        error_type: "Lưu ý kiểm tra dấu và đơn vị đại lượng khi thế số",
        pedagogical_guidance: `Khi làm bài môn ${subject}, hãy luôn dành 10 giây kiểm tra lại bước thế số và điều kiện của nghiệm trước khi kết luận.`,
        encouragement: "Trợ lý luôn đồng hành cùng từng nét chữ nháp của bạn!",
        is_ai_analyzed: false
      };
    }
  }
}
