import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import { DebateGenerateQuestionDto, DebateGenerateSessionDto } from "./socratic.schemas";
import { getTheoryContent } from "./socratic.knowledge";
import { findDomainConcreteDebate } from "./socratic.concrete-debates";

export interface DebateQuestionResult {
  question_number: number;
  question: string;
  sample_answer: string;
  key_points: string[];
  topic_hint: string;
}

export async function generateDebateQuestionHelper(dto: DebateGenerateQuestionDto): Promise<DebateQuestionResult> {
  const focusChapter = dto.selected_chapters[(dto.question_index - 1) % dto.selected_chapters.length] || dto.subject;
  const theoryExtract = getTheoryContent(dto.subject, focusChapter).slice(0, 1500);

  const prevList = Array.isArray(dto.previous_questions) ? dto.previous_questions.filter(Boolean) : [];
  const prevNotice = prevList.length > 0
    ? `\nCÁC CÂU ĐÃ HỎI TRƯỚC ĐÓ:\n${prevList.map((q, idx) => `${idx + 1}. "${q}"`).join("\n")}\nLƯU Ý ĐẶC BIỆT: TUYỆT ĐỐI KHÔNG HỎI LẠI CÁC Ý/CHỦ ĐỀ ĐÃ NÊU TRÊN. BẮT BUỘC CHỌN MỘT KHÍA CẠNH, KHÁI NIỆM HOẶC SỰ KIỆN HOÀN TOÀN KHÁC TRONG BÀI.`
    : "";

  const prompt = `Bạn là Trợ Lý Gia Sư Tranh Luận môn ${dto.subject} bậc THPT.
Chủ đề: "${focusChapter}". Câu hỏi số: ${dto.question_index}/10.
${prevNotice}

NGUỒN DỮ LIỆU LÝ THUYẾT SGK CHUẨN:
"""
${theoryExtract}
"""

YÊU CẦU ĐẶT CÂU HỎI CHO TRỢ LÝ:
1. TUYỆT ĐỐI KHÔNG TRÙNG LẶP: Không hỏi lại các khái niệm/vấn đề đã xuất hiện ở các câu trước.
2. BÁM SÁT LÝ THUYẾT NGUỒN: Khai thác đúng các định nghĩa, công thức toán học/vật lý/hóa học, hiện tượng, cơ chế, sự kiện lịch sử, điều luật hoặc từ vựng/ngữ pháp có trong đoạn trích lý thuyết.
3. DẠNG CÂU HỎI TRANH BIỆN PHẢN BIỆN (15-30 từ):
   - "Có ý kiến nhận định rằng... Đúng hay sai? Tại sao?"
   - "Tại sao khi... thì... mà không thể...?"
   - "Nếu thay đổi điều kiện... thì kết quả/hiện tượng sẽ biến đổi ra sao?"
4. BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON (không kèm markdown):
{
  "question": "Câu hỏi ngắn gọn...",
  "sample_answer": "Ý chính giải thích chuẩn xác...",
  "key_points": ["Luận điểm 1", "Luận điểm 2"],
  "topic_hint": "${focusChapter}"
}`;

  const messages: ChatMessage[] = [
    { role: "system", content: "Chỉ trả về duy nhất 1 JSON object hợp lệ, không bọc markdown hay text bên ngoài." },
    { role: "user", content: prompt }
  ];

  const isDuplicate = (qText: string) => {
    const norm = qText.toLowerCase().replace(/[^a-z0-9à-ỹ\s]/g, "");
    return prevList.some((old) => {
      const oldNorm = old.toLowerCase().replace(/[^a-z0-9à-ỹ\s]/g, "");
      return norm === oldNorm || (norm.length > 25 && oldNorm.includes(norm.slice(0, 35)));
    });
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callAiModel({ messages, temperature: 0.75 + attempt * 0.15, maxTokens: 600 });
      const match = raw.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);

      if (parsed.question && !parsed.question.includes("hai khái niệm cơ bản") && !isDuplicate(parsed.question)) {
        return {
          question_number: dto.question_index,
          question: parsed.question,
          sample_answer: parsed.sample_answer || "Nắm vững bản chất để giải thích đúng.",
          key_points: Array.isArray(parsed.key_points) ? parsed.key_points : ["Khái niệm chính xác"],
          topic_hint: parsed.topic_hint || focusChapter
        };
      }
    } catch {}
  }

  const domainItem = findDomainConcreteDebate(dto.subject, focusChapter, dto.question_index, prevList);
  return {
    question_number: dto.question_index,
    question: domainItem.question,
    sample_answer: domainItem.sample_answer,
    key_points: domainItem.key_points,
    topic_hint: domainItem.topic_hint
  };
}

export async function generateDebateSessionHelper(dto: DebateGenerateSessionDto): Promise<DebateQuestionResult[]> {
  const totalCount = Math.min(Math.max(1, dto.count || 10), 10);
  const combinedTheory = dto.selected_chapters
    .map((ch) => `--- CHỦ ĐỀ: ${ch} ---\n${getTheoryContent(dto.subject, ch).slice(0, 1200)}`)
    .join("\n\n");

  const prompt = `Bạn là Trọng tài kiêm Gia sư Tranh luận môn ${dto.subject} THPT.
Hãy tạo đúng ${totalCount} câu hỏi phản biện tự luận độc đáo, không trùng lặp dựa trên các chủ đề sau:
${dto.selected_chapters.map((c, i) => `${i + 1}. ${c}`).join("\n")}

NGUỒN LÝ THUYẾT SGK GDPT 2018 ĐƯỢC CHUẨN HÓA:
"""
${combinedTheory}
"""

QUY TẮC BẮT BUỘC KHI SINH CÂU HỎI:
1. Tạo đủ ${totalCount} câu hỏi phản biện (15-30 từ), mỗi câu hỏi khai thác một định nghĩa, định luật, sự kiện, phản ứng, thuật toán, công thức hoặc từ vựng/ngữ pháp cụ thể trong tài liệu.
2. Mẫu câu hỏi kích thích tư duy phản biện:
   - "Có ý kiến cho rằng... Đúng hay sai? Tại sao?"
   - "Tại sao khi... thì... mà không được...?"
   - "Nếu giả thiết... bị thay đổi thì hiện tượng/kết quả sẽ như thế nào?"
3. Đáp án mẫu (sample_answer): 1-2 câu ngắn gọn, đưa ra luận cứ lý thuyết cốt lõi để làm thước đo chấm bài.
4. Trả về DUY NHẤT một mảng JSON (không có markdown hay văn bản ngoài):
[
  {
    "question_number": 1,
    "question": "Nội dung câu hỏi ngắn gọn...",
    "sample_answer": "Ý chính chuẩn xác...",
    "key_points": ["Luận điểm 1", "Luận điểm 2"],
    "topic_hint": "Tên chủ đề..."
  }
]`;

  const messages: ChatMessage[] = [
    { role: "system", content: "Chỉ trả về JSON hợp lệ dưới dạng một mảng [] các câu hỏi." },
    { role: "user", content: prompt }
  ];

  try {
    const raw = await callAiModel({ messages, temperature: 0.65, maxTokens: 1800 });
    const match = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const jsonStr = match ? match[0] : raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedList = JSON.parse(jsonStr);
    if (Array.isArray(parsedList) && parsedList.length > 0) {
      return parsedList.slice(0, totalCount).map((item, idx) => ({
        question_number: idx + 1,
        question: item.question || `Câu hỏi tranh luận số ${idx + 1} môn ${dto.subject}`,
        sample_answer: item.sample_answer || "Nắm vững lý thuyết cốt lõi để giải thích đúng bản chất.",
        key_points: Array.isArray(item.key_points) ? item.key_points : ["Khái niệm chính xác"],
        topic_hint: item.topic_hint || dto.selected_chapters[idx % dto.selected_chapters.length] || dto.subject
      }));
    }
  } catch {}

  const results: DebateQuestionResult[] = [];
  for (let i = 1; i <= totalCount; i++) {
    const focus = dto.selected_chapters[(i - 1) % dto.selected_chapters.length] || dto.subject;
    const item = findDomainConcreteDebate(dto.subject, focus, i);
    results.push({
      question_number: i,
      question: item.question,
      sample_answer: item.sample_answer,
      key_points: item.key_points,
      topic_hint: item.topic_hint
    });
  }
  return results;
}
