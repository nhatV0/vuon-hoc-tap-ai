import { db } from "@/db/client";
import { SAMPLE_HALL_OF_FAME } from "./leaderboard.data";

export function seedLeaderboardData(): void {
  const countRow = db.query("SELECT COUNT(*) as count FROM students").get() as { count: number };
  if (countRow.count > 10) return;

  const insertStudent = db.prepare(`
    INSERT OR IGNORE INTO students (
      id, name, grade, classroom, target_subject, weakness, long_term_goal, timeframe, learning_style, selected_flower
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFlower = db.prepare(`
    INSERT OR REPLACE INTO flower_status (
      student_id, current_state, consecutive_days, last_checkin_date, water_drops, story_message
    ) VALUES (?, 'tich_cuc', ?, datetime('now'), ?, 'Cây phát triển rực rỡ')
  `);

  const insertDebate = db.prepare(`
    INSERT INTO student_debate_attempts (
      student_id, subject, question, student_answer, sample_answer, verdict, is_correct, feedback
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Hoàn thành tranh biện xuất sắc.')
  `);

  for (const st of SAMPLE_HALL_OF_FAME) {
    insertStudent.run(
      st.id,
      st.name,
      st.grade,
      st.classroom,
      st.target_subject,
      "Hổng kiến thức nền tảng",
      "Đỗ nguyện vọng 1 Đại học",
      "3 tháng",
      "visual",
      st.selected_flower
    );
    insertFlower.run(st.id, st.streak, st.water_drops);
    for (const d of st.debates) {
      insertDebate.run(st.id, d.subject, d.question, d.student_answer, d.sample_answer, d.verdict, d.is_correct);
    }
  }
}
