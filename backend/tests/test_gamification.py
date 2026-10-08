import pytest
from datetime import date, timedelta
from app.models import FlowerState, MoodType
from app.services.garden_service import calculate_flower_state, evaluate_inactive_state

def test_streak_calculation_consecutive_days():
    """Kiểm tra streak tăng liên tục qua các ngày"""
    base_date = date(2026, 10, 1)
    
    # Ngày 1: Mới tạo
    state, streak, story = calculate_flower_state(
        current_state=FlowerState.TICH_CUC,
        last_checkin_date=base_date,
        checkin_date=base_date,
        consecutive_days=1,
        completion_rate=100,
        mood=MoodType.HAPPY
    )
    assert streak == 1
    assert state == FlowerState.TICH_CUC

    # Ngày 2: Checkin liên tiếp ngày hôm sau
    next_day = base_date + timedelta(days=1)
    state, streak, story = calculate_flower_state(
        current_state=state,
        last_checkin_date=base_date,
        checkin_date=next_day,
        consecutive_days=streak,
        completion_rate=80,
        mood=MoodType.HAPPY
    )
    assert streak == 2

    # Đến ngày 21: Kích hoạt Hoa Chăm Học (Cây Lớn Rực Rỡ)
    day_21 = base_date + timedelta(days=20)
    state_21, streak_21, story_21 = calculate_flower_state(
        current_state=state,
        last_checkin_date=day_21 - timedelta(days=1),
        checkin_date=day_21,
        consecutive_days=20,
        completion_rate=90,
        mood=MoodType.HAPPY
    )
    assert streak_21 == 21
    assert state_21 == FlowerState.CHAM_HOC
    assert "hào quang" in story_21
def test_water_deficiency_and_recovery():
    """Kiểm tra hoa thiếu nước và phục hồi khi checkin trở lại"""
    today = date(2026, 10, 10)
    last_active = today - timedelta(days=5) # 5 ngày không checkin

    # Khi vào xem khu vườn chưa checkin: Đánh giá thiếu nước
    state, story = evaluate_inactive_state(last_active, today)
    assert state == FlowerState.THIEU_NUOC
    assert "khát nước" in story

    # 1. Khi học sinh streak < 21 ngày check-in trở lại: Được cộng dồn chuỗi (4 + 1 = 5)
    recovered_state, new_streak, new_story = calculate_flower_state(
        current_state=state,
        last_checkin_date=last_active,
        checkin_date=today,
        consecutive_days=4,
        completion_rate=75,
        mood=MoodType.NEUTRAL
    )
    assert recovered_state == FlowerState.TICH_CUC
    assert new_streak == 5 # Cộng dồn để đủ 21 ngày

    # 2. Khi học sinh streak >= 21 ngày vắng mặt: Chuyển về 1 để chờ khôi phục
    recovered_mature, mature_streak, _ = calculate_flower_state(
        current_state=FlowerState.THIEU_NUOC,
        last_checkin_date=last_active,
        checkin_date=today,
        consecutive_days=35,
        completion_rate=75,
        mood=MoodType.NEUTRAL
    )
    assert mature_streak == 1
