import { Hono } from "hono";
import { db } from "@/db/client";
import { authMiddleware, roleGuard } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";
import { z } from "zod";

const StudentUpdateSchema = z.object({
  classroom: z.string().optional(),
  grade: z.string().optional(),
  target_subject: z.string().optional(),
  weakness: z.string().optional(),
  long_term_goal: z.string().optional()
});

export function createAdminStudentRouter(): Hono {
  const router = new Hono();
  router.use("*", authMiddleware);
  router.use("*", roleGuard([UserRole.TEACHER, UserRole.ADMIN]));

  // List students with full management details
  router.get("/", (c) => {
    const list = db.query(`
      SELECT 
        s.id,
        s.name,
        s.grade,
        s.classroom,
        s.target_subject,
        s.weakness,
        s.long_term_goal,
        s.selected_flower,
        s.created_at,
        u.email,
        COALESCE(f.current_state, 'tich_cuc') as flower_state,
        COALESCE(f.consecutive_days, 1) as streak,
        COALESCE(f.water_drops, 1) as water_drops,
        (SELECT COUNT(*) FROM daily_checkins WHERE student_id = s.id) as total_checkins,
        (SELECT COUNT(*) FROM student_debate_attempts WHERE student_id = s.id) as total_debates
      FROM students s
      LEFT JOIN users u ON u.id = s.user_id
      LEFT JOIN flower_status f ON f.student_id = s.id
      ORDER BY s.created_at DESC
    `).all();
    return c.json(list, 200);
  });

  // Update student academic information
  router.put("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const body = await c.req.json();
      const val = StudentUpdateSchema.parse(body);
      const updates: string[] = [];
      const params: Array<string | number> = [];
      if (val.classroom !== undefined) { updates.push("classroom = ?"); params.push(val.classroom); }
      if (val.grade !== undefined) { updates.push("grade = ?"); params.push(val.grade); }
      if (val.target_subject !== undefined) { updates.push("target_subject = ?"); params.push(val.target_subject); }
      if (val.weakness !== undefined) { updates.push("weakness = ?"); params.push(val.weakness); }
      if (val.long_term_goal !== undefined) { updates.push("long_term_goal = ?"); params.push(val.long_term_goal); }

      if (updates.length > 0) {
        params.push(id);
        db.run(`UPDATE students SET ${updates.join(", ")} WHERE id = ?`, params);
      }

      const updated = db.query("SELECT * FROM students WHERE id = ?").get(id);
      return c.json(updated, 200);
    } catch (err) {
      return c.json({ detail: "Dữ liệu cập nhật không hợp lệ", error: String(err) }, 400);
    }
  });

  // Admin/Teacher can restore/refresh water drops for student
  router.post("/:id/care-boost", (c) => {
    const id = c.req.param("id");
    const existing = db.query("SELECT id FROM students WHERE id = ?").get(id);
    if (!existing) return c.json({ detail: "Không tìm thấy học sinh" }, 404);

    db.run(
      "UPDATE flower_status SET current_state = 'tich_cuc', water_drops = water_drops + 3 WHERE student_id = ?",
      [id]
    );
    return c.json({ success: true, message: "Đã tưới nước và gửi năng lượng tích cực cho học sinh!" }, 200);
  });

  return router;
}
