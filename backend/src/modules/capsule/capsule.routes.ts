import { Hono } from "hono";
import { db } from "@/db/client";
import { generateId } from "@/common/utils";
import { authMiddleware, AuthUser } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";
import { z } from "zod";

const CapsuleCreateSchema = z.object({
  student_id: z.string().min(1),
  author_type: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
  title: z.string().trim().min(1).max(150),
  letter_content: z.string().trim().min(1).max(5000),
  target_unlock_day: z.number().int().min(1).max(365).default(21)
});

export function createCapsuleBadgeRouter(): Hono {
  const router = new Hono();
  router.use("*", authMiddleware);

  const verifyStudentAccess = (c: any, targetStudentId: string): boolean => {
    const user = c.get("user") as AuthUser;
    if (user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) return true;
    return user.student_id === targetStudentId;
  };

  // Capsules
  router.get("/capsule/:studentId", (c) => {
    const studentId = c.req.param("studentId");
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền xem hộp thư thời gian của người khác" }, 403);
    }
    const list = db.query("SELECT * FROM time_capsules WHERE student_id = ? ORDER BY created_at DESC").all(studentId);
    return c.json(list, 200);
  });

  router.post("/capsule", async (c) => {
    try {
      const body = await c.req.json();
      const validated = CapsuleCreateSchema.parse(body);
      if (!verifyStudentAccess(c, validated.student_id)) {
        return c.json({ detail: "Không có quyền gửi thư cho học sinh khác" }, 403);
      }
      const id = generateId("cap");
      db.run(
        "INSERT INTO time_capsules (id, student_id, author_type, title, letter_content, target_unlock_day, status) VALUES (?, ?, ?, ?, ?, ?, 'sealed')",
        [id, validated.student_id, validated.author_type, validated.title, validated.letter_content, validated.target_unlock_day]
      );
      const created = db.query("SELECT * FROM time_capsules WHERE id = ?").get(id);
      return c.json(created, 201);
    } catch (err) {
      return c.json({ detail: "Dữ liệu hộp thư không hợp lệ", error: String(err) }, 400);
    }
  });

  router.post("/capsule/:id/unlock", (c) => {
    const id = c.req.param("id");
    const capsule = db.query("SELECT student_id, target_unlock_day FROM time_capsules WHERE id = ?").get(id) as {
      student_id: string;
      target_unlock_day: number;
    } | null;

    if (!capsule) return c.json({ detail: "Không tìm thấy hộp thư" }, 404);
    if (!verifyStudentAccess(c, capsule.student_id)) {
      return c.json({ detail: "Không có quyền mở hộp thư của người khác" }, 403);
    }

    // Business Logic: Check streak requirement before unlocking
    const flower = db.query("SELECT consecutive_days FROM flower_status WHERE student_id = ?").get(capsule.student_id) as { consecutive_days: number } | null;
    const currentStreak = flower?.consecutive_days || 0;
    if (currentStreak < capsule.target_unlock_day) {
      return c.json({
        detail: `Hộp thư vẫn đang niêm phong! Cần đạt chuỗi ${capsule.target_unlock_day} ngày (hiện tại: ${currentStreak} ngày).`
      }, 400);
    }

    db.run("UPDATE time_capsules SET status = 'unlocked', unlocked_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
    const updated = db.query("SELECT * FROM time_capsules WHERE id = ?").get(id);
    return c.json(updated, 200);
  });

  // Badges
  router.get("/badges/:studentId", (c) => {
    const studentId = c.req.param("studentId");
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền xem huy hiệu của người khác" }, 403);
    }
    const flower = db.query("SELECT consecutive_days FROM flower_status WHERE student_id = ?").get(studentId) as { consecutive_days: number } | null;
    const streak = flower?.consecutive_days || 1;

    const badges = [
      { id: "pioneer_seed", category: "resilience", title: "Hạt Mầm Tiên Phong", description: "Bắt đầu hành trình chăm sóc bản thân", icon: "sprout", required_streak: 1, unlocked: true },
      { id: "streak_3", category: "streak_milestone", title: "Mầm Xanh Vươn Cao", description: "Duy trì thói quen 3 ngày liên tục", icon: "leaf", required_streak: 3, unlocked: streak >= 3 },
      { id: "streak_7", category: "streak_milestone", title: "Hoa Hướng Dương Rực Rỡ", description: "Hoàn thành chuỗi 7 ngày nở rộ", icon: "sun", required_streak: 7, unlocked: streak >= 7 },
      { id: "streak_21", category: "streak_milestone", title: "Khu Vườn Bền Bỉ", description: "Chinh phục 21 ngày hình thành thói quen", icon: "award", required_streak: 21, unlocked: streak >= 21 }
    ];

    return c.json(badges, 200);
  });

  router.get("/inventory/:studentId", (c) => {
    const studentId = c.req.param("studentId");
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền xem kho đồ của người khác" }, 403);
    }
    const inv = db.query("SELECT * FROM streak_inventories WHERE student_id = ?").get(studentId);
    return c.json(inv || { freeze_shields_available: 1, grace_passes_available: 1, quiz_tickets: 1, holy_water: 0 }, 200);
  });

  return router;
}
