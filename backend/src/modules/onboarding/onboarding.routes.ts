import { Hono } from "hono";
import { OnboardingService } from "./onboarding.service";
import { StudentRepository } from "@/modules/student/student.repository";
import { StudentCreateSchema } from "@/modules/student/student.schemas";

export function createOnboardingRouter(): Hono {
  const router = new Hono();
  const repo = new StudentRepository();
  const service = new OnboardingService(repo);

  router.post("/", async (c) => {
    try {
      const body = await c.req.json();
      const dto = StudentCreateSchema.parse(body);
      const res = service.onboard(dto);
      return c.json(res, 201);
    } catch (err) {
      return c.json({ detail: "Khởi tạo lộ trình thất bại", error: String(err) }, 400);
    }
  });

  return router;
}
