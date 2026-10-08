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
    """Admin tạo tài khoản giáo viên Toán, giáo viên tạo câu môn Toán thành công nhưng tạo môn khác bị chặn."""
    from app.models import User, UserRole
    # Tạo GV Toán
    tch = User(
        id="usr_tch_toan_test",
        email="gv_toan_test",
        name="Thầy Nam",
        password_hash="fake:hash",
        role=UserRole.TEACHER,
        assigned_subject="Toán học",
        assigned_classes=["12A1"]
    )
    db_session.add(tch)
    # Tạo Admin
    admin = User(
        id="usr_adm_test",
        email="admin_quiz_test",
        name="Admin Test",
        password_hash="fake:hash",
        role=UserRole.ADMIN,
        assigned_subject="ALL",
        assigned_classes=["ALL"]
    )
    db_session.add(admin)
    db_session.commit()

    tch_token = "usr_tch_toan_test:faketoken"
    adm_token = "usr_adm_test:faketoken"

    # 1. GV Toán tạo câu hỏi môn Vật lí -> Bị từ chối 403
    fail_data = {
        "block": "A00",
        "subject": "Vật lí",
        "source": "Đề Vật lí 2026",
        "question_text": "Tính công suất...",
        "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
        "correct_answer": "A",
        "micro_explanation": "Giải thích"
    }
    res_fail = client.post("/api/quiz/inject", json=fail_data, headers={"Authorization": f"Bearer {tch_token}"})
    assert res_fail.status_code == 403
    assert "chỉ được phân công phụ trách môn 'Toán học'" in res_fail.json()["detail"]

    # 2. GV Toán tạo câu hỏi môn Toán học -> Thành công 201
    pass_data = {
        "block": "A00",
        "subject": "Toán học",
        "source": "Đề Chuyên Bến Tre 2026",
        "question_text": "Tính tích phân...",
        "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
        "correct_answer": "B",
        "micro_explanation": "Đổi biến t = x"
    }
    res_pass = client.post("/api/quiz/inject", json=pass_data, headers={"Authorization": f"Bearer {tch_token}"})
    assert res_pass.status_code == 201
    q_id = res_pass.json()["question_id"]

    # 3. GV khác (hoặc chưa có quyền) cố xóa câu hỏi của Thầy Nam -> 403
    other_tch = User(
        id="usr_other_tch",
        email="gv_khac",
        name="Cô Lan",
        password_hash="fake:hash",
        role=UserRole.TEACHER,
        assigned_subject="Toán học"
    )
    db_session.add(other_tch)
    db_session.commit()
    res_del_fail = client.delete(f"/api/quiz/questions/{q_id}", headers={"Authorization": "Bearer usr_other_tch:faketoken"})
    assert res_del_fail.status_code == 403

    # 4. Admin có quyền Sửa/Xóa bất kỳ câu hỏi nào
    res_update_adm = client.patch(
        f"/api/quiz/questions/{q_id}",
        json={"question_text": "Tính tích phân mở rộng (đã chỉnh sửa bởi Admin)..."},
        headers={"Authorization": f"Bearer {adm_token}"}
    )
    assert res_update_adm.status_code == 200
    assert "Admin" in res_update_adm.json()["question_text"]

    # 5. GV chính chủ tự xóa câu của mình -> Thành công
    res_del_ok = client.delete(f"/api/quiz/questions/{q_id}", headers={"Authorization": f"Bearer {tch_token}"})
    assert res_del_ok.status_code == 200
    assert res_del_ok.json()["success"] is True

    # 6. Kiểm tra API grouped questions trả về danh sách phân theo môn
    res_grp = client.get("/api/quiz/questions/grouped")
    assert res_grp.status_code == 200
    groups = res_grp.json()
    assert len(groups) >= 3
    subjects = [g["subject"] for g in groups]
    assert "Toán học" in subjects

def test_all_11_modular_subjects_present(client):
    """Xác nhận toàn bộ 11 môn học đều có mặt trong ngân hàng câu hỏi phân nhóm."""
    res = client.get("/api/quiz/questions/grouped")
    assert res.status_code == 200
    groups = res.json()
    subject_names = set(g["subject"] for g in groups)
    
    expected_subjects = [
        "Toán học", "Vật lí", "Hóa học", "Sinh học", "Ngữ văn",
        "Tiếng Anh", "Lịch sử", "Địa lí", "Tin học", "GDKT & PL", "Công nghệ"
    ]
    for sub in expected_subjects:
        assert sub in subject_names, f"Môn {sub} không có trong kết quả /quiz/questions/grouped"
        
    total_questions = sum(g["total_count"] for g in groups)
    assert total_questions >= 132
