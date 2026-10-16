import bundledQuestions from "./bundled_questions.json";

export interface ClientQuizQuestion {
  id: string;
  block?: string;
  subject: string;
  bloom_level?: string;
  source?: string;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  micro_explanation?: string;
  growth_mindset_tip?: string;
}

export function getClientQuestionsBySubject(subject: string): ClientQuizQuestion[] {
  if (Array.isArray(bundledQuestions)) {
    const list = (bundledQuestions as any[]).filter((q) => q.subject === subject);
    if (list.length > 0) {
      // True Fisher-Yates random shuffle so questions are unpredictable and varied
      const shuffled = [...list];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.map((q) => ({
        id: q.id,
        block: q.block || "A00",
        subject: q.subject,
        bloom_level: q.bloom_level || "Thông hiểu",
        source: q.source || "Ngân hàng chuẩn hóa GDPT 2018",
        question_text: q.question_text,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options || {},
        correct_answer: q.correct_answer || "A",
        micro_explanation: q.micro_explanation || "Lời giải chi tiết chuẩn hóa GDPT 2018.",
        growth_mindset_tip: q.growth_mindset_tip || "Sai lầm là cơ hội để học hỏi sâu hơn!"
      }));
    }
  }
  return [];
}
