import { Hono } from "hono";
import { db } from "@/db/client";
import { authMiddleware, AuthUser } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";
import { z } from "zod";

const TaskCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  duration_minutes: z.number().int().min(1).max(180).default(10),
  subject: z.string().trim().min(1).max(50).default("Toán học"),
  category: z.string().trim().min(1).max(50).default("Lý thuyết"),
  tip: z.string().max(300).optional().default(""),
  day_offset: z.number().int().min(1).max(365).default(1)
});

const TaskUpdateSchema = z.object({
  is_completed: z.boolean()
});

export function createPlanningRouter(): Hono {
  const router = new Hono();
  router.use("*", authMiddleware);

  const verifyStudentAccess = (c: any, targetStudentId: string): boolean => {
    const user = c.get("user") as AuthUser;
    if (user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) return true;
    return user.student_id === targetStudentId;
  };

  router.get("/:studentId", (c) => {
    const studentId = c.req.param("studentId");
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền xem kế hoạch học tập của học sinh khác" }, 403);
    }

    const student = db.query("SELECT * FROM students WHERE id = ?").get(studentId) as {
      name: string;
      target_subject: string;
      target_subjects: string;
      emotion_scale: number;
      long_term_goal: string;
    } | null;

    if (!student) return c.json({ detail: "Không tìm thấy học sinh" }, 404);

    const tasks = db.query("SELECT * FROM planned_tasks WHERE student_id = ? ORDER BY day_offset ASC, id ASC").all(studentId) as Array<{
      id: number;
      student_id: string;
      title: string;
      duration_minutes: number;
      subject: string;
      category: string;
      tip: string;
      is_completed: number;
      day_offset: number;
      created_at: string;
    }>;

    const roadmap = db.query("SELECT milestones FROM roadmaps WHERE student_id = ?").get(studentId) as { milestones: string } | null;
    let milestones = [];
    try {
      if (roadmap?.milestones) milestones = JSON.parse(roadmap.milestones);
    } catch {}

    const tasksByDay: Record<number, typeof tasks> = {};
    let completedCount = 0;
    for (const task of tasks) {
      if (task.is_completed) completedCount += 1;
      if (!tasksByDay[task.day_offset]) tasksByDay[task.day_offset] = [];
      tasksByDay[task.day_offset].push({ ...task, is_completed: Boolean(task.is_completed) } as any);
    }

    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return c.json({
      student_id: studentId,
      student_name: student.name,
      target_subject: student.target_subject,
      target_subjects: JSON.parse(student.target_subjects || "[]"),
      emotion_scale: student.emotion_scale,
      long_term_goal: student.long_term_goal,
      total_tasks: total,
      completed_tasks: completedCount,
      completion_percentage: percentage,
      tasks_by_day: tasksByDay,
      milestones
    }, 200);
  });

  router.post("/:studentId/task", async (c) => {
    const studentId = c.req.param("studentId");
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền thêm nhiệm vụ cho học sinh khác" }, 403);
    }

    try {
      const body = await c.req.json();
      const validated = TaskCreateSchema.parse(body);
      const result = db.run(
        "INSERT INTO planned_tasks (student_id, title, duration_minutes, subject, category, tip, is_completed, day_offset) VALUES (?, ?, ?, ?, ?, ?, 0, ?)",
        [studentId, validated.title, validated.duration_minutes, validated.subject, validated.category, validated.tip, validated.day_offset]
      );
      const newTask = db.query("SELECT * FROM planned_tasks WHERE id = ?").get(result.lastInsertRowid);
      return c.json(newTask, 201);
    } catch (err) {
      return c.json({ detail: "Dữ liệu nhiệm vụ không hợp lệ", error: String(err) }, 400);
    }
  });

  router.put("/task/:taskId", async (c) => {
    const taskId = c.req.param("taskId");
    const existing = db.query("SELECT student_id FROM planned_tasks WHERE id = ?").get(taskId) as { student_id: string } | null;
    if (!existing) return c.json({ detail: "Không tìm thấy nhiệm vụ" }, 404);
    if (!verifyStudentAccess(c, existing.student_id)) {
      return c.json({ detail: "Không có quyền cập nhật nhiệm vụ của người khác" }, 403);
    }

    try {
      const body = await c.req.json();
      const validated = TaskUpdateSchema.parse(body);
      db.run("UPDATE planned_tasks SET is_completed = ? WHERE id = ?", [validated.is_completed ? 1 : 0, taskId]);
      const updated = db.query("SELECT * FROM planned_tasks WHERE id = ?").get(taskId);
      return c.json(updated, 200);
    } catch (err) {
      return c.json({ detail: "Dữ liệu cập nhật không hợp lệ", error: String(err) }, 400);
    }
  });

  router.delete("/task/:taskId", (c) => {
    const taskId = c.req.param("taskId");
    const existing = db.query("SELECT student_id FROM planned_tasks WHERE id = ?").get(taskId) as { student_id: string } | null;
    if (!existing) return c.json({ detail: "Không tìm thấy nhiệm vụ" }, 404);
    if (!verifyStudentAccess(c, existing.student_id)) {
      return c.json({ detail: "Không có quyền xóa nhiệm vụ của người khác" }, 403);
    }

    db.run("DELETE FROM planned_tasks WHERE id = ?", [taskId]);
    return c.json({ success: true, message: "Đã xóa nhiệm vụ" }, 200);
  });

  return router;
}
