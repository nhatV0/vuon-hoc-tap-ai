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
    { id: "toan-11-c6", title: "Hàm số mũ và hàm số lôgarit (Lớp 11)", grade: "11" },
    { id: "toan-11-c7", title: "Quan hệ vuông góc trong không gian (Lớp 11)", grade: "11" },
    { id: "toan-11-c8", title: "Quy tắc tính xác suất (Lớp 11)", grade: "11" },
    { id: "toan-11-c9", title: "Đạo hàm và tiếp tuyến đồ thị (Lớp 11)", grade: "11" },
    { id: "toan-12-c1", title: "Ứng dụng đạo hàm khảo sát đồ thị hàm số (Lớp 12)", grade: "12" },
    { id: "toan-12-c2", title: "Vectơ và hệ tọa độ Oxyz không gian (Lớp 12)", grade: "12" },
    { id: "toan-12-c3", title: "Số đặc trưng mẫu số liệu ghép nhóm (Lớp 12)", grade: "12" },
    { id: "toan-12-c4", title: "Nguyên hàm, tích phân và ứng dụng (Lớp 12)", grade: "12" },
    { id: "toan-12-c5", title: "Phương trình mặt phẳng, đường thẳng Oxyz (Lớp 12)", grade: "12" },
    { id: "toan-12-c6", title: "Xác suất có điều kiện và công thức Bayes (Lớp 12)", grade: "12" }
  ],
  "Vật lí": [
    { id: "ly-11-c3", title: "Điện trường, điện thế và tụ điện (Lớp 11)", grade: "11" },
    { id: "ly-11-c4", title: "Dòng điện, mạch điện và định luật Ohm (Lớp 11)", grade: "11" },
    { id: "ly-12-c1", title: "Vật lí nhiệt và định luật nhiệt động lực học (Lớp 12)", grade: "12" },
    { id: "ly-12-c2", title: "Khí lí tưởng và phương trình trạng thái (Lớp 12)", grade: "12" },
    { id: "ly-12-c3", title: "Từ trường, cảm ứng điện từ và sóng điện từ (Lớp 12)", grade: "12" },
    { id: "ly-12-c4", title: "Vật lí hạt nhân và phóng xạ (Lớp 12)", grade: "12" }
  ],
  "Hóa học": [
    { id: "hoa-11-c1", title: "Dẫn xuất halogen, alcohol và phenol (Lớp 11)", grade: "11" },
    { id: "hoa-11-c2", title: "Hợp chất carbonyl và carboxylic acid (Lớp 11)", grade: "11" },
    { id: "hoa-12-c1", title: "Ester và lipid (Lớp 12)", grade: "12" },
    { id: "hoa-12-c2", title: "Carbohydrate (Glucose, tinh bột, cellulose) (Lớp 12)", grade: "12" },
    { id: "hoa-12-c3", title: "Hợp chất chứa nitrogen (Amine, amino acid, peptide) (Lớp 12)", grade: "12" },
    { id: "hoa-12-c4", title: "Polymer và vật liệu polymer (Lớp 12)", grade: "12" },
    { id: "hoa-12-c5", title: "Pin điện hóa và điện phân (Lớp 12)", grade: "12" },
    { id: "hoa-12-c6", title: "Đại cương kim loại và nhóm IA, IIA (Lớp 12)", grade: "12" },
    { id: "hoa-12-c7", title: "Kim loại chuyển tiếp dãy thứ nhất và phức chất (Lớp 12)", grade: "12" }
  ],
  "Sinh học": [
    { id: "sinh-11-c2", title: "Cảm ứng và tập tính ở sinh vật (Lớp 11)", grade: "11" },
    { id: "sinh-11-c3", title: "Sinh trưởng và phát triển ở sinh vật (Lớp 11)", grade: "11" },
    { id: "sinh-11-c4", title: "Sinh sản ở sinh vật (Lớp 11)", grade: "11" },
    { id: "sinh-12-c1", title: "Di truyền phân tử (DNA, RNA, đột biến gen) (Lớp 12)", grade: "12" },
    { id: "sinh-12-c2", title: "Di truyền nhiễm sắc thể và liên kết gen (Lớp 12)", grade: "12" },
    { id: "sinh-12-c3", title: "Di truyền học quần thể và phả hệ (Lớp 12)", grade: "12" },
    { id: "sinh-12-c4", title: "Tiến hóa và các học thuyết tiến hóa (Lớp 12)", grade: "12" },
    { id: "sinh-12-c5", title: "Sinh thái học quần xã và hệ sinh thái (Lớp 12)", grade: "12" }
  ],
  "Tin học": [
    { id: "tin-11-c1", title: "Cơ sở dữ liệu và hệ quản trị CSDL quan hệ (Lớp 11)", grade: "11" },
    { id: "tin-11-c2", title: "Kĩ thuật lập trình Python/C++ & thuật toán (Lớp 11)", grade: "11" },
    { id: "tin-12-c1", title: "Trí tuệ nhân tạo (AI) và mạng máy tính (Lớp 12)", grade: "12" },
    { id: "tin-12-c2", title: "Thiết kế trang web với HTML, CSS và DOM (Lớp 12)", grade: "12" },
    { id: "tin-12-c3", title: "Chuyên sâu Khoa học máy tính & An toàn mạng (Lớp 12)", grade: "12" }
  ],
  "Ngữ văn": [
    { id: "van-11-c1", title: "Đọc hiểu truyện ngắn và thơ trung - hiện đại (Lớp 11)", grade: "11" },
    { id: "van-11-c2", title: "Biện pháp tu từ và tiếng Việt thực hành (Lớp 11)", grade: "11" },
    { id: "van-12-c1", title: "Đọc hiểu văn bản văn học theo thể loại (Lớp 12)", grade: "12" },
    { id: "van-12-c2", title: "Nghị luận xã hội và tư duy phản biện (Lớp 12)", grade: "12" },
    { id: "van-12-c3", title: "Nghị luận văn học và bài viết nghiên cứu (Lớp 12)", grade: "12" }
  ],
  "Tiếng Anh": [
    { id: "anh-11-c1", title: "Heritage, Education and Independence (Grade 11)", grade: "11" },
    { id: "anh-11-c2", title: "Social Issues and Ecosystems (Grade 11)", grade: "11" },
    { id: "anh-12-c1", title: "Life Stories, Green Living & Urbanisation (Grade 12)", grade: "12" },
    { id: "anh-12-c2", title: "World of Work, AI & Mass Media (Grade 12)", grade: "12" },
    { id: "anh-12-c3", title: "Wildlife Conservation & Career Paths (Grade 12)", grade: "12" }
  ],
  "Lịch sử": [
    { id: "su-11-c1", title: "Chiến tranh bảo vệ Tổ quốc và giải phóng dân tộc (Lớp 11)", grade: "11" },
    { id: "su-11-c2", title: "Các cuộc cải cách lớn trong lịch sử Việt Nam (Lớp 11)", grade: "11" },
    { id: "su-11-c3", title: "Chủ quyền biển đảo Việt Nam ở Biển Đông (Lớp 11)", grade: "11" },
    { id: "su-12-c1", title: "Thế giới trong và sau Chiến tranh lạnh, ASEAN (Lớp 12)", grade: "12" },
    { id: "su-12-c2", title: "Kháng chiến chống Pháp và chống Mỹ (1945 - 1975) (Lớp 12)", grade: "12" },
    { id: "su-12-c3", title: "Công cuộc Đổi mới từ 1986 và đối ngoại hiện đại (Lớp 12)", grade: "12" }
  ],
  "Địa lí": [
    { id: "dia-11-c1", title: "Địa lí khu vực: Đông Nam Á, EU, Mỹ La-tinh (Lớp 11)", grade: "11" },
    { id: "dia-12-c1", title: "Địa lí tự nhiên và dân cư Việt Nam (Lớp 12)", grade: "12" },
    { id: "dia-12-c2", title: "Địa lí các ngành kinh tế (Nông nghiệp, Công nghiệp, Dịch vụ) (Lớp 12)", grade: "12" },
    { id: "dia-12-c3", title: "Địa lí các vùng kinh tế trọng điểm Việt Nam (Lớp 12)", grade: "12" }
  ],
  "GDKT & PL": [
    { id: "ktpl-11-c1", title: "Quyền bình đẳng, dân chủ và tự do của công dân (Lớp 11)", grade: "11" },
    { id: "ktpl-12-c1", title: "Tăng trưởng, phát triển kinh tế và an sinh xã hội (Lớp 12)", grade: "12" },
    { id: "ktpl-12-c2", title: "Quyền và nghĩa vụ công dân về kinh tế, văn hóa (Lớp 12)", grade: "12" }
  ]
};
