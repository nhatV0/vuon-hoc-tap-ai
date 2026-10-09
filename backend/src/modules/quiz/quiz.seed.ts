import { db } from "@/db/client";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export function seedQuizQuestionsFromHocLieu() {
  const existingCount = db.query("SELECT COUNT(*) as count FROM quiz_questions").get() as { count: number };
  if (existingCount.count > 0) return;

  const hocLieuDir = join(process.cwd(), "..", "hoc_lieu", "bo_cau_hoi", "mon_hoc");
  if (!existsSync(hocLieuDir)) return;

  const files = readdirSync(hocLieuDir).filter(f => f.endsWith(".json"));
  for (const file of files) {
    try {
      const content = readFileSync(join(hocLieuDir, file), "utf-8");
      const list = JSON.parse(content);
      if (Array.isArray(list)) {
        for (const item of list) {
          const id = item.id || `q_${Math.random().toString(36).substring(2, 9)}`;
          db.run(
            `INSERT OR IGNORE INTO quiz_questions (
              id, block, subject, slot_type, source, bloom_level,
              lock_condition, time_limit_seconds, question_text, options,
              correct_answer, micro_explanation, growth_mindset_tip
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              item.block || "A00",
              item.subject || "Toán học",
              item.slot_type || "DYNAMIC_3",
              item.source || "Ngân hàng chuẩn hóa GDPT 2018",
              item.bloom_level || "Thông hiểu",
              item.lock_condition || "MOTUDO",
              item.time_limit_seconds || 60,
              item.question_text || "",
              typeof item.options === "string" ? item.options : JSON.stringify(item.options || {}),
              item.correct_answer || "A",
              item.micro_explanation || "Lời giải chi tiết theo chuẩn GDPT 2018.",
              item.growth_mindset_tip || "Sai lầm là cơ hội để học hỏi sâu hơn!"
            ]
          );
        }
      }
    } catch {}
  }
}
