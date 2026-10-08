from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models import FlowerState, MoodType, UserRole, BadgeCategory, CapsuleStatus

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=60, description="Họ và tên")
    email: str = Field(..., description="Email đăng nhập")
    password: str = Field(..., min_length=6, description="Mật khẩu tối thiểu 6 ký tự")
    role: UserRole = Field(default=UserRole.STUDENT, description="student hoặc teacher")

class UserLogin(BaseModel):
    email: str = Field(..., description="Email đăng nhập")
    password: str = Field(..., description="Mật khẩu")

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    assigned_classes: Optional[List[str]] = Field(default_factory=list)
    assigned_subject: Optional[str] = "Toán học"
    created_at: datetime
    student_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AuthTokenResponse(BaseModel):
    token: str
    user: UserResponse

# --- Dynamic Diagnostic Questions (Khảo sát cá nhân hóa sâu) ---
class DiagnosticOption(BaseModel):
    id: str
    label: str
    subtext: Optional[str] = None

class DiagnosticQuestion(BaseModel):
    id: str
    subject: Optional[str] = None
    question: str
    category: str # "level", "blocker", "pace", "style"
    options: List[DiagnosticOption]

# --- Onboarding Schemas ---
class StudentCreate(BaseModel):
    user_id: Optional[str] = None
    name: str = Field(..., min_length=2, max_length=50)
    grade: str = Field(..., description="Khối lớp: 10, 11, 12")
    classroom: Optional[str] = Field(default="12A1", description="Lớp học được phân công (ví dụ 12A1)")
    target_subject: Optional[str] = Field("Toán học", description="Môn học trọng tâm")
    target_subjects: Optional[List[str]] = Field(default_factory=list, description="Danh sách các môn học được chọn")
    emotion_scale: Optional[int] = Field(4, ge=1, le=7, description="Thang điểm cảm xúc môn học 1-7")
    weakness: str = Field(..., description="Khó khăn lớn nhất")
    long_term_goal: Optional[str] = Field(None, description="Mục tiêu dài hạn")
    timeframe: Optional[str] = Field("3 tháng", description="Quỹ thời gian chuẩn bị")
    learning_style: Optional[str] = Field("visual", description="Phong cách học tập")
    diagnostic_answers: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Các câu trả lời chẩn đoán")
    initial_time_capsule: Optional[str] = Field(None, description="Tâm thư gửi tương lai viết tại onboarding")
class MilestoneItem(BaseModel):
    stage: int
    title: str
    duration: str
    goal: str
    key_actions: List[str] = Field(default_factory=list)

class DailyTaskItem(BaseModel):
    id: int
    title: str
    duration_minutes: int = 10
    subject: Optional[str] = "Toán học"
    category: Optional[str] = "Lý thuyết"
    tip: Optional[str] = None

class RoadmapResponse(BaseModel):
    id: Optional[int] = None
    student_id: Optional[str] = None
    milestones: List[MilestoneItem]
    initial_daily_tasks: List[DailyTaskItem]
    encouraging_message: str

class StudentResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    grade: str
    classroom: Optional[str] = "12A1"
    target_subject: str
    target_subjects: Optional[List[str]] = None
    emotion_scale: Optional[int] = 4
    weakness: str
    long_term_goal: str
    timeframe: str
    learning_style: Optional[str] = None
    diagnostic_answers: Optional[Dict[str, Any]] = None
    created_at: datetime
    roadmap: Optional[RoadmapResponse] = None
    flower_state: Optional[FlowerState] = None

    model_config = ConfigDict(from_attributes=True)

# --- Planning Page Schemas (Kế hoạch hành động) ---
class PlannedTaskCreate(BaseModel):
    title: str = Field(..., min_length=2)
    duration_minutes: int = Field(default=10, ge=5, le=120)
    subject: Optional[str] = "Toán học"
    category: str = Field(default="Bài tập") # "Lý thuyết", "Bài tập", "Ôn luyện", "Nghỉ ngơi"
    tip: Optional[str] = None
    day_offset: int = Field(default=1, ge=1, le=7)

class PlannedTaskUpdate(BaseModel):
    title: Optional[str] = None
    duration_minutes: Optional[int] = None
    subject: Optional[str] = None
    category: Optional[str] = None
    tip: Optional[str] = None
    is_completed: Optional[bool] = None

class PlannedTaskResponse(BaseModel):
    id: int
    student_id: str
    title: str
    duration_minutes: int
    subject: Optional[str] = "Toán học"
    category: str
    tip: Optional[str]
    is_completed: bool
    day_offset: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PlanningOverviewResponse(BaseModel):
    student_id: str
    student_name: str
    target_subject: str
    target_subjects: List[str] = Field(default_factory=list)
    emotion_scale: int = 4
    long_term_goal: str
    total_tasks: int
    completed_tasks: int
    completion_percentage: int
    tasks_by_day: Dict[int, List[PlannedTaskResponse]]
    milestones: List[MilestoneItem]

# --- Check-in Schemas ---
class CheckinCreate(BaseModel):
    student_id: str
    completion_rate: Optional[int] = Field(75, ge=0, le=100)
    subject_difficulty: Optional[str] = "Không có khó khăn lớn"
    action_reflection: Optional[str] = ""
    mood: Optional[MoodType] = MoodType.HAPPY
    emotion_scale: Optional[int] = Field(5, ge=1, le=7, description="Thang đo cảm xúc 1-7 hôm nay")
    # Trạm 1:
    energy_level: Optional[int] = Field(70, description="15, 40, 70, 100")
    confidence_stars: Optional[int] = Field(3, ge=1, le=5, description="Độ tự tin 1 - 5 sao")
    # Trạm 2:
    completed_subjects: Optional[List[str]] = Field(default_factory=list, description="Danh sách môn đã học")
    micro_wins: Optional[List[str]] = Field(default_factory=list, description="Danh sách chiến thắng vi mô")
    # Trạm 3:
    bottleneck_key: Optional[str] = Field("none", description="Điểm nghẽn chính: phone_distraction, hard_problem, fatigue, time_crunch, none")
    weekday_answer: Optional[str] = Field(None, description="Câu trả lời cho câu hỏi xoay vòng theo thứ")
class CheckinResponse(BaseModel):
    id: int
    student_id: str
    completion_rate: int
    subject_difficulty: Optional[str] = None
    action_reflection: Optional[str] = None
    mood: MoodType
    emotion_scale: int
    energy_level: int = 70
    confidence_stars: int = 3
    completed_subjects: Optional[List[str]] = None
    micro_wins: Optional[List[str]] = None
    bottleneck_key: Optional[str] = "none"
    weekday_answer: Optional[str] = None
    ai_feedback: str
    needs_attention: bool
    created_at: datetime
    streak_days: int
    flower_state: FlowerState
    water_drops: int
    shield_used: bool = False
    shield_message: Optional[str] = None
    newly_unlocked_badges: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

# --- Gamification & Badges Schemas ---
class BadgeResponse(BaseModel):
    id: str
    category: str
    title: str
    description: str
    icon: str
    required_streak: int
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class StreakInventoryResponse(BaseModel):
    freeze_shields_available: int = 1
    grace_passes_available: int = 0
    total_shields_used: int = 0
    last_shield_used_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TimeCapsuleCreate(BaseModel):
    student_id: str
    title: str = "Tâm thư ngày đầu tiên gửi người vượt trọng lực"
    letter_content: str = Field(..., min_length=5, description="Nội dung lá thư gửi tương lai")
    target_unlock_day: Optional[int] = Field(21, description="Ngày mở khóa mục tiêu (mặc định 21)")

class TimeCapsuleResponse(BaseModel):
    id: str
    student_id: str
    author_type: str = "STUDENT"
    title: str
    letter_content: str
    target_unlock_day: int
    unlock_at_date: Optional[date] = None
    status: str
    created_at: datetime
    unlocked_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class MilestoneReward(BaseModel):
    day: int
    title: str
    reward_text: str
    quote: str
    is_reached: bool = False

# --- Garden Schemas ---
class GardenStatusResponse(BaseModel):
    student_id: str
    student_name: str
    current_state: FlowerState
    consecutive_days: int
    water_drops: int
    last_checkin_date: date
    story_message: str
    recent_moods: List[str] = Field(default_factory=list)
    completion_trend: List[int] = Field(default_factory=list)
    shields_available: int = 1
    grace_passes_available: int = 0
    unlocked_badges_count: int = 0
    badges: List[BadgeResponse] = Field(default_factory=list)
    active_capsule: Optional[TimeCapsuleResponse] = None
    journey_milestones: List[MilestoneReward] = Field(default_factory=list)
class WaterActionResponse(BaseModel):
    success: bool
    message: str
    new_state: FlowerState
    water_drops: int

# --- Teacher Dashboard Schemas ---
class StudentAlertItem(BaseModel):
    student_id: str
    student_name: str
    grade: str
    classroom: Optional[str] = "12A1"
    target_subject: str
    target_subjects: List[str] = Field(default_factory=list)
    emotion_scale: int = 4
    current_state: FlowerState
    consecutive_days: int
    days_since_last_checkin: int
    last_mood: Optional[MoodType]
    alert_reason: str
    severity: str
    needs_attention: bool
    latest_reflection: Optional[str] = None
    username: Optional[str] = None # Email / Tên tài khoản đăng nhập của học sinh
    initial_password: Optional[str] = None # Mật khẩu ban đầu hoặc mật khẩu được gán

class TeacherDashboardResponse(BaseModel):
    total_students: int
    alert_students_count: int
    healthy_students_count: int
    students_needing_attention: List[StudentAlertItem]
    all_students: List[StudentAlertItem]

# --- Micro-Quiz Schemas (plan-Quest.txt) ---
class QuizQuestionItem(BaseModel):
    id: str
    block: str
    subject: str
    slot_type: str
    source: str
    bloom_level: str
    lock_condition: str
    time_limit_seconds: int
    question_text: str
    options: Dict[str, str]
    growth_mindset_tip: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class QuizQuestionAdmin(QuizQuestionItem):
    correct_answer: str
    micro_explanation: str
    creator_role: str = "SYSTEM"
    creator_id: Optional[str] = None
    is_active: bool = True

class DailyQuizPackageResponse(BaseModel):
    student_id: str
    block: str
    streak_days: int
    is_boss_unlocked: bool
    has_attempted_today: bool
    questions: List[QuizQuestionItem]
    last_attempt: Optional[Dict[str, Any]] = None

class QuizAnswerItem(BaseModel):
    question_id: str
    selected_answer: str # A, B, C, D
    time_spent_seconds: int = 45

class QuizSubmissionCreate(BaseModel):
    student_id: str
    block: str
    answers: List[QuizAnswerItem]

class QuizAnswerResult(BaseModel):
    question_id: str
    selected_answer: str
    correct_answer: str
    is_correct: bool
    micro_explanation: str
    growth_mindset_tip: Optional[str] = None

class QuizSubmissionResponse(BaseModel):
    total_questions: int
    correct_answers: int
    score_percentage: float
    streak_days: int
    water_drop_earned: int
    results: List[QuizAnswerResult]
    ai_mentor_encouragement: str
    is_boss_conquered: bool
    routed_to_teacher: bool

class TeacherInjectQuizCreate(BaseModel):
    block: str # A00, A01, B00, C00, D01
    subject: str
    source: str
    bloom_level: str = "Vận dụng (Mức 8+)"
    lock_condition: str = "MOTUDO" # or YEUCAUSTREAK30NGAY
    time_limit_seconds: int = 90
    question_text: str
    options: Dict[str, str] # {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_answer: str
    micro_explanation: str
    growth_mindset_tip: Optional[str] = None
    teacher_id: Optional[str] = "GV_ADMIN"

class TeacherQuizStatsItem(BaseModel):
    question_id: str
    block: str
    subject: str
    question_text: str
    source: str
    total_attempts: int
    correct_rate: float
    wrong_count: int
class ClassroomCreateRequest(BaseModel):
    id: str = Field(..., min_length=2, max_length=20, description="Mã lớp (ví dụ: 12A4, 11B3...)")
    name: Optional[str] = Field(None, description="Tên lớp (ví dụ: Lớp 12A4)")
    grade: Optional[str] = Field("12", description="Khối lớp (10, 11, 12)")
    description: Optional[str] = Field(None, description="Mô tả lớp học")

class ClassroomItem(BaseModel):
    id: str
    name: str
    grade: str
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
# --- Admin Management Schemas (Quản Lý Admin & Phân Lớp) ---
class TeacherCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=60, description="Họ tên giáo viên")
    email: str = Field(..., description="Email/Tài khoản giáo viên")
    password: str = Field(default="123456", min_length=6, description="Mật khẩu khởi tạo")
    assigned_classes: List[str] = Field(default_factory=lambda: ["12A1"], description="Các lớp được phân công phụ trách")
    assigned_subject: str = Field(default="Toán học", description="Môn học chuyên trách được phân công (ví dụ: Toán học, Vật lí...)")

class TeacherUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    assigned_classes: Optional[List[str]] = None
    assigned_subject: Optional[str] = None
    password: Optional[str] = None

class StudentUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    grade: Optional[str] = None
    classroom: Optional[str] = None
    target_subject: Optional[str] = None
    target_subjects: Optional[List[str]] = None
    weakness: Optional[str] = None
    long_term_goal: Optional[str] = None
    timeframe: Optional[str] = None
    emotion_scale: Optional[int] = None
    learning_style: Optional[str] = None

class TeacherResponseItem(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    assigned_classes: List[str]
    assigned_subject: Optional[str] = "Toán học"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StudentAssignClassRequest(BaseModel):
    classroom: str = Field(..., description="Lớp phân bổ (ví dụ: 12A1, 12A2, 11B1...)")

class AdminStudentCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=60)
    grade: str = Field(default="12")
    classroom: str = Field(default="12A1")
    target_subject: str = Field(default="Toán học")
    target_subjects: List[str] = Field(default_factory=lambda: ["Toán học"])
    weakness: str = Field(default="Cần củng cố phương pháp giải nhanh")
    long_term_goal: str = Field(default="Đỗ trường Đại học mục tiêu")
    timeframe: str = Field(default="5 tháng")
    email: Optional[str] = None
    password: Optional[str] = "123456"

class AdminOverviewStats(BaseModel):
    total_teachers: int
    total_students: int
    total_classes: int
    classes_list: List[str]
    classrooms_details: List[ClassroomItem] = Field(default_factory=list)
    teachers: List[TeacherResponseItem]
    students: List[StudentAlertItem]
# --- Quiz Question Update & Management Schemas ---
class QuizQuestionUpdateRequest(BaseModel):
    subject: Optional[str] = None
    block: Optional[str] = None
    bloom_level: Optional[str] = None
    time_limit_seconds: Optional[int] = None
    source: Optional[str] = None
    question_text: Optional[str] = None
    options: Optional[Dict[str, str]] = None
    correct_answer: Optional[str] = None
    micro_explanation: Optional[str] = None
    growth_mindset_tip: Optional[str] = None
    is_active: Optional[bool] = None

class SubjectQuestionGroup(BaseModel):
    subject: str
    total_count: int
    questions: List[QuizQuestionAdmin]
