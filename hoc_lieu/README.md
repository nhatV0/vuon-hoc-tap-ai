# HƯỚNG DẪN ĐÓNG GÓP HỌC LIỆU & BỘ CÂU HỎI TRẮC NGHIỆM

Thư mục này được tạo ra để lưu trữ các tài liệu tham khảo, khung lý thuyết sư phạm và bộ câu hỏi trắc nghiệm chẩn đoán / điểm danh hằng ngày dành cho học sinh.

---

## 1. Cấu trúc thư mục

```text
hoc_lieu/
├── bo_cau_hoi/              <-- Đặt các bộ câu hỏi trắc nghiệm (Word, Excel, Markdown, JSON...)
│   ├── trac_nghiem_dau_vao/ <-- Câu hỏi chẩn đoán nhận thức phân nhánh theo môn học
│   └── trac_nghiem_hang_ngay/<-- Câu hỏi điểm danh nhanh 5 phút mỗi tối
│
└── tai_lieu_huong_dan/      <-- Tài liệu phương pháp sư phạm, tâm lý học đường, tiêu chí đánh giá
```

---

## 2. Các định dạng file hỗ trợ
Bạn có thể thả vào đây bất kỳ định dạng nào tiện lợi cho bạn:
- **Tài liệu văn bản**: `.docx`, `.pdf`, `.txt`, `.md`
- **Bảng tính**: `.xlsx`, `.csv` (thích hợp cho ngân hàng câu hỏi nhiều đáp án)
- **Dữ liệu cấu trúc**: `.json`

---

## 3. Cấu trúc gợi ý cho một bộ câu hỏi trắc nghiệm chuẩn

### A. Câu hỏi chẩn đoán đầu vào (Onboarding Diagnostics)
Mỗi câu hỏi nên gắn liền với một **rào cản nhận thức cụ thể** để AI có thể sinh nhiệm vụ khắc phục:
- **Môn học**: Toán học / Hóa học / Ngữ văn / Tiếng Anh / Vật lý / Sinh học
- **Nội dung câu hỏi**: (Ví dụ: "Khi giải bài toán este hóa, khó khăn lớn nhất của em là gì?")
- **Các lựa chọn đáp án**:
  - `A`: Chưa nhớ công thức cấu tạo
  - `B`: Chưa hiểu phương pháp bảo toàn khối lượng/nguyên tố
  - `C`: Đọc đề dài bị rối, không biết bắt đầu từ đâu
  - `D`: Thiếu thời gian làm bài kiểm tra

### B. Câu hỏi điểm danh hằng ngày (Daily Check-in)
Nên thiết kế siêu ngắn (chọn trong vòng 10–15 giây):
1. **Tiến độ**: Mức độ hoàn thành kế hoạch hôm nay (0-25%, 50%, 75%, 100%).
2. **Cảm xúc**: Thang đo tâm lý hoặc biểu cảm hôm nay.
3. **Trở ngại gặp phải**: Không hiểu bài / Mất tập trung / Quá nhiều bài tập / Tốt, không trở ngại.

---
*Mọi file bạn bỏ vào đây sẽ được AI đọc và tích hợp trực tiếp vào hệ thống sinh lộ trình học tập.*
