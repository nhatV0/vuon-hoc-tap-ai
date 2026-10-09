import React from "react";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface Props {
  emotionScale: number;
  setEmotionScale: (v: number) => void;
  onBack: () => void;
  onNext: () => void;
}

const EMOTION_ITEMS = [
  { level: 1, text: "Mức 1: Rất sợ hãi và muốn né tránh hoàn toàn" },
  { level: 2, text: "Mức 2: Khá áp lực, cảm thấy quá tải" },
  { level: 4, text: "Mức 4: Bình thường, sẵn sàng cố gắng từng bước nhỏ" },
  { level: 6, text: "Mức 6: Khá tự tin và hào hứng" },
  { level: 7, text: "Mức 7: Đầy nhiệt huyết và muốn chinh phục câu khó" }
];

export default function StepEmotionScale({
  emotionScale,
  setEmotionScale,
  onBack,
  onNext
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 mb-1">Cảm xúc của bạn trước môn học</h2>
        <p className="text-xs text-stone-500">Mức độ thoải mái khi đối diện với bài vở (Thang đo 1 - 7).</p>
      </div>
      <div className="space-y-2">
        {EMOTION_ITEMS.map((item) => (
          <button
            key={item.level}
            onClick={() => setEmotionScale(item.level)}
            className={`w-full p-3 text-left rounded-xl border text-xs font-medium flex items-center justify-between transition-colors ${
              emotionScale === item.level
                ? "bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500"
                : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
            }`}
          >
            <span>{item.text}</span>
            {emotionScale === item.level && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Quay lại</span>
        </Button>
        <Button onClick={onNext} className="flex-1">
          <span>Tiếp tục</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
