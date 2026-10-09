import { Hono } from "hono";
import { SocraticService } from "./socratic.service";
import { SocraticChatSchema } from "./socratic.schemas";
import { authMiddleware, AuthUser } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";

export function createSocraticRouter(): Hono {
  const router = new Hono();
  const service = new SocraticService();

  router.use("*", authMiddleware);

  const verifyStudentAccess = (c: any, targetStudentId: string): boolean => {
    const user = c.get("user") as AuthUser;
    if (user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) return true;
    return user.student_id === targetStudentId;
  };

  router.post("/chat", async (c) => {
    try {
      const body = await c.req.json();
      const validated = SocraticChatSchema.parse(body);
      if (!verifyStudentAccess(c, validated.student_id)) {
        return c.json({ detail: "Không có quyền hội thoại cho học sinh khác" }, 403);
      }
      const res = await service.chat(validated);
      return c.json(res, 200);
    } catch (err) {
      return c.json({ detail: "Lỗi tương tác gia sư Socratic", error: String(err) }, 400);
    }
  });

  return router;
}
