import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import FlowerState, MoodType, UserRole

import os
if os.path.exists("./test_upgraded.db"):
    try:
        os.remove("./test_upgraded.db")
    except Exception:
        pass

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_upgraded.db"
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

def test_auth_and_diagnostics_and_planning():
    import uuid
    test_email = f"baongoc_{uuid.uuid4().hex[:6]}@example.com"
    # 1. Test Register
    reg_payload = {
        "name": "Lê Bảo Ngọc",
        "email": test_email,
        "password": "password123",
        "role": "student"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    auth_data = res_reg.json()
    assert "token" in auth_data
    token = auth_data["token"]
    user_id = auth_data["user"]["id"]

    # 2. Test Login
    login_payload = {
        "email": test_email,
        "password": "password123"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    assert "token" in res_login.json()

    # 3. Test Diagnostics API for Mathematics
    res_diag = client.get("/api/diagnostics/Toán học")
    assert res_diag.status_code == 200
    questions = res_diag.json()
    assert len(questions) >= 2
    assert "toán" in questions[0]["question"].lower() or "đề bài" in questions[0]["options"][0]["label"].lower()

    # 4. Test Onboarding with diagnostic answers
    onboard_payload = {
        "user_id": user_id,
        "name": "Lê Bảo Ngọc",
        "grade": "11",
        "target_subject": "Toán học",
        "weakness": "Hình học không gian Oxyz",
        "long_term_goal": "Đạt 8.5+ điểm Toán kỳ 1",
        "timeframe": "3 tháng",
        "learning_style": "visual",
        "diagnostic_answers": {
            "math_blocker": "read_misunderstand",
            "math_focus_area": "geometry"
        }
    }
    res_onboard = client.post("/api/onboarding", json=onboard_payload)
    assert res_onboard.status_code == 201
    student_data = res_onboard.json()
    student_id = student_data["id"]

    # 5. Test Planning Page API
    res_plan = client.get(f"/api/planning/{student_id}")
    assert res_plan.status_code == 200
    plan_data = res_plan.json()
    assert plan_data["total_tasks"] >= 5
    assert len(plan_data["milestones"]) == 3

    # 6. Test Task completion toggle
    first_task = list(plan_data["tasks_by_day"].values())[0][0]
    task_id = first_task["id"]
    res_toggle = client.patch(f"/api/planning/task/{task_id}", json={"is_completed": True})
    assert res_toggle.status_code == 200
    assert res_toggle.json()["is_completed"] is True
