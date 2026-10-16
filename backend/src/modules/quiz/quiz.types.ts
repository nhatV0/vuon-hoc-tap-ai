export interface FallbackQuizItem {
  id: string;
  block: string;
  subject: string;
  slot_type: string;
  source: string;
  bloom_level: string;
  lock_condition: string;
  time_limit_seconds: number;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  micro_explanation: string;
  growth_mindset_tip: string;
}
