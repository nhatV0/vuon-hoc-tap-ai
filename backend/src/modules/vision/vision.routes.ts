import { Hono } from "hono";
import { VisionService } from "./vision.service";
import { VisionScratchpadSchema } from "./vision.schemas";
import { authMiddleware, AuthUser } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";

export function createVisionRouter(): Hono {
  const router = new Hono();
  const service = new VisionService();

  router.use("*", authMiddleware);

  const verifyStudentAccess = (c: any, targetStudentId: string): boolean => {
    const user = c.get("user") as AuthUser;
    if (user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) return true;
    return user.student_id === targetStudentId;
  };

  router.post("/analyze-scratchpad", async (c) => {
    try {
      const body = await c.req.json();
      const validated = VisionScratchpadSchema.parse(body);
      if (!verifyStudentAccess(c, validated.student_id)) {
        return c.json({ detail: "Không có quyền nội soi bài nháp của học sinh khác" }, 403);
      }
      const res = await service.analyzeScratchpad(
        validated.image_base64,
        validated.subject,
        validated.problem_description
      );
      return c.json(res, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi nội soi bài nháp", error: String(err) }, 400);
    }
  });

  return router;
}
