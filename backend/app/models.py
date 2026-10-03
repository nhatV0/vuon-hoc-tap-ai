import enum
from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Enum as SQLEnum, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

def utcnow():
    return datetime.now(timezone.utc)

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

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    grade = Column(String, nullable=False) # e.g. "10", "11", "12"
    target_subject = Column(String, nullable=False)
    weakness = Column(Text, nullable=False)
    long_term_goal = Column(Text, nullable=False)
    timeframe = Column(String, nullable=False)
    learning_style = Column(String, nullable=True, default="visual")
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    roadmaps = relationship("Roadmap", back_populates="student", cascade="all, delete-orphan")
    checkins = relationship("DailyCheckin", back_populates="student", cascade="all, delete-orphan")
    flower_status = relationship("FlowerStatus", back_populates="student", uselist=False, cascade="all, delete-orphan")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    milestones = Column(JSON, nullable=False) # List of 3 milestones
    initial_daily_tasks = Column(JSON, nullable=False) # List of 5 micro-tasks (5-10 min)
    encouraging_message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    student = relationship("Student", back_populates="roadmaps")

class DailyCheckin(Base):
    __tablename__ = "daily_checkins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False, index=True)
    completion_rate = Column(Integer, nullable=False) # 0 - 100%
    subject_difficulty = Column(String, nullable=True) # Câu hỏi khó khăn môn học
    action_reflection = Column(Text, nullable=True) # Điều làm tốt hoặc trở ngại
    mood = Column(SQLEnum(MoodType), nullable=False) # happy, neutral, stressed, tired
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
