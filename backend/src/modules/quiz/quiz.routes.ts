import { Hono } from "hono";
import { db } from "@/db/client";
import { seedQuizQuestionsFromHocLieu } from "./quiz.seed";
import { TwinQuizRequestSchema } from "./quiz.twin.schemas";
import { synthesizeTwinQuestion } from "./quiz.twin.service";
import { authMiddleware, AuthUser } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";

export function createQuizRouter(): Hono {
  const router = new Hono();
  seedQuizQuestionsFromHocLieu();

  router.use("*", authMiddleware);

  const verifyStudentAccess = (c: any, targetStudentId: string): boolean => {
    const user = c.get("user") as AuthUser;
    if (user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) return true;
    return user.student_id === targetStudentId;
  };

  router.get("/daily/:studentId", (c) => {
    const studentId = c.req.param("studentId");
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền truy cập bài thi của người khác" }, 403);
    }
    const block = c.req.query("block") || "A00";

    const inv = db.query("SELECT * FROM streak_inventories WHERE student_id = ?").get(studentId) as {
      quiz_tickets: number;
      holy_water: number;
    } | null;

    const questions = db.query("SELECT * FROM quiz_questions WHERE is_active = 1 LIMIT 3").all() as Array<{
      id: string;
      block: string;
      subject: string;
      question_text: string;
      options: string;
      bloom_level: string;
      time_limit_seconds: number;
    }>;

    const formattedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options || "{}")
    }));

    return c.json({
      student_id: studentId,
      block,
      quiz_tickets: inv?.quiz_tickets ?? 1,
      holy_water: inv?.holy_water ?? 0,
      questions: formattedQuestions
    }, 200);
  });

  router.post("/start", async (c) => {
    const body = await c.req.json();
    const studentId = body.student_id;
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền bắt đầu phiên thi cho người khác" }, 403);
    }

    const inv = db.query("SELECT * FROM streak_inventories WHERE student_id = ?").get(studentId) as {
      quiz_tickets: number;
    } | null;

    if (!inv || inv.quiz_tickets <= 0) {
      return c.json({ detail: "Bạn đã hết vé làm bài trắc nghiệm hôm nay." }, 400);
    }

    db.run("UPDATE streak_inventories SET quiz_tickets = quiz_tickets - 1 WHERE student_id = ?", [studentId]);
    return c.json({ success: true, message: "Bắt đầu bài thi thành công", tickets_left: inv.quiz_tickets - 1 }, 200);
  });

  router.post("/submit", async (c) => {
    const body = await c.req.json();
    const { student_id, answers, block } = body;
    if (!verifyStudentAccess(c, student_id)) {
      return c.json({ detail: "Không có quyền nộp bài cho học sinh khác" }, 403);
    }

    let correctCount = 0;
    const details = [];

    for (const ans of (answers || [])) {
      const q = db.query("SELECT correct_answer, micro_explanation, growth_mindset_tip FROM quiz_questions WHERE id = ?").get(ans.question_id) as {
        correct_answer: string;
        micro_explanation: string;
        growth_mindset_tip: string;
      } | null;

      const isCorrect = q && q.correct_answer === ans.selected_answer;
      if (isCorrect) correctCount += 1;
      details.push({
        question_id: ans.question_id,
        selected_answer: ans.selected_answer,
        correct_answer: q?.correct_answer || "A",
        is_correct: Boolean(isCorrect),
        micro_explanation: q?.micro_explanation || "",
        growth_mindset_tip: q?.growth_mindset_tip || ""
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    db.run(
      "INSERT INTO student_quiz_attempts (student_id, quiz_date, block, total_questions, correct_answers, details) VALUES (?, ?, ?, ?, ?, ?)",
      [student_id, todayStr, block || "A00", (answers || []).length, correctCount, JSON.stringify(details)]
    );

    return c.json({
      total_questions: (answers || []).length,
      correct_answers: correctCount,
      details,
      feedback: correctCount === (answers || []).length
        ? "Xuất sắc! Bạn đã trả lời đúng toàn bộ câu hỏi phản xạ hôm nay!"
        : "Luyện tập rất tốt! Đọc kỹ giải thích vi mô để củng cố các câu còn phân vân nhé!"
    }, 200);
  });

  // Feature 1: Twin Quiz Synthesizer Endpoint
  router.post("/twin-challenge", async (c) => {
    try {
      const body = await c.req.json();
      const validated = TwinQuizRequestSchema.parse(body);
      if (!verifyStudentAccess(c, validated.student_id)) {
        return c.json({ detail: "Không có quyền tạo thử thách sinh đôi cho học sinh khác" }, 403);
      }
      const twinQuestion = await synthesizeTwinQuestion(
        validated.question_id,
        validated.selected_wrong_answer,
        validated.subject
      );
      return c.json(twinQuestion, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi sinh câu hỏi sinh đôi", error: String(err) }, 400);
    }
  });

  router.post("/exchange-holy-water", async (c) => {
    const body = await c.req.json();
    const studentId = body.student_id;
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền đổi nước thánh cho học sinh khác" }, 403);
    }

    const inv = db.query("SELECT * FROM streak_inventories WHERE student_id = ?").get(studentId) as {
      holy_water: number;
    } | null;

    if (!inv || inv.holy_water <= 0) {
      return c.json({ detail: "Bạn chưa có bình Nước Thánh để đổi vé." }, 400);
    }

    db.run("UPDATE streak_inventories SET holy_water = holy_water - 1, quiz_tickets = quiz_tickets + 5 WHERE student_id = ?", [studentId]);
    return c.json({ success: true, message: "Đã đổi thành công 1 Bình Nước Thánh lấy 5 Vé Quiz!", tickets: 5 }, 200);
  });

  router.get("/questions/grouped", (c) => {
    const questions = db.query("SELECT * FROM quiz_questions ORDER BY subject ASC").all() as Array<{
      id: string;
      block: string;
      subject: string;
      question_text: string;
      options: string;
      correct_answer: string;
      micro_explanation: string;
      bloom_level: string;
    }>;

    const grouped: Record<string, typeof questions> = {};
    for (const q of questions) {
      if (!grouped[q.subject]) grouped[q.subject] = [];
      grouped[q.subject].push({ ...q, options: JSON.parse(q.options || "{}") } as any);
    }

    const result = Object.entries(grouped).map(([subject, list]) => ({
      subject,
      total_questions: list.length,
      questions: list
    }));

    return c.json(result, 200);
  });

  return router;
}
