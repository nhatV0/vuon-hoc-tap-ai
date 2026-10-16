export interface ConcreteDebateSeed {
  question: string;
  sample_answer: string;
  topic_hint: string;
  key_points: string[];
}

export const DOMAIN_CONCRETE_DEBATES: Record<string, Record<string, ConcreteDebateSeed[]>> = {
  "Tin học": {
    "Cơ sở dữ liệu và Hệ quản trị CSDL": [
      {
        question: "Có ý kiến cho rằng: 'Trong cơ sở dữ liệu quan hệ, một bảng không nhất thiết phải có khóa chính (Primary Key)'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Trong CSDL quan hệ, mỗi bảng bắt buộc phải có ít nhất một khóa chính để định danh duy nhất mỗi bản ghi, bảo toàn tính toàn vẹn thực thể và cho phép các bảng khác tham chiếu liên kết qua khóa ngoại.",
        topic_hint: "Khóa chính & Tính toàn vẹn thực thể",
        key_points: ["Định danh duy nhất bản ghi", "Tính toàn vẹn thực thể", "Tham chiếu qua khóa ngoại"]
      },
      {
        question: "Có nhận định cho rằng: 'Hệ quản trị CSDL chỉ đóng vai trò lưu trữ các tệp dữ liệu, còn kiểm soát truy cập và sao lưu dữ liệu là do hệ điều hành đảm nhận'. Quan điểm này đúng hay sai? Tại sao?",
        sample_answer: "Sai. Hệ quản trị CSDL (DBMS) tích hợp đầy đủ cơ chế bảo mật phân quyền (GRANT/REVOKE), kiểm soát truy cập đồng thời, tối ưu truy vấn và sao lưu phục hồi dữ liệu tự động, vượt xa chức năng tệp của hệ điều hành.",
        topic_hint: "Vai trò của Hệ quản trị CSDL (DBMS)",
        key_points: ["Cơ chế bảo mật phân quyền GRANT/REVOKE", "Kiểm soát đồng thời", "Tự động sao lưu và phục hồi"]
      },
      {
        question: "Có ý kiến cho rằng: 'Quan hệ Nhiều - Nhiều (N - N) giữa hai bảng có thể thiết lập trực tiếp bằng cách đặt khóa chính của bảng này làm khóa ngoại của bảng kia'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Quan hệ N - N không thể liên kết trực tiếp giữa hai bảng vì sẽ vi phạm chuẩn hóa và dư thừa dữ liệu; bắt buộc phải phân rã thông qua một bảng trung gian chứa khóa ngoại tham chiếu đến hai bảng ban đầu.",
        topic_hint: "Mối quan hệ N - N & Bảng trung gian",
        key_points: ["Tránh vi phạm chuẩn hóa", "Bảng trung gian (Junction table)", "Khóa ngoại kép tham chiếu"]
      },
      {
        question: "Trong SQL, có quan điểm cho rằng: 'Lệnh DELETE và DROP TABLE đều làm mất dữ liệu nên hoàn toàn giống nhau'. Quan điểm này đúng hay sai? Vì sao?",
        sample_answer: "Sai. DELETE là lệnh DML chỉ xóa các dòng dữ liệu bên trong bảng nhưng vẫn giữ nguyên cấu trúc bảng. DROP TABLE là lệnh DDL xóa vĩnh viễn toàn bộ cấu trúc bảng và định nghĩa khỏi CSDL.",
        topic_hint: "Phân biệt DELETE (DML) và DROP TABLE (DDL)",
        key_points: ["DELETE là DML giữ cấu trúc", "DROP là DDL xóa định nghĩa bảng", "Khả năng Rollback khác nhau"]
      },
      {
        question: "Có ý kiến cho rằng: 'Tính độc lập dữ liệu trong CSDL nghĩa là người dùng có thể xóa một trường dữ liệu mà không ảnh hưởng gì đến các ứng dụng đang khai thác'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Tính độc lập dữ liệu là sự tách biệt giữa mức vật lý (lưu trữ đĩa) và mức logic. Nếu xóa một trường đang được ứng dụng truy vấn thì ứng dụng sẽ phát sinh lỗi cú pháp hoặc thiếu dữ liệu tham chiếu.",
        topic_hint: "Tính độc lập dữ liệu mức logic & vật lý",
        key_points: ["Tách biệt vật lý và logic", "Ứng dụng phụ thuộc mức logic", "Ràng buộc tham chiếu"]
      }
    ],
    "Kĩ thuật lập trình & Quản trị CSDL chuyên sâu": [
      {
        question: "Có ý kiến cho rằng: 'Thuật toán tìm kiếm nhị phân có thể áp dụng hiệu quả trên mọi danh sách bất kỳ mà không cần sắp xếp trước'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Tìm kiếm nhị phân dựa trên nguyên tắc chia đôi và so sánh phần tử ở giữa, do đó bắt buộc danh sách đầu vào phải được sắp xếp theo thứ tự tăng hoặc giảm dần.",
        topic_hint: "Điều kiện tiên quyết của Tìm kiếm nhị phân",
        key_points: ["Nguyên tắc chia để trị", "Bắt buộc danh sách sắp xếp", "Độ phức tạp O(log n)"]
      },
      {
        question: "Có nhận định cho rằng: 'Độ phức tạp thời gian O(n log n) của thuật toán Merge Sort luôn chậm hơn O(n) của thuật toán tìm kiếm tuần tự'. Đúng hay sai? Vì sao?",
        sample_answer: "Đúng về độ lớn lý thuyết O(n log n) > O(n), nhưng so sánh này khập khiễng vì Merge Sort là bài toán sắp xếp toàn bộ dữ liệu, còn tìm kiếm tuần tự chỉ là bài toán duyệt tìm một phần tử.",
        topic_hint: "Đánh giá độ phức tạp thuật toán",
        key_points: ["So sánh khác bài toán mục tiêu", "Sắp xếp toàn bộ vs Tìm kiếm đơn lẻ", "Độ phức tạp tiệm cận"]
      }
    ],
    "Trí tuệ nhân tạo (AI) & Mạng máy tính": [
      {
        question: "Có ý kiến cho rằng: 'Mô hình ngôn ngữ lớn (LLM) thực sự có ý thức và tư duy giống con người'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. LLM là mô hình xác suất thống kê dự đoán từ tiếp theo dựa trên khối lượng văn bản huấn luyện khổng lồ, không có ý thức, cảm xúc hay khả năng tự nhận thức nội tại.",
        topic_hint: "Bản chất toán học và cơ chế của LLM",
        key_points: ["Xác suất thống kê", "Dự đoán token tiếp theo", "Không có ý thức sinh học"]
      },
      {
        question: "Có nhận định cho rằng: 'Địa chỉ IP và địa chỉ MAC có cùng chức năng nên mạng máy tính chỉ cần một trong hai'. Quan điểm này đúng hay sai? Tại sao?",
        sample_answer: "Sai. Địa chỉ MAC là địa chỉ vật lý gắn cứng vào card mạng ở tầng liên kết dữ liệu, còn địa chỉ IP là địa chỉ logic có thể thay đổi phục vụ định tuyến gói tin qua các mạng khác nhau.",
        topic_hint: "Phân biệt địa chỉ IP và địa chỉ MAC",
        key_points: ["MAC là địa chỉ vật lý tầng Data Link", "IP là địa chỉ logic tầng Network", "Định tuyến liên mạng"]
      }
    ]
  },
  "Toán học": {
    "Hàm số mũ và hàm số lôgarit": [
      {
        question: "Có ý kiến cho rằng: 'Hàm số y = log_a(x) xác định với mọi giá trị thực x khác 0'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Biểu thức dưới dấu logarit bắt buộc phải nhận giá trị thực dương (x > 0), không chấp nhận x < 0 hay x = 0 trong tập số thực.",
        topic_hint: "Điều kiện xác định của biểu thức logarit",
        key_points: ["Điều kiện x > 0", "Tập xác định D = (0; +vô cực)", "Bản chất hàm ngược của hàm mũ"]
      },
      {
        question: "Có nhận định rằng: 'Phương trình a^x = b luôn luôn có nghiệm duy nhất với mọi số thực b'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Với cơ số a > 0 và a khác 1, hàm số a^x luôn nhận giá trị dương (a^x > 0). Do đó nếu b <= 0 thì phương trình vô nghiệm.",
        topic_hint: "Tập giá trị của hàm số mũ a^x",
        key_points: ["Tập giá trị (0; +vô cực)", "Vô nghiệm khi b <= 0", "Nghiệm x = log_a(b) khi b > 0"]
      },
      {
        question: "Có ý kiến khẳng định: 'Hàm số y = a^x luôn đồng biến trên R với mọi giá trị cơ số a > 0'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Hàm số y = a^x chỉ đồng biến khi cơ số a > 1; còn khi 0 < a < 1 thì hàm số nghịch biến trên toàn bộ trục số thực R.",
        topic_hint: "Tính đơn điệu của hàm số mũ theo cơ số a",
        key_points: ["Đồng biến khi a > 1", "Nghịch biến khi 0 < a < 1", "Đạo hàm y' = a^x * ln(a)"]
      }
    ],
    "Quan hệ vuông góc trong không gian": [
      {
        question: "Có ý kiến cho rằng: 'Nếu đường thẳng d vuông góc với hai đường thẳng bất kì nằm trong mặt phẳng (P) thì d vuông góc với (P)'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Đường thẳng d phải vuông góc với hai đường thẳng CẮT NHAU cùng nằm trong mặt phẳng (P). Nếu hai đường thẳng đó song song thì d chưa chắc vuông góc với (P).",
        topic_hint: "Điều kiện đường thẳng vuông góc mặt phẳng",
        key_points: ["Bắt buộc hai đường thẳng cắt nhau", "Nằm trong cùng mặt phẳng", "Tránh trường hợp song song"]
      },
      {
        question: "Có nhận định rằng: 'Hai mặt phẳng cùng vuông góc với một mặt phẳng thứ ba thì bắt buộc phải song song với nhau'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Hai mặt phẳng cùng vuông góc với một mặt phẳng thứ ba hoàn toàn có thể cắt nhau theo một giao tuyến cũng vuông góc với mặt phẳng thứ ba đó (ví dụ hai bức tường vuông góc mặt sàn).",
        topic_hint: "Mối quan hệ vị trí giữa các mặt phẳng vuông góc",
        key_points: ["Có thể cắt nhau theo giao tuyến", "Giao tuyến vuông góc mặt thứ ba", "Mô hình hai tường và sàn"]
      }
    ],
    "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số": [
      {
        question: "Có ý kiến cho rằng: 'Nếu f'(x0) = 0 thì điểm x0 chắc chắn là điểm cực trị của hàm số y = f(x)'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Đạo hàm bằng 0 tại x0 là điều kiện cần nhưng chưa đủ; đạo hàm f'(x) bắt buộc phải đổi dấu khi đi qua điểm x0 thì x0 mới là điểm cực trị (ví dụ hàm y = x^3 có f'(0) = 0 nhưng không là cực trị).",
        topic_hint: "Điều kiện cần và đủ của điểm cực trị",
        key_points: ["Điều kiện cần f'(x0) = 0", "Điều kiện đủ: f'(x) đổi dấu", "Phản ví dụ y = x^3"]
      },
      {
        question: "Có nhận định rằng: 'Đồ thị hàm số y = f(x) có tiệm cận đứng x = x0 thì hàm số bắt buộc phải không xác định tại x0'. Đúng hay sai? Vì sao?",
        sample_answer: "Đúng. Tiệm cận đứng x = x0 xuất hiện khi giới hạn của hàm số tiến về vô cực khi x dần tới x0, đòi hỏi x0 là điểm gián đoạn hoặc điểm biên mà hàm số không xác định.",
        topic_hint: "Bản chất giới hạn của tiệm cận đứng",
        key_points: ["Giới hạn vô cực khi x -> x0", "Điểm gián đoạn hoặc biên", "Định nghĩa tiệm cận đứng"]
      }
    ]
  },
  "Vật lí": {
    "Vật lí nhiệt": [
      {
        question: "Có ý kiến nhận định rằng: 'Nhiệt độ của một vật càng cao thì nhiệt lượng chứa trong vật đó càng lớn'. Đúng hay sai? Tại sao?",
        sample_answer: "Sai. Nhiệt lượng không phải là một dạng năng lượng chứa sẵn trong vật mà là phần nhiệt năng được truyền từ vật này sang vật khác trong quá trình truyền nhiệt. Vật chỉ chứa nội năng chứ không chứa nhiệt lượng.",
        topic_hint: "Bản chất khái niệm Nội năng và Nhiệt lượng",
        key_points: ["Nhiệt lượng là năng lượng truyền qua", "Vật chỉ chứa nội năng", "Nhiệt độ đo động năng phân tử"]
      },
      {
        question: "Có ý kiến cho rằng: 'Trong quá trình một chất rắn kết tinh nóng chảy hoàn toàn, nhiệt độ của chất đó liên tục tăng lên'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Trong suốt thời gian nóng chảy của chất rắn kết tinh, nhiệt độ được giữ không đổi ở nhiệt độ nóng chảy vì toàn bộ nhiệt lượng cung cấp được dùng để phá vỡ mạng tinh thể.",
        topic_hint: "Quá trình chuyển thể & Nhiệt độ nóng chảy",
        key_points: ["Nhiệt độ giữ không đổi", "Năng lượng phá vỡ mạng tinh thể", "Đặc điểm chất rắn kết tinh"]
      }
    ],
    "Khí lí tưởng": [
      {
        question: "Có nhận định cho rằng: 'Trong quá trình biến đổi đẳng nhiệt của một lượng khí lí tưởng xác định, khi thể tích giảm một nửa thì áp suất của khối khí cũng giảm đi một nửa'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Theo định luật Boyle, trong quá trình đẳng nhiệt, áp suất tỉ lệ nghịch với thể tích (p.V = hằng số). Do đó khi thể tích giảm một nửa thì áp suất phải tăng gấp đôi.",
        topic_hint: "Định luật Boyle trong quá trình đẳng nhiệt",
        key_points: ["Định luật Boyle p.V = const", "Tỉ lệ nghịch giữa áp suất và thể tích", "Áp suất tăng gấp đôi"]
      }
    ]
  },
  "Hóa học": {
    "Dẫn xuất halogen": [
      {
        question: "Có ý kiến cho rằng: 'Mọi dẫn xuất halogen đều có thể tham gia phản ứng tách hiđro halogenua (HX) để tạo thành anken tương ứng'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Phản ứng tách HX chỉ xảy ra khi nguyên tử cacbon kế bên (vị trí beta) có gắn ít nhất một nguyên tử hiđro. Ví dụ CH3-Cl hoặc (CH3)3C-CH2-Cl không có hiđro beta nên không thể tách tạo anken.",
        topic_hint: "Quy tắc tách Zaitsev và điều kiện hiđro beta",
        key_points: ["Bắt buộc có hiđro vị trí beta", "Quy tắc Zaitsev", "Phản ví dụ CH3Cl"]
      }
    ],
    "Ester - Lipid": [
      {
        question: "Có ý kiến cho rằng: 'Phản ứng thủy phân este trong môi trường kiềm (phản ứng xà phòng hóa) là phản ứng thuận nghịch hai chiều'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Phản ứng thủy phân este trong môi trường axit mới là phản ứng thuận nghịch. Trong môi trường kiềm, phản ứng xảy ra một chiều vì muối carboxylat tạo thành không phản ứng lại với ancol.",
        topic_hint: "Đặc điểm phản ứng thủy phân este",
        key_points: ["Môi trường kiềm là phản ứng một chiều", "Muối carboxylat bền không thuận nghịch", "Phản ứng xà phòng hóa"]
      }
    ]
  }
};

export function findDomainConcreteDebate(subject: string, chapterTitle: string, index: number): ConcreteDebateSeed {
  const subj = DOMAIN_CONCRETE_DEBATES[subject];
  if (subj) {
    const rawClean = chapterTitle
      .replace(/Chương\s+[0-9IVXLCDM]+:?\s*/gi, "")
      .replace(/Unit\s+\d+:?\s*/gi, "")
      .trim()
      .toLowerCase();

    for (const [chKey, list] of Object.entries(subj)) {
      const keyClean = chKey.toLowerCase();
      if (rawClean.includes(keyClean) || keyClean.includes(rawClean) || list.some((item) => item.topic_hint.toLowerCase().includes(rawClean))) {
        return list[(index - 1) % list.length];
      }
    }

    const allSubj = Object.values(subj).flat();
    if (allSubj.length > 0) {
      return allSubj[(index - 1) % allSubj.length];
    }
  }

  const focusClean = chapterTitle.replace(/^Chương\s+[0-9IVXLCDM]+:?\s*/i, "").trim() || subject;
  return {
    question: `Trong nội dung "${focusClean}" môn ${subject}, có nhận định cho rằng chỉ cần ghi nhớ kết quả thay vì hiểu rõ bản chất cơ chế hay nguyên nhân sâu xa. Nhận định này đúng hay sai? Vì sao?`,
    sample_answer: `Cần nắm chắc bản chất, điều kiện áp dụng và cơ sở khoa học trong ${focusClean} để giải thích hiện tượng và giải quyết bài toán chính xác.`,
    topic_hint: focusClean,
    key_points: ["Bản chất lý thuyết", "Cơ sở thực tiễn"]
  };
}
