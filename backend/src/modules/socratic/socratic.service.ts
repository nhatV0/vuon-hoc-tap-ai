import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import {
  DebateGenerateQuestionDto,
  DebateEvaluateAnswerDto,
  SocraticChatDto
} from "./socratic.schemas";
import { SUBJECT_SYLLABUS_MAP, SyllabusChapter } from "./socratic.syllabus";
import { evaluateDebateAnswer, DebateEvaluationResult } from "./socratic.evaluator";
import { getTheoryContent } from "./socratic.knowledge";

export interface DebateQuestionResult {
  question_number: number;
  question: string;
  sample_answer: string;
  key_points: string[];
  topic_hint: string;
}

export type { DebateEvaluationResult };

export class SocraticService {
  getSyllabus(subject?: string): Record<string, SyllabusChapter[]> {
    if (subject && SUBJECT_SYLLABUS_MAP[subject]) {
      return { [subject]: SUBJECT_SYLLABUS_MAP[subject] };
    }
    return SUBJECT_SYLLABUS_MAP;
  }

  async generateDebateQuestion(dto: DebateGenerateQuestionDto): Promise<DebateQuestionResult> {
    const focusChapter = dto.selected_chapters[(dto.question_index - 1) % dto.selected_chapters.length] || dto.subject;
    const theoryExtract = getTheoryContent(dto.subject, focusChapter).slice(0, 1500);

    const prevList = Array.isArray(dto.previous_questions) ? dto.previous_questions.filter(Boolean) : [];
    const prevNotice = prevList.length > 0
      ? `\nCÁC CÂU ĐÃ HỎI TRƯỚC ĐÓ:\n${prevList.map((q, idx) => `${idx + 1}. "${q}"`).join("\n")}\nLƯU Ý ĐẶC BIỆT: TUYỆT ĐỐI KHÔNG HỎI LẠI CÁC Ý/CHỦ ĐỀ ĐÃ NÊU TRÊN. BẮT BUỘC CHỌN MỘT KHÍA CẠNH, KHÁI NIỆM HOẶC SỰ KIỆN HOÀN TOÀN KHÁC TRONG BÀI.`
      : "";

    const prompt = `Bạn là Trợ Lý Gia Sư Tranh Luận môn ${dto.subject} THPT.
Chủ đề: "${focusChapter}". Câu số: ${dto.question_index}/10.
${prevNotice}

LÝ THUYẾT NGUỒN TỪ SÁCH GIÁO KHOA:
"""
${theoryExtract}
"""

QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG TRÙNG LẶP: Không hỏi lại các câu hay chủ đề đã hỏi ở các câu trước.
2. Hỏi ĐÚNG VÀO NỘI DUNG LÝ THUYẾT TRONG ĐOẠN TRÍCH TRÊN. Nêu tên chính xác khái niệm, định luật, sự kiện, công thức hoặc cơ chế có trong bài.
3. TUYỆT ĐỐI KHÔNG hỏi chung chung, không hỏi triết lý ("nếu lược bỏ giả thiết thì sao", "bản chất là gì").
4. Hãy đặt 1 câu hỏi phản biện ngắn (15-30 từ) bằng tình huống cụ thể (Ví dụ: "Có ý kiến cho rằng... đúng hay sai? Vì sao?", "Tại sao khi... thì phải... mà không được...?").
5. Trả về đúng định dạng JSON:
{
  "question": "Nội dung câu hỏi ngắn cụ thể",
  "sample_answer": "Ý chính chuẩn xác dựa trên lý thuyết (1-2 câu)",
  "topic_hint": "${focusChapter}"
}`;

    const messages: ChatMessage[] = [
      { role: "system", content: "Chỉ trả về JSON hợp lệ." },
      { role: "user", content: prompt }
    ];

    const isDuplicate = (q: string): boolean => {
      if (!q || q.length < 10) return true;
      const qClean = q.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/);
      const qSet = new Set(qClean);
      for (const old of prevList) {
        const oldClean = old.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/);
        const oldSet = new Set(oldClean);
        let intersect = 0;
        for (const w of qSet) {
          if (oldSet.has(w)) intersect++;
        }
        const sim = (2 * intersect) / (qSet.size + oldSet.size);
        if (sim > 0.55) return true;
      }
      return false;
    };

    // Retry loop with higher temperature if duplicate
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const temp = attempt === 0 ? 0.75 : 0.95;
        const raw = await callAiModel({ messages, temperature: temp, maxTokens: 350 });
        const match = raw.match(/\{[\s\S]*\}/);
        const jsonStr = match ? match[0] : raw.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = jsonStr ? JSON.parse(jsonStr) : {};
        if (parsed.question && !parsed.question.includes("hai khái niệm cơ bản") && !isDuplicate(parsed.question)) {
          return {
            question_number: dto.question_index,
            question: parsed.question,
            sample_answer: parsed.sample_answer || "Nắm vững lý thuyết nguồn để giải thích đúng bản chất.",
            key_points: Array.isArray(parsed.key_points) ? parsed.key_points : ["Khái niệm chính xác"],
            topic_hint: parsed.topic_hint || focusChapter
          };
        }
      } catch {}
    }

    // Varied concrete fallback derived directly from subject facts
    const fallbacks = [
      `Trong "${focusChapter}", có quan điểm cho rằng chỉ cần ghi nhớ kết quả thay vì bản chất cơ chế hay nguyên nhân sâu xa. Quan điểm này đúng hay sai? Vì sao?`,
      `Tại sao trong nội dung "${focusChapter}", các căn cứ định luật/luật pháp/cơ sở dữ liệu thực nghiệm lại quyết định giá trị pháp lý và khoa học của một luận điểm?`,
      `Trong "${focusChapter}", nếu một nhận định bỏ qua điều kiện biên hoặc bối cảnh lịch sử/khoa học cụ thể thì tính đúng đắn sẽ thay đổi như thế nào?`,
      `Đối với "${focusChapter}", vì sao việc xác định rõ mối quan hệ nguyên nhân - kết quả lại là yếu tố then chốt để bác bỏ những ngộ nhận phổ biến?`
    ];
    const selectedFallback = fallbacks[(dto.question_index - 1) % fallbacks.length];

    return {
      question_number: dto.question_index,
      question: selectedFallback,
      sample_answer: `Trong ${focusChapter}, cần nắm chắc bản chất, cơ sở thực nghiệm và bối cảnh để giải thích thuyết phục.`,
      key_points: ["Bản chất lý thuyết", "Cơ sở thực tiễn"],
      topic_hint: focusChapter
    };
  }

  async evaluateStudentAnswer(dto: DebateEvaluateAnswerDto): Promise<DebateEvaluationResult> {
    return evaluateDebateAnswer(dto);
  }

  async chat(dto: SocraticChatDto): Promise<{ response: string; question_prompt: string }> {
    const chaptersContext = dto.selected_chapters?.length ? ` (${dto.selected_chapters.join(", ")})` : "";
    const systemPrompt = `Gia Sư Tranh Luận môn ${dto.subject}${chaptersContext}. Phản biện ngắn gọn, bọc công thức trong $...$.`;
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...dto.history.slice(-6),
      { role: "user", content: dto.message }
    ];

    try {
      const reply = await callAiModel({ messages, temperature: 0.5, maxTokens: 800 });
      return {
        response: reply,
        question_prompt: "Luận cứ phản biện tiếp theo của bạn là gì?"
      };
    } catch {
      return {
        response: `Về câu hỏi môn ${dto.subject}, luận điểm của bạn rất đáng chú ý. Hãy đưa ra dẫn chứng để cùng trao đổi tiếp nhé!`,
        question_prompt: "Luận cứ phản biện của bạn là gì?"
      };
    }
  }
}
