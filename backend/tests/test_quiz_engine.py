import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models import (
    Student, FlowerStatus, FlowerState, MoodType,
    QuizQuestion, StudentQuizAttempt, StreakInventory
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

def test_daily_quiz_package_bloom_stages(db_session):
    """Kiểm tra phân bổ câu hỏi theo 4 mốc ngày: 1-7, 8-21, 22-30, >30."""
    # Tạo học sinh mốc ngày 5 (1-7 ngày)
    s1 = Student(id="hs_day5", name="Em Ngày 5", grade="12", target_subject="Toán học", target_subjects=["Toán học", "Vật lí", "Hóa học"], weakness="Hình học", long_term_goal="ĐH Bách Khoa", timeframe="5 tháng")
    f1 = FlowerStatus(student_id=s1.id, current_state=FlowerState.CHAM_HOC, consecutive_days=5, water_drops=1)
    db_session.add_all([s1, f1])

    # Tạo học sinh mốc ngày 15 (8-21 ngày)
    s2 = Student(id="hs_day15", name="Em Ngày 15", grade="12", target_subject="Toán học", target_subjects=["Toán học", "Vật lí", "Hóa học"], weakness="Hình học", long_term_goal="ĐH Bách Khoa", timeframe="5 tháng")
    f2 = FlowerStatus(student_id=s2.id, current_state=FlowerState.CHAM_HOC, consecutive_days=15, water_drops=1)
    db_session.add_all([s2, f2])

    # Tạo học sinh mốc ngày 25 (22-30 ngày)
    s3 = Student(id="hs_day25", name="Em Ngày 25", grade="12", target_subject="Toán học", target_subjects=["Toán học", "Vật lí", "Hóa học"], weakness="Hình học", long_term_goal="ĐH Bách Khoa", timeframe="5 tháng")
    f3 = FlowerStatus(student_id=s3.id, current_state=FlowerState.CHAM_HOC, consecutive_days=25, water_drops=1)
    db_session.add_all([s3, f3])

    # Tạo học sinh mốc ngày 35 (>30 ngày)
    s4 = Student(id="hs_day35", name="Em Ngày 35", grade="12", target_subject="Toán học", target_subjects=["Toán học", "Vật lí", "Hóa học"], weakness="Hình học", long_term_goal="ĐH Bách Khoa", timeframe="5 tháng")
    f4 = FlowerStatus(student_id=s4.id, current_state=FlowerState.CHAM_HOC, consecutive_days=35, water_drops=1)
    db_session.add_all([s4, f4])

    db_session.commit()

    # 1-7 ngày: 3 câu Nhận biết
    pkg1 = get_daily_quiz_package(db=db_session, student_id=s1.id, requested_block="A00")
    assert pkg1.target_question_count == 3
    assert pkg1.current_bloom_stage == "Nhận biết"
    assert len(pkg1.questions) == 3
    assert all("Nhận biết" in q.bloom_level for q in pkg1.questions)

    # 8-21 ngày: 3 câu Thông hiểu
    pkg2 = get_daily_quiz_package(db=db_session, student_id=s2.id, requested_block="A00")
    assert pkg2.target_question_count == 3
    assert pkg2.current_bloom_stage == "Thông hiểu"
    assert len(pkg2.questions) == 3
    assert all("Thông hiểu" in q.bloom_level for q in pkg2.questions)

    # 22-30 ngày: 5 câu Vận dụng
    pkg3 = get_daily_quiz_package(db=db_session, student_id=s3.id, requested_block="A00")
    assert pkg3.target_question_count == 5
    assert pkg3.current_bloom_stage == "Vận dụng"
    assert len(pkg3.questions) == 5
    assert all("Vận dụng" in q.bloom_level for q in pkg3.questions)

    # >30 ngày: 10 câu Hỗn hợp mọi cấp độ
    pkg4 = get_daily_quiz_package(db=db_session, student_id=s4.id, requested_block="A00")
    assert pkg4.target_question_count == 10
    assert pkg4.current_bloom_stage == "Hỗn hợp tất cả"
    assert len(pkg4.questions) == 10
    assert pkg4.is_boss_unlocked is True

def test_quiz_tickets_daily_and_milestones(db_session):
    """Kiểm tra cấp vé miễn phí và thưởng vé theo mốc hoa."""
    student = Student(id="hs_tickets", name="Học Sinh Vé", grade="12", target_subject="Toán học", target_subjects=["Toán học"], weakness="Hình học", long_term_goal="ĐH Bách Khoa", timeframe="3 tháng")
    flower = FlowerStatus(student_id=student.id, current_state=FlowerState.CHAM_HOC, consecutive_days=21, water_drops=1)
    db_session.add_all([student, flower])
    db_session.commit()

    pkg = get_daily_quiz_package(db=db_session, student_id=student.id, requested_block="A00")
    # Khởi tạo có 1 vé + 1 vé ngày hôm nay (nếu refresh) + mốc 3(+1), 7(+2), 14(+2), 21(+3) = 1 + 1 + 2 + 2 + 3 = 9 vé
    assert pkg.quiz_tickets >= 9
    assert pkg.can_start_quiz is True

def test_holy_water_and_exchange(db_session, client):
    """Kiểm tra tích lũy Nước Thánh từ chuỗi 30 ngày và đổi sang Vé Quiz."""
    student = Student(id="hs_holy_water", name="Học Sinh Nước Thánh", grade="12", target_subject="Toán học", target_subjects=["Toán học"], weakness="Hình học", long_term_goal="ĐH Bách Khoa", timeframe="3 tháng")
    # Chuỗi 62 ngày => 62 // 30 = 2 bình Nước Thánh
    flower = FlowerStatus(student_id=student.id, current_state=FlowerState.CHAM_HOC, consecutive_days=62, water_drops=1)
    db_session.add_all([student, flower])
    db_session.commit()

    pkg = get_daily_quiz_package(db=db_session, student_id=student.id, requested_block="A00")
    assert pkg.holy_water == 2

    initial_tickets = pkg.quiz_tickets

    # Đổi 1 Nước Thánh lấy 5 Vé Quiz
    res = client.post(f"/api/quiz/exchange-holy-water?student_id={student.id}")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["holy_water_remaining"] == 1
    assert data["quiz_tickets"] == initial_tickets + 5
def test_start_quiz_deducts_ticket_and_submit_increments_conquest_streak(db_session, client):
    """Quy trình chuẩn: Bắt đầu quiz trừ 1 vé, nộp bài đủ câu cộng 1 chuỗi chinh phục."""
    student = Student(id="hs_conquest", name="Học Sinh Chinh Phục", grade="12", target_subject="Toán học", target_subjects=["Toán học", "Vật lí", "Hóa học"], weakness="Hình học", long_term_goal="ĐH Bách Khoa", timeframe="3 tháng")
    flower = FlowerStatus(student_id=student.id, current_state=FlowerState.CHAM_HOC, consecutive_days=5, water_drops=1)
    db_session.add_all([student, flower])
    db_session.commit()

    pkg = get_daily_quiz_package(db=db_session, student_id=student.id, requested_block="A00")
    initial_tickets = pkg.quiz_tickets
    initial_conquest = pkg.conquest_streak
    assert initial_tickets >= 1

    # 1. Bắt đầu phiên thi: trừ 1 vé ngay lập tức
    res_start = client.post("/api/quiz/start", json={"student_id": student.id, "selected_subjects": ["Toán học"]})
    assert res_start.status_code == 200
    start_data = res_start.json()
    assert start_data["success"] is True
    assert start_data["quiz_tickets_remaining"] == initial_tickets - 1

    # 2. Nộp bài: Làm đúng cả 3/3 câu -> Chuỗi chinh phục tăng +1
    # Lấy đúng đáp án để đạt 3/3
    answers_correct = []
    for q_data in start_data["package"]["questions"]:
        answers_correct.append(QuizAnswerItem(question_id=q_data["id"], selected_answer=q_data["correct_answer"], time_spent_seconds=20))

    sub = QuizSubmissionCreate(
        student_id=student.id,
        block="A00",
        answers=answers_correct
    )

    res = submit_student_quiz(db=db_session, submission=sub)
    assert res.correct_answers == 3
    assert res.conquest_streak == initial_conquest + 1
    assert res.conquest_streak_incremented is True
    assert res.quiz_tickets_remaining == initial_tickets - 1

def test_subject_based_question_distribution(db_session, client):
    """
    - Chọn 1 môn ('Toán học'): 3 câu đều là môn Toán.
    - Chọn 2 môn ('Toán học', 'Vật lí'): chắc chắn có ít nhất 1 câu Toán và 1 câu Lí.
    """
    student = Student(id="hs_subject_test", name="Học Sinh Chọn Môn", grade="12", target_subject="Toán học", target_subjects=["Toán học", "Vật lí"], weakness="Hình học", long_term_goal="ĐH Bách Khoa", timeframe="3 tháng")
    flower = FlowerStatus(student_id=student.id, current_state=FlowerState.CHAM_HOC, consecutive_days=5, water_drops=1)
    db_session.add_all([student, flower])
    db_session.commit()

    # 1. Chọn 1 môn: Toán học
    res1 = client.post("/api/quiz/start", json={"student_id": student.id, "selected_subjects": ["Toán học"]})
    assert res1.status_code == 200
    q_subs1 = [q["subject"] for q in res1.json()["package"]["questions"]]
    assert len(q_subs1) == 3
    assert all(s == "Toán học" for s in q_subs1)

    # 2. Chọn 2 môn: Toán học và Vật lí
    # Cấp thêm vé để test
    inv = db_session.query(StreakInventory).filter(StreakInventory.student_id == student.id).first()
    inv.quiz_tickets = 5
    db_session.commit()

    res2 = client.post("/api/quiz/start", json={"student_id": student.id, "selected_subjects": ["Toán học", "Vật lí"]})
    assert res2.status_code == 200
    q_subs2 = [q["subject"] for q in res2.json()["package"]["questions"]]
    assert len(q_subs2) == 3
    assert "Toán học" in q_subs2
    assert "Vật lí" in q_subs2

def test_teacher_quiz_injection_and_analytics(db_session, client):
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
