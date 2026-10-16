export interface QuestionArchetype {
  id: string;
  name: string;
  instruction_vi: string;
  instruction_en: string;
  example_vi: string;
  example_en: string;
}

export const QUESTION_ARCHETYPES: QuestionArchetype[] = [
  {
    id: "direct_definition",
    name: "Hỏi trực tiếp Định nghĩa / Bản chất",
    instruction_vi: "Hỏi trực tiếp khái niệm, định nghĩa hoặc bản chất của một thuật ngữ cốt lõi trong bài học.",
    instruction_en: "Ask directly for the definition or core mechanism of a key concept from the lesson.",
    example_vi: "Khóa chính (Primary Key) trong mô hình CSDL quan hệ là gì và giữ vai trò cốt lõi nào?",
    example_en: "What is a Primary Key in relational databases and what essential function does it serve?"
  },
  {
    id: "property_condition",
    name: "Hỏi về Tính chất / Điều kiện tiên quyết",
    instruction_vi: "Hỏi về các tính chất, đặc điểm nhận dạng hoặc điều kiện tiên quyết để định luật/thuật toán/hiện tượng xảy ra.",
    instruction_en: "Ask about properties, characteristics, or prerequisite conditions for a theorem/algorithm/process to hold.",
    example_vi: "Nêu điều kiện tiên quyết để thuật toán Tìm kiếm nhị phân (Binary Search) có thể thực hiện thành công.",
    example_en: "What is the mandatory prerequisite condition for Binary Search to execute correctly?"
  },
  {
    id: "fill_in_the_blank",
    name: "Điền khuyết khái niệm / Thuật ngữ then chốt",
    instruction_vi: "Đưa ra một phát biểu lý thuyết quan trọng bị khuyết một cụm từ then chốt [...] và yêu cầu học sinh điền từ chuẩn xác.",
    instruction_en: "Provide an essential theoretical statement with a missing term [...] and ask the student to fill in the exact concept.",
    example_vi: "Điền vào dấu [...]: 'Trong CSDL quan hệ, tính toàn vẹn thực thể quy định rằng [...] không được mang giá trị NULL.'",
    example_en: "Fill in the [...]: 'In relational databases, entity integrity dictates that [...] must never contain NULL values.'"
  },
  {
    id: "step_ordering",
    name: "Sắp xếp thứ tự quy trình 1 - 2 - 3 - 4",
    instruction_vi: "Liệt kê các bước thực hiện một quy trình/thuật toán/phản ứng theo thứ tự lộn xộn và yêu cầu học sinh sắp xếp đúng trình tự.",
    instruction_en: "Present steps of a process/algorithm/cycle in scrambled order and ask the student to arrange them in correct 1-2-3-4 order.",
    example_vi: "Hãy sắp xếp thứ tự chuẩn (1-2-3) các thao tác sau khi kết nối CSDL: (A) Thực thi truy vấn, (B) Mở kết nối, (C) Đóng kết nối.",
    example_en: "Arrange the correct sequential order (1-2-3): (A) Execute query, (B) Open connection, (C) Close connection."
  },
  {
    id: "reverse_lookup",
    name: "Truy ngược: Cho mô tả / dấu hiệu -> Tìm tên gọi / định luật",
    instruction_vi: "Mô tả một biểu hiện, chức năng, tính chất cụ thể rồi yêu cầu học sinh truy ngược lại xem đó là định luật/thuật toán/khái niệm nào.",
    instruction_en: "Describe a specific behavior, effect, or symptom and ask the student to identify which concept, rule, or mechanism it belongs to.",
    example_vi: "'Lệnh dùng để xóa vĩnh viễn toàn bộ cấu trúc bảng và định nghĩa khỏi hệ CSDL'. Đây là lệnh SQL nào?",
    example_en: "'The SQL statement that permanently removes the entire table structure and definition from the database.' Which command is this?"
  },
  {
    id: "critique_debate",
    name: "Tranh biện & Phản biện luận điểm",
    instruction_vi: "Đưa ra một nhận định gây tranh cãi hoặc ngộ nhận phổ biến và yêu cầu học sinh phản biện Đúng hay Sai kèm lý do.",
    instruction_en: "Present a common misconception or controversial claim and challenge the student to argue True/False with scientific reasons.",
    example_vi: "Có nhận định rằng hệ CSDL không cần khóa ngoại vì các bảng đã độc lập. Quan điểm này đúng hay sai? Vì sao?",
    example_en: "Some argue foreign keys are redundant because tables already have primary keys. Is this correct or incorrect? Why?"
  }
];

export function getArchetypeForQuestion(index: number): QuestionArchetype {
  return QUESTION_ARCHETYPES[(index - 1) % QUESTION_ARCHETYPES.length];
}
