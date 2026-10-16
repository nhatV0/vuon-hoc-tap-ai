import { DOMAIN_CONCRETE_DEBATES } from "@/modules/socratic/socratic.concrete-debates";

export interface EssayQuestionBankItem {
  id: string;
  subject: string;
  topic_hint: string;
  question_text: string;
  sample_answer: string;
  key_points: string[];
}

export function getAllEssayDebateQuestions(): Record<string, EssayQuestionBankItem[]> {
  const result: Record<string, EssayQuestionBankItem[]> = {};

  let count = 1;
  for (const [subject, chapters] of Object.entries(DOMAIN_CONCRETE_DEBATES)) {
    result[subject] = [];
    for (const [chTitle, qList] of Object.entries(chapters)) {
      for (const q of qList) {
        result[subject].push({
          id: `TL-${subject.slice(0, 3).toUpperCase()}-${String(count++).padStart(3, "0")}`,
          subject,
          topic_hint: q.topic_hint || chTitle,
          question_text: q.question,
          sample_answer: q.sample_answer,
          key_points: q.key_points || []
        });
      }
    }
  }

  return result;
}
