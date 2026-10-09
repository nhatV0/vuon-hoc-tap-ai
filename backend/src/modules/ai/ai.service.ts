import { RoadmapResult, StudentInput } from "./ai.types";
import { generateFallbackRoadmap } from "./ai.fallback";

export function callAiRoadmap(data: StudentInput): RoadmapResult {
  // Synchronous robust pedagogical generator based on 7-tier emotion scale
  return generateFallbackRoadmap(data);
}

export function callAiMentor(name: string, mood: string, energy: number, difficulty?: string): string {
  if (mood === "tired" || energy <= 40) {
    return `Chào ${name}! Hôm nay bạn đã rất cố gắng rồi. Hãy cho phép bản thân nghỉ ngơi, uống một ngụm nước ấm và ngủ sớm nhé. Mầm cây vẫn kiên nhẫn đợi bạn!`;
  }
  if (mood === "stressed") {
    return `Thương gửi ${name}! Áp lực trước bài vở là điều ai cũng gặp phải. Chia nhỏ khó khăn "${difficulty || "bài tập"}" thành từng bước 5 phút, bạn sẽ thấy mọi thứ nhẹ nhàng hơn.`;
  }
  return `Tuyệt vời lắm ${name}! Năng lượng ${energy}% hôm nay rất tích cực. Hãy giữ vững nhịp độ này để đón nhận những chiến thắng nhỏ tiếp theo nhé!`;
}
