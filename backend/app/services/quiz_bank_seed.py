"""
Dữ liệu chuẩn hóa Ngân hàng câu hỏi trắc nghiệm vi mô theo plan-Quest.txt
Phân phối theo 5 tổ hợp xét tuyển đại học:
- A00: Toán - Lí - Hóa
- D01: Toán - Văn - Anh
- B00: Toán - Hóa - Sinh
- C00: Văn - Sử - Địa
- A01: Toán - Lí - Anh
Kèm theo câu hỏi Boss phân hóa (Streak >= 30 ngày) và Slot chờ nạp giáo viên.
"""

from typing import List, Dict, Any

SEED_QUIZ_QUESTIONS: List[Dict[str, Any]] = [
    # ================= KHỐI A00 =================
    {
        "id": "A00-Q1-REFLEX",
        "block": "A00",
        "subject": "Toán học",
        "slot_type": "REFLEX_1",
        "source": "Chuẩn kiến thức GDPT 2018 - Giải tích 12",
        "bloom_level": "Nhận biết (45s)",
        "lock_condition": "MOTUDO",
        "time_limit_seconds": 45,
        "question_text": "Đạo hàm của hàm số $y = 3^x$ trên tập số thực $\\mathbb{R}$ là:",
        "options": {
            "A": "y' = x \\cdot 3^{x-1}",
            "B": "y' = 3^x \\cdot \\ln 3",
            "C": "y' = \\frac{3^x}{\\ln 3}",
            "D": "y' = 3^x"
        },
        "correct_answer": "B",
        "micro_explanation": "Công thức đạo hàm hàm số mũ: $(a^x)' = a^x \\ln a$. Bẫy phổ biến: Nhầm sang công thức lũy thừa $(x^n)' = n x^{n-1}$.",
        "growth_mindset_tip": "Nhớ kỹ: Ẩn ở trên mũ thì nhân thêm ln(cơ số). Bạn đang có phản xạ công thức rất tốt!"
    },
    {
        "id": "A00-Q2-TRAP",
        "block": "A00",
        "subject": "Vật lí",
        "slot_type": "TRAP_2",
        "source": "Chuẩn kiến thức GDPT 2018 - Nhiệt học 12",
        "bloom_level": "Thông hiểu (60s)",
        "lock_condition": "MOTUDO",
        "time_limit_seconds": 60,
        "question_text": "Trong hệ đơn vị quốc tế SI, đơn vị của nhiệt dung riêng là:",
        "options": {
            "A": "J/kg",
            "B": "J/(kg \\cdot K)",
            "C": "cal/g",
            "D": "W/(m \\cdot K)"
        },
        "correct_answer": "B",
        "micro_explanation": "Từ công thức nhiệt lượng: $Q = mc\\Delta T \\Rightarrow c = \\frac{Q}{m\\Delta T}$, với $Q$ đo bằng J, $m$ đo bằng kg, $\\Delta T$ đo bằng K.",
        "growth_mindset_tip": "Chú ý mẫu số có cả khối lượng và độ tăng nhiệt độ. Đọc kỹ đơn vị giúp bạn không mất điểm oan!"
    },
    {
        "id": "A00-Q3-STANDARD",
        "block": "A00",
        "subject": "Hóa học",
        "slot_type": "DYNAMIC_3",
        "source": "Chuẩn kiến thức GDPT 2018 - Hóa hữu cơ 12",
        "bloom_level": "Vận dụng vừa (60s)",
        "lock_condition": "MOTUDO",
        "time_limit_seconds": 60,
        "question_text": "Hợp chất hữu cơ nào sau đây có phản ứng tráng bạc với thuốc thử Tollens ($AgNO_3/NH_3$)?",
        "options": {
            "A": "Ethyl acetate",
            "B": "Methyl formate",
            "C": "Ethanol",
            "D": "Sucrose"
        },
        "correct_answer": "B",
        "micro_explanation": "Methyl formate ($HCOOCH_3$) có nhóm chức aldehyde $-CHO$ ở đầu gốc formate nên có tính khử và tráng bạc được.",
        "growth_mindset_tip": "Gốc formate HCOO- là bẫy kinh điển trong este. Chúc mừng bạn đã bắt trọn cấu trúc phân tử!"
    },
    {
        "id": "A00-Q3-BOSS-30D",
        "block": "A00",
        "subject": "Toán học",
        "slot_type": "BOSS_30D",
        "source": "Đề thi Tốt nghiệp THPT Chính thức - Phân hóa 8.5+",
        "bloom_level": "Vận dụng cao 8+ (90s)",
        "lock_condition": "YEUCAUSTREAK30NGAY",
        "time_limit_seconds": 90,
        "question_text": "Cho hàm số $f(x)$ liên tục trên $\\mathbb{R}$. Biết $F(x)$ là một nguyên hàm của $f(x)$ thỏa mãn $F(2) - F(0) = 4$. Tích phân $I = \\int_0^1 f(2x) \\, dx$ có giá trị bằng:",
        "options": {
            "A": "2",
            "B": "8",
            "C": "4",
            "D": "1"
        },
        "correct_answer": "A",
        "micro_explanation": "Đổi biến số: đặt $t = 2x \\Rightarrow dt = 2dx \\Rightarrow dx = \\frac{dt}{2}$. Khi $x=0 \\to t=0$, $x=1 \\to t=2$. Ta có $I = \\frac{1}{2}\\int_0^2 f(t)dt = \\frac{F(2)-F(0)}{2} = \\frac{4}{2} = 2$.",
        "growth_mindset_tip": "🔥 Bạn đã chinh phục Câu Boss Đề Thi Thật 30 Ngày! Kỹ năng đổi biến số của bạn đạt trình độ thủ khoa!"
    },

    # ================= KHỐI D01 =================
    {
        "id": "D01-Q1-REFLEX",
        "block": "D01",
        "subject": "Tiếng Anh",
        "slot_type": "REFLEX_1",
        "source": "Collocations & Vocabulary GDPT 2018",
        "bloom_level": "Nhận biết (45s)",
        "time_limit_seconds": 45,
        "lock_condition": "MOTUDO",
        "question_text": "Choose the word that best fits the blank: 'Students are advised to _______ the entry requirements before applying to university.'",
        "options": {
            "A": "make",
            "B": "meet",
            "C": "do",
            "D": "hold"
        },
        "correct_answer": "B",
        "micro_explanation": "Collocation chuẩn xác: 'meet the requirements' mang nghĩa là đáp ứng/thỏa mãn các yêu cầu hoặc tiêu chuẩn đặt ra.",
        "growth_mindset_tip": "Từ vựng cụm từ (collocation) giúp bạn tăng tốc độ đọc hiểu bài thi môn Anh gấp đôi!"
    },
    {
        "id": "D01-Q2-TRAP",
        "block": "D01",
        "subject": "Toán học",
        "slot_type": "TRAP_2",
        "source": "Khảo sát hàm số GDPT 2018",
        "bloom_level": "Thông hiểu (60s)",
        "time_limit_seconds": 60,
        "lock_condition": "MOTUDO",
        "question_text": "Cho hàm số $y = f(x)$ có bảng biến thiên. Khẳng định nào sau đây là đúng?",
        "options": {
            "A": "Giá trị cực đại của hàm số là hoành độ điểm cực đại.",
            "B": "Hàm số đạt cực tiểu tại điểm làm cho đạo hàm đổi dấu từ âm sang dương.",
            "C": "Điểm cực trị của đồ thị hàm số chỉ có hoành độ, không có tung độ.",
            "D": "Hàm số luôn có giá trị lớn nhất tại điểm cực đại."
        },
        "correct_answer": "B",
        "micro_explanation": "Quy tắc 1 tìm cực trị: Khi qua điểm $x_0$, đạo hàm $f'(x)$ đổi dấu từ '-' sang '+' thì hàm số đạt cực tiểu tại $x_0$.",
        "growth_mindset_tip": "Phân biệt rạch ròi: 'Điểm cực trị của hàm số' ($x$), 'Giá trị cực trị' ($y$) và 'Điểm cực trị của đồ thị' ($(x; y)$)."
    },
    {
        "id": "D01-Q3-STANDARD",
        "block": "D01",
        "subject": "Ngữ văn",
        "slot_type": "DYNAMIC_3",
        "source": "Đọc hiểu văn bản nghệ thuật GDPT 2018",
        "bloom_level": "Thông hiểu (60s)",
        "time_limit_seconds": 60,
        "lock_condition": "MOTUDO",
        "question_text": "Đọc câu văn: 'Thời gian như một dòng nước vô tình cuốn trôi mọi dấu vết phù hoa, chỉ giữ lại những gì được xây đắp bằng sự chân thành.' Biện pháp tu từ nổi bật nhất là:",
        "options": {
            "A": "Ẩn dụ chuyển đổi cảm giác",
            "B": "So sánh",
            "C": "Điệp thanh",
            "D": "Đảo ngữ"
        },
        "correct_answer": "B",
        "micro_explanation": "Câu văn sử dụng từ so sánh trực tiếp 'như' ('Thời gian như một dòng nước...').",
        "growth_mindset_tip": "Xác định nhanh từ khóa tu từ giúp bạn ăn trọn 0.75 điểm phần Đọc hiểu trong 10 giây đầu!"
    },
    {
        "id": "D01-Q3-BOSS-30D",
        "block": "D01",
        "subject": "Tiếng Anh",
        "slot_type": "BOSS_30D",
        "source": "Đề thi phân hóa C2 / Thành ngữ nâng cao 9+",
        "bloom_level": "Vận dụng cao 8+ (90s)",
        "lock_condition": "YEUCAUSTREAK30NGAY",
        "time_limit_seconds": 90,
        "question_text": "Choose the best option: 'I\\'ve been _______ the midnight oil all week trying to finish my final research project.'",
        "options": {
            "A": "wasting",
            "B": "burning",
            "C": "lighting",
            "D": "spending"
        },
        "correct_answer": "B",
        "micro_explanation": "Idiom 'burn the midnight oil' có nghĩa là thức khuya miệt mài học tập hoặc làm việc.",
        "growth_mindset_tip": "🔥 Chinh phục Boss Idioms C2! Kỷ luật 30 ngày của bạn phản chiếu chính xác tinh thần 'burning the midnight oil'!"
    },

    # ================= KHỐI B00 =================
    {
        "id": "B00-Q1-REFLEX",
        "block": "B00",
        "subject": "Sinh học",
        "slot_type": "REFLEX_1",
        "source": "Di truyền học phân tử 12",
        "bloom_level": "Nhận biết (45s)",
        "time_limit_seconds": 45,
        "lock_condition": "MOTUDO",
        "question_text": "Trong quá trình phiên mã ở sinh vật nhân thực, enzyme RNA polymerase di chuyển trên mạch khuôn của gen theo chiều nào?",
        "options": {
            "A": "Chiều 5' -> 3'",
            "B": "Chiều 3' -> 5'",
            "C": "Cả hai chiều tùy thuộc vào promoter",
            "D": "Từ giữa gen ra hai đầu"
        },
        "correct_answer": "B",
        "micro_explanation": "RNA polymerase trượt trên mạch khuôn theo chiều 3' -> 5' để tổng hợp mạch mRNA mới theo nguyên tắc bổ sung có chiều 5' -> 3'.",
        "growth_mindset_tip": "Bẫy chiều mạch là điểm mất điểm số 1 môn Sinh. Bạn đã ghi nhớ rất chính xác!"
    },
    {
        "id": "B00-Q2-TRAP",
        "block": "B00",
        "subject": "Hóa học",
        "slot_type": "TRAP_2",
        "source": "Nhiệt động học hóa học GDPT 2018",
        "bloom_level": "Thông hiểu (60s)",
        "time_limit_seconds": 60,
        "lock_condition": "MOTUDO",
        "question_text": "Cho phản ứng: $N_2(g) + 3H_2(g) \\rightleftharpoons 2NH_3(g)$ có $\\Delta_r H^\\circ_{298} = -92 \\, kJ$. Nhận định nào sau đây là đúng?",
        "options": {
            "A": "Phản ứng trên là phản ứng thu nhiệt.",
            "B": "Khi tăng nhiệt độ, cân bằng chuyển dịch theo chiều thuận.",
            "C": "Đây là phản ứng tỏa nhiệt; nhiệt lượng tỏa ra khi tạo thành 2 mol NH3 là 92 kJ.",
            "D": "Năng lượng của chất tham gia thấp hơn năng lượng của sản phẩm."
        },
        "correct_answer": "C",
        "micro_explanation": "Quy ước dấu: $\\Delta_r H^\\circ_{298} < 0$ là phản ứng tỏa nhiệt, giá trị âm thể hiện nhiệt lượng tỏa ra môi trường.",
        "growth_mindset_tip": "Nhiệt phản ứng $\\Delta_r H < 0$ là Tỏa nhiệt. Đừng để dấu trừ làm bạn bối rối!"
    },
    {
        "id": "B00-Q3-STANDARD",
        "block": "B00",
        "subject": "Toán học",
        "slot_type": "DYNAMIC_3",
        "source": "Phương pháp tọa độ không gian Oxyz",
        "bloom_level": "Thông hiểu (60s)",
        "time_limit_seconds": 60,
        "lock_condition": "MOTUDO",
        "question_text": "Trong không gian $Oxyz$, mặt cầu $(S): (x-1)^2 + (y+2)^2 + z^2 = 9$ có tọa độ tâm $I$ và bán kính $R$ là:",
        "options": {
            "A": "I(1; -2; 0), R = 3",
            "B": "I(-1; 2; 0), R = 9",
            "C": "I(1; -2; 0), R = 9",
            "D": "I(-1; 2; 0), R = 3"
        },
        "correct_answer": "A",
        "micro_explanation": "Phương trình $(x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$ có tâm $I(a; b; c) = (1; -2; 0)$ và bán kính $R = \\sqrt{9} = 3$.",
        "growth_mindset_tip": "Cẩn thận dấu trừ trong ngoặc và nhớ khai căn bậc hai của R bình phương!"
    },
    {
        "id": "B00-Q3-BOSS-30D",
        "block": "B00",
        "subject": "Sinh học",
        "slot_type": "BOSS_30D",
        "source": "Đề thi Tốt nghiệp THPT - Di truyền quần thể phân hóa 9+",
        "bloom_level": "Vận dụng cao 8+ (90s)",
        "lock_condition": "YEUCAUSTREAK30NGAY",
        "time_limit_seconds": 90,
        "question_text": "Một quần thể thực vật giao phấn ngẫu nhiên đang cân bằng di truyền có tần số alen $A = 0.6$ và $a = 0.4$. Trong số các cá thể mang kiểu hình trội ở thế hệ này, tỉ lệ cá thể có kiểu gen dị hợp tử ($Aa$) xấp xỉ bằng:",
        "options": {
            "A": "48%",
            "B": "57.1%",
            "C": "36%",
            "D": "24%"
        },
        "correct_answer": "B",
        "micro_explanation": "Cấu trúc quần thể: $0.36 AA : 0.48 Aa : 0.16 aa$. Nhóm cá thể mang kiểu hình trội gồm $0.36 AA + 0.48 Aa = 0.84$. Tỉ lệ dị hợp trong nhóm trội là $\\frac{0.48}{0.84} \\approx 57.14\\%$.",
        "growth_mindset_tip": "🔥 Xuất sắc hạ gục bẫy 'Trong số cá thể trội'! Bạn tính mẫu số điều kiện cực kỳ tỉnh táo!"
    },

    # ================= KHỐI C00 =================
    {
        "id": "C00-Q1-REFLEX",
        "block": "C00",
        "subject": "Lịch sử",
        "slot_type": "REFLEX_1",
        "source": "Lịch sử Việt Nam hiện đại 12",
        "bloom_level": "Nhận biết (45s)",
        "time_limit_seconds": 45,
        "lock_condition": "MOTUDO",
        "question_text": "Chiến thắng quân sự nào của quân và dân ta đã làm phá sản hoàn toàn Kế hoạch Nava của thực dân Pháp, buộc Pháp phải ký Hiệp định Giơnevơ năm 1954?",
        "options": {
            "A": "Chiến dịch Việt Bắc thu - đông 1947",
            "B": "Chiến dịch Biên giới thu - đông 1950",
            "C": "Chiến thắng Điện Biên Phủ 1954",
            "D": "Chiến dịch Thượng Lào 1953"
        },
        "correct_answer": "C",
        "micro_explanation": "Chiến thắng Điện Biên Phủ (07/05/1954) là mốc son chói lọi đập tan hoàn toàn kế hoạch Nava, xoay chuyển cục diện chiến tranh.",
        "growth_mindset_tip": "Các mốc sự kiện mang tính bước ngoặt lịch sử luôn là điểm số dễ lấy nhất!"
    },
    {
        "id": "C00-Q2-TRAP",
        "block": "C00",
        "subject": "Địa lí",
        "slot_type": "TRAP_2",
        "source": "Kỹ năng tính toán địa lí GDPT 2018",
        "bloom_level": "Thông hiểu (60s)",
        "time_limit_seconds": 60,
        "lock_condition": "MOTUDO",
        "question_text": "Năm 2024, một tỉnh có số dân là 1.800.000 người và diện tích tự nhiên là 3.600 km². Mật độ dân số của tỉnh đó là:",
        "options": {
            "A": "500 người/km²",
            "B": "200 người/km²",
            "C": "0.5 người/km²",
            "D": "2.000 người/km²"
        },
        "correct_answer": "A",
        "micro_explanation": "Công thức mật độ dân số = Dân số / Diện tích = 1.800.000 / 3.600 = 500 người/km².",
        "growth_mindset_tip": "Công thức bỏ túi: Mật độ dân số lấy Người chia cho km vuông. Bấm máy tính nhanh và chính xác!"
    },
    {
        "id": "C00-Q3-STANDARD",
        "block": "C00",
        "subject": "Ngữ văn",
        "slot_type": "DYNAMIC_3",
        "source": "Phương thức biểu đạt GDPT 2018",
        "bloom_level": "Nhận biết (45s)",
        "time_limit_seconds": 45,
        "lock_condition": "MOTUDO",
        "question_text": "Đoạn văn trích dẫn từ văn bản về một di tích lịch sử cung cấp số liệu về năm xây dựng, kích thước tường thành và chất liệu xây dựng chủ yếu sử dụng phương thức biểu đạt nào?",
        "options": {
            "A": "Tự sự",
            "B": "Biểu cảm",
            "C": "Thuyết minh",
            "D": "Nghị luận"
        },
        "correct_answer": "C",
        "micro_explanation": "Phương thức thuyết minh có đặc trưng là cung cấp tri thức, số liệu khách quan, cấu trúc hình thành của sự vật, hiện tượng.",
        "growth_mindset_tip": "Nhận diện số liệu + thông tin khách quan = Thuyết minh!"
    },
    {
        "id": "C00-Q3-BOSS-30D",
        "block": "C00",
        "subject": "Lịch sử",
        "slot_type": "BOSS_30D",
        "source": "Đề thi Tốt nghiệp THPT - Phân hóa so sánh chiến lược 8.5+",
        "bloom_level": "Vận dụng cao 8+ (90s)",
        "lock_condition": "YEUCAUSTREAK30NGAY",
        "time_limit_seconds": 90,
        "question_text": "Điểm khác biệt cốt lõi về lực lượng tham chiến chủ yếu giữa chiến lược 'Chiến tranh đặc biệt' (1961–1965) và 'Chiến tranh cục bộ' (1965–1968) của Mỹ ở miền Nam Việt Nam là:",
        "options": {
            "A": "Chiến tranh đặc biệt dùng quân viễn chinh Mỹ; Chiến tranh cục bộ dùng quân đội Sài Gòn.",
            "B": "Chiến tranh đặc biệt dùng quân đội Sài Gòn làm nòng cốt; Chiến tranh cục bộ dùng quân viễn chinh Mỹ và đồng minh trực tiếp tham chiến giữ vai trò nòng cốt.",
            "C": "Cả hai chiến lược đều chỉ dùng không quân và hải quân đánh phá miền Bắc.",
            "D": "Chiến tranh cục bộ có sự tham gia của quân đội Liên Hợp Quốc."
        },
        "correct_answer": "B",
        "micro_explanation": "Bản chất: Chiến tranh đặc biệt là 'Dùng người Việt đánh người Việt' (quân đội Sài Gòn là nòng cốt), còn Chiến tranh cục bộ Mỹ đưa quân viễn chinh trực tiếp tham chiến giữ vai trò chủ đạo.",
        "growth_mindset_tip": "🔥 Chinh phục Boss Lịch Sử! Tư duy so sánh bản chất thời kỳ của bạn rất sắc bén!"
    },

    # ================= KHỐI A01 =================
    {
        "id": "A01-Q1-REFLEX",
        "block": "A01",
        "subject": "Vật lí",
        "slot_type": "REFLEX_1",
        "source": "Vật lí 12 - Thang nhiệt độ Kelvin",
        "bloom_level": "Nhận biết (45s)",
        "time_limit_seconds": 45,
        "lock_condition": "MOTUDO",
        "question_text": "Nhiệt độ $27^\\circ C$ tương ứng với bao nhiêu Kelvin ($K$)?",
        "options": {
            "A": "300 K",
            "B": "246 K",
            "C": "327 K",
            "D": "273 K"
        },
        "correct_answer": "A",
        "micro_explanation": "Công thức chuyển đổi nhiệt độ tuyệt đối: $T(K) = t(^\\circ C) + 273 = 27 + 273 = 300 \\, K$.",
        "growth_mindset_tip": "Cộng 273 là ra nhiệt độ Kelvin ngay! Đơn giản và chuẩn xác."
    },
    {
        "id": "A01-Q2-TRAP",
        "block": "A01",
        "subject": "Tiếng Anh",
        "slot_type": "TRAP_2",
        "source": "Quy tắc trọng âm từ 2 âm tiết",
        "bloom_level": "Thông hiểu (45s)",
        "time_limit_seconds": 45,
        "lock_condition": "MOTUDO",
        "question_text": "Which word has a different stress pattern from the others?",
        "options": {
            "A": "attract",
            "B": "decide",
            "C": "offer",
            "D": "prevent"
        },
        "correct_answer": "C",
        "micro_explanation": "Động từ 'offer' nhấn âm 1. Các động từ 2 âm tiết còn lại (attract, decide, prevent) đều nhấn âm 2.",
        "growth_mindset_tip": "Bẫy trọng âm ngoại lệ động từ 2 âm tiết (offer, answer, enter) đã bị bạn hóa giải!"
    },
    {
        "id": "A01-Q3-STANDARD",
        "block": "A01",
        "subject": "Toán học",
        "slot_type": "DYNAMIC_3",
        "source": "Khảo sát hàm số GDPT 2018",
        "bloom_level": "Thông hiểu (60s)",
        "time_limit_seconds": 60,
        "lock_condition": "MOTUDO",
        "question_text": "Cho bảng xét dấu của $f'(x)$ đổi dấu từ âm sang dương khi qua $x = 1$, và đổi dấu từ dương sang âm khi qua $x = 3$. Điểm cực đại của hàm số $f(x)$ là:",
        "options": {
            "A": "x = 1",
            "B": "x = 3",
            "C": "y = 3",
            "D": "x = 0"
        },
        "correct_answer": "B",
        "micro_explanation": "Đạo hàm đổi dấu từ '+' sang '-' khi đi qua điểm $x = 3$ nên hàm số đạt cực đại tại $x = 3$.",
        "growth_mindset_tip": "Nhớ quy tắc: Dương sang Âm là Đỉnh Núi (Cực đại)!"
    },
    {
        "id": "A01-Q3-BOSS-30D",
        "block": "A01",
        "subject": "Vật lí",
        "slot_type": "BOSS_30D",
        "source": "Đề thi Tốt nghiệp THPT - Năng lượng hạt nhân thực tế 8.5+",
        "bloom_level": "Vận dụng cao 8+ (90s)",
        "lock_condition": "YEUCAUSTREAK30NGAY",
        "time_limit_seconds": 90,
        "question_text": "Một nhà máy điện hạt nhân sử dụng nhiên liệu phân hạch $^{235}U$. Biết mỗi phân hạch tỏa ra năng lượng 200 MeV. Nếu nhà máy sản xuất công suất điện 1.000 MW với hiệu suất chuyển hóa nhiệt – điện là 25%, thì công suất nhiệt toàn phần lò phản ứng phải cung cấp là:",
        "options": {
            "A": "250 MW",
            "B": "4.000 MW",
            "C": "1.250 MW",
            "D": "2.500 MW"
        },
        "correct_answer": "B",
        "micro_explanation": "Hiệu suất: $H = \\frac{P_{điện}}{P_{nhiệt}} \\Rightarrow P_{nhiệt} = \\frac{P_{điện}}{H} = \\frac{1.000}{0.25} = 4.000 \\, MW$. Bẫy phổ biến: Nhân với hiệu suất (1000 * 0.25 = 250 MW).",
        "growth_mindset_tip": "🔥 Chinh phục Boss Vật Lí 30 Ngày! Năng lượng toàn phần luôn phải lớn hơn năng lượng có ích!"
    }
]
