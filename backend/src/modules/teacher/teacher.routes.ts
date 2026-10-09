import { Hono } from "hono";
import { db } from "@/db/client";
import { generateId, hashPassword } from "@/common/utils";
import { authMiddleware, roleGuard } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";
import { z } from "zod";

const TeacherCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional().default("123456"),
  name: z.string().min(1),
  assigned_classes: z.array(z.string()).optional().default([]),
  assigned_subject: z.string().optional().default("Toán học")
});

export function createTeacherRouter(): Hono {
  const router = new Hono();

  // Protect all teacher endpoints with authentication
  router.use("*", authMiddleware);

  // Require TEACHER or ADMIN role for dashboard & overview
  router.get("/dashboard", roleGuard([UserRole.TEACHER, UserRole.ADMIN]), (c) => {
    const students = db.query("SELECT * FROM students").all() as Array<{
      id: string;
      name: string;
      grade: string;
      classroom: string;
      target_subject: string;
      emotion_scale: number;
    }>;

    const alerts = [];
    for (const st of students) {
      const flower = db.query("SELECT current_state, consecutive_days, last_checkin_date FROM flower_status WHERE student_id = ?").get(st.id) as {
        current_state: string;
        consecutive_days: number;
        last_checkin_date: string;
      } | null;

      const lastCheckin = db.query("SELECT mood, energy_level, needs_attention, ai_feedback FROM daily_checkins WHERE student_id = ? ORDER BY id DESC LIMIT 1").get(st.id) as {
        mood: string;
        energy_level: number;
        needs_attention: number;
        ai_feedback: string;
      } | null;

      const isHighRisk = (flower && flower.current_state === "thieu_nuoc") || (lastCheckin && lastCheckin.needs_attention === 1);

      if (isHighRisk) {
        alerts.push({
          student_id: st.id,
          student_name: st.name,
          grade: st.grade,
          classroom: st.classroom,
          subject: st.target_subject,
          reason: flower?.current_state === "thieu_nuoc" ? "Vắng mặt kéo dài, cây héo" : "Dấu hiệu quá tải cảm xúc",
          suggested_action: "Thầy cô nên nhắn tin hỏi thăm nhẹ nhàng, lắng nghe khó khăn trong học tập.",
          streak: flower?.consecutive_days || 0,
          mood: lastCheckin?.mood || "stressed"
        });
      }
    }

    const classes = db.query("SELECT id, name, grade FROM classrooms").all();

    return c.json({
      total_students: students.length,
      high_risk_count: alerts.length,
      alerts,
      classrooms: classes
    }, 200);
  });

  router.get("/overview", roleGuard([UserRole.TEACHER, UserRole.ADMIN]), (c) => {
    const studentCount = (db.query("SELECT COUNT(*) as c FROM students").get() as { c: number }).c;
    const teacherCount = (db.query("SELECT COUNT(*) as c FROM users WHERE role = 'teacher'").get() as { c: number }).c;
    const questionCount = (db.query("SELECT COUNT(*) as c FROM quiz_questions").get() as { c: number }).c;
    const classroomCount = (db.query("SELECT COUNT(*) as c FROM classrooms").get() as { c: number }).c;

    return c.json({
      total_students: studentCount,
      total_teachers: teacherCount,
      total_questions: questionCount,
      total_classrooms: classroomCount
    }, 200);
  });

  // Only ADMIN can create teacher accounts
  router.post("/teachers", roleGuard([UserRole.ADMIN]), async (c) => {
    try {
      const body = await c.req.json();
      const validated = TeacherCreateSchema.parse(body);
      const id = generateId("tea");
      db.run(
        "INSERT INTO users (id, email, password_hash, name, role, assigned_classes, assigned_subject) VALUES (?, ?, ?, ?, 'teacher', ?, ?)",
        [
          id,
          validated.email,
          hashPassword(validated.password),
          validated.name,
          JSON.stringify(validated.assigned_classes),
          validated.assigned_subject
        ]
      );
      const created = db.query("SELECT id, email, name, role, assigned_classes, assigned_subject, created_at FROM users WHERE id = ?").get(id);
      return c.json(created, 201);
    } catch (err) {
      return c.json({ detail: "Dữ liệu tạo giáo viên không hợp lệ", error: String(err) }, 400);
    }
  });

  return router;
}
