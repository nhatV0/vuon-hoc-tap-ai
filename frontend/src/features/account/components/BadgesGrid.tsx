import React from "react";
import { Award, Trophy, Sprout, Flame, Shield, Sparkles } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export interface BadgeItem {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  required_streak: number;
  unlocked: boolean;
}

interface Props {
  badges: BadgeItem[];
  streak: number;
}

export default function BadgesGrid({ badges, streak }: Props) {
  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case "sprout": return <Sprout className="w-5 h-5 text-emerald-500" />;
      case "leaf": return <Flame className="w-5 h-5 text-amber-500" />;
      case "sun": return <Sparkles className="w-5 h-5 text-yellow-500" />;
      case "award": return <Trophy className="w-5 h-5 text-indigo-500" />;
      default: return <Award className="w-5 h-5 text-stone-500" />;
    }
  };

  return (
    <Card className="p-5 border-border bg-white shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-stone-900">Bộ Sưu Tập Huy Hiệu</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Đạt {badges.filter((b) => b.unlocked).length}/{badges.length} huy hiệu
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
              b.unlocked
                ? "bg-amber-50/40 border-amber-200/60 shadow-xs"
                : "bg-stone-50/50 border-stone-200/40 opacity-55 grayscale"
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${b.unlocked ? "bg-white shadow-xs" : "bg-stone-200"}`}>
              {getBadgeIcon(b.icon)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-xs text-stone-900 truncate">{b.title}</span>
                {b.unlocked ? (
                  <Badge variant="default" className="text-[10px] h-4 px-1.5 bg-emerald-600">Đã mở</Badge>
                ) : (
                  <span className="text-[10px] text-stone-400 font-medium">Cần {b.required_streak} ngày</span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
