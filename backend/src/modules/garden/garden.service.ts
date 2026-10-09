import { GardenRepository, FlowerStatusEntity } from "./garden.repository";
import { calculateFlowerState, evaluateInactiveState } from "./garden.state-machine";
import { FlowerState, MoodType } from "@/common/types";

export class GardenService {
  constructor(private repo: GardenRepository) {}

  getStatus(studentId: string) {
    let flower = this.repo.getFlowerStatus(studentId);
    const todayStr = new Date().toISOString().split("T")[0];
    if (!flower) {
      flower = {
        student_id: studentId,
        current_state: FlowerState.TICH_CUC,
        consecutive_days: 1,
        last_checkin_date: todayStr,
        water_drops: 1,
        story_message: "Mầm cây xanh vừa được gieo trồng trong khu vườn cảm xúc của bạn."
      };
      this.repo.saveFlowerStatus(flower);
    } else {
      const inactive = evaluateInactiveState(flower.last_checkin_date, todayStr);
      if (inactive.state !== flower.current_state && flower.current_state !== FlowerState.CHAM_HOC) {
        flower.current_state = inactive.state;
        flower.story_message = inactive.story;
        this.repo.saveFlowerStatus(flower);
      }
    }
    const inv = this.repo.getInventory(studentId);
    return {
      current_state: flower.current_state,
      consecutive_days: flower.consecutive_days,
      last_checkin_date: flower.last_checkin_date,
      water_drops: flower.water_drops,
      story_message: flower.story_message,
      freeze_shields_available: inv?.freeze_shields_available ?? 1,
      grace_passes_available: inv?.grace_passes_available ?? 1,
      quiz_tickets: inv?.quiz_tickets ?? 1,
      holy_water: inv?.holy_water ?? 0
    };
  }

  water(studentId: string) {
    const flower = this.repo.getFlowerStatus(studentId);
    if (!flower) throw new Error("NOT_FOUND");
    flower.water_drops += 1;
    if (flower.current_state === FlowerState.THIEU_NUOC) {
      flower.current_state = FlowerState.TICH_CUC;
      flower.story_message = "Cây đã được tiếp thêm nước ngọt lành và tươi tỉnh trở lại.";
    }
    this.repo.saveFlowerStatus(flower);
    return {
      success: true,
      water_drops: flower.water_drops,
      current_state: flower.current_state,
      message: "Bạn vừa tưới một giọt nước yêu thương cho cây hoa!"
    };
  }

  restoreStreak(studentId: string) {
    const inv = this.repo.getInventory(studentId);
    const flower = this.repo.getFlowerStatus(studentId);
    if (!inv || !flower) throw new Error("NOT_FOUND");
    if (inv.grace_passes_available <= 0) {
      return { success: false, message: "Bạn đã hết lượt khôi phục chuỗi mầm cây.", passes_left: 0 };
    }
    inv.grace_passes_available -= 1;
    inv.last_restore_used_at = new Date().toISOString();
    flower.consecutive_days = Math.max(flower.consecutive_days, inv.saved_streak_before_break || 7);
    flower.current_state = FlowerState.TICH_CUC;
    flower.story_message = "Mầm cây đã được hồi sinh kỳ diệu nhờ giọt sương phục hồi!";
    this.repo.updateInventory(inv);
    this.repo.saveFlowerStatus(flower);
    return {
      success: true,
      message: "Khôi phục chuỗi thành công!",
      restored_streak: flower.consecutive_days,
      passes_left: inv.grace_passes_available,
      flower_state: flower.current_state
    };
  }

  rewardPomodoro(studentId: string, durationMinutes = 25) {
    const flower = this.repo.getFlowerStatus(studentId);
    if (!flower) throw new Error("NOT_FOUND");
    const earnedDrops = Math.max(1, Math.floor(durationMinutes / 10));
    flower.water_drops += earnedDrops;
    this.repo.saveFlowerStatus(flower);
    return {
      success: true,
      earned_drops: earnedDrops,
      total_drops: flower.water_drops,
      message: `Hoàn thành phiên tập trung ${durationMinutes} phút! Tặng bạn ${earnedDrops} giọt nước.`
    };
  }
}
