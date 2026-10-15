import { Hono, Context } from "hono";
import { SocraticService } from "./socratic.service";
import {
  SocraticChatSchema,
  DebateGenerateQuestionSchema,
  DebateEvaluateAnswerSchema
} from "./socratic.schemas";
import { authMiddleware, AuthUser } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";

export function createSocraticRouter(): Hono {
  const router = new Hono();
  const service = new SocraticService();
  // Public syllabus endpoint for instant curriculum navigation without strict auth blocking
  router.get("/syllabus", (c: Context) => {
    try {
      const subject = c.req.query("subject");
      const data = service.getSyllabus(subject);
      return c.json({ syllabus: data }, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi tải đề mục chương trình", error: String(err) }, 400);
    }
  });

  router.use("*", authMiddleware);

  const verifyStudentAccess = (c: Context, targetStudentId: string): boolean => {
    const user = c.get("user") as AuthUser;
    if (user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) return true;
    return user.student_id === targetStudentId;
  };
  router.post("/debate/generate-session", async (c: Context) => {
    try {
      const body = await c.req.json();
      const validated = DebateGenerateSessionSchema.parse(body);
      if (!verifyStudentAccess(c, validated.student_id)) {
        return c.json({ detail: "Không có quyền tạo phiên tranh luận cho học sinh khác" }, 403);
      }
      const questions = await service.generateDebateSession(validated);
      return c.json({ questions }, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi tạo danh sách câu hỏi tranh luận", error: String(err) }, 400);
    }
  });

  router.post("/debate/generate-question", async (c: Context) => {
    try {
      const body = await c.req.json();
      const validated = DebateGenerateQuestionSchema.parse(body);
      if (!verifyStudentAccess(c, validated.student_id)) {
        return c.json({ detail: "Không có quyền tạo câu hỏi tranh luận cho học sinh khác" }, 403);
      }
      const res = await service.generateDebateQuestion(validated);
      return c.json(res, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi tạo câu hỏi tranh luận", error: String(err) }, 400);
    }
  });

  router.post("/debate/evaluate-answer", async (c: Context) => {
    try {
      const body = await c.req.json();
      const validated = DebateEvaluateAnswerSchema.parse(body);
      if (!verifyStudentAccess(c, validated.student_id)) {
        return c.json({ detail: "Không có quyền nộp câu trả lời cho học sinh khác" }, 403);
      }
      const res = await service.evaluateStudentAnswer(validated);
      return c.json(res, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi kiểm tra câu trả lời tranh luận", error: String(err) }, 400);
    }
  });

  router.post("/chat", async (c: Context) => {
    try {
      const body = await c.req.json();
      const validated = SocraticChatSchema.parse(body);
      if (!verifyStudentAccess(c, validated.student_id)) {
        return c.json({ detail: "Không có quyền hội thoại cho học sinh khác" }, 403);
      }
      const res = await service.chat(validated);
      return c.json(res, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi tương tác gia sư tranh luận", error: String(err) }, 400);
    }
  });

  return router;
}
