import { Hono } from "hono";
import { db } from "@/db/client";
import { z } from "zod";
import { authMiddleware, roleGuard, AuthUser } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";

const QuestionReportCreateSchema = z.object({
  question_id: z.string().min(1),
  question_type: z.enum(["mcq", "essay"]).default("mcq"),
  subject: z.string().min(1),
  question_text: z.string().min(1),
  issue_type: z.string().min(1),
  reason: z.string().min(1),
  reporter_id: z.string().optional()
});

export function createQuestionReportRouter(): Hono {
  const router = new Hono();

  // Create report (public or authenticated)
  router.post("/", async (c) => {
    try {
      const body = await c.req.json();
      const val = QuestionReportCreateSchema.parse(body);

      db.run(
        `INSERT INTO question_reports (
          question_id, question_type, subject, question_text, issue_type, reason, reporter_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          val.question_id,
          val.question_type,
          val.subject,
          val.question_text,
          val.issue_type,
          val.reason,
          val.reporter_id || "anonymous_user"
        ]
      );

      return c.json({ success: true, message: "Đã ghi nhận báo cáo câu hỏi để trợ lý AI rút kinh nghiệm!" }, 201);
    } catch (err) {
      return c.json({ detail: "Dữ liệu báo cáo không hợp lệ", error: String(err) }, 400);
    }
  });

  // Get active question reports for a subject (used by AI prompt to avoid flawed patterns)
  router.get("/flaws/:subject", (c) => {
    const subject = c.req.param("subject");
    const reports = db.query(
      "SELECT question_text, issue_type, reason FROM question_reports WHERE subject = ? AND status = 'pending' ORDER BY id DESC LIMIT 10"
    ).all(subject);
    return c.json(reports, 200);
  });

  // Teacher/Admin view all reports
  router.get("/all", authMiddleware, roleGuard([UserRole.TEACHER, UserRole.ADMIN]), (c) => {
    const reports = db.query(
      "SELECT * FROM question_reports ORDER BY created_at DESC LIMIT 100"
    ).all();
    return c.json(reports, 200);
  });

  return router;
}
