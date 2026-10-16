import { FallbackQuizItem } from "./quiz.types";

export const FALLBACK_SAMPLE_QUIZ_QUESTIONS_PART2: FallbackQuizItem[] = [
  {
    id: "ENG-001",
    block: "D01",
    subject: "Tiếng Anh",
    slot_type: "REFLEX_1",
    source: "Unit 1 Global Warming",
    bloom_level: "Nhận biết (45s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 45,
    question_text: "Neil Armstrong was the first man ______ on the moon.",
    options: {
      A: "to step",
      B: "stepping",
      C: "stepped",
      D: "steps"
    },
    correct_answer: "A",
    micro_explanation: "Khi danh từ đi trước có số thứ tự (the first, the second) hoặc so sánh nhất, mệnh đề quan hệ rút gọn dùng to-infinitive.",
    growth_mindset_tip: "Gặp 'the first/last/only' -> dùng 'to V' rút gọn mệnh đề quan hệ."
  },
  {
    id: "VAN-001",
    block: "D01",
    subject: "Ngữ văn",
    slot_type: "REFLEX_1",
    source: "Văn bản nghị luận & tùy bút",
    bloom_level: "Thông hiểu (60s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 60,
    question_text: "Yếu tố nào sau đây là linh hồn của thể loại tùy bút và tản văn?",
    options: {
      A: "Cái 'tôi' tài hoa, cảm xúc chủ quan của người viết",
      B: "Cốt truyện li kì và hệ thống mâu thuẫn kịch tính",
      C: "Quy luật gieo vần bằng trắc nghiêm ngặt",
      D: "Ngôn ngữ ước lệ tượng trưng thời trung đại"
    },
    correct_answer: "A",
    micro_explanation: "Tùy bút và tản văn tôn vinh cái tôi trữ tình, sự quan sát tinh tế và những rung động trực tiếp của tác giả trước cuộc sống.",
    growth_mindset_tip: "Tùy bút thể hiện đậm nét cá tính sáng tạo và cái 'tôi' nghệ sĩ."
  },
  {
    id: "SU-001",
    block: "C00",
    subject: "Lịch sử",
    slot_type: "REFLEX_1",
    source: "Cách mạng tư sản thế giới",
    bloom_level: "Nhận biết (45s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 45,
    question_text: "Mục tiêu chung của các cuộc cách mạng tư sản thời cận đại là:",
    options: {
      A: "Lật đổ chế độ phong kiến, mở đường cho chủ nghĩa tư bản phát triển",
      B: "Xóa bỏ hoàn toàn chế độ tư hữu tư nhân",
      C: "Thiết lập quyền thống trị của giai cấp vô sản",
      D: "Bảo tồn nguyên vẹn trật tự đẳng cấp quý tộc"
    },
    correct_answer: "A",
    micro_explanation: "Các cuộc cách mạng tư sản có mục tiêu xóa bỏ rào cản phong kiến để xác lập nền kinh tế tư bản chủ nghĩa.",
    growth_mindset_tip: "Mục tiêu then chốt của cách mạng tư sản: Lật đổ phong kiến, mở đường cho CNTB."
  },
  {
    id: "DIA-001",
    block: "C00",
    subject: "Địa lí",
    slot_type: "REFLEX_1",
    source: "Địa lí tự nhiên thế giới",
    bloom_level: "Nhận biết (45s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 45,
    question_text: "Hiện tượng ngày đêm luân phiên trên Trái Đất là hệ quả của chuyển động nào?",
    options: {
      A: "Chuyển động tự quay quanh trục của Trái Đất",
      B: "Chuyển động của Trái Đất quanh Mặt Trời",
      C: "Sự nghiêng của trục Trái Đất khi quay quanh Mặt Trời",
      D: "Sự thay đổi khoảng cách giữa Trái Đất và Mặt Trăng"
    },
    correct_answer: "A",
    micro_explanation: "Do Trái Đất hình cầu và tự quay quanh trục từ Tây sang Đông nên mọi điểm trên Trái Đất đều lần lượt được Mặt Trời chiếu sáng.",
    growth_mindset_tip: "Tự quay quanh trục -> Ngày đêm luân phiên; Quay quanh Mặt Trời -> 4 mùa."
  },
  {
    id: "GDKTPL-001",
    block: "C00",
    subject: "GDKT & PL",
    slot_type: "REFLEX_1",
    source: "Quy luật kinh tế thị trường",
    bloom_level: "Nhận biết (45s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 45,
    question_text: "Quy luật kinh tế nào điều tiết tỉ lệ phân chia các yếu tố sản xuất và lưu thông hàng hóa qua giá cả thị trường?",
    options: {
      A: "Quy luật giá trị",
      B: "Quy luật tự nhiên",
      C: "Quy luật cung cầu",
      D: "Quy luật cạnh tranh"
    },
    correct_answer: "A",
    micro_explanation: "Quy luật giá trị là quy luật kinh tế căn bản của sản xuất và lưu thông hàng hóa, điều tiết qua sự biến động giá cả xoay quanh giá trị.",
    growth_mindset_tip: "Quy luật giá trị vận hành dựa trên thời gian lao động xã hội cần thiết."
  },
  {
    id: "CONGNGHE-001",
    block: "A00",
    subject: "Công nghệ",
    slot_type: "REFLEX_1",
    source: "Bản vẽ kĩ thuật và cơ khí",
    bloom_level: "Nhận biết (45s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 45,
    question_text: "Trong phương pháp chiếu góc thứ nhất, hình chiếu bằng có hướng chiếu từ:",
    options: {
      A: "Trên nhìn xuống và đặt ở dưới hình chiếu đứng",
      B: "Dưới nhìn lên và đặt ở trên hình chiếu đứng",
      C: "Trái nhìn sang và đặt bên phải hình chiếu đứng",
      D: "Trước nhìn vào và đặt ở trung tâm bản vẽ"
    },
    correct_answer: "A",
    micro_explanation: "Hình chiếu bằng có hướng chiếu từ trên xuống, được đặt ngay phía dưới hình chiếu đứng theo tiêu chuẩn TCVN.",
    growth_mindset_tip: "Hình chiếu đứng: trước -> sau; Hình chiếu bằng: trên -> dưới; Hình chiếu cạnh: trái -> phải."
  }
];
