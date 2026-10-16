import React, { useState, useEffect } from "react";
import { BookOpen, Search, Loader2, ListOrdered, MessageSquareText } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { QuestionItem } from "./TeacherQuestionCard";
import MultipleChoiceListItem from "./MultipleChoiceListItem";
import EssayDebateListItem, { EssayQuestionItem } from "./EssayDebateListItem";

interface SubjectGroup {
  subject: string;
  total_questions: number;
  questions: QuestionItem[];
}

interface EssaySubjectGroup {
  subject: string;
  total_questions: number;
  questions: EssayQuestionItem[];
}

export default function TeacherQuestionBankView() {
  const [mcqGroups, setMcqGroups] = useState<SubjectGroup[]>([]);
  const [essayGroups, setEssayGroups] = useState<EssaySubjectGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionType, setQuestionType] = useState<"mcq" | "essay">("mcq");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("sunflower_token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`${API_BASE}/api/quiz/questions/grouped`, { headers }).then((res) => res.json()),
      fetch(`${API_BASE}/api/quiz/questions/essay-grouped`, { headers }).then((res) => res.json())
    ])
      .then(([mcqData, essayData]) => {
        setMcqGroups(Array.isArray(mcqData) ? mcqData : []);
        setEssayGroups(Array.isArray(essayData) ? essayData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentGroups = questionType === "mcq" ? mcqGroups : essayGroups;
  const totalCount = currentGroups.reduce((acc, g) => acc + g.total_questions, 0);

  const filteredQuestions = (currentGroups as any[])
    .filter((g) => selectedSubject === "ALL" || g.subject === selectedSubject)
    .flatMap((g) => g.questions)
    .filter((q) => {
      if (!searchQuery.trim()) return true;
      const lower = searchQuery.toLowerCase();
      const txt = (q.question_text || "").toLowerCase();
      const sub = (q.subject || "").toLowerCase();
      const id = (q.id || "").toLowerCase();
      return txt.includes(lower) || sub.includes(lower) || id.includes(lower);
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-stone-900">
              Ngân Hàng Câu Hỏi 11 Môn GDPT 2018 ({totalCount} câu {questionType === "mcq" ? "trắc nghiệm" : "tự luận"})
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Duyệt câu hỏi trắc nghiệm phản xạ & câu hỏi tự luận phản biện chuyên sâu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo nội dung, mã câu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setQuestionType("mcq")}
            className={`px-3 py-1 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              questionType === "mcq" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-amber-600" />
            <span>Trắc Nghiệm ({mcqGroups.reduce((a, b) => a + b.total_questions, 0)})</span>
          </button>
          <button
            type="button"
            onClick={() => setQuestionType("essay")}
            className={`px-3 py-1 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              questionType === "essay" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tự Luận Phản Biện ({essayGroups.reduce((a, b) => a + b.total_questions, 0)})</span>
          </button>
        </div>

        <span className="text-[11px] text-stone-500">
          Hiển thị dạng danh sách gọn gàng • Nhấn "Xem đáp án" để mở rộng chi tiết
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 rounded-2xl border border-stone-200/70">
        <button
          type="button"
          onClick={() => setSelectedSubject("ALL")}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
            selectedSubject === "ALL" ? "bg-stone-900 text-white shadow-xs font-semibold" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          Tất cả môn ({totalCount})
        </button>
        {currentGroups.map((g) => (
          <button
            key={g.subject}
            type="button"
            onClick={() => setSelectedSubject(g.subject)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              selectedSubject === g.subject ? "bg-amber-500 text-white shadow-xs font-semibold" : "bg-white text-stone-600 border border-stone-200 hover:bg-amber-50"
            }`}
          >
            {g.subject} ({g.total_questions})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-primary">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      ) : filteredQuestions.length > 0 ? (
        <div className="space-y-2.5">
          {questionType === "mcq"
            ? (filteredQuestions as QuestionItem[]).map((q, idx) => (
                <MultipleChoiceListItem key={q.id || idx} question={q} index={idx} />
              ))
            : (filteredQuestions as EssayQuestionItem[]).map((q, idx) => (
                <EssayDebateListItem key={q.id || idx} question={q} index={idx} />
              ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-muted-foreground">Không tìm thấy câu hỏi phù hợp.</p>
        </div>
      )}
    </div>
  );
}
