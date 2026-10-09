import { Hono } from "hono";
import { cors } from "hono/cors";
import { initDatabase } from "@/db/client";
import { auth } from "@/auth";
import { createAuthRouter } from "@/modules/auth/auth.routes";
import { createStudentRouter } from "@/modules/student/student.routes";
import { createOnboardingRouter } from "@/modules/onboarding/onboarding.routes";
import { createGardenRouter } from "@/modules/garden/garden.routes";
import { createCheckinRouter } from "@/modules/checkin/checkin.routes";
import { createPlanningRouter } from "@/modules/planning/planning.routes";
import { createQuizRouter } from "@/modules/quiz/quiz.routes";
import { createCapsuleBadgeRouter } from "@/modules/capsule/capsule.routes";
import { createTeacherRouter } from "@/modules/teacher/teacher.routes";
import { createDiagnosticsRouter } from "@/modules/diagnostics/diagnostics.routes";

initDatabase();

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

app.get("/", (c) => {
  return c.json({
    status: "healthy",
    message: "Hono Backend API - Sunflower Mentor & Emotional Garden",
    version: "2.0.0"
  });
});

// Mount specific domain routes before wildcard /api
app.route("/api/diagnostics", createDiagnosticsRouter());
app.route("/api/auth", createAuthRouter());
app.route("/api/student", createStudentRouter());
app.route("/api/onboarding", createOnboardingRouter());
app.route("/api/garden", createGardenRouter());
app.route("/api/checkin", createCheckinRouter());
app.route("/api/planning", createPlanningRouter());
app.route("/api/quiz", createQuizRouter());
app.route("/api/teacher", createTeacherRouter());
app.route("/api/admin", createTeacherRouter());
app.route("/api", createCapsuleBadgeRouter());

// Mount Better Auth handler for remaining auth endpoints
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

const port = Number(process.env.PORT) || 8000;
export default {
  port,
  fetch: app.fetch
};
