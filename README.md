# Sunflower Mentor & Emotional Garden (Trợ lý Hoa Hướng Dương & Khu Vườn Cảm Xúc)

Hệ thống web hỗ trợ học tập cá nhân hóa và chăm sóc sức khỏe tinh thần học đường dành cho học sinh THPT và giáo viên.

## 🌻 Tính Năng Nổi Bật

1. **Khảo sát cá nhân hóa lộ trình (Onboarding)**:
   - Thu thập thông tin, khối lớp, môn học mục tiêu, điểm yếu và phong cách học tập.
   - Trợ lý AI thiết kế lộ trình 3 chặng mốc (Milestones) và 5 nhiệm vụ vi mô hằng ngày 5-10 phút (Micro-learning) giúp giảm áp lực.
2. **Điểm danh cảm xúc & tiến độ 5 phút (Daily Check-in)**:
   - 3 câu hỏi trắc nghiệm nhanh đánh giá ngày qua.
   - Bộ chọn trạng thái cảm xúc (Vui vẻ, Bình thường, Căng thẳng, Mệt mỏi) với giao diện tối giản, mềm mại.
   - "Trợ lý Hoa Hướng Dương" gửi phản hồi nâng đỡ tinh thần thấu cảm, không phán xét.
3. **Khu vườn cảm xúc (Gamification Garden)**:
   - Cây hoa hướng dương vẽ bằng SVG tương tác theo State Machine:
     - `Hoa Chăm Học`: Check-in liên tục $\ge 7$ ngày (hoa nở rộ, phát hào quang).
     - `Hoa Tích Cực`: Hoàn thành tốt, cây khỏe khoắn vươn cao đón nắng.
     - `Hoa Thiếu Nước`: Nghỉ 3-7 ngày, hoa rủ nhẹ kèm thông điệp nhắc nhở ân cần.
     - `Hạt Mầm Tái Sinh`: Nghỉ $\ge 30$ ngày, gieo lại mầm xanh mới không áp lực.
   - Tính năng tưới nước thủ công tích lũy giọt nước mỗi lần check-in.
4. **Bảng giám sát dành cho giáo viên (Teacher Dashboard)**:
   - Theo dõi tổng số học sinh, danh sách học sinh có dấu hiệu quá tải hoặc vắng mặt kéo dài.
   - Gợi ý lời nói và hành động tâm lý học đường phù hợp để thầy cô hỗ trợ kịp thời.

5. **Hệ thống đa dạng loài hoa & Bộ tài nguyên Multimedia (Đang mở rộng)**:
   - Mở rộng thêm 6 loài hoa chữa lành: Hoa Hướng Dương, Hoa Sen, Bồ Công Anh, Oải Hương, Xương Rồng, Cẩm Tú Cầu.
   - Toàn bộ đặc tả tạo ảnh AI, chuyển động (Motion/Lottie), âm thanh SFX và nhạc nền BGM xem chi tiết tại [`ASSETS_CREATION_GUIDE.md`](./ASSETS_CREATION_GUIDE.md).
## 🚀 Khởi Chạy Dự Án

### Backend (FastAPI + Python 3.14 + SQLite)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- Swagger API Docs: http://127.0.0.1:8000/docs
- Chạy kiểm thử: `python -m pytest tests/test_core.py -v`

### Frontend (Next.js 14 + Tailwind CSS)
```bash
cd frontend
npm install
npm run build
npm run start
```
- Ứng dụng chính: http://localhost:3000
- Khảo sát học sinh: http://localhost:3000/onboarding
- Bảng giáo viên: http://localhost:3000/teacher
