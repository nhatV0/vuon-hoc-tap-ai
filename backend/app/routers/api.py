import uuid
from datetime import date, datetime
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import (
    User, UserRole, Student, Roadmap, DailyCheckin, FlowerStatus,
    FlowerState, MoodType, PlannedTask
)
from app.schemas import (
    UserRegister, UserLogin, UserResponse, AuthTokenResponse,
    DiagnosticQuestion, DiagnosticOption,
    StudentCreate, StudentResponse, RoadmapResponse,
    PlannedTaskCreate, PlannedTaskUpdate, PlannedTaskResponse, PlanningOverviewResponse,
    CheckinCreate, CheckinResponse,
    GardenStatusResponse, WaterActionResponse,
    TeacherDashboardResponse, StudentAlertItem
)
from app.auth import hash_password, verify_password, generate_session_token
from app.services.ai_service import call_ai_roadmap, call_ai_mentor
from app.services.garden_service import calculate_flower_state, evaluate_inactive_state, STORY_MESSAGES

router = APIRouter(prefix="/api", tags=["Sunflower API"])

# --- 1. HỆ THỐNG XÁC THỰC (AUTH: REGISTER / LOGIN / CURRENT USER) ---
@router.post("/auth/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email này đã được sử dụng")

    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    new_user = User(
        id=user_id,
        email=data.email.strip().lower(),
        name=data.name.strip(),
        password_hash=hash_password(data.password),
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = generate_session_token(new_user.id)
    return AuthTokenResponse(
        token=token,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            role=new_user.role,
            created_at=new_user.created_at,
            student_id=None
        )
    )

@router.post("/auth/login", response_model=AuthTokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.strip().lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không chính xác")

    student_id = None
    if user.student_profile:
        student_id = user.student_profile.id

    token = generate_session_token(user.id)
    return AuthTokenResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            created_at=user.created_at,
            student_id=student_id
        )
    )

@router.get("/auth/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Chưa đăng nhập")

    token = authorization.split(" ")[1]
    user_id = token.split(":")[0] if ":" in token else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Không tìm thấy người dùng")

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        created_at=user.created_at,
        student_id=user.student_profile.id if user.student_profile else None
    )

# --- 2. HỆ THỐNG CÂU HỎI CHẨN ĐOÁN CÁ NHÂN HÓA (DIAGNOSTIC QUESTION BANK) ---
@router.get("/diagnostics/{subject}", response_model=List[DiagnosticQuestion])
def get_diagnostic_questions(subject: str, grade: str = "10"):
    """
    Trả về bộ câu hỏi chẩn đoán phân nhánh được cá nhân hóa cao theo từng môn học.
    """
    subject_normalized = subject.strip().lower()

    if "toán" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="math_blocker",
                subject="Toán học",
                question="Khi giải bài toán mới, bạn thường dừng lại lâu nhất ở khâu nào?",
                category="blocker",
                options=[
                    DiagnosticOption(id="read_misunderstand", label="Đọc đề bài chưa hình dung được hướng làm", subtext="Khó chuyển từ ngôn ngữ đề bài sang biểu thức toán"),
                    DiagnosticOption(id="formula_forget", label="Quên công thức hoặc nhầm lẫn dấu", subtext="Nhớ mang máng nhưng tính toán dễ sai số"),
                    DiagnosticOption(id="complex_transform", label="Kẹt ở bước biến đổi đại số/hình học phức tạp", subtext="Biết hướng đi nhưng thiếu kỹ thuật xử lý bước rút gọn"),
                    DiagnosticOption(id="time_limit", label="Hiểu cách làm nhưng làm quá chậm khi bấm giờ", subtext="Cần phản xạ nhanh hơn trong phòng thi")
                ]
            ),
            DiagnosticQuestion(
                id="math_focus_area",
                subject="Toán học",
                question="Phần kiến thức nào khiến bạn cảm thấy cần người đồng hành nhất?",
                category="level",
                options=[
                    DiagnosticOption(id="geometry", label="Hình học không gian / Tọa độ Oxyz", subtext="Khó tưởng tượng hình chiếu và góc không gian"),
                    DiagnosticOption(id="functions", label="Hàm số và đồ thị khảo sát", subtext="Cực trị, tính đơn điệu, bài toán chứa tham số"),
                    DiagnosticOption(id="trig_algebra", label="Lượng giác / Phương trình chứa căn thức", subtext="Nhiều công thức biến đổi dễ nhầm lẫn")
                ]
            )
        ]
    elif "hóa" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="chem_blocker",
                subject="Hóa học",
                question="Ở môn Hóa, trở ngại lớn nhất của bạn lúc này là gì?",
                category="blocker",
                options=[
                    DiagnosticOption(id="redox", label="Cân bằng electron & phương trình oxy hóa khử", subtext="Dễ sót hệ số hoặc xác định sai số oxy hóa"),
                    DiagnosticOption(id="organic", label="Cơ chế phản ứng hữu cơ (Este, Lipit, Amin)", subtext="Nhiều công thức cấu tạo và chuỗi phản ứng"),
                    DiagnosticOption(id="mol_math", label="Bài toán tính toán theo định luật bảo toàn", subtext="Bảo toàn khối lượng, bảo toàn e, bảo toàn nguyên tố")
                ]
            ),
            DiagnosticQuestion(
                id="chem_method",
                subject="Hóa học",
                question="Cách bạn muốn bắt đầu mỗi buổi học Hóa:",
                category="style",
                options=[
                    DiagnosticOption(id="rule_map", label="Tóm tắt 1 trang công thức & quy tắc nhớ nhanh", subtext="Nắm chắc bản chất trước khi làm bài"),
                    DiagnosticOption(id="example_first", label="Xem 1 ví dụ giải mẫu rồi làm bài tương tự", subtext="Học qua thực hành bài tập cụ thể")
                ]
            )
        ]
    elif "văn" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="lit_blocker",
                subject="Ngữ văn",
                question="Khi viết bài văn nghị luận, bạn mong muốn cải thiện điểm nào nhất?",
                category="blocker",
                options=[
                    DiagnosticOption(id="outline", label="Lập dàn ý & luận điểm mạch lạc, không bị lặp ý", subtext="Tránh viết lan man hoặc thiếu ý trọng tâm"),
                    DiagnosticOption(id="vocab_flow", label="Lời văn mượt mà, giàu cảm xúc và dẫn chứng đắt giá", subtext="Nâng cao chất lượng diễn đạt và chiều sâu"),
                    DiagnosticOption(id="time_pace", label="Kiểm soát thời gian để viết trọn vẹn kết bài", subtext="Viết kịp tiến độ không bị đuối đoạn cuối")
                ]
            )
        ]
    elif "lý" in subject_normalized or "vật lý" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="physics_blocker",
                subject="Vật lý",
                question="Khó khăn lớn nhất của bạn khi học Vật lý:",
                category="blocker",
                options=[
                    DiagnosticOption(id="phenomenon", label="Chưa hiểu rõ hiện tượng vật lý trong thực tế", subtext="Khó liên hệ giữa lý thuyết và bản chất tự nhiên"),
                    DiagnosticOption(id="formula_apply", label="Thuộc công thức nhưng không biết áp dụng vào đề bài", subtext="Bối rối khi gặp các bài toán ghép nhiều hiện tượng"),
                    DiagnosticOption(id="graph_math", label="Đọc đồ thị dao động/sóng cơ/dòng điện xoay chiều", subtext="Kỹ năng khai thác dữ kiện từ hình vẽ còn yếu")
                ]
            )
        ]
    elif "anh" in subject_normalized or "tiếng anh" in subject_normalized:
        return [
            DiagnosticQuestion(
                id="eng_blocker",
                subject="Tiếng Anh",
                question="Kỹ năng nào bạn muốn cải thiện vượt trội nhất:",
                category="blocker",
                options=[
                    DiagnosticOption(id="grammar", label="Ngữ pháp và cấu trúc câu phức", subtext="Mệnh đề quan hệ, câu điều kiện, đảo ngữ"),
                    DiagnosticOption(id="vocab", label="Vốn từ vựng học thuật (Collocations & Idioms)", subtext="Dễ quên từ và dịch câu thô cứng"),
                    DiagnosticOption(id="reading", label="Tốc độ đọc hiểu và bẫy câu hỏi suy luận", subtext="Mất nhiều thời gian đọc bài đọc dài")
                ]
            )
        ]
    else:
        return [
            DiagnosticQuestion(
                id="general_blocker",
                subject=subject,
                question=f"Mục tiêu quan trọng nhất với môn {subject} trong 30 ngày tới:",
                category="blocker",
                options=[
                    DiagnosticOption(id="core_foundation", label="Lấp đầy các lỗ hổng kiến thức nền tảng", subtext="Hiểu rõ các khái niệm căn bản và định nghĩa"),
                    DiagnosticOption(id="practice_speed", label="Tăng tốc độ làm bài và độ chính xác", subtext="Rèn luyện phản xạ giải đề thi"),
                    DiagnosticOption(id="confidence", label="Xóa bỏ cảm giác sợ môn học, tạo thói quen học nhẹ nhàng", subtext="Tự tin mỗi khi mở sách vở ra học")
                ]
            )
        ]

# --- 3. ONBOARDING & KHẢO SÁT CÁ NHÂN HÓA ---
@router.post("/onboarding", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def onboard_student(data: StudentCreate, db: Session = Depends(get_db)):
    student_id = f"hs_{uuid.uuid4().hex[:8]}"

    # Xử lý danh sách môn học
    subjects = data.target_subjects if (data.target_subjects and len(data.target_subjects) > 0) else [data.target_subject or "Toán học"]
    primary_subject = subjects[0]

    # Suy luận mặc định nếu người dùng để trống
    weakness_val = data.weakness or f"Kiến thức cốt lõi môn {', '.join(subjects)}"
    goal_val = data.long_term_goal or f"Đạt 8.5+ môn {', '.join(subjects)} và tự tin khi làm bài"

    student = Student(
        id=student_id,
        user_id=data.user_id,
        name=data.name.strip() if data.name else "Bạn học nhỏ",
        grade=data.grade,
        target_subject=primary_subject,
        target_subjects=subjects,
        emotion_scale=data.emotion_scale,
        weakness=weakness_val,
        long_term_goal=goal_val,
        timeframe=data.timeframe,
        learning_style=data.learning_style or "visual",
        diagnostic_answers=data.diagnostic_answers or {}
    )
    db.add(student)
    db.flush()

    # Sinh lộ trình qua AI (kèm fallback sư phạm)
    roadmap_data = await call_ai_roadmap(data)
    roadmap = Roadmap(
        student_id=student.id,
        milestones=[m.model_dump() for m in roadmap_data.milestones],
        initial_daily_tasks=[t.model_dump() for t in roadmap_data.initial_daily_tasks],
        encouraging_message=roadmap_data.encouraging_message
    )
    db.add(roadmap)

    # Gieo sẵn nhiệm vụ vào Planning Page, có gắn môn học tương ứng
    categories = ["Lý thuyết", "Bài tập", "Ôn luyện", "Lý thuyết", "Nghỉ ngơi"]
    for idx, task in enumerate(roadmap_data.initial_daily_tasks):
        assigned_subject = task.subject if task.subject else subjects[idx % len(subjects)]
        planned = PlannedTask(
            student_id=student.id,
            title=task.title,
            duration_minutes=task.duration_minutes,
            subject=assigned_subject,
            category=task.category or categories[idx % len(categories)],
            tip=task.tip,
            is_completed=False,
            day_offset=idx + 1
        )
        db.add(planned)

    # Khởi tạo chậu hoa
    initial_flower = FlowerStatus(
        student_id=student.id,
        current_state=FlowerState.TICH_CUC,
        consecutive_days=1,
        last_checkin_date=date.today(),
        water_drops=3,
        story_message=STORY_MESSAGES[FlowerState.TICH_CUC]
    )
    db.add(initial_flower)
    db.commit()
    db.refresh(student)

    return StudentResponse(
        id=student.id,
        user_id=student.user_id,
        name=student.name,
        grade=student.grade,
        target_subject=student.target_subject,
        target_subjects=student.target_subjects,
        emotion_scale=student.emotion_scale,
        weakness=student.weakness,
        long_term_goal=student.long_term_goal,
        timeframe=student.timeframe,
        learning_style=student.learning_style,
        diagnostic_answers=student.diagnostic_answers,
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
        user_id=student.user_id,
        name=student.name,
        grade=student.grade,
        target_subject=student.target_subject,
        target_subjects=student.target_subjects or [student.target_subject],
        emotion_scale=student.emotion_scale or 4,
        weakness=student.weakness,
        long_term_goal=student.long_term_goal,
        timeframe=student.timeframe,
        learning_style=student.learning_style,
        diagnostic_answers=student.diagnostic_answers,
        created_at=student.created_at,
        roadmap=roadmap_resp,
        flower_state=flower.current_state if flower else None
    )

# --- 4. PLANNING PAGE API (KẾ HOẠCH HỌC TẬP) ---
@router.get("/planning/{student_id}", response_model=PlanningOverviewResponse)
def get_planning_overview(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    tasks = db.query(PlannedTask).filter(PlannedTask.student_id == student_id).order_by(PlannedTask.day_offset, PlannedTask.id).all()
    roadmap = db.query(Roadmap).filter(Roadmap.student_id == student_id).order_by(desc(Roadmap.created_at)).first()

    tasks_by_day: Dict[int, List[PlannedTaskResponse]] = {}
    completed_count = 0
    for t in tasks:
        day = t.day_offset
        if day not in tasks_by_day:
            tasks_by_day[day] = []
        tasks_by_day[day].append(PlannedTaskResponse.model_validate(t))
        if t.is_completed:
            completed_count += 1

    total_tasks = len(tasks)
    percentage = int((completed_count / total_tasks * 100)) if total_tasks > 0 else 0

    milestones = roadmap.milestones if roadmap else []

    return PlanningOverviewResponse(
        student_id=student.id,
        student_name=student.name,
        target_subject=student.target_subject,
        target_subjects=student.target_subjects or [student.target_subject],
        emotion_scale=student.emotion_scale or 4,
        long_term_goal=student.long_term_goal,
        total_tasks=total_tasks,
        completed_tasks=completed_count,
        completion_percentage=percentage,
        tasks_by_day=tasks_by_day,
        milestones=milestones
    )

@router.post("/planning/{student_id}/task", response_model=PlannedTaskResponse)
def add_planned_task(student_id: str, data: PlannedTaskCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    task = PlannedTask(
        student_id=student_id,
        title=data.title.strip(),
        duration_minutes=data.duration_minutes,
        subject=data.subject or student.target_subject,
        category=data.category,
        tip=data.tip,
        day_offset=data.day_offset,
        is_completed=False
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return PlannedTaskResponse.model_validate(task)

@router.patch("/planning/task/{task_id}", response_model=PlannedTaskResponse)
def update_task_status(task_id: int, data: PlannedTaskUpdate, db: Session = Depends(get_db)):
    task = db.query(PlannedTask).filter(PlannedTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ")

    if data.is_completed is not None:
        task.is_completed = data.is_completed
    if data.title is not None:
        task.title = data.title.strip()
    if data.duration_minutes is not None:
        task.duration_minutes = data.duration_minutes
    if data.subject is not None:
        task.subject = data.subject
    if data.category is not None:
        task.category = data.category
    if data.tip is not None:
        task.tip = data.tip

    db.commit()
    db.refresh(task)
    return PlannedTaskResponse.model_validate(task)

@router.delete("/planning/task/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(PlannedTask).filter(PlannedTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ")
    db.delete(task)
    db.commit()
    return {"success": True, "message": "Đã xóa nhiệm vụ"}

# --- 5. DAILY CHECK-IN & AI FEEDBACK ---
@router.post("/checkin", response_model=CheckinResponse)
async def submit_daily_checkin(data: CheckinCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    ai_feedback = await call_ai_mentor(data, student)

    recent_checkins = db.query(DailyCheckin)\
        .filter(DailyCheckin.student_id == data.student_id)\
        .order_by(desc(DailyCheckin.created_at))\
        .limit(2)\
        .all()

    needs_attention = False
    scale = data.emotion_scale or 4
    if (scale <= 2 or data.mood in [MoodType.STRESSED, MoodType.TIRED]) and data.completion_rate < 50:
        if any(c.mood in [MoodType.STRESSED, MoodType.TIRED] for c in recent_checkins):
            needs_attention = True

    checkin_record = DailyCheckin(
        student_id=data.student_id,
        completion_rate=data.completion_rate,
        subject_difficulty=data.subject_difficulty,
        action_reflection=data.action_reflection,
        mood=data.mood,
        emotion_scale=scale,
        ai_feedback=ai_feedback,
        needs_attention=needs_attention
    )
    db.add(checkin_record)

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
        flower.water_drops += 1
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
        emotion_scale=scale,
        ai_feedback=checkin_record.ai_feedback,
        needs_attention=checkin_record.needs_attention,
        created_at=checkin_record.created_at,
        streak_days=flower.consecutive_days,
        flower_state=flower.current_state,
        water_drops=flower.water_drops
    )

# --- 6. KHU VƯỜN & TƯỚI NƯỚC (GARDEN STATUS) ---
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
        delta_days = (today - flower.last_checkin_date).days
        if delta_days >= 3 and flower.current_state not in [FlowerState.THIEU_NUOC, FlowerState.HEO_KHO]:
            new_state, story = evaluate_inactive_state(flower.last_checkin_date, today)
            flower.current_state = new_state
            flower.story_message = story
            db.commit()
            db.refresh(flower)

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
    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()
    if not flower:
        raise HTTPException(status_code=404, detail="Không tìm thấy khu vườn")

    if flower.water_drops <= 0:
        return WaterActionResponse(
            success=False,
            message="Hết giọt nước rồi. Hoàn thành check-in để nhận thêm nước mát nhé!",
            new_state=flower.current_state,
            water_drops=flower.water_drops
        )

    flower.water_drops -= 1
    if flower.current_state == FlowerState.THIEU_NUOC:
        flower.current_state = FlowerState.TICH_CUC
        flower.story_message = "Cành lá đã tươi tỉnh và vươn mình trở lại sau khi nhận nước mát!"
    elif flower.current_state == FlowerState.HEO_KHO:
        flower.current_state = FlowerState.TICH_CUC
        flower.consecutive_days = 1
        flower.story_message = "Một mầm xanh non tơ đã nhú lên từ lòng đất ấm. Bắt đầu lại thật nhẹ nhàng!"

    db.commit()
    db.refresh(flower)

    return WaterActionResponse(
        success=True,
        message="Tưới nước thành công! Bông hoa đang mỉm cười đón nhận sự chăm sóc của bạn.",
        new_state=flower.current_state,
        water_drops=flower.water_drops
    )

# --- 7. TEACHER DASHBOARD ---
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

        alert_reason = "Bình thường"
        severity = "low"
        needs_attention = False

        if days_inactive >= 7:
            alert_reason = f"Đã vắng mặt {days_inactive} ngày"
            severity = "high"
            needs_attention = True
        elif latest_checkin and latest_checkin.needs_attention:
            alert_reason = "Áp lực kéo dài (Mood căng thẳng & tiến độ thấp)"
            severity = "high"
            needs_attention = True
        elif s.emotion_scale and s.emotion_scale <= 2:
            alert_reason = f"Cảm xúc học tập rất tiêu cực (Mức {s.emotion_scale}/7)"
            severity = "high"
            needs_attention = True
        elif current_state == FlowerState.THIEU_NUOC:
            alert_reason = "Cây thiếu nước (nghỉ 3-7 ngày)"
            severity = "medium"
            needs_attention = True
        elif latest_checkin and latest_checkin.mood in [MoodType.STRESSED, MoodType.TIRED]:
            alert_reason = "Tâm trạng gần đây mệt mỏi"
            severity = "medium"

        item = StudentAlertItem(
            student_id=s.id,
            student_name=s.name,
            grade=s.grade,
            target_subject=s.target_subject,
            target_subjects=s.target_subjects or [s.target_subject],
            emotion_scale=s.emotion_scale or 4,
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
