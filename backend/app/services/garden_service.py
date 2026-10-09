from datetime import date, datetime, timedelta, timezone
from typing import Tuple, List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import FlowerState, MoodType, Badge, BadgeCategory, StudentBadge, StreakInventory, TimeCapsule, CapsuleStatus, FlowerStatus
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
        "id": "stage_0_seed",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🌰 Hạt Mầm Khởi Nguyên",
        "description": "0 ngày - Hạt mầm tiềm năng được chọn để chuẩn bị gieo mầm hy vọng.",
        "icon": "🌰",
        "required_streak": 0
    },
    {
        "id": "stage_3_sowing",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🪴 Đất Ấm Gieo Mầm",
        "description": "3 ngày - Hạt giống snug trong chậu đất ẩm, tiếp nhận ánh mặt trời đầu tiên.",
        "icon": "🪴",
        "required_streak": 3
    },
    {
        "id": "stage_7_sprout",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🌱 Mầm Xanh Vươn Lên",
        "description": "7 ngày - Đâm chồi nảy lộc, hai lá mầm đầu tiên phá đất vươn lên đón sáng.",
        "icon": "🌱",
        "required_streak": 7
    },
    {
        "id": "stage_14_seedling",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🌿 Cây Con Sức Sống",
        "description": "14 ngày - Thân cây mảnh mai xanh biếc, hấp thụ ánh sáng với nhịp thở vững vàng.",
        "icon": "🌿",
        "required_streak": 14
    },
    {
        "id": "stage_21_mature",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🌻 Cây Lớn Rực Rỡ (Thoát Trọng Lực)",
        "description": "21 ngày - Cây lớn hoàn chỉnh, bung nở cánh hoa với nụ cười ấm áp, thoát khỏi trọng lực trì hoãn!",
        "icon": "🌻",
        "required_streak": 21
    },
    {
        "id": "aura_lvl1_white",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "⚪ Hào Quang Bạch Ngọc (Bậc 1)",
        "description": "30 ngày - Cây bậc 1 phát hào quang trắng tinh khiết, tâm trí thanh tịnh kiên cường.",
        "icon": "⚪",
        "required_streak": 30
    },
    {
        "id": "aura_lvl2_blue",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🔵 Hào Quang Lam Ngọc (Bậc 2)",
        "description": "50 ngày - Cây bậc 2 tỏa sắc lam trí tuệ, sự điềm tĩnh và phong độ học tập ổn định.",
        "icon": "🔵",
        "required_streak": 50
    },
    {
        "id": "aura_lvl3_aqua",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "💧 Hào Quang Thủy Triều (Bậc 3)",
        "description": "100 ngày - Cây bậc 3 ngọc biển mát lành, dòng chảy kiến thức xuyên suốt không cản bước.",
        "icon": "💧",
        "required_streak": 100
    },
    {
        "id": "aura_lvl4_purple",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🟣 Hào Quang Tinh Vân Tím (Bậc 4)",
        "description": "200 ngày - Cây bậc 4 tím huyền bí, thói quen tự học đã khắc sâu vào bản sắc vĩnh cửu.",
        "icon": "🟣",
        "required_streak": 200
    },
    {
        "id": "aura_lvl5_red",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🔴 Hào Quang Hồng Ngọc Lửa (Bậc 5)",
        "description": "300 ngày - Cây bậc 5 đỏ rực lửa, ý chí kiên định và ngọn lửa đam mê bất khả chiến bại.",
        "icon": "🔴",
        "required_streak": 300
    },
    {
        "id": "aura_lvl6_gold",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🟡 Hào Quang Kim Thái Dương (Bậc 6)",
        "description": "450 ngày - Cây bậc 6 vàng kim rực rỡ như vầng thái dương ban trưa, uy nghiêm đỉnh cao.",
        "icon": "🟡",
        "required_streak": 450
    },
    {
        "id": "aura_lvl7_rainbow",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "🌈 Hào Quang Cực Quang Ngũ Sắc (Bậc 7)",
        "description": "700 ngày - Cây bậc 7 cực quang cầu vồng chuyển màu mềm mại, kiệt tác kỷ luật học đường.",
        "icon": "🌈",
        "required_streak": 700
    },
    {
        "id": "aura_lvl8_divine",
        "category": BadgeCategory.STREAK_MILESTONE,
        "title": "✨ Hào Quang Thiên Giới Tối Thượng",
        "description": "900 ngày - Cây tối thượng, ánh sáng kim cương thần thánh khai sáng mọi thử thách tri thức!",
        "icon": "✨",
        "required_streak": 900
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
        "title": "🌟 Hồi Sinh Chuỗi Bền Bỉ",
        "description": "Khôi phục chuỗi thành công, tiếp tục hành trình nuôi dưỡng cây hoa.",
        "icon": "🌟",
        "required_streak": 0
    }
]

JOURNEY_MILESTONES = [
    {"day": 0, "title": "Hạt Mầm", "reward_text": "01 Lượt Khôi Phục Chuỗi ngay khi bắt đầu", "quote": "Hành trình vạn dặm bắt đầu từ một hạt giống nhỏ."},
    {"day": 3, "title": "Gieo Vào Chậu", "reward_text": "Cây bắt rễ đất ấm + Danh hiệu Đất Ấm", "quote": "3 ngày bền bỉ chứng minh bạn đã sẵn sàng bắt rễ vào mảnh đất kỷ luật."},
    {"day": 7, "title": "Nảy Mầm", "reward_text": "2 lá mầm đầu tiên vươn lên + Danh hiệu Mầm Xanh", "quote": "7 ngày! Mầm xanh đã vượt qua lớp đất dày để đón nhận ánh mặt trời."},
    {"day": 14, "title": "Lên Cây Con", "reward_text": "Cây con xanh biếc + Danh hiệu Cây Con", "quote": "14 ngày kiên định, thói quen bắt đầu bén rễ sâu sắc vào nếp sống của bạn."},
    {"day": 21, "title": "Cây Lớn Rực Rỡ", "reward_text": "Cây trưởng thành nở rộ + Mở Khóa Tâm Thư Ngày 1 + Danh hiệu Cây Lớn", "quote": "21 ngày! Bạn đã chính thức vượt thoát lực cản quán tính của sự trì hoãn!"},
    {"day": 30, "title": "Cây Bậc 1 (Bạch Ngọc)", "reward_text": "Hào quang trắng ngọc trai + Tặng thêm 01 Lượt Khôi Phục Chuỗi", "quote": "30 ngày kiên định! Một tháng trọn vẹn thắp sáng tâm trí thanh khiết."},
    {"day": 50, "title": "Cây Bậc 2 (Lam Ngọc)", "reward_text": "Hào quang xanh lam trí tuệ + Tặng 01 Lượt Khôi Phục", "quote": "50 ngày! Sắc lam của sự điềm tĩnh và trí tuệ vững vàng."},
    {"day": 100, "title": "Cây Bậc 3 (Thủy Triều)", "reward_text": "Hào quang ngọc biển mát lành + Tặng 01 Lượt Khôi Phục", "quote": "100 ngày! Dòng chảy tự học như dòng sông lớn không gì ngăn cản được."},
    {"day": 200, "title": "Cây Bậc 4 (Tinh Vân Tím)", "reward_text": "Hào quang tím huyền bí + Tặng 01 Lượt Khôi Phục", "quote": "200 ngày! Kỷ luật tự giác đã trở thành một phần bản sắc không thể tách rời."},
    {"day": 300, "title": "Cây Bậc 5 (Hồng Ngọc Lửa)", "reward_text": "Hào quang đỏ rực lửa + Tặng 01 Lượt Khôi Phục", "quote": "300 ngày! Ngọn lửa đam mê và ý chí học tập bất khả chiến bại."},
    {"day": 450, "title": "Cây Bậc 6 (Kim Thái Dương)", "reward_text": "Hào quang vàng kim chói lọi + Tặng 01 Lượt Khôi Phục", "quote": "450 ngày! Vầng thái dương rực rỡ soi sáng con đường chinh phục ước mơ."},
    {"day": 700, "title": "Cây Bậc 7 (Cực Quang Ngũ Sắc)", "reward_text": "Hào quang cực quang cầu vồng + Tặng 01 Lượt Khôi Phục", "quote": "700 ngày! Kiệt tác của lòng kiên trì và vẻ đẹp của sự nỗ lực không ngừng."},
    {"day": 900, "title": "Cây Tối Thượng (Thiên Giới)", "reward_text": "Hào quang kim cương tối thượng + Vương miện Thần Thánh", "quote": "900 ngày huyền thoại! Bạn đã chạm đến đỉnh cao tối thượng của sự tự học!"}
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
        # Vừa trồng (mới bắt đầu) có ngay 1 lượt khôi phục chuỗi (grace_passes_available = 1)
        inventory = StreakInventory(
            student_id=student_id,
            freeze_shields_available=1,
            grace_passes_available=1,
            restores_claimed_count=0,
            saved_streak_before_break=0,
            total_shields_used=0,
            quiz_tickets=1,
            holy_water=0,
            conquest_streak=0,
            last_daily_ticket_date=date.today(),
            holy_water_claimed_count=0,
            quiz_stage_milestones_claimed=[]
        )
        db.add(inventory)
        db.commit()
        db.refresh(inventory)
    else:
        updated = False
        if inventory.grace_passes_available is None:
            inventory.grace_passes_available = 1
            updated = True
        if inventory.quiz_tickets is None:
            inventory.quiz_tickets = 1
            updated = True
        if inventory.holy_water is None:
            inventory.holy_water = 0
            updated = True
        if inventory.conquest_streak is None:
            inventory.conquest_streak = 0
            updated = True
        if inventory.holy_water_claimed_count is None:
            inventory.holy_water_claimed_count = 0
            updated = True
        if inventory.quiz_stage_milestones_claimed is None:
            inventory.quiz_stage_milestones_claimed = []
            updated = True
        if updated:
            db.commit()
            db.refresh(inventory)
    return inventory
def check_and_award_badges(student_id: str, streak: int, micro_wins: Optional[List[str]], db: Session) -> List[str]:
    """Trao các huy hiệu thỏa mãn điều kiện và trả về danh sách ID huy hiệu mới mở"""
    ensure_badges_seeded(db)
    existing_student_badges = {sb.badge_id for sb in db.query(StudentBadge).filter(StudentBadge.student_id == student_id).all()}
    new_unlocked = []

    streak_map = {
        0: "stage_0_seed",
        3: "stage_3_sowing",
        7: "stage_7_sprout",
        14: "stage_14_seedling",
        21: "stage_21_mature",
        30: "aura_lvl1_white",
        50: "aura_lvl2_blue",
        100: "aura_lvl3_aqua",
        200: "aura_lvl4_purple",
        300: "aura_lvl5_red",
        450: "aura_lvl6_gold",
        700: "aura_lvl7_rainbow",
        900: "aura_lvl8_divine"
    }

    for req_streak, b_id in streak_map.items():
        if streak >= req_streak and b_id not in existing_student_badges:
            sb = StudentBadge(student_id=student_id, badge_id=b_id)
            db.add(sb)
            existing_student_badges.add(b_id)
            new_unlocked.append(b_id)

    # Huy hiệu hành vi micro_wins
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
    Quy tắc chuyển đổi trạng thái hoa và chuỗi ngày:
    1. Nếu quên chuỗi mà streak < 21 ngày:
       - Không bị reset về 0/1 mà được CỘNG DỒN các ngày check-in tích lũy để người dùng đủ 21 ngày thoát trọng lực.
       - Hoa luôn giữ trạng thái tích cực hoặc mầm xanh vươn lên.
    2. Nếu quên chuỗi từ 21 ngày trở đi (streak >= 21):
       - Hoa chuyển qua CÂY HÉO (THIEU_NUOC).
       - Lưu lại chuỗi streak cũ vào inventory.saved_streak_before_break để người dùng có thể dùng lượt Khôi Phục Chuỗi!
       - Nếu còn Khiên Hộ Mệnh (chỉ nhỡ 1 ngày hôm qua delta_days == 2): tự động dùng khiên bảo toàn chuỗi.
       - Nếu không dùng khiên: streak tạm về 1 hoặc chờ khôi phục, trạng thái cây héo nhắc nhở yêu thương.
    """
    delta_days = (checkin_date - last_checkin_date).days
    shield_used = False
    shield_message = None

    if delta_days <= 0:
        # Nếu đã điểm danh trong ngày hôm nay: không thể tăng thêm chuỗi trong cùng ngày 24h
        new_consecutive = consecutive_days
        shield_message = "Hôm nay bạn đã thắp sáng chuỗi rồi! Hãy giữ vững ngọn lửa và tiếp tục sau 0h AM nhé."
    elif delta_days == 1:
        # Sang ngày hôm sau (sau 0h AM): chuỗi thắp sáng tăng thêm 1 ngày
        new_consecutive = consecutive_days + 1
        shield_message = f"Chúc mừng bạn đã hoàn thành nhiệm vụ và thắp sáng chuỗi Ngày {new_consecutive}!"
    elif delta_days == 2:
        # Nhỡ 1 ngày hôm qua
        if inventory and inventory.freeze_shields_available > 0:
            inventory.freeze_shields_available -= 1
            inventory.total_shields_used += 1
            inventory.last_shield_used_at = datetime.now(timezone.utc)
            shield_used = True
            shield_message = "Khiên hộ mệnh đã bảo vệ chuỗi cho bạn ngày hôm qua!"
            new_consecutive = consecutive_days + 1
        else:
            if consecutive_days < 21:
                # Dưới 21 ngày: Quên chuỗi sẽ được CỘNG DỒN để đủ 21 ngày thoát trọng lực
                new_consecutive = consecutive_days + 1
                shield_message = "Dưới 21 ngày, chuỗi được cộng dồn tiếp tục để giúp bạn đạt mốc 21 ngày!"
            else:
                # Từ 21 ngày trở đi: Chuỗi bị tắt, chuyển qua cây héo, lưu lại chuỗi để khôi phục bằng Nước Thánh
                if inventory:
                    inventory.saved_streak_before_break = max(inventory.saved_streak_before_break or 0, consecutive_days)
                new_consecutive = 1
                shield_message = f"Chuỗi {consecutive_days} ngày đã tắt do lỡ hẹn! Bạn có thể dùng Nước Thánh để khôi phục lại."
    else:
        # Nghỉ nhiều ngày (delta_days >= 3)
        if consecutive_days < 21:
            # Dưới 21 ngày: Cộng dồn không phạt mất chuỗi
            new_consecutive = consecutive_days + 1
            shield_message = "Chào mừng bạn quay lại! Chuỗi được cộng dồn để giúp bạn vững vàng đạt 21 ngày."
        else:
            # Từ 21 ngày trở đi: Chuỗi bị tắt, lưu streak để phục hồi
            if inventory:
                inventory.saved_streak_before_break = max(inventory.saved_streak_before_break or 0, consecutive_days)
            new_consecutive = 1
            shield_message = f"Chuỗi {consecutive_days} ngày đã tắt! Hãy dùng Nước Thánh để thắp sáng lại nhé."

    # Cập nhật số lượt khôi phục chuỗi: Mỗi mốc 30 ngày streak được nhận 1 lượt khôi phục
    if inventory and new_consecutive >= 30:
        milestones_30 = new_consecutive // 30
        current_claimed = inventory.restores_claimed_count or 0
        if milestones_30 > current_claimed:
            new_passes = milestones_30 - current_claimed
            inventory.grace_passes_available = (inventory.grace_passes_available or 0) + new_passes
            inventory.restores_claimed_count = milestones_30
    # Đạt mốc 21 ngày (hoặc streak cao) kích hoạt CHAM_HOC (Hoa nở rộ đón nắng / Hào quang)
    if new_consecutive >= 21:
        new_state = FlowerState.CHAM_HOC
    else:
        new_state = FlowerState.TICH_CUC

    story = STORY_MESSAGES[new_state]
    if inventory is None:
        return new_state, new_consecutive, story
    return new_state, new_consecutive, story, shield_used, shield_message

def evaluate_inactive_state(last_checkin_date: date, today: date, consecutive_days: Optional[int] = None) -> Tuple[FlowerState, str]:
    """
    Đánh giá trạng thái khi người dùng vào xem vườn mà chưa check-in trong ngày:
    - Nếu nghỉ >= 30 ngày: Mùa đông HEO_KHO
    - Nếu consecutive_days < 21 ngày: giữ TICH_CUC để cộng dồn không phạt
    - Nếu consecutive_days >= 21 ngày và qua 0h ngày tiếp theo mà không làm nhiệm vụ (delta_days >= 2): chuỗi bị tắt, hoa héo THIEU_NUOC
    - Ngược lại khi vắng mặt >= 3 ngày: THIEU_NUOC
    """
    delta_days = (today - last_checkin_date).days
    if delta_days >= 30:
        state = FlowerState.HEO_KHO
    elif consecutive_days is not None and consecutive_days < 21:
        state = FlowerState.TICH_CUC
    elif consecutive_days is not None and consecutive_days >= 21 and delta_days >= 2:
        state = FlowerState.THIEU_NUOC
    elif delta_days >= 3:
        state = FlowerState.THIEU_NUOC
    else:
        state = FlowerState.TICH_CUC
    return state, STORY_MESSAGES[state]
def restore_student_streak(student_id: str, db: Session) -> Tuple[bool, str, int, int, FlowerState]:
    """
    Khôi phục chuỗi học tập khi cây bị héo hoặc đứt chuỗi (tiêu thụ 1 Grace Pass)
    """
    inventory = get_or_create_inventory(student_id=student_id, db=db)
    flower = db.query(FlowerStatus).filter(FlowerStatus.student_id == student_id).first()

    if not flower:
        return False, "Không tìm thấy dữ liệu hoa của học sinh.", 0, inventory.grace_passes_available or 0, FlowerState.TICH_CUC

    if (inventory.grace_passes_available or 0) <= 0:
        return False, "Bạn đã hết lượt khôi phục chuỗi. Mỗi 30 ngày kiên trì sẽ được nhận thêm 1 lượt!", flower.consecutive_days, 0, flower.current_state

    target_streak = inventory.saved_streak_before_break or 0
    if target_streak <= flower.consecutive_days:
        # Không có chuỗi cao hơn để khôi phục
        return False, "Chuỗi của bạn hiện đang ở mức cao nhất, không cần khôi phục.", flower.consecutive_days, inventory.grace_passes_available or 0, flower.current_state

    # Tiêu thụ 1 lượt khôi phục
    inventory.grace_passes_available -= 1
    inventory.last_restore_used_at = datetime.now(timezone.utc)
    flower.consecutive_days = target_streak
    flower.current_state = FlowerState.CHAM_HOC if target_streak >= 21 else FlowerState.TICH_CUC
    flower.story_message = f"🌟 Chuỗi {target_streak} ngày đã được khôi phục thành công! Chào mừng ngọn lửa kiên trì trở lại!"

    # Trao huy hiệu hồi sinh chuỗi
    resilient_badge = db.query(Badge).filter(Badge.id == "resilient_comeback").first()
    if resilient_badge:
        existing = db.query(StudentBadge).filter(
            StudentBadge.student_id == student_id,
            StudentBadge.badge_id == "resilient_comeback"
        ).first()
        if not existing:
            db.add(StudentBadge(student_id=student_id, badge_id="resilient_comeback"))

    db.commit()
    db.refresh(flower)
    db.refresh(inventory)

    return True, f"Khôi phục thành công chuỗi {target_streak} ngày!", target_streak, inventory.grace_passes_available or 0, flower.current_state
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
