import { DOMAIN_CONCRETE_DEBATES_PART2 } from "./socratic.concrete-debates-part2";
import { DOMAIN_CONCRETE_DEBATES_PART3 } from "./socratic.concrete-debates-part3";
import { DOMAIN_CONCRETE_DEBATES_ENGLISH } from "./socratic.concrete-debates-english";

export interface ConcreteDebateSeed {
  question: string;
  sample_answer: string;
  topic_hint: string;
  key_points: string[];
}

const PART1: Record<string, Record<string, ConcreteDebateSeed[]>> = {
  "Tin học": {
    "Cơ sở dữ liệu và Hệ quản trị CSDL": [
      {
        question: "Định nghĩa Khóa chính (Primary Key) trong mô hình CSDL quan hệ là gì và nêu 2 đặc tính bắt buộc của nó?",
        sample_answer: "Khóa chính là một hoặc một tập hợp thuộc tính tối thiểu dùng để định danh duy nhất mỗi bản ghi trong bảng. Hai đặc tính bắt buộc: giá trị không được trùng lặp và không được mang giá trị rỗng (NOT NULL).",
        topic_hint: "Định nghĩa Khóa chính & Ràng buộc toàn vẹn",
        key_points: ["Định danh duy nhất bản ghi", "Không trùng lặp", "Không được chứa giá trị NULL"]
      },
      {
        question: "Điền thuật ngữ thích hợp vào chỗ trống [...]: 'Trong CSDL quan hệ, mối liên kết logic giữa hai bảng được thiết lập nhờ [...] tham chiếu đến khóa chính của bảng kia.'",
        sample_answer: "Khóa ngoại (Foreign Key).",
        topic_hint: "Điền khuyết: Khái niệm Khóa ngoại",
        key_points: ["Khóa ngoại", "Foreign Key", "FK"]
      },
      {
        question: "Hãy sắp xếp thứ tự đúng (1 - 2 - 3) của các lệnh sau để tạo và cấu hình bảng mới trong SQL: (A) INSERT dữ liệu, (B) CREATE TABLE định nghĩa cấu trúc, (C) SELECT truy vấn kết quả.",
        sample_answer: "Thứ tự đúng là: (B) -> (A) -> (C) (hoặc 2 - 1 - 3). Đầu tiên phải CREATE TABLE để có khung bảng, sau đó INSERT dữ liệu, cuối cùng mới dùng SELECT để truy vấn.",
        topic_hint: "Sắp xếp quy trình thao tác SQL",
        key_points: ["CREATE TABLE trước", "INSERT dữ liệu", "SELECT truy vấn sau cùng"]
      },
      {
        question: "'Lệnh dùng để xóa toàn bộ cấu trúc bảng cùng toàn bộ dữ liệu vĩnh viễn khỏi CSDL và không thể ROLLBACK'. Đây là lệnh SQL nào và thuộc nhóm lệnh nào (DDL hay DML)?",
        sample_answer: "Đây là lệnh DROP TABLE, thuộc nhóm ngôn ngữ định nghĩa dữ liệu (DDL - Data Definition Language).",
        topic_hint: "Truy ngược: Phân biệt lệnh DROP TABLE (DDL)",
        key_points: ["DROP TABLE", "Nhóm lệnh DDL", "Xóa hoàn toàn cấu trúc bảng"]
      },
      {
        question: "Có nhận định cho rằng: 'Quan hệ Nhiều - Nhiều (N - N) giữa hai bảng có thể thiết lập trực tiếp mà không cần bảng trung gian'. Quan điểm này đúng hay sai? Vì sao?",
        sample_answer: "Sai. Quan hệ N - N bắt buộc phải phân rã thông qua một bảng trung gian chứa 2 khóa ngoại tham chiếu đến 2 bảng ban đầu để tránh vi phạm chuẩn hóa và dư thừa dữ liệu.",
        topic_hint: "Phản biện: Quan hệ N - N và Bảng trung gian",
        key_points: ["Bắt buộc dùng bảng trung gian", "Tránh vi phạm chuẩn hóa", "Khóa ngoại kép tham chiếu"]
      }
    ],
    "Kĩ thuật lập trình & Quản trị CSDL chuyên sâu": [
      {
        question: "Có ý kiến cho rằng: 'Thuật toán tìm kiếm nhị phân có thể áp dụng hiệu quả trên mọi danh sách bất kỳ mà không cần sắp xếp trước'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Tìm kiếm nhị phân dựa trên nguyên tắc chia đôi và so sánh phần tử ở giữa, do đó bắt buộc danh sách đầu vào phải được sắp xếp theo thứ tự tăng hoặc giảm dần.",
        topic_hint: "Điều kiện tiên quyết của Tìm kiếm nhị phân",
        key_points: ["Nguyên tắc chia để trị", "Bắt buộc danh sách sắp xếp", "Độ phức tạp O(log n)"]
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
      }
    ],
    "Quan hệ vuông góc trong không gian": [
      {
        question: "Có ý kiến cho rằng: 'Nếu đường thẳng d vuông góc với hai đường thẳng bất kì nằm trong mặt phẳng (P) thì d vuông góc với (P)'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Đường thẳng d phải vuông góc với hai đường thẳng CẮT NHAU cùng nằm trong mặt phẳng (P). Nếu hai đường thẳng đó song song thì d chưa chắc vuông góc với (P).",
        topic_hint: "Điều kiện đường thẳng vuông góc mặt phẳng",
        key_points: ["Bắt buộc hai đường thẳng cắt nhau", "Nằm trong cùng mặt phẳng", "Tránh trường hợp song song"]
      }
    ],
    "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số": [
      {
        question: "Có ý kiến cho rằng: 'Nếu f'(x0) = 0 thì điểm x0 chắc chắn là điểm cực trị của hàm số y = f(x)'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Đạo hàm bằng 0 tại x0 là điều kiện cần nhưng chưa đủ; đạo hàm f'(x) bắt buộc phải đổi dấu khi đi qua điểm x0 thì x0 mới là điểm cực trị.",
        topic_hint: "Điều kiện cần và đủ của điểm cực trị",
        key_points: ["Điều kiện cần f'(x0) = 0", "Điều kiện đủ: f'(x) đổi dấu", "Phản ví dụ y = x^3"]
      }
    ]
  }
};

export const DOMAIN_CONCRETE_DEBATES: Record<string, Record<string, ConcreteDebateSeed[]>> = {
  ...PART1,
  ...DOMAIN_CONCRETE_DEBATES_PART2,
  ...DOMAIN_CONCRETE_DEBATES_PART3,
  "Tiếng Anh": DOMAIN_CONCRETE_DEBATES_ENGLISH
};

export function findDomainConcreteDebate(
  subject: string,
  chapterTitle: string,
  index: number,
  priorQuestions: string[] = []
): ConcreteDebateSeed {
  const subj = DOMAIN_CONCRETE_DEBATES[subject];
  if (subj) {
    const rawClean = chapterTitle
      .replace(/Chương\s+[0-9IVXLCDM]+:?\s*/gi, "")
      .replace(/Unit\s+\d+:?\s*/gi, "")
      .trim()
      .toLowerCase();

    let candidateList: ConcreteDebateSeed[] = [];
    for (const [chKey, list] of Object.entries(subj)) {
      const keyClean = chKey.toLowerCase();
      if (rawClean.includes(keyClean) || keyClean.includes(rawClean) || list.some((item) => item.topic_hint.toLowerCase().includes(rawClean))) {
        candidateList = list;
        break;
      }
    }

    if (candidateList.length === 0) {
      candidateList = Object.values(subj).flat();
    }

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
    topic_hint: focusClean,
    key_points: ["Bản chất lý thuyết", "Cơ sở thực tiễn"]
  };
}
