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

    # Đến ngày 7: Kích hoạt Hoa Chăm Học
    day_7 = base_date + timedelta(days=6)
    state_7, streak_7, story_7 = calculate_flower_state(
        current_state=state,
        last_checkin_date=day_7 - timedelta(days=1),
        checkin_date=day_7,
        consecutive_days=6,
        completion_rate=90,
        mood=MoodType.HAPPY
    )
    assert streak_7 == 7
    assert state_7 == FlowerState.CHAM_HOC
    assert "hào quang" in story_7

def test_water_deficiency_and_recovery():
    """Kiểm tra hoa thiếu nước và phục hồi khi checkin trở lại"""
    today = date(2026, 10, 10)
    last_active = today - timedelta(days=5) # 5 ngày không checkin

    # Khi vào xem khu vườn chưa checkin: Đánh giá thiếu nước
    state, story = evaluate_inactive_state(last_active, today)
    assert state == FlowerState.THIEU_NUOC
    assert "khát nước" in story

    # Khi học sinh check-in trở lại: Hồi sinh hoa tích cực
    recovered_state, new_streak, new_story = calculate_flower_state(
        current_state=state,
        last_checkin_date=last_active,
        checkin_date=today,
        consecutive_days=4,
        completion_rate=75,
        mood=MoodType.NEUTRAL
    )
    assert recovered_state == FlowerState.TICH_CUC
    assert new_streak == 1 # Bắt đầu chuỗi mới sau khi vắng mặt
