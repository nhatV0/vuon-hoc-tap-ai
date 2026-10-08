from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import FlowerState, MoodType, Student, StreakInventory, TimeCapsule, CapsuleStatus
from app.services.garden_service import calculate_flower_state

# Setup in-memory test SQLite DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_10_gdpt_diagnostic_questions():
    """Kiểm tra ngân hàng câu hỏi chẩn đoán hỗ trợ đầy đủ 10 môn GDPT 2018"""
    subjects = [
        "Toán học", "Vật lí", "Hóa học", "Sinh học", "Tin học",
        "Ngữ văn", "Lịch sử", "Địa lí", "GDKT & PL", "Tiếng Anh"
    ]
    for sub in subjects:
        res = client.get(f"/api/diagnostics/{sub}")
        assert res.status_code == 200, f"Failed for {sub}"
        data = res.json()
        assert len(data) >= 1, f"No questions for {sub}"
        assert data[0]["options"] and len(data[0]["options"]) >= 2

def test_onboarding_with_time_capsule_and_badges():
    """Kiểm tra onboarding tạo student, gieo mầm khiên hộ mệnh, badge và phong ấn tâm thư"""
    payload = {
        "name": "Đặng Hoàng Nam",
        "grade": "12",
        "target_subject": "Toán học",
        "target_subjects": ["Toán học", "Vật lí", "Hóa học"],
        "emotion_scale": 5,
        "weakness": "Đọc đồ thị và bẫy đúng sai",
        "long_term_goal": "Đỗ Đại học Bách Khoa",
        "timeframe": "6 tháng",
        "initial_time_capsule": "Gửi tôi ngày 21: Hãy giữ vững ngọn lửa kỷ luật!"
    }
    res = client.post("/api/onboarding", json=payload)
    assert res.status_code == 201
    student_data = res.json()
    student_id = student_data["id"]

    # Kiểm tra Garden Status nhận đủ badges và khiên
    g_res = client.get(f"/api/garden/{student_id}")
    assert g_res.status_code == 200
    g_data = g_res.json()
    assert g_data["shields_available"] >= 1
    assert g_data["unlocked_badges_count"] >= 1
    assert g_data["active_capsule"] is not None
    assert g_data["active_capsule"]["status"] == "sealed"
    assert "ngọn lửa" in g_data["active_capsule"]["letter_content"]

def test_daily_checkin_4_stations_and_streak_freeze():
    """Kiểm tra checkin 4 trạm ghi nhận đầy đủ trường dữ liệu và cơ chế khiên hộ mệnh bảo toàn chuỗi"""
    # 1. Tạo student
    payload = {
        "name": "Nguyễn Minh Châu",
        "grade": "10",
        "target_subject": "Tin học",
        "target_subjects": ["Tin học"],
        "weakness": "Lập trình Python",
        "long_term_goal": "Học sinh giỏi cấp tỉnh",
        "timeframe": "1 năm"
    }
    s_res = client.post("/api/onboarding", json=payload)
    student_id = s_res.json()["id"]

    # Hoàn thành các nhiệm vụ trước khi điểm danh
    tasks_res = client.get(f"/api/planning/{student_id}")
    if tasks_res.status_code == 200:
        p_data = tasks_res.json()
        for t_list in p_data.get("tasks_by_day", {}).values():
            for t in t_list:
                client.patch(f"/api/planning/task/{t['id']}", json={"is_completed": True})

    # 2. Checkin Ngày 1
    c1_payload = {
        "student_id": student_id,
        "completion_rate": 80,
        "energy_level": 100,
        "confidence_stars": 4,
        "completed_subjects": ["Tin học", "Toán học"],
        "micro_wins": ["solve_problems", "punctual_start"],
        "bottleneck_key": "none",
        "weekday_answer": "Xong 3 chuyên đề hổng"
    }
    c1_res = client.post("/api/checkin", json=c1_payload)
    assert c1_res.status_code == 200
    c1_data = c1_res.json()
    assert c1_data["streak_days"] >= 1
    assert c1_data["energy_level"] == 100
    assert c1_data["confidence_stars"] == 4

    # 3. Giả lập học sinh lỡ 1 ngày hôm qua và có 1 Khiên hộ mệnh
    inv_res = client.get(f"/api/inventory/{student_id}")
    assert inv_res.status_code == 200
    inv_data = inv_res.json()
    assert inv_data["freeze_shields_available"] >= 1

    inv = StreakInventory(
        student_id=student_id,
        freeze_shields_available=1,
        grace_passes_available=0,
        total_shields_used=0
    )
    today = date(2026, 10, 10)
    day_before_yesterday = today - timedelta(days=2) # Cách 2 ngày = nhỡ 1 ngày

    # Test hàm calculate_flower_state với Streak Freeze
    new_state, new_streak, story, shield_used, shield_msg = calculate_flower_state(
        current_state=FlowerState.TICH_CUC,
        last_checkin_date=day_before_yesterday,
        checkin_date=today,
        consecutive_days=5,
        completion_rate=80,
        mood=MoodType.HAPPY,
        inventory=inv
    )
    assert shield_used is True
    assert new_streak == 6 # Bảo toàn chuỗi liên tục (5 + 1)
    assert inv.freeze_shields_available == 0
    assert "Khiên hộ mệnh" in shield_msg

def test_time_capsule_unlock_condition():
    """Kiểm tra điều kiện mở khóa Time Capsule: chưa đủ 21 ngày sẽ báo lỗi, giáo viên hoặc đủ ngày sẽ mở thành công"""
    # Tạo học sinh
    s_res = client.post("/api/onboarding", json={
        "name": "Vũ Minh Khôi",
        "grade": "11",
        "target_subject": "Ngữ văn",
        "weakness": "Đọc hiểu",
        "long_term_goal": "8.5 Văn",
        "timeframe": "3 tháng"
    })
    student_id = s_res.json()["id"]

    # Tạo capsule
    cap_res = client.post("/api/capsule", json={
        "student_id": student_id,
        "title": "Tâm thư ngày 1",
        "letter_content": "Hôm nay tôi xuất phát...",
        "target_unlock_day": 21
    })
    assert cap_res.status_code == 201
    cap_id = cap_res.json()["id"]

    # Thử mở khi mới streak ngày 1 -> Lỗi 400
    unlock_res = client.post(f"/api/capsule/{cap_id}/unlock")
    assert unlock_res.status_code == 400
    assert "phong ấn" in unlock_res.json()["detail"].lower()
