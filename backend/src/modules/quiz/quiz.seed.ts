import { db } from "@/db/client";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import bundledQuestions from "@/db/bundled_questions.json";
import { FALLBACK_SAMPLE_QUIZ_QUESTIONS } from "./quiz.sample-data";

export function normalizeQuestionText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9à-ỹ\s]/g, "").replace(/\s+/g, " ").trim();
}

export function saveQuestionToBankIfUnique(item: {
  id?: string;
  block?: string;
  subject?: string;
  slot_type?: string;
  source?: string;
  bloom_level?: string;
  lock_condition?: string;
  time_limit_seconds?: number;
  question_text: string;
  options: Record<string, string> | string;
  correct_answer: string;
  micro_explanation?: string;
  growth_mindset_tip?: string;
  creator_role?: string;
}): boolean {
  const norm = normalizeQuestionText(item.question_text);
  if (!norm || norm.length < 10) return false;

  const existing = db.query(
    "SELECT id, question_text FROM quiz_questions WHERE subject = ?"
  ).all(item.subject || "Toán học") as Array<{ id: string; question_text: string }>;

  const isDuplicate = existing.some((q) => {
    const qNorm = normalizeQuestionText(q.question_text);
    return qNorm === norm || (qNorm.length > 30 && (qNorm.includes(norm.slice(0, 40)) || norm.includes(qNorm.slice(0, 40))));
  });

  if (isDuplicate) return false;

  const id = item.id || `ai_q_${Math.random().toString(36).substring(2, 9)}`;
  db.run(
    `INSERT OR IGNORE INTO quiz_questions (
      id, block, subject, slot_type, source, bloom_level,
      lock_condition, time_limit_seconds, question_text, options,
      correct_answer, micro_explanation, growth_mindset_tip, creator_role, is_active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
    [
      id,
      item.block || "A00",
      item.subject || "Toán học",
      item.slot_type || "DYNAMIC_3",
      item.source || "Trợ Lý AI Tự Động Lưu Khảo Thí",
      item.bloom_level || "Vận dụng",
      item.lock_condition || "MOTUDO",
      item.time_limit_seconds || 60,
      item.question_text,
      typeof item.options === "string" ? item.options : JSON.stringify(item.options || {}),
      item.correct_answer || "A",
      item.micro_explanation || "Lời giải chi tiết chuẩn hóa GDPT 2018.",
      item.growth_mindset_tip || "Sai lầm là cơ hội để học hỏi sâu hơn!",
      item.creator_role || "AI_ASSISTANT"
    ]
  );
  return true;
}

export function seedQuizQuestionsFromHocLieu() {
  const possiblePaths = [
    join(process.cwd(), "..", "hoc_lieu", "bo_cau_hoi", "mon_hoc"),
    join(process.cwd(), "hoc_lieu", "bo_cau_hoi", "mon_hoc"),
    join(process.cwd(), "backend", "hoc_lieu", "bo_cau_hoi", "mon_hoc"),
    join(import.meta.dir, "..", "..", "..", "..", "hoc_lieu", "bo_cau_hoi", "mon_hoc"),
    join(import.meta.dir, "..", "..", "..", "hoc_lieu", "bo_cau_hoi", "mon_hoc")
  ];

  const hocLieuDir = possiblePaths.find((p) => existsSync(p));
  if (hocLieuDir) {
    const files = readdirSync(hocLieuDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const content = readFileSync(join(hocLieuDir, file), "utf-8");
        const list = JSON.parse(content);
        if (Array.isArray(list)) {
          for (const item of list) {
            saveQuestionToBankIfUnique(item);
          }
        }
      } catch {}
    }
  }
  // Always seed the full 132 bundled questions across all subjects
  if (Array.isArray(bundledQuestions)) {
    for (const q of bundledQuestions) {
      saveQuestionToBankIfUnique(q);
    }
  }
  for (const sample of FALLBACK_SAMPLE_QUIZ_QUESTIONS) {
    saveQuestionToBankIfUnique(sample);
  }
}
