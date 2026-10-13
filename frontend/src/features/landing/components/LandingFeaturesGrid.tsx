import React from "react";
import { Sun, HeartHandshake, ShieldCheck, Zap, Compass, Sparkles } from "lucide-react";

export default function LandingFeaturesGrid() {
  const features = [
    {
      icon: Sun,
      color: "amber",
      title: "Lộ trình Vi Mô 5-10p",
      description: "Thiết kế theo thang đo cảm xúc 7 cấp độ và rào cản nhận thức môn học, không tạo áp lực điểm số.",
      delay: "0ms"
    },
    {
      icon: HeartHandshake,
      color: "emerald",
      title: "Check-in Thấu Cảm",
      description: "Lắng nghe năng lượng, khó khăn hằng ngày. AI phản hồi ấm áp, nâng đỡ tinh thần và ghi nhận nỗ lực.",
      delay: "100ms"
    },
    {
      icon: ShieldCheck,
      color: "indigo",
      title: "Khu Vườn Bền Bỉ",
      description: "Cây hoa tiến hóa theo chuỗi streak, nhận khiên bảo vệ, bình nước thánh và mở khóa câu hỏi Boss.",
      delay: "200ms"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left relative z-10">
      {features.map((item, idx) => {
        const Icon = item.icon;
        const colorClasses = item.color === "amber"
          ? "bg-amber-100 text-amber-600 group-hover:bg-amber-200/80 group-hover:text-amber-700"
          : item.color === "emerald"
          ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200/80 group-hover:text-emerald-700"
          : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200/80 group-hover:text-indigo-700";

        const hoverBorder = item.color === "amber"
          ? "hover:border-amber-300/80"
          : item.color === "emerald"
          ? "hover:border-emerald-300/80"
          : "hover:border-indigo-300/80";

        return (
          <div
            key={idx}
            className={`p-6 rounded-3xl bg-white/90 backdrop-blur-xs border border-stone-200/80 shadow-xs hover:shadow-lg ${hoverBorder} hover:-translate-y-1.5 transition-all duration-300 group cursor-default`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 ${colorClasses}`}>
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <h3 className="font-bold text-stone-900 mb-2 transition-colors">{item.title}</h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}
