import uuid
from datetime import date
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models import Student, FlowerStatus, QuizQuestion, StudentQuizAttempt
from app.schemas import (
    QuizQuestionItem,
    DailyQuizPackageResponse,
    QuizSubmissionCreate,
    QuizSubmissionResponse,
    QuizAnswerResult,
    TeacherInjectQuizCreate,
    TeacherQuizStatsItem,
)
from app.services.quiz_bank_seed import SEED_QUIZ_QUESTIONS

def ensure_quiz_bank_seeded(db: Session):
    """Đảm bảo ngân hàng câu hỏi trắc nghiệm đã được nạp dữ liệu chuẩn vào DB."""
    count = db.query(QuizQuestion).count()
    if count == 0:
        for q_data in SEED_QUIZ_QUESTIONS:
            q = QuizQuestion(**q_data)
            db.add(q)
        db.commit()

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

def get_daily_quiz_package(db: Session, student_id: str, requested_block: Optional[str] = None) -> DailyQuizPackageResponse:
    ensure_quiz_bank_seeded(db)

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError(f"Không tìm thấy học sinh {student_id}")

    block = resolve_student_block(student, requested_block)

    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()
    streak_days = flower.consecutive_days if flower else 0
    is_boss_unlocked = streak_days >= 30

    today = date.today()
    existing_attempt = db.query(StudentQuizAttempt).filter(
        StudentQuizAttempt.student_id == student_id,
        StudentQuizAttempt.quiz_date == today
    ).order_by(desc(StudentQuizAttempt.id)).first()

    has_attempted_today = existing_attempt is not None

    # Lấy 3 câu hỏi cho bộ trắc nghiệm hôm nay
    # Câu 1: Reflex
    q1 = db.query(QuizQuestion).filter(
        QuizQuestion.block == block,
        QuizQuestion.slot_type == "REFLEX_1",
        QuizQuestion.is_active == True
    ).first()

    # Câu 2: Trap
    q2 = db.query(QuizQuestion).filter(
        QuizQuestion.block == block,
        QuizQuestion.slot_type == "TRAP_2",
        QuizQuestion.is_active == True
    ).first()

    # Câu 3: Dynamic Slot (Giáo viên inject > Boss 30d nếu streak >= 30 > Dynamic 3 thường)
    q3_teacher = db.query(QuizQuestion).filter(
        QuizQuestion.block == block,
        QuizQuestion.creator_role == "TEACHER",
        QuizQuestion.is_active == True
    ).order_by(desc(QuizQuestion.created_at)).first()

    q3_boss = db.query(QuizQuestion).filter(
        QuizQuestion.block == block,
        QuizQuestion.slot_type == "BOSS_30D",
        QuizQuestion.is_active == True
    ).first()

    q3_standard = db.query(QuizQuestion).filter(
        QuizQuestion.block == block,
        QuizQuestion.slot_type == "DYNAMIC_3",
        QuizQuestion.is_active == True
    ).first()

    if q3_teacher and (q3_teacher.lock_condition == "MOTUDO" or is_boss_unlocked):
        q3 = q3_teacher
    elif is_boss_unlocked and q3_boss:
        q3 = q3_boss
    else:
        q3 = q3_standard or q3_boss

    questions_models = [q for q in [q1, q2, q3] if q is not None]

    # Convert to QuestionItems (không trả correct_answer ra client)
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
            growth_mindset_tip=q.growth_mindset_tip
        )
        for q in questions_models
    ]

    last_attempt_data = None
    if existing_attempt:
        last_attempt_data = {
            "correct_answers": existing_attempt.correct_answers,
            "total_questions": existing_attempt.total_questions,
            "is_boss_unlocked": existing_attempt.is_boss_unlocked,
            "details": existing_attempt.details
        }

    return DailyQuizPackageResponse(
        student_id=student_id,
        block=block,
        streak_days=streak_days,
        is_boss_unlocked=is_boss_unlocked,
        has_attempted_today=has_attempted_today,
        questions=question_items,
        last_attempt=last_attempt_data
    )

def submit_student_quiz(db: Session, submission: QuizSubmissionCreate) -> QuizSubmissionResponse:
    student = db.query(Student).filter(Student.id == submission.student_id).first()
    if not student:
        raise ValueError(f"Không tìm thấy học sinh {submission.student_id}")

    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == submission.student_id).first()
    streak_days = flower.consecutive_days if flower else 0
    is_boss_unlocked = streak_days >= 30

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

    # Thưởng giọt nước: Hoàn thành bài trắc nghiệm được +1 giọt nước
    water_drops_earned = 1
    if correct_count == total_q:
        water_drops_earned += 1 # Thưởng thêm 1 giọt nếu đạt điểm tối đa
    if is_boss_conquered:
        water_drops_earned += 1 # Thưởng thêm cho chiến tích hạ Boss

    if flower:
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
    db.commit()

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
        routed_to_teacher=needs_teacher_support
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
