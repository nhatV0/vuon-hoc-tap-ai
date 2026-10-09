import { db } from "@/db/client";
import { CheckinCreateDto } from "./checkin.schemas";
import { callAiMentor } from "@/modules/ai/ai.service";
import { calculateFlowerState } from "@/modules/garden/garden.state-machine";
import { FlowerState } from "@/common/types";

export class CheckinService {
  submit(dto: CheckinCreateDto) {
    const student = db.query("SELECT * FROM students WHERE id = ?").get(dto.student_id) as { name: string } | null;
    if (!student) throw new Error("STUDENT_NOT_FOUND");

    const needsAttention = dto.mood === "stressed" || dto.energy_level <= 20 || dto.completion_rate <= 20 ? 1 : 0;
    const aiFeedback = callAiMentor(student.name, dto.mood, dto.energy_level, dto.subject_difficulty);

    db.run(
      `INSERT INTO daily_checkins (
        student_id, completion_rate, subject_difficulty, action_reflection, mood,
        emotion_scale, energy_level, confidence_stars, completed_subjects, micro_wins,
        bottleneck_key, weekday_answer, ai_feedback, needs_attention
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.student_id, dto.completion_rate, dto.subject_difficulty || "", dto.action_reflection || "",
        dto.mood, dto.emotion_scale ?? 4, dto.energy_level, dto.confidence_stars,
        JSON.stringify(dto.completed_subjects || []), JSON.stringify(dto.micro_wins || []),
        dto.bottleneck_key || "none", dto.weekday_answer || "", aiFeedback, needsAttention
      ]
    );

    // Update Flower status
    const flower = db.query("SELECT * FROM flower_status WHERE student_id = ?").get(dto.student_id) as {
      current_state: FlowerState;
      consecutive_days: number;
      last_checkin_date: string;
      water_drops: number;
    } | null;

    const todayStr = new Date().toISOString().split("T")[0];
    let newStreak = 1;
    let newState = FlowerState.TICH_CUC;
    let story = "Cây hoa vừa đón nhận giọt nước tinh khiết từ phiên check-in hôm nay!";

    if (flower) {
      const evalRes = calculateFlowerState(
        flower.current_state,
        flower.last_checkin_date,
        todayStr,
        flower.consecutive_days,
        dto.completion_rate,
        dto.mood
      );
      newStreak = evalRes.streak;
      newState = evalRes.state;
      story = evalRes.storyMessage;

      db.run(
        `UPDATE flower_status SET
           current_state = ?, consecutive_days = ?, last_checkin_date = ?, water_drops = water_drops + 1, story_message = ?
         WHERE student_id = ?`,
        [newState, newStreak, todayStr, story, dto.student_id]
      );
    } else {
      db.run(
        `INSERT INTO flower_status (student_id, current_state, consecutive_days, last_checkin_date, water_drops, story_message)
         VALUES (?, 'tich_cuc', 1, ?, 2, ?)`,
        [dto.student_id, todayStr, story]
      );
    }

    return {
      success: true,
      ai_feedback: aiFeedback,
      consecutive_days: newStreak,
      flower_state: newState,
      story_message: story,
      water_drops_earned: 1,
      needs_attention: Boolean(needsAttention)
    };
  }
}
