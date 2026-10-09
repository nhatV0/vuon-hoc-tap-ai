import { Hono } from "hono";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { authMiddleware } from "@/middleware/auth.middleware";

export function createAuthRouter(): Hono {
  const router = new Hono();
  const repo = new AuthRepository();
  const service = new AuthService(repo);
  const controller = new AuthController(service);

  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.get("/me", authMiddleware, controller.me);

  return router;
}
