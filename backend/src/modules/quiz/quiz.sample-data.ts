import { FallbackQuizItem } from "./quiz.types";
import { FALLBACK_SAMPLE_QUIZ_QUESTIONS_PART2 } from "./quiz.sample-data-part2";

export type { FallbackQuizItem };

const PART1: FallbackQuizItem[] = [
  {
    id: "TIN-001",
    block: "A00",
    subject: "Tin học",
    slot_type: "REFLEX_1",
    source: "Cơ sở dữ liệu quan hệ GDPT 2018",
    bloom_level: "Nhận biết (45s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 45,
    question_text: "Trong mô hình cơ sở dữ liệu quan hệ (Relational Database), mỗi hàng (row) của bảng biểu diễn cho:",
    options: {
      A: "Một bản ghi (Record/Tuple)",
      B: "Một trường (Field/Attribute)",
      C: "Một khóa chính (Primary Key)",
      D: "Một lược đồ quan hệ (Schema)"
    },
    correct_answer: "A",
    micro_explanation: "Trong bảng CSDL quan hệ: Mỗi cột là một trường (Field); mỗi hàng là một bản ghi (Record) đại diện cho một thực thể cụ thể.",
    growth_mindset_tip: "Hàng = Bản ghi (Record), Cột = Trường (Field)."
  },
  {
    id: "TIN-002",
    block: "A00",
    subject: "Tin học",
    slot_type: "TRAP_2",
    source: "Ngôn ngữ SQL GDPT 2018",
    bloom_level: "Thông hiểu (60s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 60,
    question_text: "Lệnh nào sau đây trong ngôn ngữ SQL thuộc nhóm ngôn ngữ định nghĩa dữ liệu (DDL - Data Definition Language)?",
    options: {
      A: "ALTER TABLE",
      B: "UPDATE",
      C: "SELECT",
      D: "INSERT INTO"
    },
    correct_answer: "A",
    micro_explanation: "Nhóm DDL định nghĩa và thay đổi cấu trúc bảng gồm CREATE, ALTER TABLE, DROP. Các lệnh DML gồm SELECT, INSERT, UPDATE, DELETE.",
    growth_mindset_tip: "DDL định nghĩa khung cấu trúc, DML thao tác trên nội dung dữ liệu."
  },
  {
    id: "TOAN-001",
    block: "A00",
    subject: "Toán học",
    slot_type: "REFLEX_1",
    source: "Hàm số mũ và logarit",
    bloom_level: "Nhận biết (45s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 45,
    question_text: "Tập xác định của hàm số $y = \\log_3(x - 2)$ là:",
    options: {
      A: "$(2; +\\infty)$",
      B: "$[2; +\\infty)$",
      C: "$(-\\infty; 2)$",
      D: "$\\mathbb{R} \\setminus \\{2\\}$"
    },
    correct_answer: "A",
    micro_explanation: "Điều kiện xác định của biểu thức logarit là biểu thức dưới dấu logarit phải lớn hơn 0: $x - 2 > 0 \\Leftrightarrow x > 2$.",
    growth_mindset_tip: "Luôn đặt điều kiện $f(x) > 0$ khi gặp $\\log_a(f(x))$."
  },
  {
    id: "VATLI-001",
    block: "A00",
    subject: "Vật lí",
    slot_type: "REFLEX_1",
    source: "Vật lí nhiệt GDPT 2018",
    bloom_level: "Thông hiểu (60s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 60,
    question_text: "Nhiệt lượng mà một chất nhận được hoặc tỏa ra trong quá trình truyền nhiệt phụ thuộc vào:",
    options: {
      A: "Khối lượng, độ biến thiên nhiệt độ và nhiệt dung riêng của chất",
      B: "Thể tích ban đầu và áp suất của chất",
      C: "Chỉ phụ thuộc vào nhiệt độ ban đầu",
      D: "Chỉ phụ thuộc vào hình dạng của vật"
    },
    correct_answer: "A",
    micro_explanation: "Công thức tính nhiệt lượng: $Q = mc\\Delta T$, phụ thuộc vào khối lượng $m$, nhiệt dung riêng $c$ và độ biến thiên nhiệt độ $\\Delta T$.",
    growth_mindset_tip: "Nắm vững công thức $Q = mc\\Delta T$ trong phần nhiệt động lực học."
  },
  {
    id: "HOA-001",
    block: "A00",
    subject: "Hóa học",
    slot_type: "REFLEX_1",
    source: "Ester - Lipid GDPT 2018",
    bloom_level: "Nhận biết (45s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 45,
    question_text: "Hợp chất nào sau đây thuộc loại este no, đơn chức, mạch hở?",
    options: {
      A: "$\\text{CH}_3\\text{COOCH}_3$",
      B: "$\\text{CH}_2=\\text{CH}-\\text{COOCH}_3$",
      C: "$\\text{CH}_3\\text{COOH}$",
      D: "$\\text{C}_2\\text{H}_5\\text{OH}$"
    },
    correct_answer: "A",
    micro_explanation: "$\\text{CH}_3\\text{COOCH}_3$ có công thức $\\text{C}_3\\text{H}_6\\text{O}_2$ dạng $\\text{C}_n\\text{H}_{2n}\\text{O}_2$ là este no, đơn chức, mạch hở.",
    growth_mindset_tip: "Công thức este no đơn chức mạch hở là $\\text{C}_n\\text{H}_{2n}\\text{O}_2$ ($n \\ge 2$)."
  },
  {
    id: "SINH-001",
    block: "B00",
    subject: "Sinh học",
    slot_type: "REFLEX_1",
    source: "Di truyền học phân tử",
    bloom_level: "Nhận biết (45s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 45,
    question_text: "Đơn phân cấu tạo nên phân tử ADN là các nuclêôtit thuộc 4 loại nào sau đây?",
    options: {
      A: "A, T, G, X",
      B: "A, U, G, X",
      C: "A, T, U, G",
      D: "T, U, G, X"
    },
    correct_answer: "A",
    micro_explanation: "ADN được cấu tạo từ 4 loại nuclêôtit: A (Ađênin), T (Timin), G (Guanin), X (Xitôzin). ARN mới chứa U (Uraxin) thay cho T.",
    growth_mindset_tip: "ADN có T (Timin), ARN có U (Uraxin)."
  }
];

export const FALLBACK_SAMPLE_QUIZ_QUESTIONS: FallbackQuizItem[] = [
  ...PART1,
  ...FALLBACK_SAMPLE_QUIZ_QUESTIONS_PART2
];
