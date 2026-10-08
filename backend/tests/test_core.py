import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import FlowerState, MoodType
from app.services.garden_service import calculate_flower_state, evaluate_inactive_state

import os
if os.path.exists("./test_garden.db"):
    try:
        os.remove("./test_garden.db")
    except Exception:
        pass

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_garden.db"
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.drop_all(bind=test_engine)
Base.metadata.create_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_garden_state_machine_streak():
    # Kiểm tra streak 21 ngày kích hoạt CHAM_HOC (Cây Lớn Rực Rỡ)
    today = date(2026, 10, 22)
    yesterday = today - timedelta(days=1)
    
    state, streak, story = calculate_flower_state(
        current_state=FlowerState.TICH_CUC,
        last_checkin_date=yesterday,
        checkin_date=today,
        consecutive_days=20,
        completion_rate=80,
        mood=MoodType.HAPPY
    )
    assert streak == 21
    assert state == FlowerState.CHAM_HOC
    assert "hào quang" in story
def test_garden_inactive_evaluation():
    # Kiểm tra vắng mặt 4 ngày chuyển THIEU_NUOC
    today = date(2026, 10, 10)
    last_date = date(2026, 10, 6)
    state, story = evaluate_inactive_state(last_date, today)
    assert state == FlowerState.THIEU_NUOC

    # Kiểm tra vắng mặt 35 ngày chuyển HEO_KHO
    last_date_old = date(2026, 9, 1)
    state_heo, story_heo = evaluate_inactive_state(last_date_old, today)
    assert state_heo == FlowerState.HEO_KHO
    assert "Mùa đông" in story_heo

def test_onboarding_api_and_flow():
    # Test POST /api/onboarding
    payload = {
        "name": "Nguyễn Mai Anh",
        "grade": "11",
        "target_subject": "Hóa học",
        "weakness": "Cân bằng phương trình oxi hóa khử và este",
        "long_term_goal": "Đạt 9.0 điểm tổng kết và thi học sinh giỏi",
        "timeframe": "3 tháng",
        "learning_style": "visual"
    }
    res = client.post("/api/onboarding", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert len(data["roadmap"]["milestones"]) == 3
    assert len(data["roadmap"]["initial_daily_tasks"]) == 5
    assert data["flower_state"] == "tich_cuc"

    student_id = data["id"]

    # Test POST /api/checkin
    checkin_payload = {
        "student_id": student_id,
        "completion_rate": 85,
        "subject_difficulty": "Chưa nhớ hết hóa trị một số kim loại",
        "action_reflection": "Đã làm xong 2 bài tập mẫu",
        "mood": "happy"
    }
    res_checkin = client.post("/api/checkin", json=checkin_payload)
    assert res_checkin.status_code == 200
    checkin_data = res_checkin.json()
    assert checkin_data["streak_days"] >= 1
    assert "Mai Anh" in checkin_data["ai_feedback"]

    # Test GET /api/garden/{student_id}
    res_garden = client.get(f"/api/garden/{student_id}")
    assert res_garden.status_code == 200
    garden_data = res_garden.json()
    assert garden_data["student_name"] == "Nguyễn Mai Anh"
    assert garden_data["water_drops"] >= 1

    # Test POST /api/garden/{student_id}/water
    res_water = client.post(f"/api/garden/{student_id}/water")
    assert res_water.status_code == 200
    water_data = res_water.json()
    assert water_data["success"] is True

    # Test GET /api/teacher/dashboard
    res_teacher = client.get("/api/teacher/dashboard")
    assert res_teacher.status_code == 200
    teacher_data = res_teacher.json()
    assert teacher_data["total_students"] >= 1
