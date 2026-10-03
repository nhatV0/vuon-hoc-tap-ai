import json
import httpx
from typing import Dict, Any, List
from app.config import settings
from app.schemas import StudentCreate, CheckinCreate, RoadmapResponse, MilestoneItem, DailyTaskItem
from app.models import Student, MoodType

EMOTION_DESCRIPTIONS = {
    1: "Rất ghét / Cảm thấy vô cùng áp lực và sợ hãi",
    2: "Khá chán nản / Mất phương hướng và hay né tránh",
    3: "Hơi lo âu / Kiến thức còn mơ hồ, lúng túng",
    4: "Bình thường / Chưa có nhiều cảm xúc hứng thú",
    5: "Khá ổn / Tương đối hiểu bài và sẵn sàng cố gắng",
    6: "Hứng thú / Tự tin và muốn nâng cao năng lực",
    7: "Rất thích / Đầy đam mê và khao khát chinh phục đỉnh cao"
}

def generate_fallback_roadmap(data: StudentCreate) -> RoadmapResponse:
    """
    Sinh lộ trình vi mô cá nhân hóa sâu theo:
    1. Danh sách các môn học đã chọn (target_subjects)
    2. Thang đo cảm xúc 7 mức độ (1: Rất ghét/Rất tệ -> 7: Rất thích/Rất tốt)
    3. Các rào cản nhận thức cụ thể trong diagnostic_answers
    """
    subjects = data.target_subjects if (data.target_subjects and len(data.target_subjects) > 0) else [data.target_subject or "Toán học"]
    primary_subject = subjects[0]
    name = data.name or "Bạn học nhỏ"
    scale = data.emotion_scale if data.emotion_scale in range(1, 8) else 4
    diag = data.diagnostic_answers or {}

    weakness = data.weakness or f"Rào cản tiếp thu ở môn {', '.join(subjects)}"
    goal = data.long_term_goal or f"Tiến bộ rõ rệt và tự tin làm bài thi {', '.join(subjects)}"

    # Phân loại chiến lược sư phạm dựa trên Thang Đo Cảm Xúc 7 Cấp Độ
    if scale in [1, 2]:
        # Chiến lược: "Hồi Phục Tâm Lý & Gỡ Bỏ Nỗi Sợ" (Healing & Low-Barrier Entry)
        encouragement = (
            f"Thương gửi {name}! Thầy cô và Trợ lý Hoa Hướng Dương thấu hiểu rằng việc đối diện với môn {', '.join(subjects)} "
            f"đang mang lại cảm giác ngột ngạt và áp lực lớn cho bạn. Hãy thở phào nhẹ nhõm: lộ trình này được thiết kế ĐẶC BIỆT "
            f"với các bước siêu nhỏ chỉ 3–5 phút. Chúng ta không chạy đua điểm số, mà bắt đầu bằng việc dọn dẹp nỗi sợ và tìm lại "
            f"sự bình an trong từng trang sách nhé!"
        )
        milestones = [
            MilestoneItem(
                stage=1,
                title=f"Chặng 1: Tháo gỡ nỗi sợ & Tìm lại cảm giác an tâm ({primary_subject})",
                duration="2 tuần đầu",
                goal=f"Xóa bỏ cảm giác áp lực trước môn {', '.join(subjects)}. Chỉ tập trung vào những ví dụ cực kỳ cơ bản và 1 câu hỏi mỗi ngày.",
                key_actions=[
                    f"Mỗi tối chỉ mở sách môn {primary_subject} đúng 5 phút, giải quyết 1 câu hỏi mẫu dễ nhất",
                    "Ghi nhận cảm xúc và tự thưởng cho mình một khoảng nghỉ ngơi sau khi xong",
                    "Đánh dấu những điểm còn mơ hồ để hỏi bạn bè hoặc nhờ Trợ lý hướng dẫn nhẹ nhàng"
                ]
            ),
            MilestoneItem(
                stage=2,
                title=f"Chặng 2: Tích lũy chiến thắng nhỏ (Small Wins) & Xây dựng thói quen",
                duration="Tuần 3 - Tuần 6",
                goal=f"Tạo nhịp độ học 10 phút không ngắt quãng giữa các môn {', '.join(subjects)} mà không thấy mệt mỏi.",
                key_actions=[
                    f"Áp dụng tóm tắt sơ đồ 1 trang cho {subjects[-1] if len(subjects) > 1 else primary_subject}",
                    "Giải thành công 2 bài tập vận dụng căn bản mỗi buổi học",
                    "Theo dõi chậu hoa xanh tươi để cảm nhận sự nỗ lực được ghi nhận"
                ]
            ),
            MilestoneItem(
                stage=3,
                title=f"Chặng 3: Tự tin bước vào phòng thi & Đạt mục tiêu {goal}",
                duration="Tuần 7 trở đi",
                goal=f"Vững vàng tâm lý, làm chủ các dạng bài quen thuộc và tự tin đạt {goal}.",
                key_actions=[
                    "Luyện giải các đề thi thử với tinh thần thoải mái, không bấm giờ áp lực",
                    "Tổng hợp các lỗi sai vào sổ tay 'Bài học kinh nghiệm'",
                    "Duy trì giấc ngủ ngon và tinh thần lạc quan trước kỳ kiểm tra"
                ]
            )
        ]
    elif scale in [3, 4]:
        # Chiến lược: "Khơi Thông Nền Tảng & Gieo Mầm Hứng Thú"
        encouragement = (
            f"Chào {name}! Thầy cô và Trợ lý Hoa Hướng Dương nhận thấy bạn đang ở trạng thái tích lũy "
            f"đối với {', '.join(subjects)}. Đây là thời điểm tuyệt vời nhất để biến những kiến thức còn lấn cấn thành "
            f"phản xạ tự nhiên. Mỗi nhiệm vụ 7–10 phút sẽ là từng viên gạch vững chắc xây nên thành công của bạn!"
        )
        milestones = [
            MilestoneItem(
                stage=1,
                title=f"Chặng 1: Rà soát & Lấp đầy lỗ hổng nền tảng",
                duration="Tuần 1 - Tuần 3",
                goal=f"Làm chủ toàn bộ định nghĩa, công thức trọng tâm của {', '.join(subjects)} liên quan đến {weakness}.",
                key_actions=[
                    f"Hệ thống hóa sổ tay công thức cốt lõi môn {primary_subject}",
                    "Làm bài tập nhận biết - thông hiểu với độ chính xác trên 85%",
                    "Tập thói quen phân tích đề bài trước khi bắt tay vào giải"
                ]
            ),
            MilestoneItem(
                stage=2,
                title=f"Chặng 2: Rèn luyện kỹ năng phân tích & Tăng tốc độ giải",
                duration="Tuần 4 - Tuần 7",
                goal=f"Xử lý gọn gàng các dạng bài vận dụng vừa sức ở {', '.join(subjects)}.",
                key_actions=[
                    "Thực hành giải đề theo kỹ thuật Pomodoro 15-20 phút",
                    "Phân loại các bẫy thường gặp trong đề thi",
                    "Học xen kẽ các môn để não bộ luôn tỉnh táo và tiếp thu nhanh"
                ]
            ),
            MilestoneItem(
                stage=3,
                title=f"Chặng 3: Bứt phá điểm số & Hiện thực hóa {goal}",
                duration="Tuần 8 trở đi",
                goal=f"Đạt độ nhạy bén cao trong phòng thi, tự tin chinh phục mốc {goal}.",
                key_actions=[
                    "Giải đề thi thử hoàn chỉnh với thời gian chuẩn",
                    "Rà soát tối ưu hóa các bước biến đổi để tiết kiệm thời gian",
                    "Giữ vững phong độ chăm học để chậu hoa nở rộ hào quang"
                ]
            )
        ]
    else:
        # Chiến lược: "Bứt Phá Đỉnh Cao & Thăng Hoa Đam Mê" (scale 5, 6, 7)
        encouragement = (
            f"Năng lượng và tình yêu tuyệt vời của {name} dành cho môn {', '.join(subjects)} là hạt mầm vô giá! "
            f"Với tinh thần tích cực này, Trợ lý đã tối ưu hóa lộ trình để bạn thỏa sức đào sâu bản chất, nâng cao tốc độ "
            f"và bứt phá trở thành học sinh tiêu biểu đạt {goal}!"
        )
        milestones = [
            MilestoneItem(
                stage=1,
                title=f"Chặng 1: Tối ưu hóa phản xạ & Quản trị thời gian",
                duration="Tuần 1 - Tuần 2",
                goal=f"Giải nhanh các dạng bài cơ bản môn {', '.join(subjects)} trong thời gian ngắn nhất với độ chính xác 100%.",
                key_actions=[
                    f"Rèn luyện kỹ năng đọc đề lướt và nhận dạng phương pháp giải ngay trong 10 giây",
                    "Thực hành phương pháp giải nhanh và bấm máy tính bỏ túi tối ưu",
                    "Chia sẻ phương pháp học hay cùng các bạn trong nhóm học tập"
                ]
            ),
            MilestoneItem(
                stage=2,
                title=f"Chặng 2: Chinh phục bài toán phân loại & Vận dụng cao",
                duration="Tuần 3 - Tuần 6",
                goal=f"Giải quyết các câu hỏi phân loại 8.5+ đến 9.5+ môn {', '.join(subjects)}.",
                key_actions=[
                    "Thử thách bản thân với 1 bài toán khó đa chủ đề mỗi ngày",
                    "Tự sáng tạo các bài toán tương tự hoặc tìm nhiều cách giải khác nhau",
                    "Đúc kết sơ đồ tư duy chuyên sâu liên kết liên môn"
                ]
            ),
            MilestoneItem(
                stage=3,
                title=f"Chặng 3: Làm chủ đề thi thực tế & Chạm mốc xuất sắc {goal}",
                duration="Tuần 7 trở đi",
                goal=f"Hoàn thiện kỹ năng phòng thi đỉnh cao, kiểm soát tuyệt đối sai sót để đạt {goal}.",
                key_actions=[
                    "Giải đề thi học sinh giỏi hoặc đề thi thử của các trường chuyên",
                    "Rèn luyện tâm lý thi đấu điềm tĩnh và phán đoán sắc sảo",
                    "Tỏa sáng rực rỡ như một đóa hướng dương tràn đầy năng lượng tích cực"
                ]
            )
        ]

    # Sinh danh sách 5 Daily Tasks vi mô phân bổ đều cho các môn đã chọn
    initial_tasks: List[DailyTaskItem] = []
    
    # Task 1: Môn thứ nhất (hoặc điểm rào cản chính)
    initial_tasks.append(
        DailyTaskItem(
            id=1,
            subject=primary_subject,
            title=f"Đọc 1 trang tóm tắt công thức then chốt môn {primary_subject}",
            duration_minutes=5 if scale <= 2 else 10,
            category="Lý thuyết",
            tip="Chỉ cần đọc lướt để quen mặt chữ, không cần ép bản thân nhớ hết ngay."
        )
    )

    # Task 2: Môn thứ hai (nếu có) hoặc bài tập mẫu môn chính
    second_subject = subjects[1] if len(subjects) > 1 else primary_subject
    initial_tasks.append(
        DailyTaskItem(
            id=2,
            subject=second_subject,
            title=f"Xem 1 ví dụ giải mẫu điểm 8+ môn {second_subject} và chép lại bằng lời của mình",
            duration_minutes=8 if scale <= 2 else 12,
            category="Bài tập",
            tip="Viết lại theo suy nghĩ của bạn giúp não bộ ghi nhớ sâu gấp 3 lần."
        )
    )

    # Task 3: Luyện tập phản xạ
    third_subject = subjects[2] if len(subjects) > 2 else primary_subject
    initial_tasks.append(
        DailyTaskItem(
            id=3,
            subject=third_subject,
            title=f"Tự tay làm 2 câu trắc nghiệm cơ bản môn {third_subject}",
            duration_minutes=6 if scale <= 2 else 10,
            category="Ôn luyện",
            tip="Nếu gặp câu hỏi lấn cấn, hãy mỉm cười vì bạn đã tìm ra lỗ hổng để lấp đầy."
        )
    )

    # Task 4: Sơ đồ liên kết
    initial_tasks.append(
        DailyTaskItem(
            id=4,
            subject=primary_subject,
            title=f"Vẽ nhanh sơ đồ nháp (mindmap 1 trang) nối các định lý quan trọng môn {primary_subject}",
            duration_minutes=7 if scale <= 2 else 15,
            category="Lý thuyết",
            tip="Dùng bút màu hoặc các hình vẽ vui nhộn để việc học thêm tươi sáng nhé."
        )
    )

    # Task 5: Thư giãn và dọn dẹp tâm trí
    initial_tasks.append(
        DailyTaskItem(
            id=5,
            subject="Khu vườn cảm xúc",
            title="Dành 5 phút thư giãn, hít thở sâu và tưới 1 giọt nước cho chậu cây",
            duration_minutes=5,
            category="Nghỉ ngơi",
            tip="Nghỉ ngơi đúng lúc chính là bí quyết để ghi nhớ bền bỉ hơn."
        )
    )

    return RoadmapResponse(
        milestones=milestones,
        initial_daily_tasks=initial_tasks,
        encouraging_message=encouragement
    )

def generate_fallback_feedback(checkin: CheckinCreate, student: Student) -> str:
    """Tạo phản hồi chuẩn tâm lý thấu cảm khi không có LLM API key"""
    name = student.name
    rate = checkin.completion_rate
    mood = checkin.mood
    scale = checkin.emotion_scale or 4
    subj = student.target_subject

    if scale <= 2 or mood in [MoodType.STRESSED, MoodType.TIRED]:
        if rate >= 70:
            return (
                f"{name} ơi, hôm nay dù cảm thấy mệt mỏi nhưng bạn vẫn hoàn thành được {rate}% kế hoạch, "
                f"đó là một nỗ lực vô cùng đáng khâm phục! Đừng quá gồng ép bản thân nhé, hãy uống một cốc nước ấm, "
                f"nghe bản nhạc yêu thích và đi ngủ sớm để nạp lại năng lượng cho bông hoa nhỏ nhé!"
            )
        else:
            return (
                f"Thương gửi {name}, không sao cả đâu bạn nhé! Ai cũng có những ngày năng lượng chùng xuống, "
                f"và việc bạn dành thời gian vào đây điểm danh đã là một điểm sáng tuyệt vời rồi. "
                f"Hôm nay hãy gác lại bài vở một chút để nghỉ ngơi thật thoải mái nhé. "
                f"Ngày mai chúng ta sẽ cùng bắt đầu lại từ một việc thật nhỏ 5 phút thôi!"
            )
    else: # Tích cực
        if rate >= 80:
            return (
                f"Tuyệt vời lắm {name}! Năng lượng tích cực (mức {scale}/7) và con số {rate}% hoàn thành hôm nay làm sáng bừng cả khu vườn hướng dương! "
                f"Sự kiên định với môn {subj} đang từng bước đưa bạn đến gần mục tiêu lớn rồi đấy. Hãy tự khen ngợi chính mình hôm nay nhé!"
            )
        else:
            return (
                f"Chào {name}! Bạn đã làm rất tốt khi giữ vững nhịp độ hoàn thành {rate}% hôm nay. "
                f"Từng bước tiến vững chãi hơn là sự vội vã. Giữ vững tinh thần thoải mái này để tiếp tục đón ánh mặt trời ngày mai nhé!"
            )

async def call_ai_roadmap(data: StudentCreate) -> RoadmapResponse:
    """Gọi LLM (Gemini hoặc OpenAI) hoặc kích hoạt fallback cá nhân hóa sâu"""
    if settings.GEMINI_API_KEY:
        try:
            subjects_str = ", ".join(data.target_subjects if data.target_subjects else [data.target_subject or "Toán học"])
            scale_desc = EMOTION_DESCRIPTIONS.get(data.emotion_scale, "Bình thường")
            prompt = f"""
Bạn là chuyên gia thiết kế lộ trình học cá nhân hóa cho học sinh THPT.
Thông tin học sinh:
- Tên: {data.name}
- Lớp: {data.grade}
- Danh sách môn học cần học: {subjects_str}
- Thang đo cảm xúc hiện tại với việc học: {data.emotion_scale}/7 ({scale_desc})
- Điểm yếu/khó khăn: {data.weakness}
- Mục tiêu lớn: {data.long_term_goal}
- Thời hạn: {data.timeframe}

Yêu cầu sư phạm:
1. Nếu cảm xúc ở mức 1-2 (Rất ghét / sợ hãi): Các nhiệm vụ đầu tiên phải SIÊU NHỎ (3-5 phút), mang tính trị liệu tâm lý và giảm tải tối đa, không giao bài khó.
2. Nếu cảm xúc ở mức 3-4: Nhiệm vụ 7-10 phút, tập trung khơi thông nền tảng.
3. Nếu cảm xúc ở mức 5-7: Nhiệm vụ 10-15 phút, tăng tốc dạng bài phân loại.
4. Phân bổ các nhiệm vụ hằng ngày bao phủ các môn học trong danh sách: {subjects_str}.
5. Trả về định dạng JSON thuần túy (không bọc markdown) gồm các trường: milestones (3 chặng), initial_daily_tasks (5 tasks có trường subject, title, duration_minutes, category, tip), encouraging_message.
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.5}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    result_json = res.json()
                    raw_text = result_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if raw_text.startswith("```json"):
                        raw_text = raw_text[7:]
                    if raw_text.startswith("```"):
                        raw_text = raw_text[3:]
                    if raw_text.endswith("```"):
                        raw_text = raw_text[:-3]
                    parsed = json.loads(raw_text.strip())
                    return RoadmapResponse(**parsed)
        except Exception as e:
            print(f"[AI Service] Gemini call failed, falling back to rule-based engine: {e}")

    return generate_fallback_roadmap(data)

async def call_ai_mentor(checkin: CheckinCreate, student: Student) -> str:
    """Gọi LLM (Gemini) hoặc fallback cho lời nhắn nhủ thấu cảm"""
    if settings.GEMINI_API_KEY:
        try:
            prompt = f"""
Bạn là "Trợ lý Hoa Hướng Dương" – một người đồng hành tinh tế, ấm áp, thấu cảm và luôn tràn đầy năng lượng tích cực dành cho học sinh.

Thông tin báo cáo hằng ngày của học sinh:
- Tên học sinh: {student.name}
- Môn học trọng tâm: {student.target_subject}
- Tỷ lệ hoàn thành nhiệm vụ: {checkin.completion_rate}%
- Cảm xúc hằng ngày: {checkin.mood.value} (thang điểm {checkin.emotion_scale or 4}/7)
- Ghi chú/phản hồi của học sinh: "{checkin.reflection or 'Không có'}"

Nhiệm vụ của bạn:
1. Nếu học sinh hoàn thành tốt: Khen ngợi cụ thể, nhắc nhở các em tự thưởng cho bản thân.
2. Nếu học sinh gặp khó khăn, bỏ bê hoặc năng lượng thấp: Tuyệt đối không phán xét hay khiển trách. Hãy dùng lời lẽ dịu dàng, thấu hiểu, gợi ý thu nhỏ mục tiêu lại cho vừa sức hơn ("Không sao cả, hôm nay chúng ta bắt đầu lại từ một việc nhỏ nhé!").
3. Văn phong: Thân thiện, gần gũi như một người anh/chị hoặc giáo viên tâm lý học đường, xúc tích (khoảng 2-3 câu).
Chỉ trả về trực tiếp đoạn văn bản nhắn nhủ bằng tiếng Việt, không kèm định dạng markdown hay tiêu đề thừa.
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 300
                }
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    res_json = res.json()
                    text = res_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if text:
                        return text
        except Exception as e:
            print(f"[AI Service] Gemini call_ai_mentor failed, falling back: {e}")

    return generate_fallback_feedback(checkin, student)
