import pytest
from datetime import date
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models import User, UserRole, Student, FlowerStatus, FlowerState
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_admin_auth.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Tạo sẵn Admin
        admin = User(
            id="usr_admin_test",
            email="admin_test",
            name="Admin Quản Trị",
            password_hash="fake:hash",
            role=UserRole.ADMIN,
            assigned_classes=["ALL"]
        )
        db.add(admin)
        db.commit()
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

def test_forbid_teacher_self_registration(client):
    """Giáo viên không được phép tự tạo tài khoản qua /api/auth/register."""
    payload = {
        "name": "Thầy Giáo Tự Đăng Ký",
        "email": "teacher_hack@example.com",
        "password": "password123",
        "role": "teacher"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 403
    assert "không thể tự đăng ký" in res.json()["detail"]

def test_admin_create_teacher_and_assign_classes(client, db_session):
    """Admin tạo mới giáo viên và phân lớp 12A1, 12A2."""
    admin_token = "usr_admin_test:faketoken"
    payload = {
        "name": "Cô Nguyễn Thị Mai",
        "email": "cô_mai_toan",
        "password": "password123",
        "assigned_classes": ["12A1", "12A2"]
    }
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.post("/api/admin/teachers", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Cô Nguyễn Thị Mai"
    assert "12A1" in data["assigned_classes"]
    assert "12A2" in data["assigned_classes"]

def test_admin_create_student_and_assign_class(client, db_session):
    """Admin tạo học sinh và gán vào lớp 12A1."""
    admin_token = "usr_admin_test:faketoken"
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "name": "Học Sinh Lớp 12A1",
        "grade": "12",
        "classroom": "12A1",
        "target_subject": "Toán học"
    }
    res = client.post("/api/admin/students", json=payload, headers=headers)
    assert res.status_code == 201
    assert res.json()["classroom"] == "12A1"

def test_teacher_dashboard_filtered_by_assigned_class(client, db_session):
    """Giáo viên chỉ nhìn thấy học sinh thuộc lớp được phân công."""
    # Tạo thêm 1 học sinh ở lớp 10C1
    s_other = Student(
        id="hs_other_10c1",
        name="Học Sinh Lớp 10C1",
        grade="10",
        classroom="10C1",
        target_subject="Văn",
        weakness="Lười học",
        long_term_goal="Đỗ tốt nghiệp",
        timeframe="5 tháng"
    )
    db_session.add(s_other)
    db_session.commit()

    # Giáo viên được gán lớp 12A1
    teacher_user = User(
        id="usr_tch_mai",
        email="mai_teacher",
        name="Cô Mai",
        password_hash="fake:hash",
        role=UserRole.TEACHER,
        assigned_classes=["12A1"]
    )
    db_session.add(teacher_user)
    db_session.commit()

    teacher_token = "usr_tch_mai:faketoken"
    headers = {"Authorization": f"Bearer {teacher_token}"}
    res = client.get("/api/teacher/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    
    # Đảm bảo không nhìn thấy học sinh lớp 10C1
    student_names = [s["student_name"] for s in data["all_students"]]
    assert "Học Sinh Lớp 10C1" not in student_names
    assert "Học Sinh Lớp 12A1" in student_names
