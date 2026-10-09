import { db } from "@/db/client";
import { FlowerState } from "@/common/types";

export interface FlowerStatusEntity {
  student_id: string;
  current_state: FlowerState;
  consecutive_days: number;
  last_checkin_date: string;
  water_drops: number;
  story_message: string;
}

export interface StreakInventoryEntity {
  student_id: string;
  freeze_shields_available: number;
  grace_passes_available: number;
  restores_claimed_count: number;
  saved_streak_before_break: number;
  total_shields_used: number;
  last_shield_used_at: string | null;
  last_restore_used_at: string | null;
  quiz_tickets: number;
  holy_water: number;
  conquest_streak: number;
  last_daily_ticket_date: string | null;
  holy_water_claimed_count: number;
  quiz_stage_milestones_claimed: string;
}

export class GardenRepository {
  getFlowerStatus(studentId: string): FlowerStatusEntity | null {
    return db.query("SELECT * FROM flower_status WHERE student_id = ?").get(studentId) as FlowerStatusEntity | null;
  }

  saveFlowerStatus(status: FlowerStatusEntity) {
    db.run(
      `INSERT INTO flower_status (student_id, current_state, consecutive_days, last_checkin_date, water_drops, story_message)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(student_id) DO UPDATE SET
         current_state = excluded.current_state,
         consecutive_days = excluded.consecutive_days,
         last_checkin_date = excluded.last_checkin_date,
         water_drops = excluded.water_drops,
         story_message = excluded.story_message`,
      [status.student_id, status.current_state, status.consecutive_days, status.last_checkin_date, status.water_drops, status.story_message]
    );
  }

  getInventory(studentId: string): StreakInventoryEntity | null {
    let inv = db.query("SELECT * FROM streak_inventories WHERE student_id = ?").get(studentId) as StreakInventoryEntity | null;
    if (!inv) {
      db.run(
        `INSERT INTO streak_inventories (student_id, freeze_shields_available, grace_passes_available, quiz_tickets, holy_water)
         VALUES (?, 1, 1, 1, 0)`,
        [studentId]
      );
      inv = db.query("SELECT * FROM streak_inventories WHERE student_id = ?").get(studentId) as StreakInventoryEntity | null;
    }
    return inv;
  }

  updateInventory(inv: StreakInventoryEntity) {
    db.run(
      `UPDATE streak_inventories SET
         freeze_shields_available = ?,
         grace_passes_available = ?,
         restores_claimed_count = ?,
         saved_streak_before_break = ?,
         total_shields_used = ?,
         last_shield_used_at = ?,
         last_restore_used_at = ?,
         quiz_tickets = ?,
         holy_water = ?,
         conquest_streak = ?,
         last_daily_ticket_date = ?,
         holy_water_claimed_count = ?,
         quiz_stage_milestones_claimed = ?
       WHERE student_id = ?`,
      [
        inv.freeze_shields_available, inv.grace_passes_available, inv.restores_claimed_count,
        inv.saved_streak_before_break, inv.total_shields_used, inv.last_shield_used_at,
        inv.last_restore_used_at, inv.quiz_tickets, inv.holy_water, inv.conquest_streak,
        inv.last_daily_ticket_date, inv.holy_water_claimed_count, inv.quiz_stage_milestones_claimed,
        inv.student_id
      ]
    );
  }
}
