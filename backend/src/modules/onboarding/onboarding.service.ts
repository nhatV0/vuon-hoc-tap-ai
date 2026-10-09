import { db } from "@/db/client";
import { StudentRepository } from "@/modules/student/student.repository";
import { StudentCreateDto } from "@/modules/student/student.schemas";
import { callAiRoadmap } from "@/modules/ai/ai.service";
import { generateId } from "@/common/utils";

export class OnboardingService {
  constructor(private studentRepo: StudentRepository) {}

  onboard(dto: StudentCreateDto) {
    const studentId = generateId("hs");
    const targetSubjects = dto.target_subjects && dto.target_subjects.length > 0 
      ? dto.target_subjects 
      : [dto.target_subject];

    const student = this.studentRepo.create({
      id: studentId,
      user_id: dto.user_id || null,
      name: dto.name,
      grade: dto.grade,
      target_subject: dto.target_subject,
      target_subjects: JSON.stringify(targetSubjects),
      emotion_scale: dto.emotion_scale ?? 4,
      weakness: dto.weakness,
      long_term_goal: dto.long_term_goal,
      timeframe: dto.timeframe,
      learning_style: dto.learning_style || "visual",
      selected_flower: dto.selected_flower || "sunflower",
      diagnostic_answers: JSON.stringify(dto.diagnostic_answers || {})
    });

    const roadmapData = callAiRoadmap({
      name: dto.name,
      grade: dto.grade,
      target_subject: dto.target_subject,
      target_subjects: targetSubjects,
      emotion_scale: dto.emotion_scale,
      weakness: dto.weakness,
      long_term_goal: dto.long_term_goal,
      timeframe: dto.timeframe,
      diagnostic_answers: dto.diagnostic_answers
    });

    db.run(
      "INSERT INTO roadmaps (student_id, milestones, initial_daily_tasks, encouraging_message) VALUES (?, ?, ?, ?)",
      [
        studentId,
        JSON.stringify(roadmapData.milestones),
        JSON.stringify(roadmapData.initial_daily_tasks),
        roadmapData.encouraging_message
      ]
    );

    for (const task of roadmapData.initial_daily_tasks) {
      db.run(
        "INSERT INTO planned_tasks (student_id, title, duration_minutes, subject, category, tip, is_completed, day_offset) VALUES (?, ?, ?, ?, ?, ?, 0, ?)",
        [studentId, task.title, task.duration_minutes, task.subject || dto.target_subject, task.category, task.tip || "", task.id]
      );
    }

    const todayStr = new Date().toISOString().split("T")[0];
    db.run(
      "INSERT INTO flower_status (student_id, current_state, consecutive_days, last_checkin_date, water_drops, story_message) VALUES (?, 'tich_cuc', 1, ?, 1, ?)",
      [studentId, todayStr, "Mầm cây xanh vừa được gieo trồng trong khu vườn cảm xúc."]
    );

    db.run(
      "INSERT INTO streak_inventories (student_id, freeze_shields_available, grace_passes_available, quiz_tickets, holy_water) VALUES (?, 1, 1, 1, 0)",
      [studentId]
    );

    return {
      ...student,
      target_subjects: targetSubjects,
      diagnostic_answers: dto.diagnostic_answers,
      roadmap: roadmapData
    };
  }
}
