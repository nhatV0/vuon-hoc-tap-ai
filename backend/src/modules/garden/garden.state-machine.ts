import { FlowerState, MoodType } from "@/common/types";

export interface GardenEvaluation {
  state: FlowerState;
  streak: number;
  storyMessage: string;
}

export function calculateFlowerState(
  currentState: FlowerState,
  lastCheckinDateStr: string,
  todayStr: string,
  consecutiveDays: number,
  completionRate: number,
  mood: MoodType
): GardenEvaluation {
  const lastDate = new Date(lastCheckinDateStr);
  const today = new Date(todayStr);
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  let streak = consecutiveDays;
  if (diffDays === 1) {
    streak += 1;
  } else if (diffDays === 0) {
    // Checkin same day: keep streak
  } else {
    // Broke streak: resets to 1
    streak = 1;
  }

  let state = FlowerState.TICH_CUC;
  let storyMessage = "Cây hoa đang vươn mình đón nắng mai và lớn lên từng ngày.";

  if (streak >= 7) {
    state = FlowerState.CHAM_HOC;
    storyMessage = "Cây hoa đã bung nở rực rỡ và tỏa ánh hào quang lấp lánh nhờ nỗ lực bền bỉ của bạn!";
  } else if (mood === MoodType.TIRED || mood === MoodType.STRESSED || completionRate < 50) {
    state = FlowerState.TICH_CUC;
    storyMessage = "Hôm nay có chút mệt mỏi, nhưng việc bạn quay lại chăm sóc mầm cây là một chiến thắng rất đáng tự hào!";
  }

  return { state, streak, storyMessage };
}

export function evaluateInactiveState(lastCheckinDateStr: string, todayStr: string): { state: FlowerState; story: string } {
  const lastDate = new Date(lastCheckinDateStr);
  const today = new Date(todayStr);
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 30) {
    return {
      state: FlowerState.HEO_KHO,
      story: "Mùa đông đã đến, chậu cây thu mình lại thành hạt mầm đợi ngày bạn gieo lại mầm xanh mới."
    };
  }
  if (diffDays >= 3) {
    return {
      state: FlowerState.THIEU_NUOC,
      story: "Cây hoa đang thiếu nước và rủ nhẹ vì nhớ bạn. Hãy tưới nước và check-in để hoa tươi tắn trở lại nhé!"
    };
  }
  return {
    state: FlowerState.TICH_CUC,
    story: "Cây hoa vẫn đang khỏe mạnh và chờ đón bạn mỗi ngày."
  };
}
