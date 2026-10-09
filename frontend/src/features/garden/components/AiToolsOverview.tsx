import React from "react";
import { Lightbulb, Camera } from "lucide-react";
import { Card } from "@/shared/components/ui/card";

interface Props {
  onOpenSocratic: () => void;
  onOpenScratchpad: () => void;
}

export default function AiToolsOverview({ onOpenSocratic, onOpenScratchpad }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Card
        onClick={onOpenSocratic}
        className="p-4 border-border hover:border-primary transition-all cursor-pointer flex items-center gap-3.5 group shadow-xs bg-white"
      >
        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-xs text-foreground">Gia Sư Khơi Gợi Socratic</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Không giải sẵn, dẫn dắt từng bước</p>
        </div>
      </Card>

      <Card
        onClick={onOpenScratchpad}
        className="p-4 border-border hover:border-primary transition-all cursor-pointer flex items-center gap-3.5 group shadow-xs bg-white"
      >
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
          <Camera className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-xs text-foreground">Nội Soi Bài Nháp Viết Tay</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Chụp ảnh phát hiện điểm gãy tư duy</p>
        </div>
      </Card>
    </div>
  );
}
