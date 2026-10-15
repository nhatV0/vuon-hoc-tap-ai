export interface SyllabusChapter {
  id: string;
  title: string;
  grade: "11" | "12" | "all";
}

export interface SubjectSyllabus {
  subject: string;
  chapters: SyllabusChapter[];
}

export const SUBJECT_SYLLABUS_MAP: Record<string, SyllabusChapter[]> = {
  "Toán học": [
    { id: "toan-11-c6", title: "Chương VI. Hàm số mũ và hàm số lôgarit", grade: "11" },
    { id: "toan-11-c7", title: "Chương VII. Quan hệ vuông góc trong không gian", grade: "11" },
    { id: "toan-11-c8", title: "Chương VIII. Các quy tắc tính xác suất", grade: "11" },
    { id: "toan-11-c9", title: "Chương IX. Đạo hàm", grade: "11" },
    { id: "toan-12-c1", title: "Chương I. Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số", grade: "12" },
    { id: "toan-12-c2", title: "Chương II. Vectơ và hệ trục tọa độ trong không gian", grade: "12" },
    { id: "toan-12-c3", title: "Chương III. Các số đặc trưng đo mức độ phân tán mẫu ghép nhóm", grade: "12" },
    { id: "toan-12-c4", title: "Chương IV. Nguyên hàm và tích phân", grade: "12" },
    { id: "toan-12-c5", title: "Chương V. Phương pháp tọa độ trong không gian Oxyz", grade: "12" },
    { id: "toan-12-c6", title: "Chương VI. Xác suất có điều kiện", grade: "12" }
  ],
  "Vật lí": [
    { id: "ly-11-c3", title: "Chương III. Điện trường", grade: "11" },
    { id: "ly-11-c4", title: "Chương IV. Dòng điện. Mạch điện", grade: "11" },
    { id: "ly-12-c1", title: "Chương I. Vật lí nhiệt", grade: "12" },
    { id: "ly-12-c2", title: "Chương II. Khí lí tưởng", grade: "12" },
    { id: "ly-12-c3", title: "Chương III. Từ trường", grade: "12" },
    { id: "ly-12-c4", title: "Chương IV. Vật lí hạt nhân", grade: "12" }
  ],
  "Hóa học": [
    { id: "hoa-11-c1", title: "1. Dẫn xuất halogen", grade: "11" },
    { id: "hoa-11-c2", title: "2. Alcohol", grade: "11" },
    { id: "hoa-11-c3", title: "3. Phenol", grade: "11" },
    { id: "hoa-11-c4", title: "4. Hợp chất Carbonyl (Aldehyde - Ketone)", grade: "11" },
    { id: "hoa-11-c5", title: "5. Carboxylic acid", grade: "11" },
    { id: "hoa-12-c1", title: "Chương 1. Ester - Lipid", grade: "12" },
    { id: "hoa-12-c2", title: "Chương 2. Carbohydrate", grade: "12" },
    { id: "hoa-12-c3", title: "Chương 3. Hợp chất chứa Nitrogen", grade: "12" },
    { id: "hoa-12-c4", title: "Chương 4. Polymer và vật liệu polymer", grade: "12" },
    { id: "hoa-12-c5", title: "Chương 5. Pin điện và điện phân", grade: "12" },
    { id: "hoa-12-c6", title: "Chương 6. Đại cương về kim loại", grade: "12" },
    { id: "hoa-12-c7", title: "Chương 7. Nguyên tố nhóm IA và nhóm IIA", grade: "12" },
    { id: "hoa-12-c8", title: "Chương 8. Sơ lược về kim loại chuyển tiếp và phức chất", grade: "12" }
  ],
  "Sinh học": [
    { id: "sinh-11-c2", title: "Chương II. Cảm ứng ở sinh vật", grade: "11" },
    { id: "sinh-11-c3", title: "Chương III. Sinh trưởng và phát triển ở sinh vật", grade: "11" },
    { id: "sinh-11-c4", title: "Chương IV. Sinh sản ở sinh vật", grade: "11" },
    { id: "sinh-11-c5", title: "Chương V. Mối quan hệ giữa các quá trình sinh lý", grade: "11" },
    { id: "sinh-12-c1", title: "Di truyền học (Di truyền phân tử, NST, quần thể)", grade: "12" },
    { id: "sinh-12-c2", title: "Tiến hóa (Bằng chứng và các học thuyết tiến hóa)", grade: "12" },
    { id: "sinh-12-c3", title: "Sinh thái học và môi trường (Quần thể, quần xã, hệ sinh thái)", grade: "12" }
  ],
  "Tin học": [
    { id: "tin-11-c1", title: "1. Cơ sở dữ liệu và Hệ quản trị cơ sở dữ liệu", grade: "11" },
    { id: "tin-11-c2", title: "2. Kĩ thuật lập trình & Quản trị CSDL (Chuyên sâu CS & ICT)", grade: "11" },
    { id: "tin-12-c1", title: "1. Trí tuệ nhân tạo (AI) & Mạng máy tính", grade: "12" },
    { id: "tin-12-c2", title: "2. Thiết kế Trang web với HTML và CSS", grade: "12" },
    { id: "tin-12-c3", title: "3. Chủ đề chuyên sâu theo Định hướng (CS & ICT - Lớp 12)", grade: "12" }
  ],
  "Ngữ văn": [
    { id: "van-11-c1", title: "1. Thể loại & Kiến thức văn học trọng tâm (Lớp 11 - Đọc hiểu)", grade: "11" },
    { id: "van-11-c2", title: "2. Thực hành Tiếng Việt (Lớp 11 - HKII)", grade: "11" },
    { id: "van-11-c3", title: "3. Kiến thức Viết (Lớp 11 - HKII)", grade: "11" },
    { id: "van-12-c1", title: "1. Thể loại & Tác phẩm trọng tâm (Lớp 12 - Đọc hiểu)", grade: "12" },
    { id: "van-12-c2", title: "2. Thực hành Tiếng Việt (Lớp 12 - Cả năm)", grade: "12" },
    { id: "van-12-c3", title: "3. Kiến thức Viết & Báo cáo nghiên cứu (Lớp 12 - Cả năm)", grade: "12" }
  ],
  "Tiếng Anh": [
    { id: "anh-11-u6", title: "Unit 6: Preserving Our Heritage", grade: "11" },
    { id: "anh-11-u7", title: "Unit 7: Education Options for School-Leavers", grade: "11" },
    { id: "anh-11-u8", title: "Unit 8: Becoming Independent", grade: "11" },
    { id: "anh-11-u9", title: "Unit 9: Social Issues", grade: "11" },
    { id: "anh-11-u10", title: "Unit 10: The Ecosystem", grade: "11" },
    { id: "anh-12-u1", title: "Unit 1: Life Stories We Admire", grade: "12" },
    { id: "anh-12-u2", title: "Unit 2: A Multicultural World", grade: "12" },
    { id: "anh-12-u3", title: "Unit 3: Green Living", grade: "12" },
    { id: "anh-12-u4", title: "Unit 4: Urbanisation", grade: "12" },
    { id: "anh-12-u5", title: "Unit 5: The World of Work", grade: "12" },
    { id: "anh-12-u6", title: "Unit 6: Artificial Intelligence", grade: "12" },
    { id: "anh-12-u7", title: "Unit 7: The World of Mass Media", grade: "12" },
    { id: "anh-12-u8", title: "Unit 8: Wildlife Conservation", grade: "12" },
    { id: "anh-12-u9", title: "Unit 9: Career Paths", grade: "12" },
    { id: "anh-12-u10", title: "Unit 10: Lifelong Learning", grade: "12" }
  ],
  "Lịch sử": [
    { id: "su-11-c4", title: "Chương IV. Chiến tranh bảo vệ Tổ quốc và giải phóng dân tộc (trước 1945)", grade: "11" },
    { id: "su-11-c5", title: "Chương V. Một số cuộc cải cách lớn trong lịch sử Việt Nam (trước 1858)", grade: "11" },
    { id: "su-11-c6", title: "Chương VI. Lịch sử bảo vệ chủ quyền, quyền lợi ích của VN ở Biển Đông", grade: "11" },
    { id: "su-12-c1", title: "Chương I. Thế giới trong và sau Chiến tranh lạnh", grade: "12" },
    { id: "su-12-c2", title: "Chương II. ASEAN: Những chặng đường lịch sử", grade: "12" },
    { id: "su-12-c3", title: "Chương III. Cách mạng tháng Tám 1945 và các cuộc kháng chiến (1945 - 1975)", grade: "12" },
    { id: "su-12-c4", title: "Chương IV. Công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay", grade: "12" },
    { id: "su-12-c5", title: "Chương V. Lịch sử đối ngoại của Việt Nam thời cận - hiện đại", grade: "12" },
    { id: "su-12-c6", title: "Chương VI. Hồ Chí Minh trong lịch sử Việt Nam", grade: "12" }
  ],
  "Địa lí": [
    { id: "dia-11-c1", title: "1. Khu vực Mỹ La-tinh & Liên minh Châu Âu (EU)", grade: "11" },
    { id: "dia-11-c2", title: "2. Khu vực Đông Nam Á & Tây Nam Á", grade: "11" },
    { id: "dia-12-c1", title: "Chương I. Địa lí tự nhiên Việt Nam", grade: "12" },
    { id: "dia-12-c2", title: "Chương II. Địa lí dân cư Việt Nam", grade: "12" },
    { id: "dia-12-c3", title: "Chương III. Địa lí các ngành kinh tế Việt Nam", grade: "12" },
    { id: "dia-12-c4", title: "Chương IV. Địa lí các vùng kinh tế Việt Nam", grade: "12" }
  ],
  "GDKT & PL": [
    { id: "ktpl-11-c1", title: "1. Quyền bình đẳng của công dân trước pháp luật", grade: "11" },
    { id: "ktpl-11-c2", title: "2. Quyền dân chủ và quyền tự do cơ bản của công dân", grade: "11" },
    { id: "ktpl-12-c1", title: "Chương I. Giáo dục kinh tế Lớp 12 (Tăng trưởng, hội nhập, an sinh)", grade: "12" },
    { id: "ktpl-12-c2", title: "Chương II. Giáo dục pháp luật Lớp 12 (Quyền kinh tế, văn hóa, luật quốc tế)", grade: "12" }
  ],
  "Công nghệ": [
    { id: "cn-11-nn", title: "Công nghệ Chăn nuôi (Lớp 11 - HKII)", grade: "11" },
    { id: "cn-12-nn", title: "Lâm nghiệp và Thủy sản (Lớp 12 - Cả năm)", grade: "12" },
    { id: "cn-11-cn", title: "Công nghệ Cơ khí & Động cơ đốt trong (Lớp 11 - HKII)", grade: "11" },
    { id: "cn-12-cn", title: "Công nghệ Điện & Điện tử (Lớp 12 - Cả năm)", grade: "12" }
  ]
};
