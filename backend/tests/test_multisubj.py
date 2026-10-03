import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import FlowerState, MoodType

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_multisubj.db"
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_multi_subject_and_7_point_emotion():
    # 1. Test Onboarding với nhiều môn học và cảm xúc mức 2 (Chán nản/Áp lực)
    payload = {
        "name": "Trần Khánh Vy",
        "grade": "11",
        "target_subjects": ["Toán học", "Hóa học", "Vật lý"],
        "emotion_scale": 2, # Khá chán nản
        "weakness": "Phương trình hữu cơ và hình không gian",
        "long_term_goal": "Đạt 8.5+ khối A",
        "timeframe": "3 tháng",
        "learning_style": "visual",
        "diagnostic_answers": {
            "math_blocker": "formula_forget",
            "chem_blocker": "organic"
        }
    }

    res = client.post("/api/onboarding", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert len(data["target_subjects"]) == 3
    assert data["emotion_scale"] == 2
    # Vì emotion_scale = 2, thông điệp AI phải mang tính xoa dịu/trị liệu tâm lý
    assert "ngột ngạt" in data["roadmap"]["encouraging_message"] or "áp lực" in data["roadmap"]["encouraging_message"]
    # Các nhiệm vụ đầu tiên phải là siêu nhỏ
    assert data["roadmap"]["initial_daily_tasks"][0]["duration_minutes"] <= 5

    student_id = data["id"]

    # 2. Test Planning Page hỗ trợ đa môn
    res_plan = client.get(f"/api/planning/{student_id}")
    assert res_plan.status_code == 200
    plan_data = res_plan.json()
    assert plan_data["emotion_scale"] == 2
    assert len(plan_data["target_subjects"]) == 3

    # 3. Test Checkin với thang đo cảm xúc 7 mức độ
    checkin_payload = {
        "student_id": student_id,
        "completion_rate": 60,
        "subject_difficulty": "Khó nhớ công thức",
        "action_reflection": "Đã xem lại 1 ví dụ",
        "mood": "tired",
        "emotion_scale": 2
    }
    res_checkin = client.post("/api/checkin", json=checkin_payload)
    assert res_checkin.status_code == 200
    checkin_data = res_checkin.json()
    assert checkin_data["emotion_scale"] == 2

    # 4. Test Teacher Dashboard nhận diện học sinh có cảm xúc tiêu cực mức 2
    res_teacher = client.get("/api/teacher/dashboard")
    assert res_teacher.status_code == 200
    teacher_data = res_teacher.json()
    alert_ids = [s["student_id"] for s in teacher_data["students_needing_attention"]]
    assert student_id in alert_ids
