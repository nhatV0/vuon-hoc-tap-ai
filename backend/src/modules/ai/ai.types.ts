export interface RoadmapMilestone {
  stage: number;
  title: string;
  duration: string;
  goal: string;
  key_actions: string[];
}

export interface RoadmapDailyTask {
  id: number;
  title: string;
  duration_minutes: number;
  subject?: string;
  category: string;
  tip?: string;
}

export interface RoadmapResult {
  milestones: RoadmapMilestone[];
  initial_daily_tasks: RoadmapDailyTask[];
  encouraging_message: string;
}

export interface StudentInput {
  name: string;
  grade: string;
  target_subject?: string;
  target_subjects?: string[];
  emotion_scale?: number;
  weakness?: string;
  long_term_goal?: string;
  timeframe?: string;
  diagnostic_answers?: Record<string, string>;
}
