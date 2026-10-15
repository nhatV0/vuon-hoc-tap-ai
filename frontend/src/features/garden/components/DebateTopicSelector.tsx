import React from "react";
import { BookOpen, CheckSquare, Square, Layers, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export interface SyllabusChapter {
  id: string;
  title: string;
  grade: "11" | "12" | "all";
}

interface Props {
  subjects: string[];
  currentSubject: string;
  onSelectSubject: (subject: string) => void;
  chapters: SyllabusChapter[];
  selectedChapterIds: string[];
  onToggleChapter: (chapterId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onStartDebate: () => void;
  loading: boolean;
}

export default function DebateTopicSelector({
  subjects,
  currentSubject,
  onSelectSubject,
  chapters,
  selectedChapterIds,
  onToggleChapter,
  onSelectAll,
  onClearAll,
  onStartDebate,
  loading
}: Props) {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-muted/40 rounded-2xl border border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground">Chọn Môn Học:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((sub) => (
            <Button
              key={sub}
              type="button"
              variant={currentSubject === sub ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectSubject(sub)}
              className="h-7 text-xs px-2.5 rounded-lg"
            >
              {sub}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">
            Đề mục & Chương Trọng Tâm ({selectedChapterIds.length}/{chapters.length} đã chọn)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="h-6 text-[11px] px-2 text-primary"
          >
            Chọn tất cả
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-6 text-[11px] px-2 text-muted-foreground"
          >
            Bỏ chọn
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
        {chapters.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Đang tải danh mục chương trình học...
          </div>
        ) : (
          chapters.map((chap) => {
            const isSelected = selectedChapterIds.includes(chap.id);
            return (
              <Card
                key={chap.id}
                onClick={() => onToggleChapter(chap.id)}
                className={`p-3 border transition-all cursor-pointer flex items-center justify-between gap-3 rounded-xl ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border hover:border-muted-foreground/30 bg-card"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-xs font-medium text-foreground truncate">
                    {chap.title}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                  {chap.grade === "11" ? "Lớp 11" : chap.grade === "12" ? "Lớp 12" : "Toàn cấp"}
                </Badge>
              </Card>
            );
          })
        )}
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          Tích chọn 1 hoặc nhiều đề mục để AI tạo câu hỏi phản biện thực tế.
        </p>
        <Button
          type="button"
          disabled={selectedChapterIds.length === 0 || loading}
          onClick={onStartDebate}
          className="gap-2 text-xs h-9 px-4 rounded-xl"
        >
          <Sparkles className="w-4 h-4" />
          <span>Bắt đầu Tranh Luận</span>
        </Button>
      </div>
    </div>
  );
}
