import { GardenStatus, Student, PlannedTask, StreakInventoryData } from "./types";

export const DEMO_STUDENT: Student = {
  id: "demo-student-01",
  name: "Mai Thảo Vy",
  grade: "10",
  target_subject: "Toán",
  weakness: "Hàm số bậc hai và vectơ tọa độ",
  long_term_goal: "Đạt 8+ điểm môn Toán và nuôi dưỡng thói quen tự học",
  timeframe: "Học kỳ 1",
  learning_style: "Trực quan",
  selected_flower: "sunflower",
  flower_state: "cham_hoc",
  created_at: new Date().toISOString(),
  roadmap: {
    milestones: [
      {
        stage: 1,
        title: "Củng cố nền tảng Hàm số bậc hai",
        duration: "Tuần 1-2",
        goal: "Nắm vững bảng biến thiên & đồ thị parabol",
        key_actions: ["Ôn lại tọa độ đỉnh", "Luyện 10 bài tập cơ bản", "Tóm tắt công thức"]
      },
      {
        stage: 2,
        title: "Chinh phục Tọa độ Vectơ",
        duration: "Tuần 3-4",
        goal: "Giải quyết bài toán tích vô hướng và độ dài",
        key_actions: ["Làm bài tập trắc nghiệm", "Vẽ hình minh họa", "Áp dụng định lý"]
      }
    ],
    initial_daily_tasks: [
      {
        id: 101,
        title: "Ôn lại 3 dạng bài tập Đồ thị Parabol",
        duration_minutes: 15,
        subject: "Toán",
        category: "Lý thuyết & Ví dụ",
        tip: "Chú ý dấu hệ số a khi xác định bề lõm"
      },
      {
        id: 102,
        title: "Giải 5 câu trắc nghiệm Tích vô hướng",
        duration_minutes: 20,
        subject: "Toán",
        category: "Thực hành",
        tip: "Nhớ công thức: u . v = |u||v|cos(u,v)"
      },
      {
        id: 103,
        title: "Đọc trước bài Phương trình đường thẳng",
        duration_minutes: 15,
        subject: "Toán",
        category: "Chuẩn bị bài mới",
        tip: "Xem kỹ vectơ pháp tuyến và vectơ chỉ phương"
      }
    ],
    encouraging_message: "Chúc Mai Thảo Vy có một hành trình học tập vui vẻ và kiên trì!"
  }
};

export const DEMO_GARDEN: GardenStatus = {
  student_id: "demo-student-01",
  student_name: "Mai Thảo Vy",
  selected_flower: "sunflower",
  current_state: "cham_hoc",
  consecutive_days: 7,
  water_drops: 120,
  last_checkin_date: new Date().toISOString(),
  story_message: "Hoa của Vy đang nở rộ rực rỡ và phát ra hào quang vàng ấm áp!",
  can_restore_streak: true,
  has_checked_in_today: true,
  unlocked_badges_count: 3,
  shields_available: 2,
  grace_passes_available: 1,
  saved_streak_before_break: 0
};

export const DEMO_TASKS: PlannedTask[] = [
  {
    id: 101,
    student_id: "demo-student-01",
    title: "Ôn lại 3 dạng bài tập Đồ thị Parabol",
    duration_minutes: 15,
    subject: "Toán",
    category: "Lý thuyết & Ví dụ",
    tip: "Chú ý dấu hệ số a khi xác định bề lõm",
    is_completed: false,
    day_offset: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 102,
    student_id: "demo-student-01",
    title: "Giải 5 câu trắc nghiệm Tích vô hướng",
    duration_minutes: 20,
    subject: "Toán",
    category: "Thực hành",
    tip: "Nhớ công thức: u . v = |u||v|cos(u,v)",
    is_completed: false,
    day_offset: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 103,
    student_id: "demo-student-01",
    title: "Đọc trước bài Phương trình đường thẳng",
    duration_minutes: 15,
    subject: "Toán",
    category: "Chuẩn bị bài mới",
    tip: "Xem kỹ vectơ pháp tuyến và vectơ chỉ phương",
    is_completed: false,
    day_offset: 1,
    created_at: new Date().toISOString()
  }
];

export const DEMO_INVENTORY: StreakInventoryData = {
  freeze_shields_available: 2,
  grace_passes_available: 1,
  restores_claimed_count: 0,
  saved_streak_before_break: 0,
  total_shields_used: 1,
  quiz_tickets: 5,
  holy_water: 3,
  conquest_streak: 7,
  holy_water_claimed_count: 1,
  quiz_stage_milestones_claimed: [7]
};
