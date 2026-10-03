from datetime import date, timedelta
from typing import Tuple
from app.models import FlowerState, MoodType

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

def calculate_flower_state(
    current_state: FlowerState,
    last_checkin_date: date,
    checkin_date: date,
    consecutive_days: int,
    completion_rate: int,
    mood: MoodType
) -> Tuple[FlowerState, int, str]:
    """
    Quy tắc chuyển đổi trạng thái hoa và chuỗi ngày (Gamification State Machine):
    1. Kiểm tra khoảng cách ngày kể từ lần check-in trước:
       - checkin_date == last_checkin_date: Cùng ngày (cập nhật tiến độ trong ngày)
       - checkin_date == last_checkin_date + 1: Check-in liên tục ngày tiếp theo -> streak + 1
       - 1 < khoảng cách <= 2 ngày: Lỡ 1 ngày, streak giữ hoặc giảm về 1
       - 3 <= khoảng cách <= 7 ngày: Trạng thái thiếu nước trước đó, nay check-in trở lại
       - khoảng cách >= 30 ngày: Héo khô, reset mầm mới
    2. Xác định trạng thái sau khi check-in hôm nay:
       - Nếu streak >= 7 ngày: CHAM_HOC
       - Nếu hoàn thành >= 70% hoặc mood = HAPPY/NEUTRAL: TICH_CUC
       - Nếu vắng mặt lâu vừa quay lại: Hồi phục về TICH_CUC với lời chào mừng
    """
    delta_days = (checkin_date - last_checkin_date).days

    if delta_days <= 0:
        new_consecutive = max(1, consecutive_days)
    elif delta_days == 1:
        new_consecutive = consecutive_days + 1
    elif delta_days == 2:
        # Nhỡ 1 ngày nhẹ nhàng
        new_consecutive = max(1, consecutive_days // 2 + 1)
    else:
        # Bị gián đoạn lâu, bắt đầu chuỗi mới
        new_consecutive = 1

    # Phân định trạng thái hoa sau khi nhận nước tưới từ check-in
    if new_consecutive >= 7:
        new_state = FlowerState.CHAM_HOC
    else:
        new_state = FlowerState.TICH_CUC

    story = STORY_MESSAGES[new_state]
    return new_state, new_consecutive, story

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
