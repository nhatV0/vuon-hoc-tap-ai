import { Hono } from "hono";
import { CheckinService } from "./checkin.service";
import { CheckinCreateSchema } from "./checkin.schemas";
import { authMiddleware, AuthUser } from "@/middleware/auth.middleware";
import { UserRole } from "@/common/types";

export function createCheckinRouter(): Hono {
  const router = new Hono();
  const service = new CheckinService();

  router.use("*", authMiddleware);

  router.post("/", async (c) => {
    try {
      const user = c.get("user") as AuthUser;
      const body = await c.req.json();
      const dto = CheckinCreateSchema.parse(body);

      // Business Logic / BOLA Guard: Student can only check in for their own student_id
      if (user.role === UserRole.STUDENT && user.student_id !== dto.student_id) {
        return c.json({ detail: "Không có quyền điểm danh hộ tài khoản khác" }, 403);
      }

      const res = service.submit(dto);
      return c.json(res, 200);
    } catch (err) {
      return c.json({ detail: "Điểm danh cảm xúc thất bại", error: String(err) }, 400);
    }
  });

  return router;
}
