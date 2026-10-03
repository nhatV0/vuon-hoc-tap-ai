import json
import httpx
from typing import Dict, Any, List
from app.config import settings
from app.schemas import StudentCreate, CheckinCreate, RoadmapResponse, MilestoneItem, DailyTaskItem
from app.models import Student, MoodType

# 1. System Prompt cho Phân hệ 1 (Sinh lộ trình Onboarding)
SYSTEM_PROMPT_ROADMAP = """
Bạn là một chuyên gia thiết kế chương trình học cá nhân hóa cho học sinh phổ thông.
Hãy đóng vai trò là hàm xử lý backend nhận đầu vào là thông tin của học sinh dưới định dạng JSON:
- Tên học sinh: {student_name}
- Lớp: {grade}
- Mục tiêu lớn: {long_term_goal}
- Thời hạn: {timeframe}
- Môn học cần tập trung: {target_subject}
- Điểm yếu hiện tại: {weakness}

Nhiệm vụ của bạn:
1. Phân tích và chia mục tiêu lớn thành đúng 3 chặng nhỏ (Milestones).
2. Thiết lập gợi ý đúng 5 nhiệm vụ hằng ngày (Daily Tasks) đầu tiên phù hợp, nhẹ nhàng (mỗi task mất khoảng 5-10 phút).
3. Trả về kết quả CHỈ LÀ một chuỗi JSON thuần túy (không bọc trong markdown ```json, không kèm giải thích thừa) với cấu trúc:
{
  "milestones": [
    {
      "stage": 1,
      "title": "Chặng 1:...",
      "duration": "...",
      "goal": "...",
      "key_actions": ["...", "..."]
    },
    ...
  ],
  "initial_daily_tasks": [
    {
      "id": 1,
      "title": "...",
      "duration_minutes": 10,
      "tip": "..."
    },
    ...
  ],
  "encouraging_message": "..."
}
"""

# 2. System Prompt cho Phân hệ 3 (Trợ lý Hoa Hướng Dương)
SYSTEM_PROMPT_MENTOR = """
Bạn là "Trợ lý Hoa Hướng Dương" – một người đồng hành tinh tế, ấm áp, thấu cảm và luôn tràn đầy năng lượng tích cực dành cho học sinh.
Nhiệm vụ của bạn:
- Đọc báo cáo hằng ngày của học sinh (gồm: tiến độ hoàn thành, cảm xúc, môn học).
- Nếu học sinh hoàn thành tốt (>= 70%): Khen ngợi cụ thể sự nỗ lực, nhắc nhở các em tự thưởng một khoảng nghỉ ngơi thư giãn nhỏ.
- Nếu học sinh gặp khó khăn (< 70%) hoặc tâm trạng mệt mỏi/căng thẳng: Tuyệt đối không khiển trách hay gây áp lực. Hãy dùng lời lẽ dịu dàng, thấu hiểu, gợi ý thu nhỏ mục tiêu lại cho vừa sức hơn ("Không sao cả, hôm nay chúng ta bắt đầu lại từ một việc nhỏ 5 phút nhé!").
- Văn phong: Thân thiện, gần gũi như một người anh/chị hoặc giáo viên tâm lý học đường, xúc tích trong khoảng 2-4 câu, mang tính nâng đỡ tinh thần và tràn đầy ánh nắng.
"""

def generate_fallback_roadmap(data: StudentCreate) -> RoadmapResponse:
    """Tạo lộ trình chuẩn sư phạm phong phú khi không có LLM API key hoặc mạng offline"""
    subj = data.target_subject
    weakness = data.weakness
    goal = data.long_term_goal
    name = data.name

    milestones = [
        MilestoneItem(
            stage=1,
            title=f"Khơi thông nền tảng & Gỡ nút thắt {subj}",
            duration="Tuần 1 - Tuần 2",
            goal=f"Rà soát lại toàn bộ khái niệm cốt lõi liên quan đến {weakness} và xây dựng phản xạ giải bài cơ bản.",
            key_actions=[
                f"Lập sổ tay tóm tắt công thức trọng tâm môn {subj}",
                f"Làm lại 3 bài tập mẫu mức độ nhận biết - thông hiểu mỗi ngày",
                "Đánh dấu những chỗ còn lấn cấn để trao đổi cùng thầy cô/bạn bè"
            ]
        ),
        MilestoneItem(
            stage=2,
            title=f"Tăng tốc rèn luyện & Xử lý dạng bài vận dụng",
            duration="Tuần 3 - Tuần 6",
            goal=f"Chinh phục các dạng bài nâng cao và kiểm soát thời gian làm bài hướng đến {goal}.",
            key_actions=[
                "Thực hành giải đề theo cụm thời gian 25 phút (kỹ thuật Pomodoro)",
                f"Tự lập sơ đồ tư duy liên kết kiến thức {weakness} với các chuyên đề khác",
                "Phân tích lỗi sai và ghi chú vào bảng 'Bài học kinh nghiệm'"
            ]
        ),
        MilestoneItem(
            stage=3,
            title=f"Tự tin bứt phá & Hiện thực hóa mục tiêu",
            duration="Tuần 7 trở đi",
            goal=f"Củng cố tâm lý vững vàng, tốc độ và độ chuẩn xác để chạm mốc: {goal}.",
            key_actions=[
                "Luyện đề tổng hợp sát cấu trúc đề thi thực tế",
                "Rèn luyện kỹ năng đọc đề nhanh và phát hiện bẫy",
                "Duy trì tinh thần thoải mái, ngủ đủ giấc để trí não luôn sắc bén"
            ]
        )
    ]

    initial_tasks = [
        DailyTaskItem(
            id=1,
            title=f"Đọc lướt và gạch chân 3 từ khóa định nghĩa quan trọng trong phần {weakness}",
            duration_minutes=5,
            tip="Chỉ cần 5 phút tập trung, không cần cố gắng hiểu hết ngay lập tức."
        ),
        DailyTaskItem(
            id=2,
            title=f"Xem lại 1 ví dụ mẫu có lời giải chi tiết môn {subj} và chép lại bằng lời của mình",
            duration_minutes=10,
            tip="Viết lại theo cách hiểu của bạn là cách não bộ ghi nhớ sâu nhất."
        ),
        DailyTaskItem(
            id=3,
            title=f"Tự tay giải 2 câu trắc nghiệm/bài tập cơ bản về {weakness}",
            duration_minutes=8,
            tip="Nếu mắc kẹt, hãy xem lại gợi ý và mỉm cười vì bạn đã tìm ra chỗ cần học thêm."
        ),
        DailyTaskItem(
            id=4,
            title=f"Vẽ nhanh một sơ đồ nháp (mindmap 1 trang) nối các công thức môn {subj}",
            duration_minutes=7,
            tip="Dùng bút màu hoặc hình vẽ vui nhộn để bài học thêm sinh động nhé."
        ),
        DailyTaskItem(
            id=5,
            title="Dành 5 phút dọn dẹp bàn học và chọn 1 việc nhỏ sẽ làm vào ngày mai",
            duration_minutes=5,
            tip="Không gian gọn gàng sẽ mang lại sự nhẹ nhõm cho tâm trí của bạn."
        )
    ]

    msg = (
        f"Chào {name}! Thầy cô và Trợ lý Hoa Hướng Dương vô cùng trân trọng mục tiêu "
        f"'{goal}' của bạn. Đừng lo lắng về những bỡ ngỡ ban đầu ở phần {weakness}, "
        f"hành trình vạn dặm đều bắt đầu từ một hạt mầm nhỏ. Mỗi ngày 10 phút, bạn đang tưới nước "
        f"cho tương lai của chính mình đấy!"
    )

    return RoadmapResponse(
        milestones=milestones,
        initial_daily_tasks=initial_tasks,
        encouraging_message=msg
    )

def generate_fallback_feedback(checkin: CheckinCreate, student: Student) -> str:
    """Tạo phản hồi chuẩn tâm lý thấu cảm khi không có LLM API key"""
    name = student.name
    rate = checkin.completion_rate
    mood = checkin.mood
    subj = student.target_subject

    if mood in [MoodType.STRESSED, MoodType.TIRED]:
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
                f"Hôm nay hãy gác lại bài vở môn {subj} một chút để nghỉ ngơi thật thoải mái nhé. "
                f"Ngày mai chúng ta sẽ cùng bắt đầu lại từ một việc thật nhỏ 5 phút thôi!"
            )
    else: # HAPPY hoặc NEUTRAL
        if rate >= 80:
            return (
                f"Tuyệt vời lắm {name}! Năng lượng tích cực và con số {rate}% hoàn thành hôm nay làm sáng bừng cả khu vườn hướng dương! "
                f"Sự kiên định với môn {subj} đang từng bước đưa bạn đến gần mục tiêu lớn rồi đấy. Hãy tự khen ngợi chính mình hôm nay nhé!"
            )
        elif rate >= 50:
            return (
                f"Chào {name}! Bạn đã làm rất tốt khi giữ vững nhịp độ hoàn thành {rate}% hôm nay. "
                f"Từng bước tiến vững chãi hơn là sự vội vã. Giữ vững tinh thần thoải mái này để tiếp tục đón ánh mặt trời ngày mai nhé!"
            )
        else:
            return (
                f"Chào {name}, mỗi ngày là một trải nghiệm mới. Dù hôm nay chưa đạt hết mục tiêu đề ra, "
                f"nhưng sự hiện diện của bạn ở đây chứng tỏ bạn luôn quan tâm đến sự tiến bộ của bản thân. "
                f"Tối nay hãy thư giãn và chọn sẵn 1 nhiệm vụ siêu nhỏ cho ngày mai nhé!"
            )

async def call_ai_roadmap(data: StudentCreate) -> RoadmapResponse:
    """Gọi LLM (Gemini hoặc OpenAI) hoặc kích hoạt fallback"""
    if settings.GEMINI_API_KEY:
        try:
            prompt = SYSTEM_PROMPT_ROADMAP.format(
                student_name=data.name,
                grade=data.grade,
                long_term_goal=data.long_term_goal,
                timeframe=data.timeframe,
                target_subject=data.target_subject,
                weakness=data.weakness
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.4}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    result_json = res.json()
                    raw_text = result_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                    # Clean markdown wrappers if any
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

    # Fallback default
    return generate_fallback_roadmap(data)

async def call_ai_mentor(checkin: CheckinCreate, student: Student) -> str:
    """Gọi LLM hoặc fallback cho lời nhắn nhủ thấu cảm"""
    if settings.GEMINI_API_KEY:
        try:
            user_info = (
                f"Học sinh: {student.name}, Lớp: {student.grade}, Môn cần chú trọng: {student.target_subject}.\n"
                f"Báo cáo hôm nay:\n"
                f"- Tỷ lệ hoàn thành: {checkin.completion_rate}%\n"
                f"- Tâm trạng: {checkin.mood.value}\n"
                f"- Khó khăn gặp phải: {checkin.subject_difficulty or 'Không có'}\n"
                f"- Tự suy ngẫm: {checkin.action_reflection or 'Không có'}"
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [
                    {"parts": [{"text": SYSTEM_PROMPT_MENTOR + "\n\n" + user_info}]}
                ],
                "generationConfig": {"temperature": 0.7, "maxOutputTokens": 300}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    result_json = res.json()
                    feedback = result_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                    return feedback
        except Exception as e:
            print(f"[AI Service] Mentor LLM failed, using fallback: {e}")

    return generate_fallback_feedback(checkin, student)
