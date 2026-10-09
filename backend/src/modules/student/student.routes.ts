import { Hono } from "hono";
import { StudentRepository } from "./student.repository";
import { db } from "@/db/client";

export function createStudentRouter(): Hono {
  const router = new Hono();
  const repo = new StudentRepository();

  router.get("/:id", (c) => {
    const id = c.req.param("id");
    const student = repo.findById(id);
    if (!student) {
      return c.json({ detail: "Không tìm thấy học sinh" }, 404);
    }
    const roadmap = db.query("SELECT * FROM roadmaps WHERE student_id = ?").get(id) as {
      milestones: string;
      initial_daily_tasks: string;
      encouraging_message: string;
    } | null;

    let parsedMilestones = [];
    let parsedDailyTasks = [];
    try {
      if (roadmap?.milestones) parsedMilestones = JSON.parse(roadmap.milestones);
      if (roadmap?.initial_daily_tasks) parsedDailyTasks = JSON.parse(roadmap.initial_daily_tasks);
    } catch {}

    const flower = db.query("SELECT current_state FROM flower_status WHERE student_id = ?").get(id) as { current_state: string } | null;

    return c.json({
      ...student,
      target_subjects: JSON.parse(student.target_subjects || "[]"),
      diagnostic_answers: JSON.parse(student.diagnostic_answers || "{}"),
      roadmap: roadmap ? {
        milestones: parsedMilestones,
        initial_daily_tasks: parsedDailyTasks,
        encouraging_message: roadmap.encouraging_message
      } : undefined,
      flower_state: flower?.current_state || "tich_cuc"
    }, 200);
  });

  return router;
}
