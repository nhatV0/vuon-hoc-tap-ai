import { FallbackDebateItem } from "./concrete-debate-questions";

export const CONCRETE_DEBATES_PART2: Record<string, Record<string, FallbackDebateItem[]>> = {
  "Sinh học": {
    "Cảm ứng ở sinh vật": [
      {
        "question": "Có nhận định cho rằng: 'Hiện tượng ngọn cây hướng sáng là do tế bào ở phía được chiếu sáng phân chia nhanh hơn tế bào ở phía tối'. Nhận định này đúng hay sai? Vì sao?",
        "sample_answer": "Sai. Nguyên nhân là do hormone auxin bị quang hóa và phân bố bất đối xứng, di chuyển sang phía tối. Nồng độ auxin cao ở phía tối kích thích các tế bào phía tối dãn dài nhanh hơn, làm cho thân cây cong về phía có ánh sáng.",
        "topic_hint": "Bản chất cơ chế hướng sáng ở thực vật"
      },
      {
        "question": "Có ý kiến nhận định: 'Cung phản xạ chỉ cần đường dẫn truyền hướng tâm và cơ quan đáp ứng là có thể thực hiện phản xạ bình thường'. Đúng hay sai? Vì sao?",
        "sample_answer": "Sai. Cung phản xạ bắt buộc phải có đầy đủ 5 bộ phận: thụ thể, đường dẫn truyền hướng tâm, trung ương thần kinh, đường dẫn truyền li tâm và cơ quan đáp ứng. Thiếu bất kì bộ phận nào thì phản xạ đều không thể diễn ra.",
        "topic_hint": "Cấu trúc toàn vẹn của cung phản xạ"
      }
    ],
    "Di truyền học": [
      {
        "question": "Có ý kiến cho rằng: 'Mọi đột biến gen xảy ra trong tế bào đều dẫn tới biến đổi kiểu hình và gây hại cho sinh vật'. Nhận định này đúng hay sai? Vì sao?",
        "sample_answer": "Sai. Nhờ tính thoái hóa của mã di truyền, đột biến thay thế nucleotide có thể là đột biến đồng nghĩa (không đổi amino acid). Ngoài ra, đột biến lặn ở trạng thái dị hợp hoặc đột biến ở vùng không mã hóa cũng không biểu hiện ra kiểu hình.",
        "topic_hint": "Đặc điểm và biểu hiện của đột biến gen"
      },
      {
        "question": "Có nhận định cho rằng: 'Quy luật phân li độc lập của Mendel áp dụng cho tất cả các gen trong tế bào'. Quan điểm này đúng hay sai? Vì sao?",
        "sample_answer": "Sai. Định luật phân li độc lập chỉ áp dụng khi các cặp gen nằm trên các cặp nhiễm sắc thể tương đồng khác nhau. Nếu các gen cùng nằm trên một cặp NST, chúng sẽ di truyền liên kết hoặc hoán vị gen.",
        "topic_hint": "Điều kiện nghiệm đúng của định luật Mendel"
      }
    ],
    "Tiến hóa và Sinh thái học": [
      {
        "question": "Có quan điểm cho rằng: 'Chọn lọc tự nhiên trực tiếp tạo ra các biến dị di truyền mới thích nghi cho quần thể sinh vật'. Đúng hay sai? Vì sao?",
        "sample_answer": "Sai. Đột biến và giao phối mới là nhân tố tạo ra biến dị di truyền. Chọn lọc tự nhiên chỉ đóng vai trò sàng lọc, đào thải các cá thể mang kiểu hình có hại và giữ lại, nhân rộng các kiểu hình có lợi đã có sẵn.",
        "topic_hint": "Vai trò thực chất của chọn lọc tự nhiên"
      },
      {
        "question": "Có ý kiến khẳng định: 'Năng lượng trong hệ sinh thái có thể được vi sinh vật phân giải chuyển hóa ngược lại thành ánh sáng mặt trời để tái sử dụng tuần hoàn'. Đúng hay sai? Vì sao?",
        "sample_answer": "Sai. Dòng năng lượng trong hệ sinh thái là dòng một chiều (từ ánh sáng Mặt Trời -> sinh vật sản xuất -> sinh vật tiêu thụ -> thất thoát dạng nhiệt ra môi trường), không thể tuần hoàn như vật chất.",
        "topic_hint": "Đặc trưng một chiều của dòng năng lượng"
      }
    ]
  },
  "Công nghệ": {
    "Công nghệ chăn nuôi & Thú y": [
      {
        "question": "Có quan điểm cho rằng: 'Để phòng bệnh cho vật nuôi hiệu quả nhất, người chăn nuôi nên trộn kháng sinh liều phòng ngừa liên tục vào thức ăn hàng ngày'. Đúng hay sai? Vì sao?",
        "sample_answer": "Sai. Lạm dụng kháng sinh gây tồn dư kháng sinh trong thịt, sữa, tiêu diệt hệ vi sinh vật có lợi và gây ra hiện tượng kháng kháng sinh (vi khuẩn kháng thuốc). Phải ưu tiên an toàn sinh học, tiêm vaccine và dùng men vi sinh probiotics.",
        "topic_hint": "Nguyên tắc sử dụng kháng sinh trong chăn nuôi"
      },
      {
        "question": "Có nhận định cho rằng: 'Khí biogas sinh ra từ hầm ủ kỵ khí chất thải chăn nuôi là khí oxy tinh khiết'. Đúng hay sai? Vì sao?",
        "sample_answer": "Sai. Khí sinh học (Biogas) sinh ra do vi khuẩn phân hủy kỵ khí, thành phần cháy chủ yếu là Methane (CH4) chiếm 50-70% và Carbon dioxide (CO2) chiếm 30-40%, hoàn toàn không có khí oxy tinh khiết.",
        "topic_hint": "Thành phần bản chất của khí Biogas"
      }
    ],
    "Công nghệ cơ khí & Động cơ": [
      {
        "question": "Có ý kiến cho rằng: 'Cả 4 kỳ trong động cơ đốt trong 4 kỳ (nạp, nén, nổ, thải) đều sinh công cơ học làm quay trục khuỷu'. Đúng hay sai? Vì sao?",
        "sample_answer": "Sai. Chỉ có duy nhất kỳ cháy - giãn nở (kỳ nổ) là kỳ sinh công. Ba kỳ nạp, nén, thải là các kỳ tiêu hao công năng được duy trì nhờ quán tính của bánh đà.",
        "topic_hint": "Chu trình sinh công của động cơ đốt trong"
      },
      {
        "question": "Có nhận định cho rằng: 'Thép và gang hoàn toàn giống nhau về cơ tính và thành phần hóa học'. Đúng hay sai? Vì sao?",
        "sample_answer": "Sai. Thép có hàm lượng cacbon dưới 2,14% nên có tính dẻo, dễ rèn cán dập; còn gang có hàm lượng cacbon từ 2,14% đến 4,3% nên cứng, giòn, chịu nén tốt và phù hợp để đúc thân máy.",
        "topic_hint": "Phân biệt thép và gang trong cơ khí"
      }
    ]
  }
};
