import { ConcreteDebateSeed } from "./socratic.concrete-debates";

export const DOMAIN_CONCRETE_DEBATES_PART3: Record<string, Record<string, ConcreteDebateSeed[]>> = {
  "Sinh học": {
    "Cảm ứng ở sinh vật": [
      {
        question: "Có nhận định cho rằng: 'Hiện tượng ngọn cây hướng sáng là do tế bào ở phía được chiếu sáng phân chia nhanh hơn tế bào ở phía tối'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Hormone auxin bị quang hóa di chuyển dồn sang phía tối, kích thích tế bào phía tối dãn dài nhanh hơn làm ngọn cong về sáng.",
        topic_hint: "Cơ chế hướng sáng do auxin dãn dài",
        key_points: ["Auxin phân bố bất đối xứng", "Tế bào phía tối dãn dài nhanh hơn", "Không phải do tế bào phân chia"]
      }
    ],
    "Di truyền học": [
      {
        question: "Có ý kiến cho rằng: 'Mọi đột biến gen xảy ra trong tế bào đều dẫn tới biến đổi kiểu hình và gây hại cho sinh vật'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Nhờ tính thoái hóa của mã di truyền, đột biến đồng nghĩa không làm đổi amino acid nên không gây hại hay đổi kiểu hình.",
        topic_hint: "Tính thoái hóa của mã di truyền",
        key_points: ["Tính thoái hóa mã di truyền", "Đột biến đồng nghĩa trung tính", "Đột biến lặn dị hợp"]
      }
    ]
  },
  "Công nghệ": {
    "Công nghệ chăn nuôi & Thú y": [
      {
        question: "Có quan điểm cho rằng: 'Để phòng bệnh cho vật nuôi hiệu quả nhất, nên trộn kháng sinh liều phòng ngừa liên tục vào thức ăn hàng ngày'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Lạm dụng kháng sinh gây tồn dư độc hại và tạo vi khuẩn kháng kháng sinh nguy hiểm, phải ưu tiên vaccine và probiotics an toàn sinh học.",
        topic_hint: "Tác hại của lạm dụng kháng sinh",
        key_points: ["Kháng kháng sinh nguy hại", "Tồn dư trong thực phẩm", "Ưu tiên an toàn sinh học"]
      }
    ]
  },
  "Ngữ văn": {
    "Văn học hiện thực & Bi kịch": [
      {
        question: "Có ý kiến cho rằng: 'Trong Chiếc thuyền ngoài xa, người đàn bà hàng chài từ chối ly hôn người chồng vũ phu là do bà ta nhu nhược'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Quyết định xuất phát từ tình mẫu tử thiêng liêng và đức hi sinh cao cả: Gia đình cần một người đàn ông chèo chống con thuyền nuôi đàn con trước bão gió.",
        topic_hint: "Tình mẫu tử đức hi sinh trong Chiếc thuyền ngoài xa",
        key_points: ["Tình mẫu tử thiêng liêng", "Gia đình cần người chèo chống", "Không phải do nhu nhược"]
      }
    ]
  },
  "Lịch sử": {
    "Kháng chiến chống ngoại xâm & Đổi mới": [
      {
        question: "Có nhận định cho rằng: 'Đường lối Đổi mới năm 1986 của Đảng ta là từ bỏ mục tiêu xây dựng chủ nghĩa xã hội'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Đổi mới là chuyển từ cơ chế bao cấp sang kinh tế thị trường định hướng XHCN, kiên định mục tiêu độc lập dân tộc và chủ nghĩa xã hội.",
        topic_hint: "Bản chất đường lối Đổi mới 1986",
        key_points: ["Kinh tế thị trường định hướng XHCN", "Kiên định mục tiêu CNXH", "Khắc phục cơ chế bao cấp"]
      }
    ]
  },
  "Địa lí": {
    "Địa lí Việt Nam & Vùng kinh tế": [
      {
        question: "Có nhận định cho rằng: 'Việt Nam có cơ cấu dân số vàng đồng nghĩa với việc nền kinh tế sẽ tự động phát triển giàu có mà không cần chính sách nào'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Dân số vàng chỉ cung cấp tiềm năng số lượng lao động; nếu không nâng cao tay nghề và tạo việc làm, sẽ dẫn tới nguy cơ thất nghiệp lớn.",
        topic_hint: "Thách thức cơ cấu dân số vàng",
        key_points: ["Chỉ là tiềm năng nhân lực", "Cần đào tạo tay nghề", "Nguy cơ bẫy thu nhập trung bình"]
      }
    ]
  },
  "GDKT & PL": {
    "Kinh tế thị trường & Pháp luật": [
      {
        question: "Có nhận định cho rằng: 'Quyền tự do ngôn luận trên mạng xã hội cho phép người dùng tùy ý phát tán mọi tin đồn'. Đúng hay sai? Vì sao?",
        sample_answer: "Sai. Tự do ngôn luận luôn trong khuôn khổ pháp luật, không được vu khống hoặc phát tán tin giả xâm phạm quyền người khác theo Luật An ninh mạng.",
        topic_hint: "Trách nhiệm pháp lí trên không gian mạng",
        key_points: ["Tự do trong khuôn khổ pháp luật", "Luật An ninh mạng", "Xử phạt tin giả vu khống"]
      }
    ]
  }
};
