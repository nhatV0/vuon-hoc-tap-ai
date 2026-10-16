import { ConcreteDebateSeed } from "./socratic.concrete-debates";

export const DOMAIN_CONCRETE_DEBATES_PART2: Record<string, Record<string, ConcreteDebateSeed[]>> = {
  "Vật lí": {
    "Vật lí nhiệt": [
      {
        question: "Có ý kiến nhận định rằng: 'Nhiệt độ của một vật càng cao thì nhiệt lượng chứa trong vật đó càng lớn'. Đúng hay sai? Tại sao?",
        sample_answer: "Sai. Nhiệt lượng không phải là năng lượng chứa sẵn trong vật mà là phần năng lượng trao đổi trong quá trình truyền nhiệt.",
        topic_hint: "Bản chất Nội năng và Nhiệt lượng",
        key_points: ["Nhiệt lượng là năng lượng truyền qua", "Vật chỉ chứa nội năng", "Nhiệt độ đo động năng phân tử"]
      },
      {
        question: "Có ý kiến cho rằng: 'Trong quá trình chất rắn kết tinh nóng chảy hoàn toàn, nhiệt độ của nó liên tục tăng lên'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Nhiệt độ của chất rắn kết tinh không đổi trong suốt quá trình nóng chảy vì nhiệt lượng dùng để phá vỡ mạng tinh thể.",
        topic_hint: "Nhiệt độ nóng chảy chất rắn kết tinh",
        key_points: ["Nhiệt độ giữ không đổi", "Phá vỡ mạng tinh thể", "Chất rắn kết tinh"]
      }
    ],
    "Khí lí tưởng": [
      {
        question: "Trong quá trình đẳng nhiệt của một lượng khí lí tưởng xác định, khi thể tích giảm một nửa thì áp suất giảm một nửa đúng hay sai?",
        sample_answer: "Sai. Theo định luật Boyle, áp suất tỉ lệ nghịch với thể tích nên khi thể tích giảm một nửa thì áp suất phải tăng gấp đôi.",
        topic_hint: "Định luật Boyle trong quá trình đẳng nhiệt",
        key_points: ["Định luật Boyle p.V = const", "Tỉ lệ nghịch áp suất và thể tích", "Áp suất tăng gấp đôi"]
      }
    ]
  },
  "Hóa học": {
    "Dẫn xuất halogen": [
      {
        question: "Có ý kiến cho rằng: 'Mọi dẫn xuất halogen đều có thể tham gia phản ứng tách HX tạo anken tương ứng'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Phản ứng tách HX bắt buộc nguyên tử cacbon kế cận (beta) phải có hiđro. Ví dụ CH3Cl không thể tách tạo anken.",
        topic_hint: "Quy tắc tách Zaitsev và hiđro beta",
        key_points: ["Bắt buộc có hiđro beta", "Quy tắc Zaitsev", "Phản ví dụ CH3Cl"]
      }
    ],
    "Ester - Lipid": [
      {
        question: "Có ý kiến cho rằng: 'Phản ứng thủy phân este trong môi trường kiềm là phản ứng thuận nghịch hai chiều'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Phản ứng xà phòng hóa trong môi trường kiềm là phản ứng một chiều hoàn toàn do muối carboxylat tạo thành bền vững.",
        topic_hint: "Phản ứng xà phòng hóa este một chiều",
        key_points: ["Môi trường kiềm là một chiều", "Muối carboxylat bền", "Phản ứng xà phòng hóa"]
      }
    ]
  }
};
