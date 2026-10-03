from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models import FlowerState, MoodType

# --- Onboarding Schemas ---
class StudentCreate(BaseModel):
    name: str = Field(..., description="Họ và tên học sinh", json_schema_extra={"example": "Nguyễn Văn An"})
    grade: str = Field(..., description="Khối lớp (10, 11, 12)", json_schema_extra={"example": "11"})
    target_subject: str = Field(..., description="Môn học muốn cải thiện", json_schema_extra={"example": "Toán học"})
    weakness: str = Field(..., description="Điểm yếu hoặc phần kiến thức còn hổng", json_schema_extra={"example": "Hình học không gian và phương pháp tọa độ"})
    long_term_goal: str = Field(..., description="Mục tiêu lớn", json_schema_extra={"example": "Đạt điểm 8.5+ học kỳ 1 và tự tin giải đề"})
    timeframe: str = Field(..., description="Thời hạn", json_schema_extra={"example": "3 tháng"})
    learning_style: Optional[str] = Field("visual", description="Phong cách học tập (visual, auditory, kinesthetic, reading)")

class MilestoneItem(BaseModel):
    stage: int = Field(..., description="Chặng 1, 2 hoặc 3")
    title: str = Field(..., description="Tên chặng")
    duration: str = Field(..., description="Thời gian dự kiến")
    goal: str = Field(..., description="Mục tiêu cốt lõi của chặng")
    key_actions: List[str] = Field(default_factory=list, description="Hành động cụ thể")

class DailyTaskItem(BaseModel):
    id: int = Field(..., description="Số thứ tự task (1-5)")
    title: str = Field(..., description="Tên nhiệm vụ ngắn")
    duration_minutes: int = Field(default=10, description="Thời gian thực hiện (5-10 phút)")
    tip: Optional[str] = Field(None, description="Gợi ý nhẹ nhàng")

class RoadmapResponse(BaseModel):
    milestones: List[MilestoneItem]
    initial_daily_tasks: List[DailyTaskItem]
    encouraging_message: str

class StudentResponse(BaseModel):
    id: str
    name: str
    grade: str
    target_subject: str
    weakness: str
    long_term_goal: str
    timeframe: str
    learning_style: Optional[str]
    created_at: datetime
    roadmap: Optional[RoadmapResponse] = None
    flower_state: Optional[FlowerState] = None

    model_config = ConfigDict(from_attributes=True)

# --- Check-in Schemas ---
class CheckinCreate(BaseModel):
    student_id: str
    completion_rate: int = Field(..., ge=0, le=100, description="Tỷ lệ hoàn thành nhiệm vụ (0-100%)")
    subject_difficulty: Optional[str] = Field(None, description="Khó khăn gặp phải ở môn học")
    action_reflection: Optional[str] = Field(None, description="Điều đã làm được hoặc trở ngại")
    mood: MoodType = Field(..., description="Tâm trạng: happy, neutral, stressed, tired")

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
    severity: str # "high" | "medium" | "low"
    needs_attention: bool
    latest_reflection: Optional[str] = None

class TeacherDashboardResponse(BaseModel):
    total_students: int
    alert_students_count: int
    healthy_students_count: int
    students_needing_attention: List[StudentAlertItem]
    all_students: List[StudentAlertItem]
