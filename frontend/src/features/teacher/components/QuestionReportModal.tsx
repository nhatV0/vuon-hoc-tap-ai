import React, { useState } from "react";
import { Flag, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface Props {
  questionId: string;
  questionType: "mcq" | "essay";
  subject: string;
  questionText: string;
  isOpen: boolean;
  onClose: () => void;
  onReported?: () => void;
}

const ISSUE_OPTIONS = [
  "Câu hỏi bị trừu tượng / mơ hồ",
  "Nội dung câu hỏi sai lệch kiến thức SGK",
  "Đáp án đúng không chính xác",
  "Lỗi định dạng công thức LaTeX / chính tả",
  "Câu hỏi lặp lại câu đã xuất hiện trước đó"
];

export default function QuestionReportModal({
  questionId,
  questionType,
  subject,
  questionText,
  isOpen,
  onClose,
  onReported
}: Props) {
  const [issueType, setIssueType] = useState(ISSUE_OPTIONS[0]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          question_type: questionType,
          subject,
          question_text: questionText,
          issue_type: issueType,
          reason: reason.trim() || issueType,
          reporter_id: localStorage.getItem("sunflower_student_id") || "guest_reporter"
        })
      });
      if (res.ok) {
        setSuccess(true);
        if (onReported) onReported();
        setTimeout(() => {
          setSuccess(false);
          setReason("");
          onClose();
        }, 1800);
      }
    } catch {} finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <Flag className="w-4 h-4 text-rose-500" />
            <span>Báo Cáo Câu Hỏi Cần Cải Thiện</span>
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-semibold text-emerald-800">
              Đã ghi nhận báo cáo! Trợ lý AI sẽ lưu ý và không lặp lại lỗi này.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Vấn đề gặp phải
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {ISSUE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mô tả chi tiết / Góp ý cho Trợ lý AI (tùy chọn)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Câu hỏi này quá chung chung, cần nêu rõ khái niệm CSDL quan hệ hoặc khóa chính..."
                rows={3}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
                {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Gửi Báo Cáo</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
