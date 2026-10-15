import { SyllabusChapter } from "@/features/garden/components/DebateTopicSelector";

export const FALLBACK_SYLLABUS_MAP: Record<string, SyllabusChapter[]> = {
  "Toán học": [
    { id: "toan-11-c6", title: "Chương 6: Hàm số mũ và hàm số lôgarit", grade: "11" },
    { id: "toan-11-c7", title: "Chương 7: Quan hệ vuông góc trong không gian", grade: "11" },
    { id: "toan-11-c8", title: "Chương 8: Các quy tắc tính xác suất", grade: "11" },
    { id: "toan-11-c9", title: "Chương 9: Đạo hàm", grade: "11" },
    { id: "toan-12-c1", title: "Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số", grade: "12" },
    { id: "toan-12-c2", title: "Chương 2: Vectơ và hệ trục tọa độ trong không gian", grade: "12" },
    { id: "toan-12-c3", title: "Chương 3: Các số đặc trưng đo mức độ phân tán mẫu ghép nhóm", grade: "12" },
    { id: "toan-12-c4", title: "Chương 4: Nguyên hàm và tích phân", grade: "12" },
    { id: "toan-12-c5", title: "Chương 5: Phương pháp tọa độ trong không gian Oxyz", grade: "12" },
    { id: "toan-12-c6", title: "Chương 6: Xác suất có điều kiện", grade: "12" }
  ],
  "Vật lí": [
    { id: "ly-11-c3", title: "Chương 3: Điện trường", grade: "11" },
    { id: "ly-11-c4", title: "Chương 4: Dòng điện. Mạch điện", grade: "11" },
    { id: "ly-12-c1", title: "Chương 1: Vật lí nhiệt", grade: "12" },
    { id: "ly-12-c2", title: "Chương 2: Khí lí tưởng", grade: "12" },
    { id: "ly-12-c3", title: "Chương 3: Từ trường", grade: "12" },
    { id: "ly-12-c4", title: "Chương 4: Vật lí hạt nhân", grade: "12" }
  ],
  "Hóa học": [
    { id: "hoa-11-c1", title: "Chương 1: Dẫn xuất halogen", grade: "11" },
    { id: "hoa-11-c2", title: "Chương 2: Alcohol", grade: "11" },
    { id: "hoa-11-c3", title: "Chương 3: Phenol", grade: "11" },
    { id: "hoa-11-c4", title: "Chương 4: Hợp chất Carbonyl (Aldehyde - Ketone)", grade: "11" },
    { id: "hoa-11-c5", title: "Chương 5: Carboxylic acid", grade: "11" },
    { id: "hoa-12-c1", title: "Chương 1: Ester - Lipid", grade: "12" },
    { id: "hoa-12-c2", title: "Chương 2: Carbohydrate", grade: "12" },
    { id: "hoa-12-c3", title: "Chương 3: Hợp chất chứa Nitrogen", grade: "12" },
    { id: "hoa-12-c4", title: "Chương 4: Polymer và vật liệu polymer", grade: "12" },
    { id: "hoa-12-c5", title: "Chương 5: Pin điện và điện phân", grade: "12" },
    { id: "hoa-12-c6", title: "Chương 6: Đại cương về kim loại", grade: "12" },
    { id: "hoa-12-c7", title: "Chương 7: Nguyên tố nhóm IA và nhóm IIA", grade: "12" },
    { id: "hoa-12-c8", title: "Chương 8: Sơ lược về kim loại chuyển tiếp và phức chất", grade: "12" }
  ],
  "Sinh học": [
    { id: "sinh-11-c2", title: "Chương 2: Cảm ứng ở sinh vật", grade: "11" },
    { id: "sinh-11-c3", title: "Chương 3: Sinh trưởng và phát triển ở sinh vật", grade: "11" },
    { id: "sinh-11-c4", title: "Chương 4: Sinh sản ở sinh vật", grade: "11" },
    { id: "sinh-11-c5", title: "Chương 5: Mối quan hệ giữa các quá trình sinh lý", grade: "11" },
    { id: "sinh-12-c1", title: "Chương 1: Di truyền học (Di truyền phân tử, NST, quần thể)", grade: "12" },
    { id: "sinh-12-c2", title: "Chương 2: Tiến hóa (Bằng chứng và các học thuyết tiến hóa)", grade: "12" },
    { id: "sinh-12-c3", title: "Chương 3: Sinh thái học và môi trường", grade: "12" }
  ],
  "Tin học": [
    { id: "tin-11-c1", title: "Chương 1: Cơ sở dữ liệu và Hệ quản trị CSDL", grade: "11" },
    { id: "tin-11-c2", title: "Chương 2: Kĩ thuật lập trình & Quản trị CSDL chuyên sâu", grade: "11" },
    { id: "tin-12-c1", title: "Chương 1: Trí tuệ nhân tạo (AI) & Mạng máy tính", grade: "12" },
    { id: "tin-12-c2", title: "Chương 2: Thiết kế Trang web với HTML và CSS", grade: "12" },
    { id: "tin-12-c3", title: "Chương 3: Chủ đề định hướng chuyên sâu (CS & ICT)", grade: "12" }
  ],
  "Ngữ văn": [
    { id: "van-11-c1", title: "Chương 1: Thơ hiện đại và bi kịch văn học", grade: "11" },
    { id: "van-11-c2", title: "Chương 2: Văn bản nghị luận và tùy bút, tản văn", grade: "11" },
    { id: "van-12-c1", title: "Chương 1: Khát vọng tự do và phong cách ngôn ngữ văn học", grade: "12" },
    { id: "van-12-c2", title: "Chương 2: Văn tế, truyện ngắn và bản lĩnh nghệ thuật", grade: "12" },
    { id: "van-12-c3", title: "Chương 3: Nhật kí, phóng sự và văn bản thông tin", grade: "12" }
  ],
  "Tiếng Anh": [
    { id: "anh-11-c1", title: "Unit 1: A healthy lifestyle & Generation gap", grade: "11" },
    { id: "anh-11-c2", title: "Unit 2: Global warming & Preserving heritage", grade: "11" },
    { id: "anh-12-c1", title: "Unit 1: Life stories & Lifelong learning", grade: "12" },
    { id: "anh-12-c2", title: "Unit 2: The green movement & Urbanisation", grade: "12" },
    { id: "anh-12-c3", title: "Unit 3: Artificial intelligence & The world of work", grade: "12" }
  ],
  "Lịch sử": [
    { id: "su-11-c1", title: "Chủ đề 1: Cách mạng tư sản và sự phát triển của CNTB", grade: "11" },
    { id: "su-11-c2", title: "Chủ đề 2: Chủ nghĩa xã hội và quá trình mở rộng", grade: "11" },
    { id: "su-12-c1", title: "Chủ đề 1: Thế giới trong và sau Chiến tranh lạnh", grade: "12" },
    { id: "su-12-c2", title: "Chủ đề 2: ASEAN: Những chặng đường lịch sử", grade: "12" },
    { id: "su-12-c3", title: "Chủ đề 3: Cách mạng tháng Tám 1945 và kháng chiến chống xâm lược", grade: "12" },
    { id: "su-12-c4", title: "Chủ đề 4: Đổi mới ở Việt Nam từ năm 1986 đến nay", grade: "12" }
  ],
  "Địa lí": [
    { id: "dia-11-c1", title: "Chủ đề 1: Kinh tế - xã hội thế giới & Khu vực Mỹ La-tinh", grade: "11" },
    { id: "dia-11-c2", title: "Chủ đề 2: Liên minh Châu Âu (EU) & Khu vực Đông Nam Á", grade: "11" },
    { id: "dia-12-c1", title: "Chủ đề 1: Địa lí tự nhiên Việt Nam (Vị trí, địa hình, khí hậu)", grade: "12" },
    { id: "dia-12-c2", title: "Chủ đề 2: Địa lí dân cư và các ngành kinh tế Việt Nam", grade: "12" },
    { id: "dia-12-c3", title: "Chủ đề 3: Sự phân hóa lãnh thổ và các vùng kinh tế trọng điểm", grade: "12" }
  ],
  "GDKT & PL": [
    { id: "gdkt-11-c1", title: "Chủ đề 1: Cạnh tranh, cung cầu và lạm phát", grade: "11" },
    { id: "gdkt-11-c2", title: "Chủ đề 2: Thị trường lao động và việc làm", grade: "11" },
    { id: "gdkt-12-c1", title: "Chủ đề 1: Tăng trưởng và phát triển kinh tế", grade: "12" },
    { id: "gdkt-12-c2", title: "Chủ đề 2: Hội nhập kinh tế quốc tế và bảo hiểm", grade: "12" },
    { id: "gdkt-12-c3", title: "Chủ đề 3: Quyền và nghĩa vụ của công dân về kinh tế và xã hội", grade: "12" }
  ]
};
