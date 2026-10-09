# Sunflower Mentor & Emotional Garden (Trợ lý Hoa Hướng Dương & Khu Vườn Cảm Xúc)

Hệ thống web hỗ trợ học tập cá nhân hóa và chăm sóc sức khỏe tinh thần học đường dành cho học sinh THPT và giáo viên.

## Tính Năng Nổi Bật

1. **Khảo sát cá nhân hóa lộ trình (Onboarding)**:
   - Thu thập thông tin, khối lớp, môn học mục tiêu, điểm yếu và phong cách học tập.
   - Trợ lý AI thiết kế lộ trình 3 chặng mốc (Milestones) và nhiệm vụ vi mô hằng ngày 5-10 phút (Micro-learning) giúp giảm áp lực.
2. **Điểm danh cảm xúc & tiến độ (Daily Check-in)**:
   - Đánh giá năng lượng (15% - 100%) và cảm xúc hằng ngày.
   - Trợ lý gửi phản hồi nâng đỡ tinh thần thấu cảm, không phán xét.
3. **Khu vườn cảm xúc (Gamification Garden)**:
   - Cây hoa tương tác theo State Machine:
     - `Hoa Chăm Học`: Check-in liên tục >= 7 ngày (hoa nở rộ, phát hào quang).
     - `Hoa Tích Cực`: Hoàn thành tốt, cây khỏe khoắn vươn cao đón nắng.
     - `Hoa Thiếu Nước`: Nghỉ 3-7 ngày, hoa rủ nhẹ kèm nhắc nhở ân cần.
     - `Hạt Mầm Tái Sinh`: Nghỉ >= 30 ngày, gieo lại mầm xanh mới không áp lực.
   - Tính năng tưới nước thủ công và tích lũy giọt nước qua đồng hồ tập trung Pomodoro.
4. **Bảng giám sát dành cho giáo viên (Teacher Dashboard)**:
   - Theo dõi tổng số học sinh, danh sách học sinh có dấu hiệu quá tải hoặc vắng mặt kéo dài.
   - Gợi ý lời nói và hành động tâm lý học đường phù hợp để thầy cô hỗ trợ kịp thời.
5. **Trắc nghiệm Vi mô Chuẩn GDPT 2018**:
   - 3 câu/ngày theo khối thi, giải thích vi mô tức thì, mở khóa Boss chuỗi 30 ngày.

## Khởi Chạy Dự Án

### Backend (Hono + TypeScript + Bun / Node + SQLite + Better Auth)
```bash
cd backend
bun install
bun run dev
```
- API Base URL: http://localhost:8000
- Chạy kiểm thử: `bun test`

### Frontend (React 18 + Vite + React Router v6 + Tailwind CSS)
```bash
cd frontend
bun install
bun run dev
```
- Ứng dụng chính: http://localhost:3000
- Khảo sát học sinh: http://localhost:3000/onboarding
- Bảng giáo viên: http://localhost:3000/teacher
