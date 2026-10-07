import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models import (
    Student, FlowerStatus, FlowerState, MoodType,
    QuizQuestion, StudentQuizAttempt
)
from app.services.quiz_bank_seed import SEED_QUIZ_QUESTIONS
from app.services.quiz_service import (
    ensure_quiz_bank_seeded, get_daily_quiz_package,
    submit_student_quiz, inject_teacher_quiz, get_teacher_quiz_stats
)
from app.schemas import QuizSubmissionCreate, QuizAnswerItem, TeacherInjectQuizCreate

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_quiz.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        ensure_quiz_bank_seeded(db)
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_quiz_bank_seeding(db_session):
    """Kiểm tra ngân hàng câu hỏi 5 khối thi được khởi tạo đầy đủ."""
    count = db_session.query(QuizQuestion).count()
    assert count >= len(SEED_QUIZ_QUESTIONS)
    
    # Kiểm tra các khối thi
    for blk in ["A00", "D01", "B00", "C00", "A01"]:
        q_count = db_session.query(QuizQuestion).filter(QuizQuestion.block == blk).count()
        assert q_count >= 3

def test_daily_quiz_package_below_30_days_streak(db_session):
    """Học sinh streak < 30 ngày: Không thấy câu Boss 30 ngày."""
    student = Student(
        id="hs_test_day5",
        name="Nguyễn Văn A",
        grade="12",
        target_subject="Toán học",
        target_subjects=["Toán học", "Vật lí", "Hóa học"],
        weakness="Hình học",
        long_term_goal="ĐH Bách Khoa",
        timeframe="5 tháng"
    )
    db_session.add(student)
    flower = FlowerStatus(
        student_id=student.id,
        current_state=FlowerState.CHAM_HOC,
        consecutive_days=5,
        water_drops=2,
        last_checkin_date=date.today(),
        story_message="Cây hoa đang lớn"
    )
    db_session.add(flower)
    db_session.commit()

    pkg = get_daily_quiz_package(db=db_session, student_id=student.id, requested_block="A00")
    assert pkg.student_id == student.id
    assert pkg.block == "A00"
    assert pkg.streak_days == 5
    assert pkg.is_boss_unlocked is False
    assert len(pkg.questions) == 3

    # Đảm bảo câu 3 không phải là BOSS_30D
    q_types = [q.slot_type for q in pkg.questions]
    assert "REFLEX_1" in q_types
    assert "TRAP_2" in q_types
    assert "BOSS_30D" not in q_types

def test_daily_quiz_package_above_30_days_unlocks_boss(db_session):
    """Học sinh streak >= 30 ngày: Tự động kích hoạt cơ chế Ổ Khóa 30 Ngày (Boss Item)."""
    student = Student(
        id="hs_test_boss30",
        name="Trần Thị Bền Bỉ",
        grade="12",
        target_subject="Toán học",
        target_subjects=["Toán học", "Ngữ văn", "Tiếng Anh"],
        weakness="Từ vựng",
        long_term_goal="ĐH Ngoại Thương",
        timeframe="3 tháng"
    )
    db_session.add(student)
    flower = FlowerStatus(
        student_id=student.id,
        current_state=FlowerState.CHAM_HOC,
        consecutive_days=31,
        water_drops=5,
        last_checkin_date=date.today(),
        story_message="Chiến binh kỷ luật"
    )
    db_session.add(flower)
    db_session.commit()

    pkg = get_daily_quiz_package(db=db_session, student_id=student.id, requested_block="D01")
    assert pkg.streak_days == 31
    assert pkg.is_boss_unlocked is True

    q_types = [q.slot_type for q in pkg.questions]
    assert "BOSS_30D" in q_types

def test_submit_quiz_and_water_reward(db_session):
    """Nộp bài trắc nghiệm: chấm điểm, giải thích vi mô và cộng giọt nước."""
    sub = QuizSubmissionCreate(
        student_id="hs_test_day5",
        block="A00",
        answers=[
            QuizAnswerItem(question_id="A00-Q1-REFLEX", selected_answer="B", time_spent_seconds=30), # đúng
            QuizAnswerItem(question_id="A00-Q2-TRAP", selected_answer="B", time_spent_seconds=40), # đúng
            QuizAnswerItem(question_id="A00-Q3-STANDARD", selected_answer="B", time_spent_seconds=50), # đúng
        ]
    )

    res = submit_student_quiz(db=db_session, submission=sub)
    assert res.total_questions == 3
    assert res.correct_answers == 3
    assert res.score_percentage == 100.0
    assert res.water_drop_earned >= 2 # +1 hoàn thành, +1 làm đúng tuyệt đối

    # Kiểm tra giải thích vi mô
    for r in res.results:
        assert r.is_correct is True
        assert len(r.micro_explanation) > 0

def test_teacher_quiz_injection_and_analytics(db_session, client):
    """Giáo viên nạp câu hỏi mới vào Slot Trống và API phản hồi chuẩn xác."""
    inject_data = {
        "block": "A00",
        "subject": "Toán học",
        "source": "Đề Khảo Sát Chất Lượng THPT Chuyên Bến Tre 2026",
        "bloom_level": "Vận dụng cao 8+",
        "lock_condition": "MOTUDO",
        "time_limit_seconds": 90,
        "question_text": "Tìm số nghiệm nguyên của bất phương trình logarit...",
        "options": {
            "A": "2",
            "B": "4",
            "C": "6",
            "D": "8"
        },
        "correct_answer": "B",
        "micro_explanation": "Đặt điều kiện xác định trước khi cô lập tham số m.",
        "growth_mindset_tip": "Luôn nhớ điều kiện biểu thức dưới dấu logarit dương!",
        "teacher_id": "GV_TOAN_01"
    }

    res = client.post("/api/quiz/inject", json=inject_data)
    assert res.status_code == 201
    json_data = res.json()
    assert json_data["success"] is True
    assert "A00-TCH-" in json_data["question_id"]

    # Kiểm tra endpoint thống kê giáo viên
    stats_res = client.get("/api/quiz/teacher/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert isinstance(stats, list)
