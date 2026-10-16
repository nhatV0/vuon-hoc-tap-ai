import { db } from "@/db/client";

export function fetchDailyQuestions(studentId: string, subjectQuery?: string) {
  const studentInfo = db.query("SELECT target_subject FROM students WHERE id = ?").get(studentId) as {
    target_subject?: string;
  } | null;
  const chosenSubject = subjectQuery || studentInfo?.target_subject || "Toán học";

  // Strictly lock to chosen subject - NEVER spill into other subjects that the student did not select
  let questions = db.query(
    "SELECT * FROM quiz_questions WHERE is_active = 1 AND subject = ? ORDER BY RANDOM()"
  ).all(chosenSubject) as Array<any>;

  if (questions.length === 0) {
    questions = db.query(
      "SELECT * FROM quiz_questions WHERE is_active = 1 ORDER BY RANDOM() LIMIT 1"
    ).all() as Array<any>;
  }

  const availableSubjects = (db.query(
    "SELECT DISTINCT subject FROM quiz_questions WHERE is_active = 1 ORDER BY subject ASC"
  ).all() as Array<{ subject: string }>).map((s) => s.subject);

  const formattedQuestions = questions.map((q) => ({
    id: q.id,
    block: q.block,
    subject: q.subject,
    source: q.source,
    bloom_level: q.bloom_level,
    time_limit_seconds: q.time_limit_seconds,
    question_text: q.question_text,
    correct_answer: q.correct_answer,
    micro_explanation: q.micro_explanation,
    growth_mindset_tip: q.growth_mindset_tip,
    options: JSON.parse(q.options || "{}")
  }));

  return {
    chosenSubject: chosenSubject || formattedQuestions[0]?.subject || "Toán học",
    availableSubjects,
    formattedQuestions
  };
}

export function recordQuizAttempt(studentId: string, block: string, answers: any[], correctCount: number, details: any[]) {
  const todayStr = new Date().toISOString().split("T")[0];
  const streakRow = db.query("SELECT consecutive_days FROM flower_status WHERE student_id = ?").get(studentId) as {
    consecutive_days?: number;
  } | null;
  const streakAtAttempt = streakRow?.consecutive_days ?? 1;
  const nowIso = new Date().toISOString();
  db.run(
    `INSERT INTO student_quiz_attempts (
      student_id, quiz_date, block, total_questions, correct_answers, details,
      streak_at_attempt, is_boss_unlocked, needs_teacher_support, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      studentId,
      todayStr,
      block || "A00",
      answers.length,
      correctCount,
      JSON.stringify(details),
      streakAtAttempt,
      correctCount === answers.length ? 1 : 0,
      correctCount <= 1 ? 1 : 0,
      nowIso
    ]
  );
}
