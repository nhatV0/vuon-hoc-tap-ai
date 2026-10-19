import { CONCRETE_DEBATE_QUESTIONS_ENGLISH } from "./concrete-debate-questions-english";
import { CONCRETE_DEBATES_PART2 } from "./concrete-debate-questions-part2";
import { CONCRETE_DEBATES_PART3 } from "./concrete-debate-questions-part3";

export interface FallbackDebateItem {
  question: string;
  sample_answer: string;
  topic_hint: string;
}

export const CONCRETE_DEBATE_QUESTIONS: Record<string, Record<string, FallbackDebateItem[]>> = {
  "Tin học": {
    "Cơ sở dữ liệu và Hệ quản trị CSDL": [
      {
        question: "Định nghĩa Khóa chính (Primary Key) trong mô hình CSDL quan hệ là gì và nêu 2 đặc tính bắt buộc của nó?",
        sample_answer: "Khóa chính là một hoặc một tập hợp thuộc tính tối thiểu dùng để định danh duy nhất mỗi bản ghi trong bảng. Hai đặc tính bắt buộc: giá trị không được trùng lặp và không được mang giá trị rỗng (NOT NULL).",
        topic_hint: "Định nghĩa Khóa chính & Ràng buộc toàn vẹn"
      },
      {
        question: "Điền thuật ngữ thích hợp vào chỗ trống [...]: 'Trong CSDL quan hệ, mối liên kết logic giữa hai bảng được thiết lập nhờ [...] tham chiếu đến khóa chính của bảng kia.'",
        sample_answer: "Khóa ngoại (Foreign Key).",
        topic_hint: "Điền khuyết: Khái niệm Khóa ngoại"
      },
      {
        question: "Hãy sắp xếp thứ tự đúng (1 - 2 - 3) của các lệnh sau để tạo và cấu hình bảng mới trong SQL: (A) INSERT dữ liệu, (B) CREATE TABLE định nghĩa cấu trúc, (C) SELECT truy vấn kết quả.",
        sample_answer: "Thứ tự đúng là: (B) -> (A) -> (C) (hoặc 2 - 1 - 3). Đầu tiên phải CREATE TABLE để có khung bảng, sau đó INSERT dữ liệu, cuối cùng mới dùng SELECT để truy vấn.",
        topic_hint: "Sắp xếp quy trình thao tác SQL"
      },
      {
        question: "'Lệnh dùng để xóa toàn bộ cấu trúc bảng cùng toàn bộ dữ liệu vĩnh viễn khỏi CSDL và không thể ROLLBACK'. Đây là lệnh SQL nào và thuộc nhóm lệnh nào (DDL hay DML)?",
        sample_answer: "Đây là lệnh DROP TABLE, thuộc nhóm ngôn ngữ định nghĩa dữ liệu (DDL - Data Definition Language).",
        topic_hint: "Truy ngược: Phân biệt lệnh DROP TABLE (DDL)"
      },
      {
        question: "Có nhận định cho rằng: 'Quan hệ Nhiều - Nhiều (N - N) giữa hai bảng có thể thiết lập trực tiếp mà không cần bảng trung gian'. Quan điểm này đúng hay sai? Vì sao?",
        sample_answer: "Sai. Quan hệ N - N bắt buộc phải phân rã thông qua một bảng trung gian chứa 2 khóa ngoại tham chiếu đến 2 bảng ban đầu để tránh vi phạm chuẩn hóa và dư thừa dữ liệu.",
        topic_hint: "Phản biện: Quan hệ N - N và Bảng trung gian"
      }
    ],
    "Kĩ thuật lập trình & Quản trị CSDL chuyên sâu": [
      {
        question: "Có ý kiến cho rằng: 'Thuật toán tìm kiếm nhị phân có thể áp dụng hiệu quả trên mọi danh sách bất kỳ mà không cần sắp xếp trước'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Tìm kiếm nhị phân dựa trên nguyên tắc chia đôi và so sánh phần tử ở giữa, do đó bắt buộc danh sách đầu vào phải được sắp xếp theo thứ tự tăng hoặc giảm dần.",
        topic_hint: "Điều kiện tiên quyết của Tìm kiếm nhị phân"
      },
      {
        question: "Có nhận định cho rằng: 'Độ phức tạp thời gian O(n log n) của thuật toán Merge Sort luôn chậm hơn O(n) của thuật toán tìm kiếm tuần tự'. Đúng hay sai? Vì sao?",
        sample_answer: "Đúng về độ lớn lý thuyết O(n log n) > O(n), nhưng so sánh này khập khiễng vì Merge Sort là bài toán sắp xếp dữ liệu, còn tìm kiếm tuần tự chỉ là bài toán duyệt tìm một phần tử.",
        topic_hint: "Đánh giá độ phức tạp thời gian thuật toán"
      }
    ],
    "Trí tuệ nhân tạo (AI) & Mạng máy tính": [
      {
        question: "Có ý kiến cho rằng: 'Mô hình ngôn ngữ lớn (LLM) thực sự có ý thức và tư duy giống con người'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. LLM là mô hình xác suất thống kê dự đoán từ tiếp theo dựa trên khối lượng văn bản huấn luyện khổng lồ, không có ý thức, cảm xúc hay khả năng tự nhận thức nội tại.",
        topic_hint: "Bản chất toán học và cơ chế của LLM"
      },
      {
        question: "Có nhận định cho rằng: 'Địa chỉ IP và địa chỉ MAC có cùng chức năng nên mạng máy tính chỉ cần một trong hai'. Quan điểm này đúng hay sai? Vì sao?",
        sample_answer: "Sai. Địa chỉ MAC là địa chỉ vật lý gắn cứng vào card mạng ở tầng liên kết dữ liệu, còn địa chỉ IP là địa chỉ logic có thể thay đổi phục vụ định tuyến gói tin qua các mạng khác nhau.",
        topic_hint: "Phân biệt địa chỉ IP và địa chỉ MAC"
      }
    ]
  },
  "Toán học": {
    "Hàm số mũ và hàm số lôgarit": [
      {
        question: "Có ý kiến cho rằng: 'Hàm số y = log_a(x) xác định với mọi giá trị thực x khác 0'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Biểu thức dưới dấu logarit bắt buộc phải nhận giá trị thực dương (x > 0), không chấp nhận x < 0 hay x = 0 trong tập số thực.",
        topic_hint: "Điều kiện xác định của biểu thức logarit"
      },
      {
        question: "Có nhận định rằng: 'Phương trình a^x = b luôn luôn có nghiệm duy nhất với mọi số thực b'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Với cơ số a > 0 và a khác 1, hàm số a^x luôn nhận giá trị dương (a^x > 0). Do đó nếu b <= 0 thì phương trình vô nghiệm.",
        topic_hint: "Tập giá trị của hàm số mũ a^x"
      },
      {
        question: "Có ý kiến khẳng định: 'Hàm số y = a^x luôn đồng biến trên R với mọi giá trị cơ số a > 0'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Hàm số y = a^x chỉ đồng biến khi cơ số a > 1; còn khi 0 < a < 1 thì hàm số nghịch biến trên toàn bộ trục số thực R.",
        topic_hint: "Tính đơn điệu của hàm số mũ theo cơ số a"
      }
    ],
    "Quan hệ vuông góc trong không gian": [
      {
        question: "Có ý kiến cho rằng: 'Nếu đường thẳng d vuông góc với hai đường thẳng bất kì nằm trong mặt phẳng (P) thì d vuông góc với (P)'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Đường thẳng d phải vuông góc với hai đường thẳng CẮT NHAU cùng nằm trong mặt phẳng (P). Nếu hai đường thẳng đó song song thì d chưa chắc vuông góc với (P).",
        topic_hint: "Điều kiện đường thẳng vuông góc mặt phẳng"
      },
      {
        question: "Có nhận định rằng: 'Hai mặt phẳng cùng vuông góc với một mặt phẳng thứ ba thì bắt buộc phải song song với nhau'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Hai mặt phẳng cùng vuông góc với một mặt phẳng thứ ba hoàn toàn có thể cắt nhau theo một giao tuyến cũng vuông góc với mặt phẳng thứ ba đó (ví dụ hai bức tường vuông góc mặt sàn).",
        topic_hint: "Mối quan hệ vị trí giữa các mặt phẳng vuông góc"
      }
    ],
    "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số": [
      {
        question: "Có ý kiến cho rằng: 'Nếu f'(x0) = 0 thì điểm x0 chắc chắn là điểm cực trị của hàm số y = f(x)'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Đạo hàm bằng 0 tại x0 là điều kiện cần nhưng chưa đủ; đạo hàm f'(x) bắt buộc phải đổi dấu khi đi qua điểm x0 thì x0 mới là điểm cực trị (ví dụ hàm y = x^3 có f'(0) = 0 nhưng không là cực trị).",
        topic_hint: "Điều kiện cần và đủ của điểm cực trị"
      },
      {
        question: "Có nhận định rằng: 'Đồ thị hàm số y = f(x) có tiệm cận đứng x = x0 thì hàm số bắt buộc phải không xác định tại x0'. Đúng hay sai? Vì sao?",
        sample_answer: "Đúng. Tiệm cận đứng x = x0 xuất hiện khi giới hạn của hàm số tiến về vô cực khi x dần tới x0, đòi hỏi x0 là điểm gián đoạn hoặc điểm biên mà hàm số không xác định.",
        topic_hint: "Bản chất giới hạn của tiệm cận đứng"
      }
    ]
  },
  "Vật lí": {
    "Vật lí nhiệt": [
      {
        question: "Có ý kiến nhận định rằng: 'Nhiệt độ của một vật càng cao thì nhiệt lượng chứa trong vật đó càng lớn'. Đúng hay sai? Tại sao?",
        sample_answer: "Sai. Nhiệt lượng không phải là một dạng năng lượng chứa sẵn trong vật mà là phần nhiệt năng được truyền từ vật này sang vật khác trong quá trình truyền nhiệt. Vật chỉ chứa nội năng chứ không chứa nhiệt lượng.",
        topic_hint: "Bản chất khái niệm Nội năng và Nhiệt lượng"
      },
      {
        question: "Có ý kiến cho rằng: 'Trong quá trình một chất rắn kết tinh nóng chảy hoàn toàn, nhiệt độ của chất đó liên tục tăng lên'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Trong suốt thời gian nóng chảy của chất rắn kết tinh, nhiệt độ được giữ không đổi ở nhiệt độ nóng chảy vì toàn bộ nhiệt lượng cung cấp được dùng để phá vỡ mạng tinh thể.",
        topic_hint: "Quá trình chuyển thể & Nhiệt độ nóng chảy"
      }
    ],
    "Khí lí tưởng": [
      {
        question: "Có nhận định cho rằng: 'Trong quá trình biến đổi đẳng nhiệt của một lượng khí lí tưởng xác định, khi thể tích giảm một nửa thì áp suất của khối khí cũng giảm đi một nửa'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Theo định luật Boyle, trong quá trình đẳng nhiệt, áp suất tỉ lệ nghịch với thể tích (p.V = hằng số). Do đó khi thể tích giảm một nửa thì áp suất phải tăng gấp đôi.",
        topic_hint: "Định luật Boyle trong quá trình đẳng nhiệt"
      }
    ]
  },
  "Hóa học": {
    "Dẫn xuất halogen": [
      {
        question: "Có ý kiến cho rằng: 'Mọi dẫn xuất halogen đều có thể tham gia phản ứng tách hiđro halogenua (HX) để tạo thành anken tương ứng'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Phản ứng tách HX chỉ xảy ra khi nguyên tử cacbon kế bên (vị trí beta) có gắn ít nhất một nguyên tử hiđro. Ví dụ CH3-Cl hoặc (CH3)3C-CH2-Cl không có hiđro beta nên không thể tách tạo anken.",
        topic_hint: "Quy tắc tách Zaitsev và điều kiện hiđro beta"
      }
    ],
    "Ester - Lipid": [
      {
        question: "Có ý kiến cho rằng: 'Phản ứng thủy phân este trong môi trường kiềm (phản ứng xà phòng hóa) là phản ứng thuận nghịch hai chiều'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Phản ứng thủy phân este trong môi trường axit mới là phản ứng thuận nghịch. Trong môi trường kiềm, phản ứng xảy ra một chiều vì muối carboxylat tạo thành không phản ứng lại với ancol.",
        topic_hint: "Đặc điểm phản ứng thủy phân este"
      }
    ]
  },
  ...CONCRETE_DEBATES_PART2,
  ...CONCRETE_DEBATES_PART3,
  "Tiếng Anh": CONCRETE_DEBATE_QUESTIONS_ENGLISH
};

export function getConcreteDebateItem(subject: string, chapterTitle: string, index: number, priorQuestions: string[] = []): FallbackDebateItem {
  const subjMap = CONCRETE_DEBATE_QUESTIONS[subject];
  if (subjMap) {
    const rawClean = chapterTitle
      .replace(/Chương\s+[0-9IVXLCDM]+:?\s*/gi, "")
      .replace(/Unit\s+\d+:?\s*/gi, "")
      .trim()
      .toLowerCase();

    let candidateList: FallbackDebateItem[] = [];
    for (const [key, questions] of Object.entries(subjMap)) {
      const keyClean = key.toLowerCase();
      if (rawClean.includes(keyClean) || keyClean.includes(rawClean) || questions.some((q) => q.topic_hint.toLowerCase().includes(rawClean))) {
        candidateList = questions;
        break;
      }
    }

    if (candidateList.length === 0) {
      candidateList = Object.values(subjMap).flat();
    }

    // Filter out questions that have already been asked in this session
    const unasked = candidateList.filter((item) => !priorQuestions.includes(item.question));
    if (unasked.length > 0) {
      return unasked[(index - 1) % unasked.length];
    }
    if (candidateList.length > 0) {
      return candidateList[(index - 1) % candidateList.length];
    }
  }

  const focusClean = chapterTitle.replace(/^Chương\s+[0-9IVXLCDM]+:?\s*/i, "").trim() || subject;
  return {
    question: `Trong nội dung "${focusClean}" môn ${subject}, có nhận định cho rằng chỉ cần ghi nhớ kết quả thay vì hiểu rõ bản chất cơ chế hay nguyên nhân sâu xa. Nhận định này đúng hay sai? Vì sao?`,
    sample_answer: `Cần nắm chắc bản chất, điều kiện áp dụng và cơ sở khoa học trong ${focusClean} để giải thích hiện tượng và giải quyết bài toán chính xác.`,
    topic_hint: focusClean
  };
}
