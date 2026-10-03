import uuid
from datetime import date, datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Student, Roadmap, DailyCheckin, FlowerStatus, FlowerState, MoodType
from app.schemas import (
    StudentCreate, StudentResponse, RoadmapResponse,
    CheckinCreate, CheckinResponse,
    GardenStatusResponse, WaterActionResponse,
    TeacherDashboardResponse, StudentAlertItem
)
from app.services.ai_service import call_ai_roadmap, call_ai_mentor
from app.services.garden_service import calculate_flower_state, evaluate_inactive_state, STORY_MESSAGES

router = APIRouter(prefix="/api", tags=["Sunflower Core API"])

# --- Phân hệ 1: Onboarding & Khảo sát cá nhân hóa ---
@router.post("/onboarding", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def onboard_student(data: StudentCreate, db: Session = Depends(get_db)):
    """
    Tiếp nhận khảo sát học sinh, sinh lộ trình qua AI Mentor, tạo chậu hoa ban đầu.
    """
    student_id = f"hs_{uuid.uuid4().hex[:8]}"
    
    # 1. Tạo Student Record
    student = Student(
        id=student_id,
        name=data.name,
        grade=data.grade,
        target_subject=data.target_subject,
        weakness=data.weakness,
        long_term_goal=data.long_term_goal,
        timeframe=data.timeframe,
        learning_style=data.learning_style or "visual"
    )
    db.add(student)
    db.flush()

    # 2. Sinh Lộ trình AI
    roadmap_data = await call_ai_roadmap(data)
    roadmap = Roadmap(
        student_id=student.id,
        milestones=[m.model_dump() for m in roadmap_data.milestones],
        initial_daily_tasks=[t.model_dump() for t in roadmap_data.initial_daily_tasks],
        encouraging_message=roadmap_data.encouraging_message
    )
    db.add(roadmap)

    # 3. Khởi tạo Chậu Hoa Cảm Xúc Ban Đầu (Mầm hoa tươi sáng)
    initial_flower = FlowerStatus(
        student_id=student.id,
        current_state=FlowerState.TICH_CUC,
        consecutive_days=1,
        last_checkin_date=date.today(),
        water_drops=3, # Tặng sẵn 3 giọt nước chào mừng
        story_message=STORY_MESSAGES[FlowerState.TICH_CUC]
    )
    db.add(initial_flower)
    db.commit()
    db.refresh(student)

    return StudentResponse(
        id=student.id,
        name=student.name,
        grade=student.grade,
        target_subject=student.target_subject,
        weakness=student.weakness,
        long_term_goal=student.long_term_goal,
        timeframe=student.timeframe,
        learning_style=student.learning_style,
        created_at=student.created_at,
        roadmap=roadmap_data,
        flower_state=initial_flower.current_state
    )

@router.get("/student/{student_id}", response_model=StudentResponse)
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")
    
    roadmap = db.query(Roadmap).filter(Roadmap.student_id == student_id).order_by(desc(Roadmap.created_at)).first()
    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()

    roadmap_resp = None
    if roadmap:
        roadmap_resp = RoadmapResponse(
            milestones=roadmap.milestones,
            initial_daily_tasks=roadmap.initial_daily_tasks,
            encouraging_message=roadmap.encouraging_message
        )

    return StudentResponse(
        id=student.id,
        name=student.name,
        grade=student.grade,
        target_subject=student.target_subject,
        weakness=student.weakness,
        long_term_goal=student.long_term_goal,
        timeframe=student.timeframe,
        learning_style=student.learning_style,
        created_at=student.created_at,
        roadmap=roadmap_resp,
        flower_state=flower.current_state if flower else None
    )

# --- Phân hệ 2 & 3: Daily Check-in & AI Feedback ---
@router.post("/checkin", response_model=CheckinResponse)
async def submit_daily_checkin(data: CheckinCreate, db: Session = Depends(get_db)):
    """
    Điểm danh hằng ngày, cập nhật trạng thái hoa và nhận lời nhắn nhủ thấu cảm.
    """
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    # 1. Gọi AI Mentor
    ai_feedback = await call_ai_mentor(data, student)

    # 2. Kiểm tra tín hiệu cảnh báo cho Teacher Dashboard
    recent_checkins = db.query(DailyCheckin)\
        .filter(DailyCheckin.student_id == data.student_id)\
        .order_by(desc(DailyCheckin.created_at))\
        .limit(2)\
        .all()
    
    # Nếu liên tiếp mệt mỏi/căng thẳng và hoàn thành thấp
    needs_attention = False
    if data.mood in [MoodType.STRESSED, MoodType.TIRED] and data.completion_rate < 50:
        if any(c.mood in [MoodType.STRESSED, MoodType.TIRED] for c in recent_checkins):
            needs_attention = True

    # 3. Lưu bản ghi Check-in
    checkin_record = DailyCheckin(
        student_id=data.student_id,
        completion_rate=data.completion_rate,
        subject_difficulty=data.subject_difficulty,
        action_reflection=data.action_reflection,
        mood=data.mood,
        ai_feedback=ai_feedback,
        needs_attention=needs_attention
    )
    db.add(checkin_record)

    # 4. Cập nhật trạng thái Hoa & Tích lũy giọt nước
    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == data.student_id).first()
    today = date.today()

    if not flower:
        flower = FlowerStatus(
            student_id=data.student_id,
            current_state=FlowerState.TICH_CUC,
            consecutive_days=1,
            last_checkin_date=today,
            water_drops=1,
            story_message=STORY_MESSAGES[FlowerState.TICH_CUC]
        )
        db.add(flower)
    else:
        new_state, new_consecutive, story = calculate_flower_state(
            current_state=flower.current_state,
            last_checkin_date=flower.last_checkin_date,
            checkin_date=today,
            consecutive_days=flower.consecutive_days,
            completion_rate=data.completion_rate,
            mood=data.mood
        )
        flower.current_state = new_state
        flower.consecutive_days = new_consecutive
        flower.last_checkin_date = today
        flower.water_drops += 1 # Thưởng 1 giọt nước
        flower.story_message = story

    db.commit()
    db.refresh(checkin_record)
    db.refresh(flower)

    return CheckinResponse(
        id=checkin_record.id,
        student_id=checkin_record.student_id,
        completion_rate=checkin_record.completion_rate,
        subject_difficulty=checkin_record.subject_difficulty,
        action_reflection=checkin_record.action_reflection,
        mood=checkin_record.mood,
        ai_feedback=checkin_record.ai_feedback,
        needs_attention=checkin_record.needs_attention,
        created_at=checkin_record.created_at,
        streak_days=flower.consecutive_days,
        flower_state=flower.current_state,
        water_drops=flower.water_drops
    )

# --- Phân hệ 4: Khu Vườn Cảm Xúc (Garden Status & Water action) ---
@router.get("/garden/{student_id}", response_model=GardenStatusResponse)
def get_garden_status(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()
    today = date.today()

    if not flower:
        flower = FlowerStatus(
            student_id=student_id,
            current_state=FlowerState.TICH_CUC,
            consecutive_days=1,
            last_checkin_date=today,
            water_drops=1,
            story_message=STORY_MESSAGES[FlowerState.TICH_CUC]
        )
        db.add(flower)
        db.commit()
        db.refresh(flower)
    else:
        # Kiểm tra xem có đang thiếu nước do nhiều ngày không vào không
        delta_days = (today - flower.last_checkin_date).days
        if delta_days >= 3 and flower.current_state not in [FlowerState.THIEU_NUOC, FlowerState.HEO_KHO]:
            new_state, story = evaluate_inactive_state(flower.last_checkin_date, today)
            flower.current_state = new_state
            flower.story_message = story
            db.commit()
            db.refresh(flower)

    # Lấy lịch sử 7 ngày gần nhất
    recent_checkins = db.query(DailyCheckin)\
        .filter(DailyCheckin.student_id == student_id)\
        .order_by(desc(DailyCheckin.created_at))\
        .limit(7)\
        .all()

    recent_moods = [c.mood.value for c in reversed(recent_checkins)]
    completion_trend = [c.completion_rate for c in reversed(recent_checkins)]

    return GardenStatusResponse(
        student_id=student.id,
        student_name=student.name,
        current_state=flower.current_state,
        consecutive_days=flower.consecutive_days,
        water_drops=flower.water_drops,
        last_checkin_date=flower.last_checkin_date,
        story_message=flower.story_message or STORY_MESSAGES[flower.current_state],
        recent_moods=recent_moods,
        completion_trend=completion_trend
    )

@router.post("/garden/{student_id}/water", response_model=WaterActionResponse)
def water_flower(student_id: str, db: Session = Depends(get_db)):
    """Hành động tưới nước thủ công khi có tích lũy giọt nước"""
    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()
    if not flower:
        raise HTTPException(status_code=404, detail="Không tìm thấy khu vườn")

    if flower.water_drops <= 0:
        return WaterActionResponse(
            success=False,
            message="Bạn đã hết giọt nước rồi! Hãy hoàn thành Check-in hằng ngày để nhận thêm giọt nước mát nhé!",
            new_state=flower.current_state,
            water_drops=flower.water_drops
        )

    flower.water_drops -= 1
    # Nếu cây đang thiếu nước, hồi phục ngay về TICH_CUC
    if flower.current_state == FlowerState.THIEU_NUOC:
        flower.current_state = FlowerState.TICH_CUC
        flower.story_message = "🌿 Nhờ giọt nước yêu thương của bạn, cành lá đã tươi tỉnh và vươn mình trở lại!"
    elif flower.current_state == FlowerState.HEO_KHO:
        flower.current_state = FlowerState.TICH_CUC
        flower.consecutive_days = 1
        flower.story_message = "🌱 Một mầm xanh non tơ đã nhú lên từ lòng đất ấm! Chúc mừng khởi đầu mới của bạn!"

    db.commit()
    db.refresh(flower)

    return WaterActionResponse(
        success=True,
        message="Đã tưới nước thành công! Bông hoa đang rạng rỡ đón nhận sự chăm sóc của bạn.",
        new_state=flower.current_state,
        water_drops=flower.water_drops
    )

# --- Phân hệ Teacher Dashboard: Giám sát & Hỗ trợ tâm lý học sinh ---
@router.get("/teacher/dashboard", response_model=TeacherDashboardResponse)
def get_teacher_dashboard(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    today = date.today()

    alert_items: List[StudentAlertItem] = []
    all_items: List[StudentAlertItem] = []

    for s in students:
        flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == s.id).first()
        latest_checkin = db.query(DailyCheckin)\
            .filter(DailyCheckin.student_id == s.id)\
            .order_by(desc(DailyCheckin.created_at))\
            .first()

        last_date = flower.last_checkin_date if flower else s.created_at.date()
        days_inactive = (today - last_date).days
        current_state = flower.current_state if flower else FlowerState.TICH_CUC
        consecutive_days = flower.consecutive_days if flower else 0

        # Đánh giá cảnh báo
        alert_reason = "Bình thường"
        severity = "low"
        needs_attention = False

        if days_inactive >= 7:
            alert_reason = f"Đã vắng mặt {days_inactive} ngày liên tục"
            severity = "high"
            needs_attention = True
        elif latest_checkin and latest_checkin.needs_attention:
            alert_reason = "Áp lực học tập kéo dài (Mood căng thẳng & tiến độ thấp)"
            severity = "high"
            needs_attention = True
        elif current_state == FlowerState.THIEU_NUOC:
            alert_reason = "Cây đang thiếu nước (chưa check-in 3-7 ngày)"
            severity = "medium"
            needs_attention = True
        elif latest_checkin and latest_checkin.mood in [MoodType.STRESSED, MoodType.TIRED]:
            alert_reason = "Tâm trạng gần đây mệt mỏi/căng thẳng"
            severity = "medium"

        item = StudentAlertItem(
            student_id=s.id,
            student_name=s.name,
            grade=s.grade,
            target_subject=s.target_subject,
            current_state=current_state,
            consecutive_days=consecutive_days,
            days_since_last_checkin=days_inactive,
            last_mood=latest_checkin.mood if latest_checkin else None,
            alert_reason=alert_reason,
            severity=severity,
            needs_attention=needs_attention,
            latest_reflection=latest_checkin.action_reflection if latest_checkin else None
        )

        all_items.append(item)
        if needs_attention or severity in ["high", "medium"]:
            alert_items.append(item)

    return TeacherDashboardResponse(
        total_students=len(students),
        alert_students_count=len(alert_items),
        healthy_students_count=len(students) - len(alert_items),
        students_needing_attention=alert_items,
        all_students=all_items
    )
