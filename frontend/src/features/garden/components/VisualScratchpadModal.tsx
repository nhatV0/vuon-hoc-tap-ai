import React, { useState } from "react";
import { Upload, Camera, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import MathText from "@/shared/components/MathText";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

interface Props {
  studentId: string;
  subject?: string;
  onClose: () => void;
}

export default function VisualScratchpadModal({ studentId, subject = "Toán học", onClose }: Props) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64 || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/vision/analyze-scratchpad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          subject,
          image_base64: imageBase64,
          problem_description: `Bài tập viết tay môn ${subject}`
        })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Camera className="w-5 h-5 text-indigo-500" />
              <span>Nội Soi Bài Nháp Viết Tay</span>
            </DialogTitle>
            <Badge variant="outline">{subject}</Badge>
          </div>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer relative bg-stone-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {imageBase64 ? (
                <div className="space-y-2">
                  <img src={imageBase64} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
                  <p className="text-[11px] text-muted-foreground">Nhấp để chọn ảnh khác</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-semibold text-foreground">Tải lên ảnh chụp bài làm nháp hoặc đoạn gạch xóa</p>
                  <p className="text-[10px] text-muted-foreground">Hỗ trợ định dạng PNG, JPG từ máy tính hoặc điện thoại</p>
                </div>
              )}
            </div>

            <Button onClick={handleAnalyze} disabled={!imageBase64 || loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              <span>Bắt Đầu Nội Soi Lỗi Sai</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <Card className="p-4 border-amber-200 bg-amber-50/50 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Chẩn đoán: {result.error_type}</span>
              </div>
              <p className="text-[11px] text-stone-600 pl-6 leading-relaxed">{result.pedagogical_guidance}</p>
            </Card>

            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground">Phiên âm từng bước lập luận:</span>
              {(result.step_by_step || []).map((step: string, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                    idx === result.error_step_index
                      ? "bg-rose-50 border-rose-300 text-rose-950"
                      : "bg-muted/40 border-border text-foreground"
                  }`}
                >
                  <span className="font-bold text-[10px] mt-0.5 px-1.5 py-0.5 rounded-md bg-stone-200">
                    #{idx + 1}
                  </span>
                  <div className="flex-1">
                    <MathText content={step} />
                  </div>
                  {idx === result.error_step_index && (
                    <Badge variant="destructive" className="text-[9px]">Điểm gãy</Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{result.encouragement}</span>
            </div>

            <Button variant="outline" onClick={() => setResult(null)} className="w-full">
              Nội soi ảnh khác
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
