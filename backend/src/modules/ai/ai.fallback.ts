import { RoadmapResult, StudentInput } from "./ai.types";

export function generateFallbackRoadmap(data: StudentInput): RoadmapResult {
  const subjects = data.target_subjects && data.target_subjects.length > 0 
    ? data.target_subjects 
    : [data.target_subject || "Toán học"];
  const primarySubject = subjects[0];
  const name = data.name || "Bạn học nhỏ";
  const scale = data.emotion_scale ?? 4;

  let encouragement = "";
  if (scale <= 2) {
    encouragement = `Thương gửi ${name}! Trợ lý thấu hiểu áp lực môn ${subjects.join(", ")}. Lộ trình này gồm các bước siêu nhỏ 5 phút giúp dọn dẹp nỗi sợ và tìm lại sự bình an.`;
  } else if (scale <= 5) {
    encouragement = `Chào ${name}! Bạn đang giữ nhịp độ ổn định ở môn ${subjects.join(", ")}. Hãy từng bước tích lũy chiến thắng nhỏ mỗi ngày nhé!`;
  } else {
    encouragement = `Chào ${name}! Năng lượng tuyệt vời! Hãy biến đam mê môn ${subjects.join(", ")} thành kết quả vượt trội với các thử thách đào sâu.`;
  }

  const milestones = [
    {
      stage: 1,
      title: `Chặng 1: Xây nền tảng vững chắc (${primarySubject})`,
      duration: "2 tuần đầu",
      goal: `Làm chủ kiến thức cốt lõi và hình thành thói quen học 10 phút.`,
      key_actions: [
        `Mỗi tối hoàn thành 1 nhiệm vụ 5-10 phút môn ${primarySubject}`,
        "Tự ghi nhận cảm xúc và đánh dấu các điểm chưa hiểu",
        "Tưới nước cho mầm cây sau mỗi phiên tập trung"
      ]
    },
    {
      stage: 2,
      title: "Chặng 2: Tích lũy chiến thắng nhỏ (Small Wins)",
      duration: "Tuần 3 - Tuần 6",
      goal: "Giải quyết các dạng bài tập vừa sức và nâng cao phản xạ.",
      key_actions: [
        `Áp dụng sơ đồ tư duy cho ${subjects[subjects.length - 1] || primarySubject}`,
        "Thực hiện 3 câu trắc nghiệm vi mô mỗi ngày",
        "Nuôi dưỡng chuỗi streak để nhận bình nước thánh"
      ]
    },
    {
      stage: 3,
      title: "Chặng 3: Bứt phá tự tin & Đạt mục tiêu kỳ thi",
      duration: "Tuần 7 trở đi",
      goal: data.long_term_goal || `Tự tin đạt điểm cao trong các bài kiểm tra ${subjects.join(", ")}`,
      key_actions: [
        "Luyện đề tổng hợp theo cấu trúc chuẩn GDPT 2018",
        "Mở khóa câu hỏi Boss ngày 30 và xem lại hộp thư thời gian"
      ]
    }
  ];

  const initial_daily_tasks = [
    {
      id: 1,
      title: `Đọc lướt 1 trang lý thuyết trọng tâm môn ${primarySubject}`,
      duration_minutes: 5,
      subject: primarySubject,
      category: "Lý thuyết",
      tip: "Đọc thong thả, chỉ gạch chân từ khóa chính."
    },
    {
      id: 2,
      title: `Tự giải lại 1 bài tập ví dụ mẫu ${primarySubject}`,
      duration_minutes: 10,
      subject: primarySubject,
      category: "Bài tập",
      tip: "Làm theo từng bước sách giáo khoa, không vội vàng."
    },
    {
      id: 3,
      title: `Lập bảng 3 công thức/khái niệm hay quên`,
      duration_minutes: 8,
      subject: primarySubject,
      category: "Ôn luyện",
      tip: "Dán trước bàn học để nhìn thấy mỗi ngày."
    },
    {
      id: 4,
      title: `Giải 3 câu trắc nghiệm nhanh phản xạ`,
      duration_minutes: 6,
      subject: subjects[1] || primarySubject,
      category: "Bài tập",
      tip: "Đọc kỹ đề và chọn đáp án không do dự."
    },
    {
      id: 5,
      title: "Uống một cốc nước và thở sâu 3 phút",
      duration_minutes: 5,
      subject: "Chăm sóc bản thân",
      category: "Nghỉ ngơi",
      tip: "Tự khen ngợi bản thân vì đã hoàn thành nhiệm vụ ngày hôm nay."
    }
  ];

  return { milestones, initial_daily_tasks, encouraging_message: encouragement };
}
