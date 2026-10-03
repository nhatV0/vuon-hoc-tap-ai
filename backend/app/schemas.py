from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from app.models import FlowerState, MoodType, UserRole

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
    question: str
    category: str # "level", "blocker", "pace", "style"
    options: List[DiagnosticOption]

# --- Onboarding Schemas ---
class StudentCreate(BaseModel):
    user_id: Optional[str] = None
    name: str = Field(..., description="Họ và tên học sinh")
    grade: str = Field(..., description="Khối lớp (10, 11, 12)")
    target_subject: str = Field(..., description="Môn học muốn cải thiện")
    weakness: str = Field(..., description="Điểm yếu hoặc phần kiến thức còn hổng")
    long_term_goal: str = Field(..., description="Mục tiêu lớn")
    timeframe: str = Field(..., description="Thời hạn")
    learning_style: Optional[str] = Field("visual", description="visual, auditory, reading, kinesthetic")
    daily_available_minutes: Optional[int] = Field(30, description="Số phút có thể học mỗi ngày")
    diagnostic_answers: Optional[Dict[str, str]] = Field(default_factory=dict, description="Các câu trả lời chẩn đoán chuyên sâu")

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
    category: Optional[str] = "Lý thuyết"
    tip: Optional[str] = None

class RoadmapResponse(BaseModel):
    milestones: List[MilestoneItem]
    initial_daily_tasks: List[DailyTaskItem]
    encouraging_message: str

class StudentResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    grade: str
    target_subject: str
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
    category: str = Field(default="Bài tập") # "Lý thuyết", "Bài tập", "Ôn luyện", "Nghỉ ngơi"
    tip: Optional[str] = None
    day_offset: int = Field(default=1, ge=1, le=7)

class PlannedTaskUpdate(BaseModel):
    title: Optional[str] = None
    duration_minutes: Optional[int] = None
    category: Optional[str] = None
    tip: Optional[str] = None
    is_completed: Optional[bool] = None

class PlannedTaskResponse(BaseModel):
    id: int
    student_id: str
    title: str
    duration_minutes: int
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
    long_term_goal: str
    total_tasks: int
    completed_tasks: int
    completion_percentage: int
    tasks_by_day: Dict[int, List[PlannedTaskResponse]]
    milestones: List[MilestoneItem]

# --- Check-in Schemas ---
class CheckinCreate(BaseModel):
    student_id: str
    completion_rate: int = Field(..., ge=0, le=100)
    subject_difficulty: Optional[str] = None
    action_reflection: Optional[str] = None
    mood: MoodType

class CheckinResponse(BaseModel):
    id: int
    student_id: str
    completion_rate: int
    subject_difficulty: Optional[str]
    action_reflection: Optional[str]
    mood: MoodType
    ai_feedback: str
    needs_attention: bool
    created_at: datetime
    streak_days: int
    flower_state: FlowerState
    water_drops: int

    model_config = ConfigDict(from_attributes=True)

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
    target_subject: str
    current_state: FlowerState
    consecutive_days: int
    days_since_last_checkin: int
    last_mood: Optional[MoodType]
    alert_reason: str
    severity: str
    needs_attention: bool
    latest_reflection: Optional[str] = None

class TeacherDashboardResponse(BaseModel):
    total_students: int
    alert_students_count: int
    healthy_students_count: int
    students_needing_attention: List[StudentAlertItem]
    all_students: List[StudentAlertItem]
