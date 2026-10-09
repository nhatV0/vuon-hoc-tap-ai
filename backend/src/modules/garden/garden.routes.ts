import { Hono } from "hono";
import { GardenService } from "./garden.service";
import { GardenRepository } from "./garden.repository";
import { authMiddleware, AuthUser } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";
import { z } from "zod";

const PomodoroSchema = z.object({
  duration_minutes: z.number().int().min(1).max(180).default(25)
});

export function createGardenRouter(): Hono {
  const router = new Hono();
  const repo = new GardenRepository();
  const service = new GardenService(repo);

  router.use("*", authMiddleware);

  // Helper check for BOLA: only student owner or teacher/admin can access/mutate
  const verifyStudentAccess = (c: any, targetStudentId: string): boolean => {
    const user = c.get("user") as AuthUser;
    if (user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) {
      return true;
    }
    return user.student_id === targetStudentId;
  };

  router.get("/:studentId", (c) => {
    const studentId = c.req.param("studentId");
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền truy cập khu vườn này (BOLA Guard)" }, 403);
    }
    try {
      const res = service.getStatus(studentId);
      return c.json(res, 200);
    } catch (err) {
      return c.json({ detail: "Không tìm thấy học sinh", error: String(err) }, 404);
    }
  });

  router.post("/:studentId/water", (c) => {
    const studentId = c.req.param("studentId");
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền tưới nước cho cây của người khác" }, 403);
    }
    try {
      const res = service.water(studentId);
      return c.json(res, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi khi tưới cây", error: String(err) }, 400);
    }
  });

  router.post("/:studentId/restore-streak", (c) => {
    const studentId = c.req.param("studentId");
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền khôi phục chuỗi của người khác" }, 403);
    }
    try {
      const res = service.restoreStreak(studentId);
      return c.json(res, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi khi khôi phục chuỗi", error: String(err) }, 400);
    }
  });

  router.post("/:studentId/pomodoro-reward", async (c) => {
    const studentId = c.req.param("studentId");
    if (!verifyStudentAccess(c, studentId)) {
      return c.json({ detail: "Không có quyền nhận thưởng cho học sinh khác" }, 403);
    }
    try {
      const raw = await c.req.json().catch(() => ({}));
      const parsed = PomodoroSchema.parse(raw);
      const res = service.rewardPomodoro(studentId, parsed.duration_minutes);
      return c.json(res, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi dữ liệu tập trung Pomodoro", error: String(err) }, 400);
    }
  });

  return router;
}
