import React from "react";
import { Flame, Droplets, Shield, Award, Sparkles, BookOpen } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

interface Props {
  streak: number;
  waterDrops: number;
  holyWater: number;
  freezeShields: number;
  totalCheckins: number;
}

export default function GrowthStatsOverview({
  streak,
  waterDrops,
  holyWater,
  freezeShields,
  totalCheckins
}: Props) {
  const stats = [
    {
      label: "Chuỗi liên tục",
      value: `${streak} ngày`,
      sub: "Bền bỉ học tập",
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-50 border-amber-200/60"
    },
    {
      label: "Giọt nước sinh khí",
      value: `${waterDrops}`,
      sub: "Đã tưới cây",
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50 border-blue-200/60"
    },
    {
      label: "Nước thánh hồi sinh",
      value: `${holyWater}`,
      sub: "Cứu chuỗi khi lỡ",
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      bg: "bg-purple-50 border-purple-200/60"
    },
    {
      label: "Khiên đóng băng",
      value: `${freezeShields}`,
      sub: "Bảo vệ chuỗi",
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-50 border-emerald-200/60"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s, idx) => (
        <Card key={idx} className={`p-4 border ${s.bg} flex flex-col justify-between shadow-xs`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600 font-medium">{s.label}</span>
            <div className="p-1.5 rounded-lg bg-white shadow-xs shrink-0">{s.icon}</div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-stone-900">{s.value}</span>
            <p className="text-[11px] text-stone-500 mt-0.5">{s.sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
