export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type FlowerState = "cham_hoc" | "tich_cuc" | "thieu_nuoc" | "heo_kho";
export type MoodType = "happy" | "neutral" | "stressed" | "tired";
export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assigned_classes?: string[];
  assigned_subject?: string;
  created_at: string;
  student_id?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DiagnosticOption {
  id: string;
  label: string;
  subtext?: string;
}

export interface DiagnosticQuestion {
  id: string;
  subject?: string;
  question: string;
  category: string;
  options: DiagnosticOption[];
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
  subject?: string;
  duration_minutes: number;
  category?: string;
  tip?: string;
}

export interface Roadmap {
  milestones: Milestone[];
  initial_daily_tasks: DailyTask[];
  encouraging_message: string;
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
  created_at: string;
}

export interface PlanningOverview {
  student_id: string;
  student_name: string;
  target_subject: string;
  target_subjects?: string[];
  emotion_scale?: number;
  long_term_goal: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  tasks_by_day: Record<number, PlannedTask[]>;
  milestones: Milestone[];
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
  diagnostic_answers?: Record<string, string>;
  created_at: string;
  roadmap?: Roadmap;
  flower_state?: FlowerState;
}

export interface BadgeItem {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  required_streak: number;
  unlocked: boolean;
  unlocked_at?: string | null;
}

export interface TimeCapsuleItem {
  id: string;
  student_id: string;
  author_type: string;
  title: string;
  letter_content: string;
  target_unlock_day: number;
  unlock_at_date?: string | null;
  status: "sealed" | "unlocked" | "read";
  created_at: string;
  unlocked_at?: string | null;
}

export interface MilestoneRewardItem {
  day: number;
  title: string;
  reward_text: string;
  quote: string;
  is_reached: boolean;
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
  shields_available?: number;
  grace_passes_available?: number;
  saved_streak_before_break?: number;
  can_restore_streak?: boolean;
  unlocked_badges_count?: number;
  badges?: BadgeItem[];
  active_capsule?: TimeCapsuleItem | null;
  journey_milestones?: MilestoneRewardItem[];
}

export interface StudentAlertItem {
  student_id: string;
  student_name: string;
  grade: string;
  classroom?: string;
  target_subject: string;
  target_subjects?: string[];
  emotion_scale?: number;
  current_state: FlowerState;
  consecutive_days: number;
  days_since_last_checkin: number;
  last_mood?: MoodType;
  alert_reason: string;
  severity: "high" | "medium" | "low";
  needs_attention: boolean;
  latest_reflection?: string;
  username?: string;
  initial_password?: string;
}
export interface TeacherDashboardData {
  total_students: number;
  alert_students_count: number;
  healthy_students_count: number;
  students_needing_attention: StudentAlertItem[];
  all_students: StudentAlertItem[];
}

// --- Daily Micro-Quiz Types (plan-Quest.txt) ---
export interface QuizQuestionItem {
  id: string;
  block: string;
  subject: string;
  slot_type: "REFLEX_1" | "TRAP_2" | "DYNAMIC_3" | "BOSS_30D" | "TEACHER_INJECTED" | string;
  source: string;
  bloom_level: string;
  lock_condition: "MOTUDO" | "YEUCAUSTREAK30NGAY" | string;
  time_limit_seconds: number;
  question_text: string;
  options: Record<string, string>;
  growth_mindset_tip?: string | null;
  correct_answer?: string;
  micro_explanation?: string;
  creator_role?: string;
  creator_id?: string | null;
  is_active?: boolean;
}

export interface QuizQuestionAdmin extends QuizQuestionItem {
  correct_answer: string;
  micro_explanation: string;
  creator_role: string;
  creator_id?: string | null;
  is_active: boolean;
}

export interface SubjectQuestionGroup {
  subject: string;
  total_count: number;
  questions: QuizQuestionAdmin[];
}

export interface DailyQuizPackage {
  student_id: string;
  block: string;
  streak_days: number;
  is_boss_unlocked: boolean;
  has_attempted_today: boolean;
  questions: QuizQuestionItem[];
  last_attempt?: {
    correct_answers: number;
    total_questions: number;
    is_boss_unlocked: boolean;
    details?: Array<{
      question_id: string;
      subject: string;
      slot_type: string;
      selected_answer: string;
      correct_answer: string;
      is_correct: boolean;
    }>;
  } | null;
}

export interface QuizAnswerResult {
  question_id: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  micro_explanation: string;
  growth_mindset_tip?: string | null;
}

export interface QuizSubmissionResponse {
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  streak_days: number;
  water_drop_earned: number;
  results: QuizAnswerResult[];
  ai_mentor_encouragement: string;
  is_boss_conquered: boolean;
  routed_to_teacher: boolean;
}

export interface TeacherQuizStatsItem {
  question_id: string;
  block: string;
  subject: string;
  question_text: string;
  source: string;
  total_attempts: number;
  correct_rate: number;
  wrong_count: number;
}
// --- Admin Management Types ---
export interface ClassroomItem {
  id: string;
  name: string;
  grade: string;
  description?: string;
  created_at: string;
}

export interface TeacherItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assigned_classes: string[];
  assigned_subject?: string;
  created_at: string;
}

export interface AdminOverviewData {
  total_teachers: number;
  total_students: number;
  total_classes: number;
  classes_list: string[];
  classrooms_details?: ClassroomItem[];
  teachers: TeacherItem[];
  students: StudentAlertItem[];
}
