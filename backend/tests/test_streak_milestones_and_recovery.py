import pytest
from datetime import date, timedelta
from app.models import FlowerState, MoodType, StreakInventory, Student, FlowerStatus, Badge, StudentBadge
from app.services.garden_service import (
    calculate_flower_state,
    evaluate_inactive_state,
    restore_student_streak,
    get_or_create_inventory,
    check_and_award_badges,
    DEFAULT_BADGES
)

def test_below_21_days_accumulates_without_wilting():
    """Dưới 21 ngày: quên điểm danh nhiều ngày vẫn được cộng dồn tích lũy để đạt 21 ngày"""
    today = date(2026, 10, 10)
    last_checkin = date(2026, 10, 5) # Nghỉ 5 ngày
    inventory = StreakInventory(
        student_id="hs_test_accum",
        freeze_shields_available=0,
        grace_passes_available=1,
        saved_streak_before_break=0
    )

    state, streak, story, shield_used, shield_msg = calculate_flower_state(
        current_state=FlowerState.TICH_CUC,
        last_checkin_date=last_checkin,
        checkin_date=today,
        consecutive_days=10,
        completion_rate=80,
        mood=MoodType.HAPPY,
        inventory=inventory
    )
    # Được cộng dồn 10 + 1 = 11 ngày, không bị phạt về 1
    assert streak == 11
    assert state == FlowerState.TICH_CUC
    assert "cộng dồn" in (shield_msg or "")

def test_above_21_days_saves_streak_for_restore():
    """Từ 21 ngày trở đi: quên điểm danh sẽ lưu lại chuỗi và hoa về trạng thái cần khôi phục"""
    today = date(2026, 10, 10)
    last_checkin = date(2026, 10, 6) # Nghỉ 4 ngày
    inventory = StreakInventory(
        student_id="hs_test_wilting",
        freeze_shields_available=0,
        grace_passes_available=1,
        saved_streak_before_break=0
    )

    state, streak, story, shield_used, shield_msg = calculate_flower_state(
        current_state=FlowerState.CHAM_HOC,
        last_checkin_date=last_checkin,
        checkin_date=today,
        consecutive_days=45,
        completion_rate=80,
        mood=MoodType.HAPPY,
        inventory=inventory
    )
    assert streak == 1
    assert inventory.saved_streak_before_break == 45

def test_streak_restore_endpoint_and_service(db_session=None):
    """Kiểm tra khôi phục chuỗi tiêu thụ 1 grace pass và phục hồi streak cũ"""
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        student_id = "hs_restore_test_unit"
        st = db.query(Student).filter(Student.id == student_id).first()
        if not st:
            st = Student(
                id=student_id,
                name="Trần Phục Hồi",
                grade="12",
                target_subject="Toán học",
                weakness="Hình học",
                long_term_goal="Đỗ đại học",
                timeframe="3 tháng"
            )
            db.add(st)
            db.commit()

        fl = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()
        if not fl:
            fl = FlowerStatus(
                student_id=student_id,
                current_state=FlowerState.THIEU_NUOC,
                consecutive_days=1,
                last_checkin_date=date.today(),
                water_drops=5
            )
            db.add(fl)
        else:
            fl.current_state = FlowerState.THIEU_NUOC
            fl.consecutive_days = 1

        inv = get_or_create_inventory(student_id=student_id, db=db)
        inv.grace_passes_available = 1
        inv.saved_streak_before_break = 60
        db.commit()

        # Thực hiện khôi phục
        success, msg, restored_streak, left, state = restore_student_streak(student_id=student_id, db=db)
        assert success is True
        assert restored_streak == 60
        assert left == 0
        assert state == FlowerState.CHAM_HOC

        # Kiểm tra huy hiệu hồi sinh chuỗi được trao
        b = db.query(StudentBadge).filter(
            StudentBadge.student_id == student_id,
            StudentBadge.badge_id == "resilient_comeback"
        ).first()
        assert b is not None
    finally:
        db.close()
