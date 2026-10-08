import os
import sqlite3
from datetime import date, timedelta
# Danh sách học sinh mẫu theo từng cấp độ streak để kiểm tra trực quan
SAMPLE_STUDENTS = [
    {
        "id": "hs_sample_0d",
        "name": "Nguyễn Hoàng Minh (Mầm 0 ngày)",
        "grade": "10",
        "classroom": "10A1",
        "subject": "Toán học",
        "streak": 0,
        "state": "tich_cuc",
        "water": 1,
        "story": "Hạt giống thần kỳ đang chuẩn bị gieo mầm hy vọng."
    },
    {
        "id": "hs_sample_3d",
        "name": "Lê Quỳnh Chi (Gieo chậu 3 ngày)",
        "grade": "10",
        "classroom": "10A1",
        "subject": "Tiếng Anh",
        "streak": 3,
        "state": "tich_cuc",
        "water": 3,
        "story": "Hạt mầm đã được gieo vào chậu đất ẩm, tiếp nhận ánh nắng sớm."
    },
    {
        "id": "hs_sample_7d",
        "name": "Trần Tuấn Kiệt (Nảy mầm 7 ngày)",
        "grade": "11",
        "classroom": "11A2",
        "subject": "Vật lí",
        "streak": 7,
        "state": "tich_cuc",
        "water": 7,
        "story": "Hai lá mầm đầu tiên vươn lên đón nắng rực rỡ."
    },
    {
        "id": "hs_sample_14d",
        "name": "Phạm Bảo Ngọc (Cây con 14 ngày)",
        "grade": "11",
        "classroom": "11A2",
        "subject": "Hóa học",
        "streak": 14,
        "state": "tich_cuc",
        "water": 12,
        "story": "Thân cây mảnh mai xanh tươi đầy sức sống tuổi trẻ."
    },
    {
        "id": "hs_sample_21d",
        "name": "Đặng Gia Huy (Cây lớn 21 ngày)",
        "grade": "12",
        "classroom": "12A1",
        "subject": "Toán học",
        "streak": 21,
        "state": "cham_hoc",
        "water": 20,
        "story": "Bông hoa hướng dương nở trọn vẹn, chính thức thoát khỏi trọng lực trì hoãn!"
    },
    {
        "id": "hs_sample_30d",
        "name": "Vũ Thu Thảo (Bậc 1 - Bạch Ngọc 30 ngày)",
        "grade": "12",
        "classroom": "12A1",
        "subject": "Ngữ văn",
        "streak": 30,
        "state": "cham_hoc",
        "water": 28,
        "story": "Hào quang bạch ngọc trắng tinh khiết bao quanh những cánh hoa kiên cường."
    },
    {
        "id": "hs_sample_50d",
        "name": "Bùi Đức Anh (Bậc 2 - Lam Ngọc 50 ngày)",
        "grade": "12",
        "classroom": "12A1",
        "subject": "Tin học",
        "streak": 50,
        "state": "cham_hoc",
        "water": 45,
        "story": "Sắc lam ngọc sâu thẳm của trí tuệ và sự kiên nhẫn bừng sáng."
    },
    {
        "id": "hs_sample_100d",
        "name": "Hồ Khánh Vy (Bậc 3 - Thủy Triều 100 ngày)",
        "grade": "12",
        "classroom": "12A2",
        "subject": "Sinh học",
        "streak": 100,
        "state": "cham_hoc",
        "water": 90,
        "story": "Ngọc biển mát lành xua tan mọi áp lực, dòng chảy kiến thức thông suốt."
    },
    {
        "id": "hs_sample_200d",
        "name": "Ngô Quang Hải (Bậc 4 - Tinh Vân Tím 200 ngày)",
        "grade": "12",
        "classroom": "12A2",
        "subject": "Lịch sử",
        "streak": 200,
        "state": "cham_hoc",
        "water": 180,
        "story": "Sắc tím huyền bí minh chứng cho thói quen tự học đã khắc sâu vào bản sắc."
    },
    {
        "id": "hs_sample_300d",
        "name": "Mai Thanh Tùng (Bậc 5 - Hồng Ngọc Lửa 300 ngày)",
        "grade": "12",
        "classroom": "12A3",
        "subject": "Toán học",
        "streak": 300,
        "state": "cham_hoc",
        "water": 270,
        "story": "Ngọn lửa hồng ngọc rực sáng đam mê và ý chí kiên định bất khuất."
    },
    {
        "id": "hs_sample_450d",
        "name": "Trịnh Mỹ Duyên (Bậc 6 - Kim Thái Dương 450 ngày)",
        "grade": "12",
        "classroom": "12A3",
        "subject": "Địa lí",
        "streak": 450,
        "state": "cham_hoc",
        "water": 400,
        "story": "Rực rỡ như vầng thái dương ban trưa, uy nghiêm đỉnh cao học đường."
    },
    {
        "id": "hs_sample_700d",
        "name": "Phan Hữu Phước (Bậc 7 - Cực Quang Ngũ Sắc 700 ngày)",
        "grade": "12",
        "classroom": "12A3",
        "subject": "GDKT & PL",
        "streak": 700,
        "state": "cham_hoc",
        "water": 650,
        "story": "Kiệt tác cầu vồng cực quang chuyển màu mềm mại, biểu tượng của sự nhẫn nại."
    },
    {
        "id": "hs_sample_900d",
        "name": "Đỗ Hoàng Long (Cây Tối Thượng 900 ngày)",
        "grade": "12",
        "classroom": "12A3",
        "subject": "Toán học",
        "streak": 900,
        "state": "cham_hoc",
        "water": 880,
        "story": "Ánh sáng kim cương thiên giới tối thượng khai sáng mọi đỉnh cao học vấn!"
    },
    {
        "id": "hs_sample_wilting",
        "name": "Trần Văn Héo (Cây Héo - Cần Khôi Phục 35 ngày)",
        "grade": "12",
        "classroom": "12A1",
        "subject": "Vật lí",
        "streak": 1,
        "state": "thieu_nuoc",
        "water": 5,
        "story": "Cây đang rủ lá chờ nhận nước yêu thương hoặc lượt khôi phục chuỗi 35 ngày cũ.",
        "saved_streak": 35,
        "can_restore": True
    }
]
def seed_sample_students():
    db_file = "garden.db" if os.path.exists("garden.db") else "backend/garden.db"
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()
    today_str = date.today().isoformat()
    old_date_str = (date.today() - timedelta(days=5)).isoformat()
    for s in SAMPLE_STUDENTS:
        # 1. Students table
        cur.execute("SELECT id FROM students WHERE id = ?", (s["id"],))
        exists = cur.fetchone()
        if not exists:
            cur.execute("""
                INSERT INTO students (id, name, grade, classroom, target_subject, weakness, long_term_goal, timeframe, learning_style, selected_flower, initial_password)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s["id"],
                s["name"],
                s["grade"],
                s["classroom"],
                s["subject"],
                "Hổng kiến thức nền tảng",
                "Đỗ nguyện vọng 1 Đại học",
                "3 tháng",
                "visual",
                "sunflower",
                "password123"
            ))
        else:
            cur.execute("UPDATE students SET name = ?, classroom = ? WHERE id = ?", (s["name"], s["classroom"], s["id"]))

        # 2. Flower Status
        last_dt = old_date_str if s["state"] == "thieu_nuoc" else today_str
        state_val = s["state"].upper()
        cur.execute("SELECT student_id FROM flower_status WHERE student_id = ?", (s["id"],))
        fl_exists = cur.fetchone()
        if not fl_exists:
            cur.execute("""
                INSERT INTO flower_status (student_id, current_state, consecutive_days, last_checkin_date, water_drops, story_message)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (s["id"], state_val, s["streak"], last_dt, s["water"], s["story"]))
        else:
            cur.execute("""
                UPDATE flower_status 
                SET current_state = ?, consecutive_days = ?, water_drops = ?, story_message = ?
                WHERE student_id = ?
            """, (state_val, s["streak"], s["water"], s["story"], s["id"]))

        # 3. Streak Inventories
        cur.execute("SELECT student_id FROM streak_inventories WHERE student_id = ?", (s["id"],))
        inv_exists = cur.fetchone()
        saved_streak = s.get("saved_streak", 0)
        passes = max(1, s["streak"] // 30 + 1)
        if not inv_exists:
            cur.execute("""
                INSERT INTO streak_inventories (student_id, freeze_shields_available, grace_passes_available, restores_claimed_count, saved_streak_before_break, total_shields_used)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (s["id"], 2, passes, s["streak"] // 30, saved_streak, 0))
        else:
            cur.execute("""
                UPDATE streak_inventories 
                SET grace_passes_available = ?, saved_streak_before_break = ?
                WHERE student_id = ?
            """, (passes, saved_streak, s["id"]))

    conn.commit()
    conn.close()
    print("Seed hoàn tất 14 học sinh mẫu ở mọi cấp độ chuỗi!")

if __name__ == "__main__":
    seed_sample_students()
