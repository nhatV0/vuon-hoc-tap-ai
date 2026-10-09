export type UserRole = "student" | "teacher" | "admin";
export type FlowerState = "cham_hoc" | "tich_cuc" | "thieu_nuoc" | "heo_kho";
export type MoodType = "happy" | "neutral" | "stressed" | "tired";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assigned_classes?: string[];
  assigned_subject?: string;
  student_id?: string | null;
}

export interface Milestone {
  stage: number;
  title: string;
  duration: string;
  goal: string;
  key_actions: string[];
}

export interface DailyTask {
  id: number;
  title: string;
  duration_minutes: number;
  subject?: string;
  category: string;
  tip?: string;
}

export interface Roadmap {
  milestones: Milestone[];
  initial_daily_tasks: DailyTask[];
  encouraging_message: string;
}

export interface Student {
  id: string;
  user_id?: string | null;
  name: string;
  grade: string;
  target_subject: string;
  target_subjects?: string[];
  emotion_scale?: number;
  weakness: string;
  long_term_goal: string;
  timeframe: string;
  learning_style?: string;
  selected_flower?: string;
  diagnostic_answers?: Record<string, string>;
  roadmap?: Roadmap;
  flower_state?: FlowerState;
}

export interface PlannedTask {
  id: number;
  student_id: string;
  title: string;
  duration_minutes: number;
  subject?: string;
  category: string;
  tip?: string;
  is_completed: boolean;
  day_offset: number;
}

export interface GardenStatus {
  current_state: FlowerState;
  consecutive_days: number;
  last_checkin_date: string;
  water_drops: number;
  story_message: string;
  freeze_shields_available?: number;
  grace_passes_available?: number;
  quiz_tickets?: number;
  holy_water?: number;
}

export interface StreakInventoryData {
  freeze_shields_available: number;
  grace_passes_available: number;
  quiz_tickets: number;
  holy_water: number;
}

export interface TimeCapsuleItem {
  id: string;
  student_id: string;
  author_type: string;
  title: string;
  letter_content: string;
  target_unlock_day: number;
  status: "sealed" | "unlocked" | "read";
  created_at: string;
}
