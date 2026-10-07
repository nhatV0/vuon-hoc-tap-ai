from datetime import date, datetime, timedelta, timezone
from typing import Tuple, List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import FlowerState, MoodType, Badge, BadgeCategory, StudentBadge, StreakInventory, TimeCapsule, CapsuleStatus
STORY_MESSAGES = {
    FlowerState.CHAM_HOC: (
        "🌻 Bông hoa hướng dương của bạn đang nở rộ rực rỡ và tỏa ánh hào quang ấm áp! "
        "Sự kiên trì hơn 7 ngày qua là minh chứng cho nội lực tuyệt vời bên trong bạn. "
        "Hãy hít một hơi thật sâu và mỉm cười tự hào về bản thân nhé!"
    ),
    FlowerState.TICH_CUC: (
        "🌱 Cây hoa đang vươn mình khỏe khoắn đón những tia nắng sớm. "
        "Từng bước nhỏ vững chãi mỗi ngày đang tưới mát cho khu vườn tri thức của bạn."
    ),
    FlowerState.THIEU_NUOC: (
        "💧 Cành lá đang rủ nhẹ một chút vì khát nước. "
        "Khu vườn nhớ bạn lắm, nhưng không sao đâu, chỉ cần một giọt nước hôm nay từ việc mở tập ra 5 phút, "
        "cây sẽ lại tươi tắn mỉm cười ngay thôi!"
    ),
    FlowerState.HEO_KHO: (
        "❄️ Mùa đông của khu vườn đã qua. Mặt đất đang ấp ủ một hạt mầm mới tinh khôi, "
        "sẵn sàng đâm chồi khi bạn gieo xuống giọt nước đầu tiên. "
        "Không có sự bắt đầu lại nào là muộn màng, hành trình mới bắt đầu từ khoảnh khắc này."
    )
}
DEFAULT_BADGES = [
    {
        "id": "pioneer_seed",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🌱 Mầm Sống Tiên Phong",
        "description": "Hoàn thành phản chiếu ngày đầu tiên, vượt qua lực cản quán tính ban đầu.",
        "icon": "🌱",
        "required_streak": 1
    },
    {
        "id": "flame_3",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "⚡ Bệ Phóng Quán Tính",
        "description": "3 ngày liên tiếp thắp sáng ngọn lửa học tập bền bỉ.",
        "icon": "⚡",
        "required_streak": 3
    },
    {
        "id": "diamond_week",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "💎 Tuần Lễ Kim Cương",
        "description": "7 ngày liên tục! Bạn đã vượt lên trên 80% người dễ bỏ cuộc.",
        "icon": "💎",
        "required_streak": 7
    },
    {
        "id": "double_digits",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🔥 Chiến Binh Bền Bỉ",
        "description": "Cán mốc 10 ngày hai chữ số - Kỷ luật trở thành sự lựa chọn tự nhiên.",
        "icon": "🔥",
        "required_streak": 10
    },
    {
        "id": "gravity_half",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🛡️ Nửa Vòng Quán Tính",
        "description": "14 ngày kiên định, bộ não bắt đầu tái cấu trúc nếp nhăn thói quen mới.",
        "icon": "🛡️",
        "required_streak": 14
    },
    {
        "id": "gravity_escaped",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "👑 Người Vượt Trọng Lực",
        "description": "21 ngày! Đánh bại sự trì hoãn nguyên bản, thói quen đã là một phần của bạn.",
        "icon": "👑",
        "required_streak": 21
    },
    {
        "id": "night_owl",
        "category": BadgeCategory.ACADEMIC_BEHAVIOR,
        "title": "🦉 Cú Đêm Kỷ Luật",
        "description": "Hoàn thành check-in chủ động không để việc dồn ứ đến nửa đêm.",
        "icon": "🦉",
        "required_streak": 0
    },
    {
        "id": "barrier_crusher",
        "category": BadgeCategory.ACADEMIC_BEHAVIOR,
        "title": "🎯 Chiến Thần Diệt Rào Cản",
        "description": "Tự tay giải quyết bài tập khó mà không cần phụ thuộc vào sách giải mẫu.",
        "icon": "🎯",
        "required_streak": 0
    },
    {
        "id": "resilient_comeback",
        "category": BadgeCategory.RESILIENCE,
        "title": "🌈 Lội Ngược Dòng",
        "description": "Dù có những ngày năng lượng cạn kiệt, bạn vẫn trở lại bàn học mạnh mẽ.",
        "icon": "🌈",
        "required_streak": 0
    }
]

JOURNEY_MILESTONES = [
    {
        "day": 1,
        "title": "Bệ Phóng Rực Lửa",
        "reward_text": "Huy hiệu Tiên Phong + 01 Khiên Hộ Mệnh + Viết tâm thư ngày 1",
        "quote": "Bước chân đầu tiên không đưa bạn đến đích, nhưng kéo bạn ra khỏi nơi bạn đã giậm chân suốt thời gian qua."
    },
    {
        "day": 3,
        "title": "Vượt Qua Quán Tính",
        "reward_text": "Tặng thêm 01 Khiên Hộ Mệnh dự phòng + Danh hiệu Bệ Phóng",
        "quote": "3 ngày không tạo nên một thiên tài, nhưng đủ để chứng minh bạn không phải là người nói suông."
    },
    {
        "day": 7,
        "title": "Tuần Lễ Kim Cương",
        "reward_text": "Huy hiệu Kim Cương + Mở khóa Bảng Phong Thần + Lời nhắn động viên đặc biệt",
        "quote": "Hầu hết mọi người bỏ cuộc vào ngày thứ 4. Bạn đã đi qua 7 ngày. Bạn đã chính thức vượt lên trên số đông."
    },
    {
        "day": 10,
        "title": "Hai Chữ Số Đầu Tiên",
        "reward_text": "Danh hiệu Chiến Binh Bền Bỉ + Hiệu ứng ngọn lửa cấp độ 2",
        "quote": "Con số 10 tròn trĩnh là bằng chứng rõ nhất: Kỷ luật không phải là cảm xúc, kỷ luật là sự lựa chọn."
    },
    {
        "day": 14,
        "title": "Nửa Vòng Quán Tính",
        "reward_text": "Huy hiệu Chiến Hạm Vượt Sóng + Tặng 01 Vé Hồi Sinh Chuỗi Khẩn Cấp (Grace Pass)",
        "quote": "Bộ não của bạn đang bắt đầu tái cấu trúc các nếp nhăn thói quen mới. Đừng dừng lại khi động cơ đang nóng!"
    },
    {
        "day": 21,
        "title": "VƯỢT TRỌNG LỰC (HABIT BORN)",
        "reward_text": "Vương miện Vượt Trọng Lực + MỞ KHÓA TÂM THƯ NGÀY 1 + Vinh danh",
        "quote": "21 ngày! Bạn đã chính thức đánh bại kẻ thù lớn nhất đời mình: Sự trì hoãn nguyên bản. Thói quen này giờ đã là một phần của bạn."
    }
]

def ensure_badges_seeded(db: Session):
    """Khởi tạo danh sách badges mặc định nếu chưa có"""
    existing_count = db.query(Badge).count()
    if existing_count < len(DEFAULT_BADGES):
        for b_data in DEFAULT_BADGES:
            b = db.query(Badge).filter(Badge.id == b_data["id"]).first()
            if not b:
                new_b = Badge(
                    id=b_data["id"],
                    category=b_data["category"],
                    title=b_data["title"],
                    description=b_data["description"],
                    icon=b_data["icon"],
                    required_streak=b_data["required_streak"]
                )
                db.add(new_b)
        db.commit()

def get_or_create_inventory(student_id: str, db: Session) -> StreakInventory:
    inventory = db.query(StreakInventory).filter(StreakInventory.student_id == student_id).first()
    if not inventory:
        inventory = StreakInventory(
            student_id=student_id,
            freeze_shields_available=1,
            grace_passes_available=0,
            total_shields_used=0
        )
        db.add(inventory)
        db.commit()
        db.refresh(inventory)
    return inventory

def check_and_award_badges(student_id: str, streak: int, micro_wins: Optional[List[str]], db: Session) -> List[str]:
    """Trao các huy hiệu thỏa mãn điều kiện và trả về danh sách ID huy hiệu mới mở"""
    ensure_badges_seeded(db)
    existing_student_badges = {sb.badge_id for sb in db.query(StudentBadge).filter(StudentBadge.student_id == student_id).all()}
    new_unlocked = []

    streak_map = {
        1: "pioneer_seed",
        3: "flame_3",
        7: "diamond_week",
        10: "double_digits",
        14: "gravity_half",
        21: "gravity_escaped"
    }

    for req_streak, b_id in streak_map.items():
        if streak >= req_streak and b_id not in existing_student_badges:
            sb = StudentBadge(student_id=student_id, badge_id=b_id)
            db.add(sb)
            existing_student_badges.add(b_id)
            new_unlocked.append(b_id)

    # Kiểm tra huy hiệu hành vi micro_wins
    if micro_wins and "solve_problems" in micro_wins and "barrier_crusher" not in existing_student_badges:
        sb = StudentBadge(student_id=student_id, badge_id="barrier_crusher")
        db.add(sb)
        new_unlocked.append("barrier_crusher")

    if new_unlocked:
        db.commit()

    return new_unlocked

def calculate_flower_state(
    current_state: FlowerState,
    last_checkin_date: date,
    checkin_date: date,
    consecutive_days: int,
    completion_rate: int,
    mood: MoodType,
    inventory: Optional[StreakInventory] = None,
    legacy_tuple: bool = False
):
    """
    Quy tắc chuyển đổi trạng thái hoa và chuỗi ngày tích hợp Khiên Hộ Mệnh (Streak Freeze):
    - Khoảng cách delta_days == 2 (bỏ lỡ 1 ngày hôm qua):
      Nếu còn khiên (freeze_shields_available > 0): Tự động tiêu thụ 1 khiên, bảo toàn streak!
    """
    delta_days = (checkin_date - last_checkin_date).days
    shield_used = False
    shield_message = None

    if delta_days <= 0:
        new_consecutive = max(1, consecutive_days)
    elif delta_days == 1:
        new_consecutive = consecutive_days + 1
    elif delta_days == 2:
        if inventory and inventory.freeze_shields_available > 0:
            inventory.freeze_shields_available -= 1
            inventory.total_shields_used += 1
            inventory.last_shield_used_at = datetime.now(timezone.utc)
            shield_used = True
            shield_message = "Hôm qua hẳn bạn đã có một ngày rất bận rộn. Khiên hộ mệnh đã giữ lại ngọn lửa cho bạn. Tối nay cùng tiếp tục nhé!"
            new_consecutive = consecutive_days + 1
        else:
            # Nhỡ 1 ngày không có khiên
            new_consecutive = max(1, consecutive_days // 2 + 1)
    else:
        # Bị gián đoạn lâu
        new_consecutive = 1

    # Phân định trạng thái hoa sau khi nhận nước tưới từ check-in
    if new_consecutive >= 7:
        new_state = FlowerState.CHAM_HOC
    else:
        new_state = FlowerState.TICH_CUC

    story = STORY_MESSAGES[new_state]
    if inventory is None:
        return new_state, new_consecutive, story
    return new_state, new_consecutive, story, shield_used, shield_message
def evaluate_inactive_state(last_checkin_date: date, today: date) -> Tuple[FlowerState, str]:
    """
    Đánh giá trạng thái khi người dùng vào xem vườn mà chưa check-in trong nhiều ngày
    """
    delta_days = (today - last_checkin_date).days
    if delta_days >= 30:
        state = FlowerState.HEO_KHO
    elif delta_days >= 3:
        state = FlowerState.THIEU_NUOC
    else:
        state = FlowerState.TICH_CUC
    return state, STORY_MESSAGES[state]

def get_journey_milestones_status(current_streak: int) -> List[Dict[str, Any]]:
    results = []
    for m in JOURNEY_MILESTONES:
        results.append({
            "day": m["day"],
            "title": m["title"],
            "reward_text": m["reward_text"],
            "quote": m["quote"],
            "is_reached": current_streak >= m["day"]
        })
    return results
