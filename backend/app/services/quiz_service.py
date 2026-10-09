import uuid
from datetime import date
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_

from app.models import Student, FlowerStatus, QuizQuestion, StudentQuizAttempt, StreakInventory
from app.services.garden_service import get_or_create_inventory
from app.schemas import (
    QuizQuestionItem,
    DailyQuizPackageResponse,
    QuizSubmissionCreate,
    QuizSubmissionResponse,
    QuizAnswerResult,
    TeacherInjectQuizCreate,
    TeacherQuizStatsItem,
    ExchangeHolyWaterResponse,
    QuizStartRequest,
    QuizStartResponse,
)
from app.services.quiz_bank_seed import SEED_QUIZ_QUESTIONS, seed_quiz_bank_to_db
def ensure_quiz_bank_seeded(db: Session):
    """Đảm bảo ngân hàng câu hỏi trắc nghiệm đã được nạp dữ liệu chuẩn vào DB (hỗ trợ modular upsert)."""
    count = db.query(QuizQuestion).count()
    if count < 50:
        seed_quiz_bank_to_db(db)
def resolve_student_block(student: Student, requested_block: Optional[str] = None) -> str:
    """Xác định tổ hợp khối thi phù hợp nhất của học sinh."""
    if requested_block in ["A00", "A01", "B00", "C00", "D01"]:
        return requested_block
    if hasattr(student, "target_block") and student.target_block:
        return student.target_block
    
    # Suy đoán từ target_subjects đã chọn ở Onboarding
    subs = set(student.target_subjects or [student.target_subject])
    if "Vật lí" in subs and "Hóa học" in subs:
        return "A00"
    if "Tiếng Anh" in subs and "Ngữ văn" in subs:
        return "D01"
    if "Hóa học" in subs and "Sinh học" in subs:
        return "B00"
    if "Lịch sử" in subs or "Địa lí" in subs:
        return "C00"
    if "Vật lí" in subs and "Tiếng Anh" in subs:
        return "A01"
    return "A00"

def get_bloom_stage_info(streak_days: int) -> tuple[int, str]:
    """
    Xác định số lượng câu hỏi và cấp độ tư duy theo mốc chuỗi ngày học:
    - <= 7 ngày: 3 câu, 100% Nhận biết
    - 8 - 21 ngày: 3 câu, 100% Thông hiểu
    - 22 - 30 ngày: 5 câu, 100% Vận dụng
    - > 30 ngày: 10 câu, Hỗn hợp mọi cấp độ (kể cả Boss)
    """
    effective_days = max(1, streak_days)
    if effective_days <= 7:
        return 3, "Nhận biết"
    elif effective_days <= 21:
        return 3, "Thông hiểu"
    elif effective_days <= 30:
        return 5, "Vận dụng"
    else:
        return 10, "Hỗn hợp tất cả"

def sync_student_quiz_inventory(db: Session, student_id: str, streak_days: int) -> StreakInventory:
    """
    Đồng bộ và cấp phát vé hàng ngày, thưởng mốc trưởng thành, và tích lũy nước thánh 30 ngày.
    """
    inventory = get_or_create_inventory(student_id, db)
    today = date.today()
    changed = False

    # 1. Cấp 1 vé hàng ngày (có thể tích lũy dồn ngày nếu qua ngày mới)
    if not inventory.last_daily_ticket_date or inventory.last_daily_ticket_date < today:
        inventory.quiz_tickets = (inventory.quiz_tickets or 0) + 1
        inventory.last_daily_ticket_date = today
        changed = True

    # 2. Thưởng vé khi đạt các mốc trưởng thành của cây: [3, 7, 14, 21, 30]
    # 3 (+1 vé), 7 (+2 vé), 14 (+2 vé), 21 (+3 vé), 30 (+5 vé)
    milestone_rewards = {
        3: 1,
        7: 2,
        14: 2,
        21: 3,
        30: 5,
    }
    claimed_milestones = list(inventory.quiz_stage_milestones_claimed or [])
    for m_day, extra_tickets in milestone_rewards.items():
        if streak_days >= m_day and m_day not in claimed_milestones:
            inventory.quiz_tickets = (inventory.quiz_tickets or 0) + extra_tickets
            claimed_milestones.append(m_day)
            changed = True
    inventory.quiz_stage_milestones_claimed = claimed_milestones

    # 3. Tích lũy Nước Thánh từ chuỗi 30 ngày (mỗi 30 ngày = 1 bình Nước Thánh)
    eligible_holy_water_milestones = streak_days // 30
    claimed_hw_count = inventory.holy_water_claimed_count or 0
    if eligible_holy_water_milestones > claimed_hw_count:
        new_bottles = eligible_holy_water_milestones - claimed_hw_count
        inventory.holy_water = (inventory.holy_water or 0) + new_bottles
        inventory.holy_water_claimed_count = eligible_holy_water_milestones
        changed = True

    if changed:
        db.commit()
        db.refresh(inventory)

    return inventory

def exchange_holy_water_for_tickets(db: Session, student_id: str) -> ExchangeHolyWaterResponse:
    """
    Đổi 1 Nước Thánh lấy 5 Vé Quiz.
    """
    inventory = get_or_create_inventory(student_id, db)
    if (inventory.holy_water or 0) < 1:
        raise ValueError("Cần ít nhất 1 bình Nước Thánh tích lũy từ chuỗi 30 ngày")

    inventory.holy_water -= 1
    inventory.quiz_tickets = (inventory.quiz_tickets or 0) + 5
    db.commit()
    db.refresh(inventory)

    return ExchangeHolyWaterResponse(
        success=True,
        message="Đổi thành công 1 Nước Thánh lấy 5 Vé Quiz!",
        quiz_tickets=inventory.quiz_tickets,
        holy_water_remaining=inventory.holy_water
    )

def get_student_target_subjects(student: Student) -> List[str]:
    """Lấy danh sách các môn học mà học sinh đã chọn để rèn luyện/cải thiện."""
    subs: List[str] = []
    if hasattr(student, "target_subjects") and student.target_subjects:
        if isinstance(student.target_subjects, list):
            subs = [s for s in student.target_subjects if s]
    if not subs and hasattr(student, "target_subject") and student.target_subject:
        subs = [student.target_subject]
    if not subs:
        subs = ["Toán học", "Ngữ văn", "Tiếng Anh"]
    return list(dict.fromkeys(subs))

def pick_questions_by_subjects(
    db: Session,
    selected_subjects: List[str],
    target_count: int,
    bloom_stage: str
) -> List[QuizQuestion]:
    """
    Cấp phát câu hỏi theo danh sách môn học sinh chọn:
    - Chọn 1 môn: 100% câu hỏi thuộc môn đó.
    - Chọn 2 môn: mỗi môn chắc chắn có ít nhất 1 câu, các câu còn lại chia ngẫu nhiên.
    - Chọn 3+ môn: phân bổ đều cho các môn đã chọn.
    """
    import random
    if not selected_subjects:
        selected_subjects = ["Toán học"]

    n_subs = len(selected_subjects)
    counts: Dict[str, int] = {}

    if n_subs >= target_count:
        sampled = random.sample(selected_subjects, target_count)
        for s in sampled:
            counts[s] = 1
    else:
        base = target_count // n_subs
        rem = target_count % n_subs
        for s in selected_subjects:
            counts[s] = base
        if rem > 0:
            for s in random.sample(selected_subjects, rem):
                counts[s] += 1

    chosen_questions: List[QuizQuestion] = []
    chosen_ids = set()

    for sub, count_needed in counts.items():
        base_q = db.query(QuizQuestion).filter(
            QuizQuestion.subject == sub,
            QuizQuestion.is_active == True,
            ~QuizQuestion.id.in_(chosen_ids)
        )
        if bloom_stage != "Hỗn hợp tất cả":
            qs = base_q.filter(QuizQuestion.bloom_level.ilike(f"%{bloom_stage}%")).order_by(func.random()).limit(count_needed).all()
        else:
            qs = base_q.order_by(func.random()).limit(count_needed).all()

        chosen_questions.extend(qs)
        chosen_ids.update(q.id for q in qs)

        # Fallback 1: Nếu chưa đủ số câu cho môn này theo cấp độ, lấy thêm các cấp độ khác cùng môn
        if len(qs) < count_needed:
            needed = count_needed - len(qs)
            fb = db.query(QuizQuestion).filter(
                QuizQuestion.subject == sub,
                QuizQuestion.is_active == True,
                ~QuizQuestion.id.in_(chosen_ids)
            ).order_by(func.random()).limit(needed).all()
            chosen_questions.extend(fb)
            chosen_ids.update(q.id for q in fb)

    # Fallback 2: Nếu tổng câu hỏi vẫn chưa đủ target_count, lấy thêm ngẫu nhiên từ các môn đã chọn
    if len(chosen_questions) < target_count:
        needed = target_count - len(chosen_questions)
        fb_all = db.query(QuizQuestion).filter(
            QuizQuestion.subject.in_(selected_subjects),
            QuizQuestion.is_active == True,
            ~QuizQuestion.id.in_(chosen_ids)
        ).order_by(func.random()).limit(needed).all()
        chosen_questions.extend(fb_all)
        chosen_ids.update(q.id for q in fb_all)

    # Fallback 3: Dự phòng cuối cùng nếu ngân hàng của các môn đó không đủ
    if len(chosen_questions) < target_count:
        needed = target_count - len(chosen_questions)
        fb_global = db.query(QuizQuestion).filter(
            QuizQuestion.is_active == True,
            ~QuizQuestion.id.in_(chosen_ids)
        ).order_by(func.random()).limit(needed).all()
        chosen_questions.extend(fb_global)
        chosen_ids.update(q.id for q in fb_global)

    return chosen_questions

def start_student_quiz(db: Session, data: QuizStartRequest) -> QuizStartResponse:
    """
    Bắt đầu phiên quiz sau khi học sinh xác nhận môn học cần luyện:
    - Kiểm tra và trừ ngay 1 vé quiz.
    - Cấp phát bộ câu hỏi theo đúng các môn học sinh đã chọn.
    """
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise ValueError(f"Không tìm thấy học sinh {data.student_id}")

    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == data.student_id).first()
    streak_days = flower.consecutive_days if flower else 1
    if streak_days <= 0:
        streak_days = 1

    inventory = sync_student_quiz_inventory(db, data.student_id, streak_days)
    if (inventory.quiz_tickets or 0) <= 0:
        raise ValueError("Bạn đã hết vé quiz! Hãy nhận vé miễn phí hàng ngày hoặc đổi từ Nước Thánh.")

    # Trừ 1 vé quiz ngay khi xác nhận bắt đầu làm bài
    inventory.quiz_tickets -= 1
    db.commit()
    db.refresh(inventory)

    package = get_daily_quiz_package(
        db=db,
        student_id=data.student_id,
        requested_block=data.block,
        selected_subjects=data.selected_subjects
    )
    return QuizStartResponse(
        success=True,
        message="Bắt đầu phiên trắc nghiệm vi mô thành công!",
        quiz_tickets_remaining=inventory.quiz_tickets,
        package=package
    )

def get_daily_quiz_package(
    db: Session,
    student_id: str,
    requested_block: Optional[str] = None,
    selected_subjects: Optional[List[str]] = None
) -> DailyQuizPackageResponse:
    ensure_quiz_bank_seeded(db)

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError(f"Không tìm thấy học sinh {student_id}")

    block = resolve_student_block(student, requested_block)
    target_subjects = get_student_target_subjects(student)

    # Nếu học sinh truyền danh sách môn muốn làm, dùng danh sách đó
    # Nếu không truyền, mặc định dùng target_subjects của học sinh
    active_subjects = selected_subjects if selected_subjects else target_subjects

    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()
    streak_days = flower.consecutive_days if flower else 1
    if streak_days <= 0:
        streak_days = 1
    is_boss_unlocked = streak_days >= 30

    # Đồng bộ vé, thưởng mốc cây, tích lũy nước thánh
    inventory = sync_student_quiz_inventory(db, student_id, streak_days)

    today = date.today()
    existing_attempt = db.query(StudentQuizAttempt).filter(
        StudentQuizAttempt.student_id == student_id,
        StudentQuizAttempt.quiz_date == today
    ).order_by(desc(StudentQuizAttempt.id)).first()

    has_attempted_today = existing_attempt is not None

    target_count, bloom_stage = get_bloom_stage_info(streak_days)

    # Cấp phát câu hỏi theo môn học được chọn
    selected_questions = pick_questions_by_subjects(
        db=db,
        selected_subjects=active_subjects,
        target_count=target_count,
        bloom_stage=bloom_stage
    )

    # Convert to QuestionItems
    question_items = [
        QuizQuestionItem(
            id=q.id,
            block=q.block,
            subject=q.subject,
            slot_type=q.slot_type,
            source=q.source,
            bloom_level=q.bloom_level,
            lock_condition=q.lock_condition,
            time_limit_seconds=q.time_limit_seconds,
            question_text=q.question_text,
            options=q.options,
            growth_mindset_tip=q.growth_mindset_tip,
            correct_answer=q.correct_answer,
            micro_explanation=q.micro_explanation
        )
        for q in selected_questions
    ]

    last_attempt_data = None
    if existing_attempt:
        last_attempt_data = {
            "correct_answers": existing_attempt.correct_answers,
            "total_questions": existing_attempt.total_questions,
            "is_boss_unlocked": existing_attempt.is_boss_unlocked,
            "details": existing_attempt.details
        }

    # Lấy toàn bộ môn có trong ngân hàng để học sinh có thể chọn thêm nếu muốn
    all_available = [
        "Toán học", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học",
        "Sinh học", "Lịch sử", "Địa lí", "Tin học", "GDKT & PL", "Công nghệ"
    ]

    return DailyQuizPackageResponse(
        student_id=student_id,
        block=block,
        streak_days=streak_days,
        is_boss_unlocked=is_boss_unlocked,
        has_attempted_today=has_attempted_today,
        questions=question_items,
        last_attempt=last_attempt_data,
        quiz_tickets=inventory.quiz_tickets or 0,
        holy_water=inventory.holy_water or 0,
        conquest_streak=inventory.conquest_streak or 0,
        target_question_count=target_count,
        current_bloom_stage=bloom_stage,
        can_start_quiz=(inventory.quiz_tickets or 0) > 0,
        student_target_subjects=target_subjects,
        available_subjects=all_available
    )
def submit_student_quiz(db: Session, submission: QuizSubmissionCreate) -> QuizSubmissionResponse:
    student = db.query(Student).filter(Student.id == submission.student_id).first()
    if not student:
        raise ValueError(f"Không tìm thấy học sinh {submission.student_id}")

    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == submission.student_id).first()
    streak_days = flower.consecutive_days if flower else 1
    if streak_days <= 0:
        streak_days = 1
    is_boss_unlocked = streak_days >= 30

    inventory = get_or_create_inventory(submission.student_id, db)
    # Vé đã được trừ chính thức ở bước start_student_quiz khi học sinh xác nhận làm bài.
    if (inventory.quiz_tickets or 0) < 0:
        inventory.quiz_tickets = 0
    target_count, _ = get_bloom_stage_info(streak_days)
    conquest_streak_incremented = False

    results: List[QuizAnswerResult] = []
    correct_count = 0
    needs_teacher_support = False
    is_boss_conquered = False

    details_for_db = []

    for ans in submission.answers:
        q = db.query(QuizQuestion).filter(QuizQuestion.id == ans.question_id).first()
        if not q:
            continue

        is_correct = (ans.selected_answer.strip().upper() == q.correct_answer.strip().upper())
        if is_correct:
            correct_count += 1
            if q.slot_type == "BOSS_30D":
                is_boss_conquered = True
        else:
            # Học sinh sai câu Boss hoặc câu của Giáo viên -> gửi cảnh báo tới GV Dashboard
            if q.slot_type in ["BOSS_30D", "TEACHER_INJECTED"] or q.creator_role == "TEACHER":
                needs_teacher_support = True

        results.append(QuizAnswerResult(
            question_id=q.id,
            selected_answer=ans.selected_answer,
            correct_answer=q.correct_answer,
            is_correct=is_correct,
            micro_explanation=q.micro_explanation,
            growth_mindset_tip=q.growth_mindset_tip
        ))

        details_for_db.append({
            "question_id": q.id,
            "subject": q.subject,
            "slot_type": q.slot_type,
            "selected_answer": ans.selected_answer,
            "correct_answer": q.correct_answer,
            "is_correct": is_correct,
            "time_spent": ans.time_spent_seconds
        })

    total_q = len(submission.answers) or 1
    score_percentage = round((correct_count / total_q) * 100, 1)

    # CHUỖI CHINH PHỤC (Conquest Streak):
    # Chỉ tăng khi học sinh trả lời CHÍNH XÁC TOÀN BỘ CÂU HỎI (ví dụ: đúng cả 3/3 câu)
    if total_q >= target_count and correct_count == total_q:
        inventory.conquest_streak = (inventory.conquest_streak or 0) + 1
        conquest_streak_incremented = True

    # Thưởng giọt nước: Hoàn thành bài trắc nghiệm được +1 giọt nước
    water_drops_earned = 1
    if correct_count == total_q:
        water_drops_earned += 1 # Thưởng thêm 1 giọt nếu đạt điểm tối đa
    if is_boss_conquered:
        water_drops_earned += 1 # Thưởng thêm cho chiến tích hạ Boss
        flower.water_drops += water_drops_earned
        db.add(flower)

    # Lưu lượt nộp bài
    attempt = StudentQuizAttempt(
        student_id=submission.student_id,
        quiz_date=date.today(),
        block=submission.block,
        total_questions=len(submission.answers),
        correct_answers=correct_count,
        details=details_for_db,
        streak_at_attempt=streak_days,
        is_boss_unlocked=is_boss_unlocked,
        needs_teacher_support=needs_teacher_support
    )
    db.add(attempt)
    db.add(inventory)
    db.commit()
    db.refresh(inventory)
    # Lời động viên Growth Mindset từ AI
    if correct_count == len(submission.answers):
        ai_msg = f"🌟 Xuất sắc tuyệt đối {correct_count}/{len(submission.answers)}! Bộ não của bạn đang đạt tốc độ phản xạ công thức và bẫy đề thi cực kỳ nhạy bén."
    elif correct_count >= 2:
        ai_msg = f"🌻 Rất tốt {correct_count}/{len(submission.answers)}! Bạn đã nắm chắc nền tảng. Hãy đọc kỹ phần giải thích vi mô ở câu sai để biến lỗi vặt thành vũ khí ghi điểm."
    else:
        ai_msg = "🌱 Đừng nản lòng! Làm sai trong luyện tập là cơ hội quý giá nhất để phát hiện lỗ hổng kiến thức trước khi bước vào phòng thi thật. Bạn vừa tiến bộ thêm một bước lớn!"

    return QuizSubmissionResponse(
        total_questions=len(submission.answers),
        correct_answers=correct_count,
        score_percentage=score_percentage,
        streak_days=streak_days,
        water_drop_earned=water_drops_earned,
        results=results,
        ai_mentor_encouragement=ai_msg,
        is_boss_conquered=is_boss_conquered,
        routed_to_teacher=needs_teacher_support,
        conquest_streak=inventory.conquest_streak or 0,
        conquest_streak_incremented=conquest_streak_incremented,
        quiz_tickets_remaining=inventory.quiz_tickets or 0
    )

def inject_teacher_quiz(db: Session, data: TeacherInjectQuizCreate) -> QuizQuestion:
    """Giáo viên nạp câu hỏi mới vào Slot trống động."""
    slot_id = f"{data.block}-TCH-{uuid.uuid4().hex[:6].upper()}"
    new_q = QuizQuestion(
        id=slot_id,
        block=data.block,
        subject=data.subject,
        slot_type="TEACHER_INJECTED",
        source=data.source,
        bloom_level=data.bloom_level,
        lock_condition=data.lock_condition,
        time_limit_seconds=data.time_limit_seconds,
        question_text=data.question_text,
        options=data.options,
        correct_answer=data.correct_answer.strip().upper(),
        micro_explanation=data.micro_explanation,
        growth_mindset_tip=data.growth_mindset_tip,
        creator_role="TEACHER",
        creator_id=data.teacher_id or "GV_ADMIN",
        is_active=True
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q

def get_teacher_quiz_stats(db: Session) -> List[TeacherQuizStatsItem]:
    """Tổng hợp thống kê phân tích đề thi cho bảng điều khiển giáo viên."""
    attempts = db.query(StudentQuizAttempt).all()
    stats_map: Dict[str, Dict[str, Any]] = {}

    for att in attempts:
        for item in att.details or []:
            qid = item.get("question_id")
            if not qid:
                continue
            if qid not in stats_map:
                stats_map[qid] = {
                    "total": 0,
                    "correct": 0,
                    "subject": item.get("subject", "Chung")
                }
            stats_map[qid]["total"] += 1
            if item.get("is_correct"):
                stats_map[qid]["correct"] += 1

    result: List[TeacherQuizStatsItem] = []
    for qid, stat in stats_map.items():
        q_obj = db.query(QuizQuestion).filter(QuizQuestion.id == qid).first()
        total = stat["total"]
        correct = stat["correct"]
        rate = round((correct / total) * 100, 1) if total > 0 else 0.0
        result.append(TeacherQuizStatsItem(
            question_id=qid,
            block=q_obj.block if q_obj else "A00",
            subject=q_obj.subject if q_obj else stat["subject"],
            question_text=q_obj.question_text if q_obj else "Câu hỏi trong hệ thống",
            source=q_obj.source if q_obj else "Đề khảo sát",
            total_attempts=total,
            correct_rate=rate,
            wrong_count=total - correct
        ))
    return sorted(result, key=lambda x: x.wrong_count, reverse=True)
