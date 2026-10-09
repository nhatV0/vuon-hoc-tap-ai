"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  Award,
  Flame,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { API_BASE } from "@/lib/types";

interface DailyCheckinModalProps {
  studentId: string;
  studentName: string;
  targetSubject: string;
  onCheckinSuccess: (data: unknown) => void;
  onClose: () => void;
}

// Trạm 1: Năng lượng (4 mức chuẩn Daily.txt)
const ENERGY_LEVELS = [
  {
    value: 100,
    emoji: "🟢",
    title: "100% – Hưng phấn / Tràn đầy",
    desc: "Học rất vào, đầu óc tỉnh táo, sẵn sàng bứt phá",
    colorClass: "border-emerald-200 bg-emerald-50/60 text-emerald-950 hover:border-emerald-400",
    activeClass: "border-emerald-600 bg-emerald-100/80 ring-2 ring-emerald-500/20 shadow-xs"
  },
  {
    value: 70,
    emoji: "🟡",
    title: "70% – Ổn định / Cân bằng",
    desc: "Hoàn thành đúng kế hoạch, không quá mệt mỏi",
    colorClass: "border-amber-200 bg-amber-50/60 text-amber-950 hover:border-amber-400",
    activeClass: "border-amber-600 bg-amber-100/80 ring-2 ring-amber-500/20 shadow-xs"
  },
  {
    value: 40,
    emoji: "🟠",
    title: "40% – Đuối sức / Cố gắng",
    desc: "Hôm nay khá mệt, phải gồng mình để ngồi vào bàn",
    colorClass: "border-orange-200 bg-orange-50/60 text-orange-950 hover:border-orange-400",
    activeClass: "border-orange-600 bg-orange-100/80 ring-2 ring-orange-500/20 shadow-xs"
  },
  {
    value: 15,
    emoji: "🔴",
    title: "15% – Cạn kiệt / Bế tắc",
    desc: "Quá tải vì áp lực trên trường, muốn buông xuôi",
    colorClass: "border-rose-200 bg-rose-50/60 text-rose-950 hover:border-rose-400",
    activeClass: "border-rose-600 bg-rose-100/80 ring-2 ring-rose-500/20 shadow-xs"
  }
];

// Trạm 2: 10 môn GDPT 2018
const SUBJECT_OPTIONS = [
  { id: "Toán học", icon: "📐", label: "Toán học" },
  { id: "Tiếng Anh", icon: "🌐", label: "Tiếng Anh" },
  { id: "Ngữ văn", icon: "📖", label: "Ngữ văn" },
  { id: "Vật lí", icon: "⚡", label: "Vật lí" },
  { id: "Hóa học", icon: "🧪", label: "Hóa học" },
  { id: "Sinh học", icon: "🧬", label: "Sinh học" },
  { id: "Lịch sử", icon: "🏛️", label: "Lịch sử" },
  { id: "Địa lí", icon: "🌍", label: "Địa lí" },
  { id: "GDKT & PL", icon: "⚖️", label: "GDKT & PL" },
  { id: "Tin học", icon: "💻", label: "Tin học" }
];

// Trạm 2: 6 chiến thắng vi mô (Micro-wins)
const MICRO_WINS_OPTIONS = [
  { id: "solve_problems", icon: "🎯", label: "Giải dứt điểm 5-10 bài không mở giải", desc: "Tự tay làm xong bằng năng lực bản thân" },
  { id: "fix_gap", icon: "🧠", label: "Hàn gắn 1 lỗ hổng kiến thức", desc: "Hiểu bản chất công thức/hiện tượng trước đây hay nhầm" },
  { id: "vocab_flashcard", icon: "📚", label: "Nạp mới ≥ 15 từ vựng / công thức", desc: "Đã ghi chép hoặc ôn qua flashcard" },
  { id: "timed_practice", icon: "⏱️", label: "Luyện đề bấm giờ tập trung", desc: "Hoàn thành 1 bài thi thử đúng thời gian" },
  { id: "punctual_start", icon: "🛡️", label: "Ngồi vào bàn học đúng giờ", desc: "Đánh bại trì hoãn, bắt đầu lúc 20h00" },
  { id: "rest_day", icon: "🧘", label: "Hôm nay nghỉ ngơi nạp lại năng lượng", desc: "Chủ động nghỉ ngơi lành mạnh để ngày mai bứt phá" }
];

// Trạm 3: 5 Điểm nghẽn chính
const BOTTLENECK_OPTIONS = [
  { id: "phone_distraction", icon: "📱", label: "Cám dỗ điện thoại", desc: "Bị lướt mạng xã hội làm đứt mạch tập trung" },
  { id: "hard_problem", icon: "🧩", label: "Gặp bài quá khó", desc: "Nghẽn ý tưởng, xem giải cũng không hiểu" },
  { id: "fatigue", icon: "🥱", label: "Buồn ngủ & Mệt mỏi", desc: "Thể lực không cho phép ngồi học lâu" },
  { id: "time_crunch", icon: "⏳", label: "Bị việc khác chèn giờ", desc: "Bài tập trên trường quá nhiều hoặc việc đột xuất" },
  { id: "none", icon: "✨", label: "Hoàn hảo", desc: "Hôm nay không có rào cản nào đáng kể" }
];

// Trạm 3: Câu hỏi xoay vòng theo thứ
const WEEKDAY_QUESTIONS: Record<number, { title: string; question: string; options: string[] }> = {
  1: {
    title: "Thứ Hai (Khởi Động)",
    question: "Mục tiêu cụ thể duy nhất bạn muốn đạt được trước tối Chủ Nhật là gì?",
    options: ["Tăng 1 điểm thi thử", "Xong 3 chuyên đề hổng", "Giữ chuỗi Streak 7 ngày"]
  },
  2: {
    title: "Thứ Ba (Bóc Tách Lỗi)",
    question: "Hôm nay bạn có câu làm sai nào không? Nguyên nhân chính là do đâu?",
    options: ["Nhầm công thức biến đổi", "Đọc ẩu đề thi", "Chưa từng gặp dạng này bao giờ"]
  },
  3: {
    title: "Thứ Tư (Tự Thưởng)",
    question: "Một điều nhỏ bạn làm tốt hôm nay xứng đáng được khen ngợi?",
    options: ["Chăm chú nghe giảng trên lớp", "Không đụng vào điện thoại 45 phút", "Giải quyết xong bài tập khó"]
  },
  4: {
    title: "Thứ Năm (Cứu Trợ Giáo Viên)",
    question: "Bạn có cần thầy/cô hoặc AI gửi video giải thích riêng chuyên đề nào không?",
    options: ["Cần giải thích lý thuyết nền", "Cần hướng dẫn dạng bài vận dụng", "Mọi thứ vẫn đang trong tầm kiểm soát"]
  },
  5: {
    title: "Thứ Sáu (Đánh Giá Kỷ Luật)",
    question: "Mức độ tập trung sâu của bạn hôm nay đạt bao nhiêu %?",
    options: ["20% (Chưa tập trung)", "50% (Đang cố gắng)", "80% (Khá sâu sắc)", "100% (Hoàn toàn nhập tâm)"]
  },
  6: {
    title: "Thứ Bảy (Thu Hoạch)",
    question: "So với đầu tuần, bạn cảm thấy mình tiến bộ nhất ở điểm nào?",
    options: ["Tự tin hơn với môn học", "Tốc độ làm bài nhanh hơn", "Kỷ luật bản thân tốt hơn"]
  },
  0: {
    title: "Chủ Nhật (Reset Năng Lượng)",
    question: "Bạn đã sẵn sàng reset tâm thế để thắp sáng tuần mới chưa?",
    options: ["Sẵn sàng 100% bứt phá", "Cần ngủ bù thêm một chút"]
  }
};

export default function DailyCheckinModal({
  studentId,
  studentName,
  targetSubject,
  onCheckinSuccess,
  onClose,
}: DailyCheckinModalProps) {
  // Trạm hiện tại (1 -> 4)
  const [station, setStation] = useState<number>(1);

  // Dữ liệu Form
  const [energyLevel, setEnergyLevel] = useState<number>(70);
  const [confidenceStars, setConfidenceStars] = useState<number>(3);
  const [completedSubjects, setCompletedSubjects] = useState<string[]>([targetSubject || "Toán học"]);
  const [microWins, setMicroWins] = useState<string[]>(["solve_problems"]);
  const [bottleneckKey, setBottleneckKey] = useState<string>("none");

  // Thứ trong tuần hiện tại (0: CN, 1: T2, ...)
  const todayDay = new Date().getDay();
  const currentWeekdayQuestion = WEEKDAY_QUESTIONS[todayDay] || WEEKDAY_QUESTIONS[1];
  const [weekdayAnswer, setWeekdayAnswer] = useState<string>(currentWeekdayQuestion.options[0]);

  // Trạng thái gửi
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkinResult, setCheckinResult] = useState<{
    ai_feedback: string;
    streak_days: number;
    shield_used?: boolean;
    shield_message?: string;
    newly_unlocked_badges?: string[];
  } | null>(null);

  // Toggle môn học
  const toggleSubject = (subjId: string) => {
    if (completedSubjects.includes(subjId)) {
      if (completedSubjects.length > 1) {
        setCompletedSubjects(completedSubjects.filter((s) => s !== subjId));
      }
    } else {
      setCompletedSubjects([...completedSubjects, subjId]);
    }
  };

  // Toggle chiến thắng vi mô
  const toggleMicroWin = (winId: string) => {
    if (microWins.includes(winId)) {
      if (microWins.length > 1) {
        setMicroWins(microWins.filter((w) => w !== winId));
      }
    } else {
      setMicroWins([...microWins, winId]);
    }
  };

  // Nộp form checkin
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      let mappedMood = "happy";
      if (energyLevel === 15) mappedMood = "tired";
      else if (energyLevel === 40) mappedMood = "stressed";
      else if (energyLevel === 70) mappedMood = "neutral";
      else mappedMood = "happy";

      const res = await fetch(`${API_BASE}/api/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          completion_rate: energyLevel,
          subject_difficulty: bottleneckKey !== "none" ? bottleneckKey : "Không có rào cản lớn",
          action_reflection: microWins.join(", "),
          mood: mappedMood,
          emotion_scale: confidenceStars + 2, // Map sang thang 1-7
          energy_level: energyLevel,
          confidence_stars: confidenceStars,
          completed_subjects: completedSubjects,
          micro_wins: microWins,
          bottleneck_key: bottleneckKey,
          weekday_answer: weekdayAnswer
        }),
      });
      let data: {
        ai_feedback: string;
        streak_days: number;
        shield_used?: boolean;
        shield_message?: string;
        newly_unlocked_badges?: string[];
      } | null = null;
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error("API call failed");
      }
      if (!data) throw new Error("Empty response");
      setCheckinResult(data);
      onCheckinSuccess(data);
      setStation(4); // Chuyển sang trạm 4 hiển thị kết quả
    } catch {
      // Fallback điểm danh ngoại tuyến: Cập nhật streak và lưu trạng thái vào localStorage
      const currentGardenStr = localStorage.getItem(`sunflower_garden_${studentId}`);
      let currentStreak = 0;
      let currentDrops = 1;
      if (currentGardenStr) {
        try {
          const parsed = JSON.parse(currentGardenStr);
          currentStreak = parsed.consecutive_days || 0;
          currentDrops = parsed.water_drops || 1;
        } catch {}
      }
      const newStreak = currentStreak + 1;
      const newDrops = currentDrops + 1;
      const offlineResult = {
        ai_feedback: `Thắp sáng thành công chuỗi Ngày ${newStreak}! Bạn đã nhận thêm 1 giọt nước tưới mát chậu hoa.`,
        streak_days: newStreak,
        shield_used: false,
        shield_message: "Khởi đầu tuyệt vời!",
        newly_unlocked_badges: newStreak === 1 ? ["🌱 Bước Chân Đầu Tiên"] : []
      };

      // Cập nhật trạng thái chậu hoa vào cache
      const updatedGarden = {
        student_id: studentId,
        student_name: studentName,
        selected_flower: "sunflower",
        current_state: "tich_cuc",
        consecutive_days: newStreak,
        water_drops: newDrops,
        last_checkin_date: new Date().toISOString(),
        story_message: `Mầm xanh của ${studentName} đang tràn đầy sức sống ở Ngày ${newStreak}!`,
        can_restore_streak: false,
        has_checked_in_today: true,
        unlocked_badges_count: newStreak >= 1 ? 1 : 0,
        shields_available: 1,
        grace_passes_available: 0,
        saved_streak_before_break: 0
      };
      localStorage.setItem(`sunflower_garden_${studentId}`, JSON.stringify(updatedGarden));
      localStorage.setItem(`sunflower_has_checked_in_${studentId}`, "true");

      setCheckinResult(offlineResult);
      onCheckinSuccess(offlineResult);
      setStation(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Thanh tiêu đề & Tiến độ 4 Trạm */}
        <div className="px-6 py-4 border-b border-stone-100 bg-amber-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌻</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  {station === 1 && "Trạm 1: Nhịp Cảm Xúc (30s)"}
                  {station === 2 && "Trạm 2: Kiểm Kê Thành Quả (60s)"}
                  {station === 3 && "Trạm 3: Điểm Nghẽn & Xoay Vòng (60s)"}
                  {station === 4 && "Trạm 4: Thắp Sáng Streak & AI (30s)"}
                </h3>
              </div>
              <p className="text-[11px] text-stone-500">
                Chào {studentName} • Phản chiếu 3 phút không ma sát
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* 4 Chấm chỉ báo trạm */}
        <div className="px-6 pt-3 flex gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                station === step
                  ? "bg-amber-500"
                  : station > step
                  ? "bg-emerald-500"
                  : "bg-stone-200"
              }`}
            />
          ))}
        </div>

        {/* Nội dung các trạm */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TRẠM 1: ĐO NHỊP NĂNG LƯỢNG & TỰ TIN */}
          {station === 1 && (
            <div className="space-y-6">
              {/* Câu 1: Bình năng lượng */}
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-stone-900">
                  1. Bình năng lượng tinh thần hôm nay của bạn ở mức nào?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ENERGY_LEVELS.map((level) => {
                    const isSelected = energyLevel === level.value;
                    return (
                      <button
                        type="button"
                        key={level.value}
                        onClick={() => setEnergyLevel(level.value)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                          isSelected ? level.activeClass : level.colorClass
                        }`}
                      >
                        <span className="text-xl mt-0.5">{level.emoji}</span>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-stone-900">
                            {level.title}
                          </p>
                          <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                            {level.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Câu 2: Độ tự tin 5 sao */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-semibold text-stone-900">
                    2. Độ tự tin với kiến thức đã học hôm nay:
                  </label>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {confidenceStars} / 5 sao
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setConfidenceStars(star)}
                      className={`flex-1 py-3 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        confidenceStars >= star
                          ? "border-amber-400 bg-amber-50 text-amber-800 font-bold shadow-xs scale-102"
                          : "border-stone-200 hover:border-stone-300 text-stone-400 bg-white"
                      }`}
                    >
                      <span className="text-xl sm:text-2xl mb-1">⭐</span>
                      <span className="text-[10px] text-stone-600 font-medium text-center">
                        {star === 1 && "Mông lung"}
                        {star === 2 && "Tắc câu khó"}
                        {star === 3 && "Nắm căn bản"}
                        {star === 4 && "Giải thích lại"}
                        {star === 5 && "Làm chủ 100%"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TRẠM 2: KIỂM KÊ THÀNH TỰU THỰC THI */}
          {station === 2 && (
            <div className="space-y-6">
              {/* Câu 3: Môn đã chiến đấu */}
              <div className="space-y-2.5">
                <label className="block text-xs sm:text-sm font-semibold text-stone-900">
                  3. Hôm nay bạn đã chiến đấu cùng những môn nào?
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_OPTIONS.map((sub) => {
                    const isSelected = completedSubjects.includes(sub.id);
                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => toggleSubject(sub.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs scale-102"
                            : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                        }`}
                      >
                        <span>{sub.icon}</span>
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Câu 4: Những chiến thắng cụ thể (Micro-wins) */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100">
                <label className="block text-xs sm:text-sm font-semibold text-stone-900">
                  4. Những &ldquo;Chiến Thắng Cụ Thể&rdquo; (Wins) bạn đã đạt được hôm nay:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MICRO_WINS_OPTIONS.map((win) => {
                    const isSelected = microWins.includes(win.id);
                    return (
                      <button
                        type="button"
                        key={win.id}
                        onClick={() => toggleMicroWin(win.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                        }`}
                      >
                        <span className="text-xl mt-0.5">{win.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-xs text-stone-900">
                            {win.label}
                          </p>
                          <p className="text-[10px] text-stone-500 leading-tight mt-0.5">
                            {win.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TRẠM 3: ĐIỂM NGHẼN & XOAY VÒNG THEO THỨ */}
          {station === 3 && (
            <div className="space-y-6">
              {/* Câu 5: Điểm nghẽn lớn nhất */}
              <div className="space-y-2.5">
                <label className="block text-xs sm:text-sm font-semibold text-stone-900">
                  5. Điểm nghẽn lớn nhất khiến bạn chưa hài lòng hôm nay là gì?
                </label>
                <div className="space-y-2">
                  {BOTTLENECK_OPTIONS.map((bn) => {
                    const isSelected = bottleneckKey === bn.id;
                    return (
                      <button
                        type="button"
                        key={bn.id}
                        onClick={() => setBottleneckKey(bn.id)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{bn.icon}</span>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold">{bn.label}</p>
                            <p className="text-[10px] text-stone-500">{bn.desc}</p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Câu 6: Câu hỏi xoay vòng thứ */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{currentWeekdayQuestion.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-800 font-medium">
                  {currentWeekdayQuestion.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentWeekdayQuestion.options.map((opt) => {
                    const isSelected = weekdayAnswer === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setWeekdayAnswer(opt)}
                        className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-white text-stone-600"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TRẠM 4: MÀN HÌNH TỔNG KẾT & PHẢN HỒI AI */}
          {station === 4 && checkinResult && (
            <div className="space-y-5 text-center py-2">
              {/* Streak Badge Animation */}
              <div className="inline-flex flex-col items-center justify-center p-4 bg-amber-50 rounded-3xl border border-amber-200 shadow-sm mx-auto">
                <div className="flex items-center gap-2 text-amber-600 font-black text-3xl">
                  <Flame className="w-8 h-8 fill-amber-500 text-amber-600 animate-bounce" />
                  <span>{checkinResult.streak_days} Ngày</span>
                </div>
                <p className="text-xs font-semibold text-amber-800 mt-1">
                  Chuỗi kỷ luật liên tục thắp sáng!
                </p>
              </div>

              {/* Khiên hộ mệnh thông báo nếu có */}
              {checkinResult.shield_used && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-left text-blue-900">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-xs leading-relaxed">
                    {checkinResult.shield_message || "Khiên hộ mệnh đã giữ lại ngọn lửa thắp sáng cho bạn!"}
                  </p>
                </div>
              )}

              {/* Lời nhắn Growth Mindset từ AI */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-left space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  <span>Lời nhắn nhủ từ AI Mentor Hoa Hướng Dương</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  &ldquo;{checkinResult.ai_feedback}&rdquo;
                </p>
              </div>

              {/* Huy hiệu mới mở nếu có */}
              {checkinResult.newly_unlocked_badges && checkinResult.newly_unlocked_badges.length > 0 && (
                <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-2xl flex items-center justify-center gap-2 text-amber-900 font-bold text-xs">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>Bạn vừa mở khóa huy hiệu mới trong Bảng Phong Thần!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nút điều hướng các trạm */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex justify-between items-center">
          {station < 4 ? (
            <>
              {station > 1 ? (
                <button
                  type="button"
                  onClick={() => setStation(station - 1)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Quay lại
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-stone-500 hover:text-stone-800 text-xs font-medium"
                >
                  Để sau
                </button>
              )}

              {station < 3 ? (
                <button
                  type="button"
                  onClick={() => setStation(station + 1)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  Tiếp theo
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang thắp sáng...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Thắp Sáng Ngọn Lửa Streak
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Nhận 1 giọt nước & Trở về Khu Vườn 💧
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
