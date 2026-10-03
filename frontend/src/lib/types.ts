import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type FlowerState = "cham_hoc" | "tich_cuc" | "thieu_nuoc" | "heo_kho";
export type MoodType = "happy" | "neutral" | "stressed" | "tired";

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
  tip?: string;
}

export interface Roadmap {
  milestones: Milestone[];
  initial_daily_tasks: DailyTask[];
  encouraging_message: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  target_subject: string;
  weakness: string;
  long_term_goal: string;
  timeframe: string;
  learning_style?: string;
  created_at: string;
  roadmap?: Roadmap;
  flower_state?: FlowerState;
}

export interface GardenStatus {
  student_id: string;
  student_name: string;
  current_state: FlowerState;
  consecutive_days: number;
  water_drops: number;
  last_checkin_date: string;
  story_message: string;
  recent_moods: string[];
  completion_trend: number[];
}

export interface StudentAlertItem {
  student_id: string;
  student_name: string;
  grade: string;
  target_subject: string;
  current_state: FlowerState;
  consecutive_days: number;
  days_since_last_checkin: number;
  last_mood?: MoodType;
  alert_reason: string;
  severity: "high" | "medium" | "low";
  needs_attention: boolean;
  latest_reflection?: string;
}

export interface TeacherDashboardData {
  total_students: number;
  alert_students_count: number;
  healthy_students_count: number;
  students_needing_attention: StudentAlertItem[];
  all_students: StudentAlertItem[];
}
