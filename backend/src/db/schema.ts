export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    assigned_classes TEXT DEFAULT '[]',
    assigned_subject TEXT DEFAULT 'Toán học',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Better Auth required standard tables
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    role TEXT DEFAULT 'student',
    assigned_classes TEXT DEFAULT '[]',
    assigned_subject TEXT DEFAULT 'Toán học'
  );

  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresAt TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt TEXT,
    refreshTokenExpiresAt TEXT,
    scope TEXT,
    password TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS classrooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

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
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS roadmaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    milestones TEXT NOT NULL,
    initial_daily_tasks TEXT NOT NULL,
    encouraging_message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

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
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

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
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS flower_status (
    student_id TEXT PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    current_state TEXT NOT NULL DEFAULT 'tich_cuc',
    consecutive_days INTEGER NOT NULL DEFAULT 1,
    last_checkin_date TEXT NOT NULL,
    water_drops INTEGER NOT NULL DEFAULT 1,
    story_message TEXT
  );

  CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    required_streak INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS student_badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_showcased INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS streak_inventories (
    student_id TEXT PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    freeze_shields_available INTEGER NOT NULL DEFAULT 1,
    grace_passes_available INTEGER NOT NULL DEFAULT 1,
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

  CREATE TABLE IF NOT EXISTS time_capsules (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    author_type TEXT NOT NULL DEFAULT 'STUDENT',
    title TEXT NOT NULL,
    letter_content TEXT NOT NULL,
    target_unlock_day INTEGER NOT NULL DEFAULT 21,
    unlock_at_date TEXT,
    status TEXT NOT NULL DEFAULT 'sealed',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unlocked_at TEXT
  );

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
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

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
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;
