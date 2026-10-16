export interface SampleDebateAttempt {
  subject: string;
  question: string;
  student_answer: string;
  sample_answer: string;
  verdict: "chính_xác" | "bán_phần" | "chưa_chính_xác";
  is_correct: number;
}

export interface SampleStudentData {
  id: string;
  name: string;
  grade: string;
  classroom: string;
  target_subject: string;
  selected_flower: string;
  streak: number;
  water_drops: number;
  debates: SampleDebateAttempt[];
}

export const SAMPLE_HALL_OF_FAME: SampleStudentData[] = [
  {
    id: "hs_cbd374f6",
    name: "Nguyễn Mai Anh",
    grade: "12",
    classroom: "12A1",
    target_subject: "Hóa học",
    selected_flower: "sunflower",
    streak: 15,
    water_drops: 26,
    debates: [
      {
        subject: "Hóa học",
        question: "Phản ứng thủy phân este trong môi trường kiềm có phải là phản ứng hai chiều thuận nghịch không?",
        student_answer: "Sai, phản ứng xà phòng hóa là một chiều vì tạo muối carboxylat bền.",
        sample_answer: "Sai. Phản ứng xà phòng hóa este là phản ứng một chiều hoàn toàn.",
        verdict: "chính_xác",
        is_correct: 1
      },
      {
        subject: "Tin học",
        question: "Trong CSDL quan hệ, một bảng có thể không có khóa chính không?",
        student_answer: "Không, bắt buộc phải có khóa chính để định danh duy nhất.",
        sample_answer: "Sai. Bắt buộc cần khóa chính để định danh từng bản ghi và bảo đảm toàn vẹn.",
        verdict: "chính_xác",
        is_correct: 1
      },
      {
        subject: "Toán học",
        question: "Hàm số logarit có xác định với x âm không?",
        student_answer: "Không, biểu thức trong logarit luôn cần lớn hơn 0.",
        sample_answer: "Đúng. Biểu thức trong dấu logarit cần nhận giá trị thực dương.",
        verdict: "chính_xác",
        is_correct: 1
      },
      {
        subject: "Tin học",
        question: "Thuật toán tìm kiếm nhị phân có chạy được trên mảng chưa sắp xếp không?",
        student_answer: "Cần sắp xếp mảng trước khi tìm kiếm nhị phân.",
        sample_answer: "Sai. Tìm kiếm nhị phân bắt buộc mảng phải sắp xếp trước.",
        verdict: "bán_phần",
        is_correct: 1
      }
    ]
  },
  {
    id: "hs_minhnhat_12a1",
    name: "Võ Minh Nhật",
    grade: "12",
    classroom: "12A1",
    target_subject: "Toán học",
    selected_flower: "sunflower",
    streak: 21,
    water_drops: 35,
    debates: [
      {
        subject: "Toán học",
        question: "Có phải hàm số mũ luôn đồng biến trên toàn bộ tập số thực R?",
        student_answer: "Chỉ đồng biến khi cơ số a > 1, còn khi 0 < a < 1 thì nghịch biến.",
        sample_answer: "Sai. Hàm số mũ nghịch biến khi 0 < a < 1.",
        verdict: "chính_xác",
        is_correct: 1
      },
      {
        subject: "Toán học",
        question: "Nếu đạo hàm bậc nhất f'(x0) = 0 thì x0 luôn là điểm cực trị đúng không?",
        student_answer: "Chưa đủ, đạo hàm cần đổi dấu khi đi qua x0.",
        sample_answer: "Sai. f'(x) phải đổi dấu qua x0 thì mới là cực trị.",
        verdict: "chính_xác",
        is_correct: 1
      },
      {
        subject: "Vật lí",
        question: "Nhiệt lượng có phải là năng lượng chứa sẵn bên trong vật thể không?",
        student_answer: "Nhiệt lượng là phần nhiệt năng truyền qua trong trao đổi nhiệt.",
        sample_answer: "Sai. Vật chỉ chứa nội năng, nhiệt lượng là năng lượng trao đổi.",
        verdict: "bán_phần",
        is_correct: 1
      }
    ]
  },
  {
    id: "hs_baongoc_11a2",
    name: "Phạm Bảo Ngọc",
    grade: "11",
    classroom: "11A2",
    target_subject: "Tin học",
    selected_flower: "sunflower",
    streak: 14,
    water_drops: 20,
    debates: [
      {
        subject: "Tin học",
        question: "Lệnh DELETE và DROP TABLE trong SQL có bản chất giống nhau không?",
        student_answer: "DELETE xóa dữ liệu giữ bảng, DROP xóa luôn cả định nghĩa bảng.",
        sample_answer: "Sai. DELETE là lệnh DML giữ cấu trúc bảng, DROP là lệnh DDL xóa vĩnh viễn.",
        verdict: "chính_xác",
        is_correct: 1
      },
      {
        subject: "Tin học",
        question: "Có ý kiến cho rằng mô hình LLM có tư duy và ý thức giống người, đúng không?",
        student_answer: "Sai, LLM là mô hình xác suất thống kê học từ dữ liệu.",
        sample_answer: "Sai. LLM là mạng nơ-ron dự đoán từ tiếp theo dựa trên xác suất.",
        verdict: "chính_xác",
        is_correct: 1
      }
    ]
  },
  {
    id: "hs_tuankiet_11a2",
    name: "Trần Tuấn Kiệt",
    grade: "11",
    classroom: "11A2",
    target_subject: "Vật lí",
    selected_flower: "sunflower",
    streak: 10,
    water_drops: 16,
    debates: [
      {
        subject: "Vật lí",
        question: "Trong quá trình chất rắn kết tinh nóng chảy, nhiệt độ có tăng không?",
        student_answer: "Nhiệt độ giữ nguyên cho đến khi nóng chảy xong hoàn toàn.",
        sample_answer: "Sai. Nhiệt độ của chất rắn kết tinh không đổi trong suốt quá trình nóng chảy.",
        verdict: "chính_xác",
        is_correct: 1
      },
      {
        subject: "Vật lí",
        question: "Trong biến đổi đẳng nhiệt, thể tích giảm một nửa thì áp suất biến đổi thế nào?",
        student_answer: "Áp suất tăng gấp đôi theo định luật Boyle.",
        sample_answer: "Sai. Áp suất tỉ lệ nghịch với thể tích nên áp suất tăng gấp đôi.",
        verdict: "bán_phần",
        is_correct: 1
      }
    ]
  },
  {
    id: "hs_quynhchi_10a1",
    name: "Lê Quỳnh Chi",
    grade: "10",
    classroom: "10A1",
    target_subject: "Tiếng Anh",
    selected_flower: "sunflower",
    streak: 7,
    water_drops: 12,
    debates: [
      {
        subject: "Tiếng Anh",
        question: "Mệnh đề to-infinitive chỉ dùng để chỉ mục đích đúng hay sai?",
        student_answer: "Sai, còn dùng để rút gọn mệnh đề quan hệ với số thứ tự.",
        sample_answer: "Sai. Ngoài chỉ mục đích, to-infinitive còn rút gọn mệnh đề quan hệ.",
        verdict: "chính_xác",
        is_correct: 1
      }
    ]
  }
];
