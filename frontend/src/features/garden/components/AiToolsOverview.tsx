import React from "react";
import { MessageSquareText, BookOpen, Lightbulb } from "lucide-react";
import { Card } from "@/shared/components/ui/card";

interface Props {
  onOpenDebate: () => void;
  onOpenQuiz: () => void;
  onOpenSocratic: () => void;
}

export default function AiToolsOverview({ onOpenDebate, onOpenQuiz, onOpenSocratic }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card
        onClick={onOpenDebate}
        className="p-4 border-border hover:border-primary transition-all cursor-pointer flex items-center gap-3.5 group shadow-xs bg-white"
      >
        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
          <MessageSquareText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-xs text-foreground">Gia Sư Tranh Luận Phản Biện</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Chọn đề mục, phản biện đúng sai tức thì</p>
        </div>
      </Card>

      <Card
        onClick={onOpenQuiz}
        className="p-4 border-border hover:border-primary transition-all cursor-pointer flex items-center gap-3.5 group shadow-xs bg-white"
      >
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-xs text-foreground">Trắc Nghiệm & Câu Sinh Đôi</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Luyện đề thích ứng, đào sâu lỗ hổng kiến thức</p>
        </div>
      </Card>

      <Card
        onClick={onOpenSocratic}
        className="p-4 border-border hover:border-emerald-500 transition-all cursor-pointer flex items-center gap-3.5 group shadow-xs bg-white"
      >
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-xs text-foreground">Gia Sư Gợi Mở Socratic</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Đặt câu hỏi thông minh, gợi mở tư duy từng bước</p>
        </div>
      </Card>
    </div>
  );
}
