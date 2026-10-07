import enum
from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Enum as SQLEnum, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"
class FlowerState(str, enum.Enum):
    CHAM_HOC = "cham_hoc"       # Streak >= 7 ngày, nở rực rỡ hào quang
    TICH_CUC = "tich_cuc"       # Hoàn thành task cao & mood tích cực
    THIEU_NUOC = "thieu_nuoc"   # Vắng mặt 3 - 7 ngày, héo nhẹ cần tưới nước
    HEO_KHO = "heo_kho"         # Vắng mặt >= 30 ngày, mùa đông gieo hạt mới

class MoodType(str, enum.Enum):
    HAPPY = "happy"           # Vui vẻ / Năng lượng cao
    NEUTRAL = "neutral"       # Bình thường
    STRESSED = "stressed"     # Căng thẳng / Áp lực
    TIRED = "tired"           # Mệt mỏi / Buồn ngủ

class BadgeCategory(str, enum.Enum):
    STREAK_MILESTONE = "streak_milestone"
    ACADEMIC_BEHAVIOR = "academic_behavior"
    RESILIENCE = "resilience"
    SPECIAL_EVENT = "special_event"

class CapsuleStatus(str, enum.Enum):
    SEALED = "sealed"
    UNLOCKED = "unlocked"
    READ = "read"
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    assigned_classes = Column(JSON, default=list, nullable=True) # Danh sách lớp được phân công phụ trách: ["12A1", "12A2"]
    assigned_subject = Column(String, default="Toán học", nullable=True) # Môn học chuyên trách được phân công (ví dụ: Toán học, Vật lí...)
    created_at = Column(DateTime, default=utcnow)
    # Quan hệ 1-1 với Student profile nếu role = student
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(String, primary_key=True, index=True) # e.g. "12A1"
    name = Column(String, nullable=False) # e.g. "Lớp 12A1"
    grade = Column(String, nullable=False) # "10", "11", "12"
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, unique=True)
    name = Column(String, nullable=False)
    grade = Column(String, nullable=False) # e.g. "10", "11", "12"
    classroom = Column(String, default="12A1", nullable=True) # Lớp học cụ thể (do Admin phân): "12A1", "12A2", ...
    target_subject = Column(String, nullable=False) # Môn chính (giữ backward compatibility)
    target_subjects = Column(JSON, nullable=True) # Danh sách nhiều môn học được chọn: ["Toán học", "Hóa học", ...]
    emotion_scale = Column(Integer, default=4, nullable=True) # Thang điểm cảm xúc 7 mức: 1 (Rất ghét/Rất tệ) -> 7 (Rất thích/Rất tốt)
    weakness = Column(Text, nullable=False)
    long_term_goal = Column(Text, nullable=False)
    timeframe = Column(String, nullable=False)
    learning_style = Column(String, nullable=True, default="visual")
    diagnostic_answers = Column(JSON, nullable=True) # Lưu trữ các câu trả lời chẩn đoán phân nhánh
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    roadmaps = relationship("Roadmap", back_populates="student", cascade="all, delete-orphan")
    checkins = relationship("DailyCheckin", back_populates="student", cascade="all, delete-orphan")
    flower_status = relationship("FlowerStatus", back_populates="student", uselist=False, cascade="all, delete-orphan")
    planned_tasks = relationship("PlannedTask", back_populates="student", cascade="all, delete-orphan")
    badges = relationship("StudentBadge", back_populates="student", cascade="all, delete-orphan")
    streak_inventory = relationship("StreakInventory", back_populates="student", uselist=False, cascade="all, delete-orphan")
    time_capsules = relationship("TimeCapsule", back_populates="student", cascade="all, delete-orphan")
    quiz_attempts = relationship("StudentQuizAttempt", back_populates="student", cascade="all, delete-orphan")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    milestones = Column(JSON, nullable=False) # List of 3 milestones
    initial_daily_tasks = Column(JSON, nullable=False) # List of 5 micro-tasks (5-10 min)
    encouraging_message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    student = relationship("Student", back_populates="roadmaps")

class PlannedTask(Base):
    __tablename__ = "planned_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=10, nullable=False)
    subject = Column(String, default="Toán học", nullable=True) # Môn học tương ứng
    category = Column(String, default="Lý thuyết", nullable=False) # "Lý thuyết", "Bài tập", "Ôn luyện", "Nghỉ ngơi"
    tip = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    day_offset = Column(Integer, default=1, nullable=False) # Ngày thứ mấy trong tuần
    created_at = Column(DateTime, default=utcnow)

    student = relationship("Student", back_populates="planned_tasks")

class DailyCheckin(Base):
    __tablename__ = "daily_checkins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False, index=True)
    completion_rate = Column(Integer, nullable=False) # 0 - 100%
    subject_difficulty = Column(String, nullable=True) # Câu hỏi khó khăn môn học
    action_reflection = Column(Text, nullable=True) # Điều làm tốt hoặc trở ngại
    mood = Column(SQLEnum(MoodType), nullable=False) # happy, neutral, stressed, tired
    emotion_scale = Column(Integer, default=4, nullable=True) # Thang đo cảm xúc 1 - 7
    energy_level = Column(Integer, default=70, nullable=False) # 15, 40, 70, 100
    confidence_stars = Column(Integer, default=3, nullable=False) # 1 - 5
    completed_subjects = Column(JSON, nullable=True) # e.g. ["Toán học", "Hóa học"]
    micro_wins = Column(JSON, nullable=True) # e.g. ["solve_problems", "fix_gap"]
    bottleneck_key = Column(String, default="none", nullable=True) # phone_distraction, hard_problem, fatigue, time_crunch, none
    weekday_answer = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=False) # Lời nhắn thấu cảm của AI Mentor
    needs_attention = Column(Boolean, default=False) # Đánh dấu nếu học sinh gặp áp lực liên tục
    created_at = Column(DateTime, default=utcnow, index=True)

    student = relationship("Student", back_populates="checkins")

class FlowerStatus(Base):
    __tablename__ = "flower_status"

    student_id = Column(String, ForeignKey("students.id"), primary_key=True)
    current_state = Column(SQLEnum(FlowerState), default=FlowerState.TICH_CUC, nullable=False)
    consecutive_days = Column(Integer, default=1, nullable=False) # Streak liên tục
    last_checkin_date = Column(Date, default=date.today, nullable=False)
    water_drops = Column(Integer, default=1, nullable=False) # Điểm tích lũy giọt nước
    story_message = Column(Text, nullable=True) # Câu chuyện chữa lành tương ứng

    student = relationship("Student", back_populates="flower_status")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(String, primary_key=True) # e.g. "pioneer_seed", "streak_3", "diamond_week"
    category = Column(SQLEnum(BadgeCategory), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String, nullable=False)
    required_streak = Column(Integer, default=0, nullable=False)

class StudentBadge(Base):
    __tablename__ = "student_badges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_id = Column(String, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    unlocked_at = Column(DateTime, default=utcnow, nullable=False)
    is_showcased = Column(Boolean, default=False, nullable=False)

    student = relationship("Student", back_populates="badges")
    badge = relationship("Badge")

class StreakInventory(Base):
    __tablename__ = "streak_inventories"

    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"), primary_key=True)
    freeze_shields_available = Column(Integer, default=1, nullable=False)
    grace_passes_available = Column(Integer, default=0, nullable=False)
    total_shields_used = Column(Integer, default=0, nullable=False)
    last_shield_used_at = Column(DateTime, nullable=True)

    student = relationship("Student", back_populates="streak_inventory", uselist=False)

class TimeCapsule(Base):
    __tablename__ = "time_capsules"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    author_type = Column(String, default="STUDENT", nullable=False) # "STUDENT" or "TEACHER"
    title = Column(String, nullable=False)
    letter_content = Column(Text, nullable=False)
    target_unlock_day = Column(Integer, default=21, nullable=False) # e.g. 21
    unlock_at_date = Column(Date, nullable=True)
    status = Column(SQLEnum(CapsuleStatus), default=CapsuleStatus.SEALED, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    unlocked_at = Column(DateTime, nullable=True)

    student = relationship("Student", back_populates="time_capsules")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(String, primary_key=True, index=True) # e.g. "A00-D1-Q1"
    block = Column(String, nullable=False, index=True) # A00, A01, B00, C00, D01
    subject = Column(String, nullable=False) # e.g. Toán học
    slot_type = Column(String, default="DYNAMIC_3", nullable=False) # REFLEX_1, TRAP_2, DYNAMIC_3, BOSS_30D, TEACHER_INJECTED
    source = Column(String, default="Ngân hàng chuẩn hóa GDPT 2018", nullable=False)
    bloom_level = Column(String, default="Thông hiểu", nullable=False) # Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao 8+
    lock_condition = Column(String, default="MOTUDO", nullable=False) # MOTUDO, YEUCAUSTREAK30NGAY
    time_limit_seconds = Column(Integer, default=60, nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False) # {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_answer = Column(String(5), nullable=False) # "A", "B", "C", "D"
    micro_explanation = Column(Text, nullable=False)
    growth_mindset_tip = Column(Text, nullable=True)
    creator_role = Column(String, default="SYSTEM", nullable=False) # SYSTEM or TEACHER
    creator_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

class StudentQuizAttempt(Base):
    __tablename__ = "student_quiz_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_date = Column(Date, default=date.today, nullable=False, index=True)
    block = Column(String, nullable=False) # A00, D01...
    total_questions = Column(Integer, default=3, nullable=False)
    correct_answers = Column(Integer, default=0, nullable=False)
    details = Column(JSON, default=list, nullable=False) # list of {question_id, selected_answer, is_correct, time_spent}
    streak_at_attempt = Column(Integer, default=0, nullable=False)
    is_boss_unlocked = Column(Boolean, default=False, nullable=False)
    needs_teacher_support = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    student = relationship("Student", back_populates="quiz_attempts")
