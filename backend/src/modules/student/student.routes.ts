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

  // Leaderboard (Bảng phong thần)
  router.get("/leaderboard/top", (c) => {
    const topStudents = db.query(`
      SELECT 
        s.id as student_id,
        s.name,
        s.grade,
        s.classroom,
        s.target_subject,
        s.selected_flower,
        COALESCE(f.consecutive_days, 1) as streak,
        COALESCE(f.water_drops, 1) as water_drops,
        COALESCE(inv.holy_water, 0) as holy_water,
        (SELECT COUNT(*) FROM daily_checkins WHERE student_id = s.id) as total_checkins,
        (SELECT COUNT(*) FROM student_quiz_attempts WHERE student_id = s.id AND correct_answers > 0) as quiz_wins
      FROM students s
      LEFT JOIN flower_status f ON f.student_id = s.id
      LEFT JOIN streak_inventories inv ON inv.student_id = s.id
      ORDER BY streak DESC, water_drops DESC, total_checkins DESC
      LIMIT 20
    `).all();

    return c.json(topStudents, 200);
  });

  return router;
}
