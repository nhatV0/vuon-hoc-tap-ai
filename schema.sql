-- BẢNG DỮ LIỆU CHUẨN CLOUDFLARE D1 (SQLITE) DÀNH CHO DỰ ÁN KHU VƯỜN CẢM XÚC

-- 1. Bảng Tài Khoản Người Dùng (Users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    assigned_classes TEXT DEFAULT '[]',
    assigned_subject TEXT DEFAULT 'Toán học',
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 2. Bảng Lớp Học (Classrooms)
CREATE TABLE IF NOT EXISTS classrooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 3. Bảng Hồ Sơ Học Sinh (Students)
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    classroom TEXT DEFAULT '12A1',
    target_subject TEXT NOT NULL,
    target_subjects TEXT DEFAULT '["Toán học"]',
    emotion_scale INTEGER DEFAULT 4,
    weakness TEXT NOT NULL,
    long_term_goal TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    learning_style TEXT DEFAULT 'visual',
    selected_flower TEXT NOT NULL DEFAULT 'sunflower',
    diagnostic_answers TEXT DEFAULT '{}',
    initial_password TEXT DEFAULT '123456',
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 4. Bảng Lộ Trình Học Tập (Roadmaps)
CREATE TABLE IF NOT EXISTS roadmaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    milestones TEXT NOT NULL,
    initial_daily_tasks TEXT NOT NULL,
    encouraging_message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 5. Bảng Nhiệm Vụ Hằng Ngày Đã Lên Kế Hoạch (Planned Tasks)
CREATE TABLE IF NOT EXISTS planned_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 10,
    subject TEXT DEFAULT 'Toán học',
    category TEXT NOT NULL DEFAULT 'Lý thuyết',
    tip TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0,
    day_offset INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 6. Bảng Điểm Danh 4 Trạm Hằng Ngày (Daily Checkins)
CREATE TABLE IF NOT EXISTS daily_checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    completion_rate INTEGER NOT NULL,
    subject_difficulty TEXT,
    action_reflection TEXT,
    mood TEXT NOT NULL,
    emotion_scale INTEGER DEFAULT 4,
    energy_level INTEGER NOT NULL DEFAULT 70,
    confidence_stars INTEGER NOT NULL DEFAULT 3,
    completed_subjects TEXT DEFAULT '[]',
    micro_wins TEXT DEFAULT '[]',
    bottleneck_key TEXT DEFAULT 'none',
    weekday_answer TEXT,
    ai_feedback TEXT NOT NULL,
    needs_attention INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 7. Bảng Trạng Thái Chậu Hoa (Flower Status)
CREATE TABLE IF NOT EXISTS flower_status (
    student_id TEXT PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    current_state TEXT NOT NULL DEFAULT 'tich_cuc',
    consecutive_days INTEGER NOT NULL DEFAULT 0,
    last_checkin_date TEXT NOT NULL,
    water_drops INTEGER NOT NULL DEFAULT 1,
    story_message TEXT
);

-- 8. Bảng Danh Mục Huy Hiệu (Badges)
CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    required_streak INTEGER NOT NULL DEFAULT 0
);

-- 9. Bảng Huy Hiệu Đã Mở Khóa Của Học Sinh (Student Badges)
CREATE TABLE IF NOT EXISTS student_badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    is_showcased INTEGER NOT NULL DEFAULT 0
);

-- 10. Bảng Kho Đồ Chuỗi Kỷ Luật (Streak Inventories)
CREATE TABLE IF NOT EXISTS streak_inventories (
    student_id TEXT PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    freeze_shields_available INTEGER NOT NULL DEFAULT 1,
    grace_passes_available INTEGER NOT NULL DEFAULT 0,
    restores_claimed_count INTEGER NOT NULL DEFAULT 0,
    saved_streak_before_break INTEGER NOT NULL DEFAULT 0,
    total_shields_used INTEGER NOT NULL DEFAULT 0,
    last_shield_used_at TEXT,
    last_restore_used_at TEXT,
    quiz_tickets INTEGER NOT NULL DEFAULT 1,
    holy_water INTEGER NOT NULL DEFAULT 0,
    conquest_streak INTEGER NOT NULL DEFAULT 0,
    last_daily_ticket_date TEXT,
    holy_water_claimed_count INTEGER NOT NULL DEFAULT 0,
    quiz_stage_milestones_claimed TEXT DEFAULT '[]'
);

-- 11. Bảng Hộp Thư Thời Gian (Time Capsules)
CREATE TABLE IF NOT EXISTS time_capsules (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    author_type TEXT NOT NULL DEFAULT 'STUDENT',
    title TEXT NOT NULL,
    letter_content TEXT NOT NULL,
    target_unlock_day INTEGER NOT NULL DEFAULT 21,
    unlock_at_date TEXT,
    status TEXT NOT NULL DEFAULT 'sealed',
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    unlocked_at TEXT
);

-- 12. Bảng Ngân Hàng Câu Hỏi Quiz Vi Mô (Quiz Questions)
CREATE TABLE IF NOT EXISTS quiz_questions (
    id TEXT PRIMARY KEY,
    block TEXT NOT NULL,
    subject TEXT NOT NULL,
    slot_type TEXT NOT NULL DEFAULT 'DYNAMIC_3',
    source TEXT NOT NULL DEFAULT 'Ngân hàng chuẩn hóa GDPT 2018',
    bloom_level TEXT NOT NULL DEFAULT 'Thông hiểu',
    lock_condition TEXT NOT NULL DEFAULT 'MOTUDO',
    time_limit_seconds INTEGER NOT NULL DEFAULT 60,
    question_text TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    micro_explanation TEXT NOT NULL,
    growth_mindset_tip TEXT,
    creator_role TEXT NOT NULL DEFAULT 'SYSTEM',
    creator_id TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 13. Bảng Lịch Sử Làm Bài Quiz (Student Quiz Attempts)
CREATE TABLE IF NOT EXISTS student_quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    quiz_date TEXT NOT NULL,
    block TEXT NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 3,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    details TEXT NOT NULL DEFAULT '[]',
    streak_at_attempt INTEGER NOT NULL DEFAULT 0,
    is_boss_unlocked INTEGER NOT NULL DEFAULT 0,
    needs_teacher_support INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- TẠO DỮ LIỆU BAN ĐẦU (SEED DATA)
-- Tài khoản Quản Trị Viên (Admin) mặc định: admin / 123456
INSERT OR IGNORE INTO users (id, email, password_hash, name, role, assigned_classes, assigned_subject)
VALUES (
    'usr_admin_master',
    'admin@sunflower.edu.vn',
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', -- sha256 hash của 123456
    'Quản Trị Viên (Admin)',
    'admin',
    '["ALL"]',
    'ALL'
);

-- Danh sách lớp học chuẩn
INSERT OR IGNORE INTO classrooms (id, name, grade, description) VALUES
('10C1', 'Lớp 10C1', '10', 'Khối 10 định hướng năng khiếu'),
('11B1', 'Lớp 11B1', '11', 'Khối 11 chuyên sâu'),
('12A1', 'Lớp 12A1', '12', 'Khối 12 luyện thi đại học'),
('12A2', 'Lớp 12A2', '12', 'Khối 12 bứt phá mục tiêu');

-- Danh mục Huy hiệu chuẩn hóa
INSERT OR IGNORE INTO badges (id, category, title, description, icon, required_streak) VALUES
('stage_0_seed', 'streak_milestone', '🌰 Hạt Mầm Khởi Nguyên', '0 ngày - Bắt đầu hành trình', '🌰', 0),
('stage_3_sowing', 'streak_milestone', '🪴 Đất Ấm Gieo Mầm', '3 ngày - Hạt giống ấp ủ', '🪴', 3),
('stage_7_sprout', 'streak_milestone', '🌱 Mầm Xanh Vươn Lên', '7 ngày - Nảy mầm kiên định', '🌱', 7),
('stage_14_seedling', 'streak_milestone', '🌿 Cây Con Sức Sống', '14 ngày - Vững vàng vượt khó', '🌿', 14),
('stage_21_mature', 'streak_milestone', '🌻 Cây Lớn Rực Rỡ', '21 ngày - Thoát trọng lực trì hoãn', '🌻', 21);
